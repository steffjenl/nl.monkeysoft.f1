'use strict';

const Homey = require('homey');
const { SESSION_STATUS } = require('../../lib/constants');

// Extrapolated clock ticks every second when running
const CLOCK_INTERVAL_MS = 1000;

class F1SessionDevice extends Homey.Device {

  async onInit() {
    this.log('F1SessionDevice onInit — sessionType:', this.getData().sessionType ?? 'generic');
    this._targetType     = this.getData().sessionType || null;  // null = generic device, no filter
    this._liveSessionType = null;
    this._unsubs         = [];
    this._prevStatus     = null;
    this._prevQualPart   = null;
    this._circuitName    = '';
    this._clockTimer     = null;
    this._clockRunning   = false;
    this._clockRemaining = 0;   // seconds
    this._clockElapsed   = 0;   // seconds
    this._clockLastSync  = null; // Date.now() when last synced from stream

    await this.homey.app.deviceConnected();
    const lc = this.homey.app.getLiveTimingClient();

    this._unsubs.push(
      lc.subscribe('SessionStatus',      this._onSessionStatus.bind(this)),
      lc.subscribe('SessionInfo',        this._onSessionInfo.bind(this)),
      lc.subscribe('ExtrapolatedClock',  this._onExtrapolatedClock.bind(this)),
      lc.subscribe('RaceControlMessages', this._onRaceControlMessages.bind(this)),
      lc.subscribe('TimingData',         this._onTimingDataForFastestLap.bind(this)),
    );
  }

  async onDeleted() {
    this._stopClockTimer();
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
    await this.homey.app.deviceDisconnected();
  }

  // ─── SessionStatus ───────────────────────────────────────────────────────────

  async _onSessionStatus(data) {
    if (!data) return;
    if (this._targetType && this._liveSessionType !== this._targetType) return;
    const raw = data.Status ?? data.SessionStatus?.Status;
    if (!raw) return;

    const status = SESSION_STATUS[raw] ?? raw.toLowerCase();
    const prev   = this._prevStatus;

    await this._setCapSafe('f1_session_status', status);

    if (status !== prev) {
      const driver = this.driver;
      await driver._sessionStatusChanged.trigger(this, { status, circuit_name: this._circuitName }, {});

      if (status === 'started') {
        const sessionType = this.getCapabilityValue('f1_session_type') ?? '';
        await driver._sessionStarted.trigger(this, { session_type: sessionType, circuit_name: this._circuitName }, {});
      }

      if (status === 'finished' || status === 'finalised') {
        await driver._sessionFinished.trigger(this, { circuit_name: this._circuitName }, {});
      }

      this._prevStatus = status;
    }
  }

  // ─── SessionInfo ─────────────────────────────────────────────────────────────

  async _onSessionInfo(data) {
    if (!data) return;
    const info = data.SessionInfo ?? data;
    const type = info.Type ?? info.Name;
    if (type) {
      this._liveSessionType = String(type);
      // Only update capability if this device matches the session type (or is generic)
      if (!this._targetType || this._liveSessionType === this._targetType) {
        await this._setCapSafe('f1_session_type', this._liveSessionType);
      }
    }
    const circuit = info.Circuit?.ShortName;
    if (circuit) this._circuitName = circuit;
  }

  // ─── ExtrapolatedClock ───────────────────────────────────────────────────────

  async _onExtrapolatedClock(data) {
    if (!data) return;
    if (this._targetType && this._liveSessionType !== this._targetType) return;
    const ec = data.ExtrapolatedClock ?? data;

    const remaining = ec.Remaining; // "HH:MM:SS" string
    const elapsed   = ec.Elapsed;
    const paused    = ec.Extrapolating === false;

    if (remaining !== undefined) {
      this._clockRemaining = this._parseTimeString(remaining);
      this._clockLastSync  = Date.now();
    }
    if (elapsed !== undefined) {
      this._clockElapsed = this._parseTimeString(elapsed);
    }

    // Determine phase
    const sessionStatus = this.getCapabilityValue('f1_session_status');
    let phase = 'idle';
    if (sessionStatus === 'started') {
      phase = paused ? 'paused' : 'running';
    } else if (sessionStatus === 'finished' || sessionStatus === 'finalised') {
      phase = 'finished';
    }
    await this._setCapSafe('f1_clock_phase', phase);

    // Sync displayed values immediately
    await this._setCapSafe('f1_clock_remaining', this._clockRemaining);
    await this._setCapSafe('f1_clock_elapsed',   this._clockElapsed);

    // Manage local tick timer
    if (phase === 'running') {
      this._startClockTimer();
    } else {
      this._stopClockTimer();
    }
  }

