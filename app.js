'use strict';

const Homey            = require('homey');
const LiveTimingClient = require('./lib/LiveTimingClient');
const JolpicaClient    = require('./lib/JolpicaClient');
const F1AuthClient     = require('./lib/F1AuthClient');

class F1App extends Homey.App {

  async onInit() {
    this.log('Formula 1 Live Timing app initialising…');

    const debugMode = Homey.env.DEBUG === 'true';

    // Shared clients — all drivers access these via this.homey.app.*
    this._liveClient    = new LiveTimingClient(this.homey, debugMode);
    this._jolpicaClient = new JolpicaClient(this.homey);
    this._authClient    = new F1AuthClient(this.homey);

    // Track how many devices are actively using the live connection
    this._deviceCount = 0;

    // Forward SignalR connection events to the settings page
    this._liveClient.on('connected',    () => this._emitSignalRStatus());
    this._liveClient.on('disconnected', () => this._emitSignalRStatus());

    // Forward auth token changes to the live client so authenticated streams
    // (CarData.z, Position.z) connect/disconnect when the user logs in/out
    this._authClient.on('tokenChanged', (token) => {
      this._liveClient.setAuthToken(token).catch((err) => {
        this.error('setAuthToken failed:', err.message);
      });
      this._emitAuthStatus();
    });

    // Initialise auth client — loads persisted token and watches for settings changes
    this._authClient.init();

    // Store initial (disconnected) status so the settings page shows something on first load
    this._emitSignalRStatus();
    this._emitAuthStatus();

    this.log('Formula 1 Live Timing app ready.');
  }

  // ─── Client accessors used by drivers ────────────────────────────────────

  getLiveTimingClient()  { return this._liveClient;    }
  getJolpicaClient()     { return this._jolpicaClient; }
  getAuthClient()        { return this._authClient;    }

  /**
   * Called by each device when it initialises.
   * Starts the SignalR connection when the first device comes online.
   */
  async deviceConnected() {
    this._deviceCount++;
    if (this._deviceCount === 1) {
      this.log('First device connected — starting Live Timing connection…');
      try {
        await this._liveClient.connect();
      } catch (err) {
        this.error('Failed to connect to F1 Live Timing:', err.message);
      }
    }
  }

  /**
   * Called by each device when it is removed.
   * Stops the SignalR connection when the last device is removed.
   */
  async deviceDisconnected() {
    this._deviceCount = Math.max(0, this._deviceCount - 1);
    if (this._deviceCount === 0) {
      this.log('Last device removed — stopping Live Timing connection.');
      await this._liveClient.disconnect();
      this._emitSignalRStatus();
    }
  }

  // ─── Settings API ─────────────────────────────────────────────────────────

  _signalRStatusPayload() {
    return {
      connected:      this._liveClient.isConnected,
      reconnecting:   this._liveClient.isReconnecting,
      reconnectCount: this._liveClient.reconnectCount,
      lastMessageAt:  this._liveClient.lastMessageAt,
    };
  }

  _emitSignalRStatus() {
    const payload = this._signalRStatusPayload();
    this.homey.settings.set('f1:signalrStatus', payload);
    this.homey.emit('nl.monkeysoft.f1.signalr.status', payload);
  }

  _emitAuthStatus() {
    const info    = this._authClient.getTokenInfo();
    const payload = {
      authenticated: this._authClient.isAuthenticated(),
      product:       info ? info.product  : null,
      expires:       info ? info.expires?.toISOString() : null,
    };
    this.homey.settings.set('f1auth:status', payload);
    this.homey.emit('nl.monkeysoft.f1.auth.status', payload);
  }
}

module.exports = F1App;
