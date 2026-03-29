'use strict';

/**
 * LiveTimingClient
 *
 * Manages a single SignalR Core connection to the F1 Live Timing service.
 * Uses @microsoft/signalr HubConnectionBuilder with automatic reconnect.
 *
 * Authenticated streams (CarData.z, Position.z) require an F1 TV Pro
 * subscription token, passed via setAuthToken(). The client reconnects
 * automatically when the token changes.
 *
 * Public API:
 *   await client.connect()
 *   await client.disconnect()
 *   await client.setAuthToken(jwtString | null)
 *   const unsub = client.subscribe('TrackStatus', (msg) => { ... })
 *   unsub()
 *   client.isConnected / .isReconnecting / .reconnectCount / .lastMessageAt
 *
 * Events: 'connected', 'disconnected'
 */

const zlib             = require('zlib');
const { EventEmitter } = require('events');

// Polyfill WebSocket for @microsoft/signalr in Node.js < 21
if (typeof globalThis.WebSocket === 'undefined') {
  try { globalThis.WebSocket = require('ws'); } catch (_) { /* optional */ }
}

const signalR = require('@microsoft/signalr');

const {
  LIVETIMING_SIGNALR_CORE,
  LIVE_STREAMS,
  LIVE_STREAMS_AUTH,
} = require('./constants');

// All streams — auth-gated streams return empty data without a valid token
const ALL_STREAMS = [
  ...Object.values(LIVE_STREAMS),
  ...Object.values(LIVE_STREAMS_AUTH),
];

// CarData.z channel ID → field name (Fast-F1 source: fastf1/_api.py)
const CAR_CHANNELS = { 0: 'Speed', 2: 'RPM', 3: 'nGear', 4: 'Throttle', 5: 'Brake', 45: 'DRS' };

// Position.z field names (keys come as strings already in live feed)
const POS_FIELDS = new Set(['Status', 'X', 'Y', 'Z']);

class LiveTimingClient extends EventEmitter {

  constructor(homey) {
    super();
    this._homey          = homey;
    this._log            = (...a) => homey.log('[LiveTiming]', ...a);
    this._error          = (...a) => homey.error('[LiveTiming]', ...a);
    this._debugMode      = homey.env.DEBUG === 'true';
    this._subscribers    = new Map();   // streamName → Set<Function>
    this._cache          = {};          // last known value per stream
    this._connection     = null;
    this._connected      = false;
    this._reconnectCount = 0;
    this._lastMessageAt  = null;
    this._authToken      = null;
    this._destroyed      = false;
    this._manualRetryTimer = null;
    if (this._debugMode) this._log('Debug mode ON (env.DEBUG=true)');
  }

  _debug(...args) {
    this._homey.log('[LiveTiming:DEBUG]', ...args);
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  async connect() {
    if (this._connection) return;
    this._destroyed = false;
    this._build();
    await this._start();
  }

  async disconnect() {
    this._destroyed = true;
    this._clearManualRetry();
    if (this._connection) {
      try { await this._connection.stop(); } catch (_) { /* ignore */ }
      this._connection = null;
    }
    this._connected = false;
    this.emit('disconnected');
  }

  /**
   * Update the F1 TV Pro subscription token. Triggers a reconnect so the
   * authenticated streams (CarData.z, Position.z) start delivering data.
   * Pass null to remove auth and reconnect anonymously.
   */
  async setAuthToken(token) {
    const newToken = token || null;
    if (newToken === this._authToken) return;
    this._authToken = newToken;
    if (this._connection) {
      this._log('Auth token changed — reconnecting…');
      const wasDestroyed = this._destroyed;
      await this.disconnect();
      if (!wasDestroyed) {
        this._destroyed = false;
        this._build();
        await this._start();
      }
    }
  }

  /**
   * Subscribe to a stream by name. Delivers the cached snapshot immediately
   * if one is available. Returns an unsubscribe function.
   */
  subscribe(streamName, listener) {
    if (!this._subscribers.has(streamName)) {
      this._subscribers.set(streamName, new Set());
    }
    this._subscribers.get(streamName).add(listener);

    if (this._cache[streamName] !== undefined) {
      try { listener(this._cache[streamName]); } catch (_) { /* ignore */ }
    }

    return () => {
      const set = this._subscribers.get(streamName);
      if (set) set.delete(listener);
    };
  }

  get isConnected()    { return this._connected; }
  get reconnectCount() { return this._reconnectCount; }
  get lastMessageAt()  { return this._lastMessageAt; }
  get isReconnecting() {
    return !!(this._connection
      && this._connection.state === signalR.HubConnectionState.Reconnecting);
  }

  // ─── Connection lifecycle ─────────────────────────────────────────────────

  _build() {
    const options = {
      headers: { 'User-Agent': 'nl.monkeysoft.f1/1.0 Homey' },
    };
    if (this._authToken) {
      options.accessTokenFactory = () => this._authToken;
    }

    this._connection = new signalR.HubConnectionBuilder()
      .withUrl(LIVETIMING_SIGNALR_CORE, options)
      .withAutomaticReconnect([5_000, 10_000, 30_000, 60_000])
      .configureLogging(this._debugMode ? signalR.LogLevel.Debug : signalR.LogLevel.Warning)
      .build();

    // Live stream messages — server fires 'feed' with (streamName, data, timestamp)
    this._connection.on('feed', (streamName, data) => {
      this._onFeed(streamName, data);
    });

    this._connection.onreconnecting(() => {
      this._connected = false;
      this._log('Reconnecting…');
      this.emit('disconnected');
    });

    this._connection.onreconnected(() => {
      this._reconnectCount++;
      this._connected = true;
      this._log('Reconnected. Re-subscribing to streams…');
      this.emit('connected');
      this._subscribe().catch((err) => this._error('Re-subscribe failed:', err.message));
    });

    this._connection.onclose((err) => {
      this._connected = false;
      if (err) this._error('Connection closed with error:', err.message);
      else     this._log('Connection closed.');
      this.emit('disconnected');
      if (!this._destroyed) this._scheduleManualRetry();
    });
  }

  async _start() {
    try {
      await this._connection.start();
      this._log('Connected. Subscribing to streams…');
      const snapshot = await this._subscribe();
      this._processSnapshot(snapshot);
      this._connected = true;
      this.emit('connected');
    } catch (err) {
      this._error('Failed to start connection:', err.message);
      if (!this._destroyed) this._scheduleManualRetry();
    }
  }

  async _subscribe() {
    return this._connection.invoke('Subscribe', ALL_STREAMS);
  }

  /**
   * The Subscribe invocation returns the current snapshot of all streams.
   * Format: { StreamName: data, ... }
   */
  _processSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return;
    const keys = Object.keys(snapshot);
    this._debug(`Snapshot received — ${keys.length} streams: ${keys.join(', ')}`);
    for (const [streamName, data] of Object.entries(snapshot)) {
      if (data !== null && data !== undefined) {
        this._onFeed(streamName, data);
      }
    }
  }

