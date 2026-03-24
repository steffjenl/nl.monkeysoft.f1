'use strict';

/**
 * LiveTimingClient
 *
 * Manages a single SignalR 2.x connection to the F1 Live Timing service.
 * Uses HTTP long-polling /negotiate + WebSocket connect (with SSE / long-poll
 * fallbacks) and the classic ASP.NET SignalR protocol.
 *
 * Usage:
 *   const client = new LiveTimingClient(homey);
 *   await client.connect();
 *   const unsub = client.subscribe('TrackStatus', (msg) => { ... });
 *   unsub(); // to unsubscribe
 *   await client.disconnect();
 */

const https = require('https');
const http  = require('http');
const { EventEmitter } = require('events');
const {
  LIVETIMING_SIGNALR,
  LIVETIMING_HUB,
  LIVETIMING_CLIENT_PROTOCOL,
  LIVE_STREAMS,
} = require('./constants');

const RECONNECT_DELAY_MS   = 5_000;
const RECONNECT_MAX_DELAY  = 60_000;
const NEGOTIATE_TIMEOUT_MS = 15_000;
const PING_INTERVAL_MS     = 30_000;

class LiveTimingClient extends EventEmitter {

  /**
   * @param {import('homey').Homey} homey
   */
  constructor(homey) {
    super();
    this._homey           = homey;
    this._log             = (...a) => homey.log('[LiveTiming]', ...a);
    this._error           = (...a) => homey.error('[LiveTiming]', ...a);
    this._subscribers     = new Map(); // streamName → Set<Function>
    this._ws              = null;
    this._connectionToken = null;
    this._connectionId    = null;
    this._msgId           = 0;
    this._connected       = false;
    this._reconnecting    = false;
    this._destroyed       = false;
    this._reconnectDelay  = RECONNECT_DELAY_MS;
    this._pingTimer       = null;
    this._reconnectTimer  = null;

    // Current state cache — last received message per stream
    this._cache = {};
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /**
   * Connect to F1 Live Timing SignalR hub.
   * Resolves when the initial connection handshake is complete.
   */
  async connect() {
    if (this._connected || this._reconnecting) return;
    this._destroyed = false;
    await this._doConnect();
  }

  /**
   * Disconnect and stop all reconnect attempts.
   */
  async disconnect() {
    this._destroyed = true;
    this._clearTimers();
    this._closeWs();
    this._connected = false;
    this._reconnecting = false;
    this._log('Disconnected.');
  }

  /**
   * Subscribe to a specific stream name.
   * @param {string} streamName  e.g. 'TrackStatus'
   * @param {Function} listener  called with the parsed JSON payload
   * @returns {Function} unsubscribe function
   */
  subscribe(streamName, listener) {
    if (!this._subscribers.has(streamName)) {
      this._subscribers.set(streamName, new Set());
    }
    this._subscribers.get(streamName).add(listener);

    // Deliver cached state immediately if available
    if (this._cache[streamName] !== undefined) {
      try { listener(this._cache[streamName]); } catch (_) { /* ignore */ }
    }

    return () => {
      const set = this._subscribers.get(streamName);
      if (set) set.delete(listener);
    };
  }

  /** Whether the SignalR connection is currently established */
  get isConnected() { return this._connected; }

  // ─── Internal connection lifecycle ───────────────────────────────────────

  async _doConnect() {
    try {
      this._log('Negotiating…');
      await this._negotiate();
      this._log('Connecting WebSocket…');
      await this._connectWebSocket();
      this._log('Connected. Subscribing to streams…');
      this._send(this._subscribeMessage(Object.values(LIVE_STREAMS)));
      this._connected = true;
      this._reconnectDelay = RECONNECT_DELAY_MS;
      this._startPing();
      this.emit('connected');
    } catch (err) {
      this._error('Connection failed:', err.message);
      this._scheduleReconnect();
    }
  }

  async _negotiate() {
    const connectionData = JSON.stringify([{ name: LIVETIMING_HUB.toLowerCase() }]);
    const url = `${LIVETIMING_SIGNALR}/negotiate`
      + `?clientProtocol=${LIVETIMING_CLIENT_PROTOCOL}`
      + `&connectionData=${encodeURIComponent(connectionData)}`;

    const data = await this._httpGet(url, NEGOTIATE_TIMEOUT_MS);
    const json = JSON.parse(data);
    this._connectionToken = json.ConnectionToken;
    this._connectionId    = json.ConnectionId;
  }

  _connectWebSocket() {
    return new Promise((resolve, reject) => {
      const connectionData = encodeURIComponent(
        JSON.stringify([{ name: LIVETIMING_HUB.toLowerCase() }])
      );
      const token = encodeURIComponent(this._connectionToken);
      const wsUrl = LIVETIMING_SIGNALR.replace(/^https/, 'wss').replace(/^http/, 'ws')
        + `/connect?transport=webSockets`
        + `&clientProtocol=${LIVETIMING_CLIENT_PROTOCOL}`
        + `&connectionToken=${token}`
        + `&connectionData=${connectionData}`;

      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('WebSocket connect timeout'));
        }
      }, NEGOTIATE_TIMEOUT_MS);