  _startClockTimer() {
    if (this._clockTimer) return;
    this._clockTimer = this.homey.setInterval(async () => {
      const elapsed = (Date.now() - this._clockLastSync) / 1000;
      const rem = Math.max(0, this._clockRemaining - elapsed);
      const elp = this._clockElapsed + elapsed;
      await this._setCapSafe('f1_clock_remaining', Math.round(rem));
      await this._setCapSafe('f1_clock_elapsed',   Math.round(elp));
    }, CLOCK_INTERVAL_MS);
  }

  _stopClockTimer() {
    if (!this._clockTimer) return;
    this.homey.clearInterval(this._clockTimer);
    this._clockTimer = null;
  }

  // ─── RaceControlMessages ─────────────────────────────────────────────────────

  async _onRaceControlMessages(data) {
    if (!data) return;
    if (this._targetType && this._liveSessionType !== this._targetType) return;
    // Data is a dict keyed by numeric string index, newest = highest key
    const msgs = data.Messages ?? data;
    if (typeof msgs !== 'object') return;

    const keys = Object.keys(msgs).sort((a, b) => parseInt(a) - parseInt(b));
    if (!keys.length) return;

    const latest = msgs[keys[keys.length - 1]];
    if (!latest) return;

    const message  = String(latest.Message  ?? '');
    const flag     = String(latest.Flag     ?? '');
    const category = String(latest.Category ?? '');

    await this._setCapSafe('f1_race_control_message',  message);
    await this._setCapSafe('f1_race_control_flag',     flag);
    await this._setCapSafe('f1_race_control_category', category);

    await this.driver._raceControlMessageRcvd.trigger(this, { message, flag, category, circuit_name: this._circuitName }, {});

    // Detect qualifying part changes from messages like "Q1 PERIOD STARTED"
    const qMatch = message.match(/^(Q[123])\s+PERIOD\s+STARTED/i);
    if (qMatch) {
      const part = qMatch[1];
      if (part !== this._prevQualPart) {
        this._prevQualPart = part;
        await this.driver._qualifyingPartChanged.trigger(this, { part, circuit_name: this._circuitName }, {});
      }
    }
  }

  // ─── TimingData (fastest lap only) ──────────────────────────────────────────

  async _onTimingDataForFastestLap(data) {
    if (!data) return;
    if (this._targetType && this._liveSessionType !== this._targetType) return;
    const td = data.TimingData ?? data;
    const bestTimes = td.BestLapTimes;
    if (!bestTimes) return;

    // Find overall fastest
    let bestTime = null;
    let bestDriver = null;

    for (const [driverNum, driverData] of Object.entries(bestTimes)) {
      const t = driverData?.Value;
      if (!t) continue;
      if (!bestTime || this._compareTimes(t, bestTime) < 0) {
        bestTime   = t;
        bestDriver = driverNum;
      }
    }

    if (bestTime) {
      const prevTime   = this.getCapabilityValue('f1_fastest_lap_time');
      const prevDriver = this.getCapabilityValue('f1_fastest_lap_driver');

      await this._setCapSafe('f1_fastest_lap_time',   bestTime);
      await this._setCapSafe('f1_fastest_lap_driver', bestDriver ?? '');

      if (bestTime !== prevTime || bestDriver !== prevDriver) {
        await this.driver._fastestLapUpdated.trigger(this, {
          driver:       bestDriver ?? '',
          time:         bestTime,
          circuit_name: this._circuitName,
        }, {});
      }
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /** Parse "HH:MM:SS" or "MM:SS" or "HH:MM:SS.mmm" → seconds */
  _parseTimeString(str) {
    if (typeof str !== 'string') return 0;
    const parts = str.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60  + parts[1];
    return 0;
  }

  /** Compare lap time strings "M:SS.mmm". Returns negative if a < b */
  _compareTimes(a, b) {
    return this._lapTimeToMs(a) - this._lapTimeToMs(b);
  }

  _lapTimeToMs(str) {
    if (typeof str !== 'string') return Infinity;
    const [minSec, ms] = str.split('.');
    const parts = minSec.split(':').map(Number);
    const totalMs = (parts.length === 2
      ? parts[0] * 60000 + parts[1] * 1000
      : parts[0] * 1000)
      + parseInt(ms ?? 0, 10);
    return totalMs;
  }

  async _setCapSafe(cap, value) {
    if (!this.hasCapability(cap)) return;
    try {
      await this.setCapabilityValue(cap, value);
    } catch (err) {
      this.error(`setCapabilityValue(${cap}) failed:`, err.message);
    }
  }

}

module.exports = F1SessionDevice;
