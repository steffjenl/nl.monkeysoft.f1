'use strict';

const Homey            = require('homey');
const LiveTimingClient = require('./lib/LiveTimingClient');
const JolpicaClient    = require('./lib/JolpicaClient');

class F1App extends Homey.App {

  async onInit() {
    this.log('Formula 1 Live Timing app initialising…');

    // Shared clients — all drivers access these via this.homey.app.*
    this._liveClient    = new LiveTimingClient(this.homey);
    this._jolpicaClient = new JolpicaClient(this.homey);

    // Track how many devices are actively using the live connection
    this._deviceCount = 0;

    this.log('Formula 1 Live Timing app ready.');
  }

  // ─── Client accessors used by drivers ────────────────────────────────────

  getLiveTimingClient()  { return this._liveClient;    }
  getJolpicaClient()     { return this._jolpicaClient; }

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
    }
  }
}

module.exports = F1App;