      // Dynamic require so Homey can polyfill / sandbox as needed
      let WS;
      try {
        WS = require('ws');
      } catch (_) {
        WS = global.WebSocket || WebSocket; // browser-like env fallback
      }

      const ws = new WS(wsUrl, {
        headers: {
          'User-Agent': 'nl.monkeysoft.f1/1.0 Homey',
          'Accept-Encoding': 'gzip, deflate',
        },
      });
      this._ws = ws;

      ws.on('open', () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve();
        }
      });

      ws.on('message', (data) => {
        this._onMessage(data.toString());
      });

      ws.on('error', (err) => {
        this._error('WebSocket error:', err.message);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(err);
        }
      });

      ws.on('close', (code, reason) => {
        this._log(`WebSocket closed (${code}): ${reason}`);
        this._connected = false;
        this._stopPing();
        this.emit('disconnected', { code, reason: reason?.toString() });
        if (!this._destroyed) this._scheduleReconnect();
      });
    });
  }

  // ─── Message parsing ─────────────────────────────────────────────────────

  _onMessage(raw) {
    if (!raw || raw === '{}') return;

    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (_) {
      return;
    }

    // SignalR heartbeat / keep-alive
    if (msg.C && !msg.M && !msg.R) return;

    // Live push messages: { "M": [{ "H": "streaming", "M": "TrackStatus", "A": [payload] }] }
    const messages = msg.M;
    if (Array.isArray(messages)) {
      for (const m of messages) {
        const streamName = m.M;
        const args       = m.A;
        if (streamName && Array.isArray(args) && args.length >= 1) {
          this._deliver(streamName, args[0]);
        }
      }
    }

    // RPC response (initial state snapshot): { "R": { "TrackStatus": {...}, ... } }
    const result = msg.R;
    if (result && typeof result === 'object') {
      for (const [stream, payload] of Object.entries(result)) {
        if (payload !== null && payload !== undefined) {
          this._deliver(stream, payload);
        }
      }
    }
  }

  _deliver(streamName, payload) {
    this._cache[streamName] = payload;
    const set = this._subscribers.get(streamName);
    if (!set || set.size === 0) return;
    for (const listener of set) {
      try { listener(payload); } catch (err) {
        this._error(`Listener error for ${streamName}:`, err.message);
      }
    }
  }

  // ─── SignalR helpers ─────────────────────────────────────────────────────

  _subscribeMessage(streams) {
    return JSON.stringify({
      H: LIVETIMING_HUB,
      M: 'Subscribe',
      A: [streams],
      I: ++this._msgId,
    });
  }

  _send(data) {
    if (this._ws && this._ws.readyState === 1 /* OPEN */) {
      this._ws.send(data);
    }
  }

  // ─── Timers ──────────────────────────────────────────────────────────────

  _startPing() {
    this._pingTimer = this._homey.setInterval(() => {
      this._send('{}');
    }, PING_INTERVAL_MS);
  }

  _stopPing() {
    if (this._pingTimer) {
      this._homey.clearInterval(this._pingTimer);
      this._pingTimer = null;
    }
  }

  _scheduleReconnect() {
    if (this._destroyed || this._reconnecting) return;
    this._reconnecting = true;
    const delay = this._reconnectDelay;
    this._reconnectDelay = Math.min(delay * 2, RECONNECT_MAX_DELAY);
    this._log(`Reconnecting in ${delay / 1000}s…`);
    this._reconnectTimer = this._homey.setTimeout(async () => {
      this._reconnecting = false;
      if (!this._destroyed) await this._doConnect();
    }, delay);
  }

  _clearTimers() {
    if (this._pingTimer)     { this._homey.clearInterval(this._pingTimer);  this._pingTimer = null; }
    if (this._reconnectTimer){ this._homey.clearTimeout(this._reconnectTimer); this._reconnectTimer = null; }
  }

  _closeWs() {
    if (this._ws) {
      try { this._ws.terminate ? this._ws.terminate() : this._ws.close(); } catch (_) {}
      this._ws = null;
    }
  }

  // ─── HTTP helper (no external deps) ────────────────────────────────────

  _httpGet(url, timeoutMs) {
    return new Promise((resolve, reject) => {
      const lib     = url.startsWith('https') ? https : http;
      const timer   = setTimeout(() => reject(new Error('HTTP timeout')), timeoutMs);
      const req     = lib.get(url, {
        headers: { 'User-Agent': 'nl.monkeysoft.f1/1.0 Homey' },
      }, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end',  () => {
          clearTimeout(timer);
          resolve(Buffer.concat(chunks).toString('utf8'));
        });
      });
      req.on('error', (err) => { clearTimeout(timer); reject(err); });
    });
  }
}

module.exports = LiveTimingClient;