  _scheduleManualRetry() {
    this._clearManualRetry();
    this._manualRetryTimer = setTimeout(async () => {
      if (this._destroyed || !this._connection) return;
      this._log('Manual reconnect attempt…');
      try {
        await this._connection.start();
        const snapshot = await this._subscribe();
        this._processSnapshot(snapshot);
        this._reconnectCount++;
        this._connected = true;
        this.emit('connected');
      } catch (err) {
        this._error('Manual reconnect failed:', err.message);
        if (!this._destroyed) this._scheduleManualRetry();
      }
    }, 60_000);
  }

  _clearManualRetry() {
    if (this._manualRetryTimer) {
      clearTimeout(this._manualRetryTimer);
      this._manualRetryTimer = null;
    }
  }

  // ─── Message handling ─────────────────────────────────────────────────────

  _onFeed(streamName, data) {
    this._lastMessageAt = new Date().toISOString();

    // .z streams are zlib-deflate + base64 encoded (per Fast-F1 fastf1/_api.py)
    if (streamName.endsWith('.z') && typeof data === 'string') {
      this._debug(`feed [${streamName}] compressed — raw length: ${data.length} chars`);
      data = this._decompress(streamName, data);
      if (data === null) return;
    } else {
      this._debug(`feed [${streamName}]`, JSON.stringify(data).slice(0, 300));
    }

    if (streamName === 'CarData.z') {
      this._dispatchCarData(data);
      return; // subscribers listen on stream-level CarData.z events only
    }
    if (streamName === 'Position.z') {
      this._dispatchPositionData(data);
      return;
    }

    this._cacheAndDispatch(streamName, data);
  }

  _decompress(streamName, data) {
    try {
      const buf = Buffer.from(data, 'base64');
      const result = JSON.parse(zlib.inflateRawSync(buf).toString('utf8'));
      this._debug(`feed [${streamName}] decompressed (${buf.length}B):`, JSON.stringify(result).slice(0, 500));
      return result;
    } catch (err) {
      this._error(`Decompression failed for ${streamName}:`, err.message);
      return null;
    }
  }

  /**
   * CarData.z decompressed structure (Fast-F1 fastf1/_api.py):
   * { "Entries": [{ "Cars": { "<driverNum>": { "Channels": { "0": speed, ... } } } }] }
   * Channel IDs: 0=Speed, 2=RPM, 3=nGear, 4=Throttle, 5=Brake(0/1), 45=DRS
   * DRS values: 0=inactive, 10=available, 12/14=active
   */
  _dispatchCarData(data) {
    const entries = data?.Entries ?? [];
    for (const entry of entries) {
      for (const [driverNum, carObj] of Object.entries(entry?.Cars ?? {})) {
        const channels = carObj?.Channels ?? {};
        const payload = { driverNumber: driverNum };
        let hasData = false;
        for (const [ch, val] of Object.entries(channels)) {
          const field = CAR_CHANNELS[Number(ch)];
          if (field) { payload[field] = val; hasData = true; }
        }
        if (hasData) {
          this._debug(`CarData.z driver=${driverNum} channels:`, JSON.stringify(channels));
          this._cacheAndDispatch('CarData.z', payload);
        }
      }
    }
  }

  /**
   * Position.z decompressed structure (Fast-F1 fastf1/_api.py):
   * { "Position": [{ "Timestamp": "...", "Entries": { "<driverNum>": { "Status": "OnTrack", "X": n, "Y": n, "Z": n } } }] }
   */
  _dispatchPositionData(data) {
    const positions = data?.Position ?? [];
    for (const frame of positions) {
      for (const [driverNum, posObj] of Object.entries(frame?.Entries ?? {})) {
        const payload = { driverNumber: driverNum };
        for (const [key, val] of Object.entries(posObj)) {
          if (POS_FIELDS.has(key)) payload[key] = val;
        }
        this._debug(`Position.z driver=${driverNum} status=${posObj.Status} x=${posObj.X} y=${posObj.Y}`);
        this._cacheAndDispatch('Position.z', payload);
      }
    }
  }

  _cacheAndDispatch(streamName, data) {
    this._cache[streamName] = data;
    const subs = this._subscribers.get(streamName);
    if (!subs) return;
    for (const fn of subs) {
      try { fn(data); } catch (err) {
        this._error(`Subscriber error [${streamName}]:`, err.message);
      }
    }
  }
}

module.exports = LiveTimingClient;
