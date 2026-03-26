'use strict';

const Homey = require('homey');
const { TRACK_STATUS } = require('../../lib/constants');

class F1TrackDevice extends Homey.Device {

  async onInit() {
    this.log('F1TrackDevice onInit');
    this._unsubs = [];
    this._prevStatus = null;

    await this.homey.app.deviceConnected();
    const lc = this.homey.app.getLiveTimingClient();

    this._unsubs.push(
      lc.subscribe('SessionInfo',  this._onSessionInfo.bind(this)),
      lc.subscribe('TrackStatus', this._onTrackStatus.bind(this)),
      lc.subscribe('WeatherData', this._onWeatherData.bind(this)),
      lc.subscribe('LapCount',    this._onLapCount.bind(this)),
    );
  }

  async onDeleted() {
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
    await this.homey.app.deviceDisconnected();
  }

  // ─── SessionInfo ─────────────────────────────────────────────────────────────

  async _onSessionInfo(data) {
    if (!data) return;
    const info = data.SessionInfo ?? data;

    const circuit = info.Circuit?.ShortName;
    const meeting = info.Meeting?.Name;

    if (circuit) await this._setCapSafe('f1_circuit_name', circuit);
    if (meeting) await this._setCapSafe('f1_meeting_name', meeting);
  }

  // ─── TrackStatus ────────────────────────────────────────────────────────────

  async _onTrackStatus(data) {
    // data: { Status: "1", Message: "AllClear" }  (or wrapped under .TrackStatus)
    if (!data) return;
    const raw = data.Status ?? data.TrackStatus?.Status;
    if (raw === undefined) return;

    const status = TRACK_STATUS[String(raw)] ?? 'UNKNOWN';
    const prev   = this._prevStatus;

    await this._setCapSafe('f1_track_status', status);
    await this._setCapSafe('alarm_generic.safety_car',  status === 'SC');
    await this._setCapSafe('alarm_generic.vsc',         status === 'VSC');
    await this._setCapSafe('alarm_generic.yellow_flag', status === 'YELLOW');
    await this._setCapSafe('alarm_generic.red_flag',    status === 'RED');

    const driver = this.driver;
    const circuit_name = this.getCapabilityValue('f1_circuit_name') ?? '';

    if (status !== prev) {
      await driver._trackStatusChanged.trigger(this, { status, circuit_name }, {});

      if (status === 'SC'     && prev !== 'SC')     await driver._safetyCarDeployed.trigger(this, { circuit_name }, {});
      if (prev  === 'SC'     && status !== 'SC')   await driver._safetyCarRecalled.trigger(this, { circuit_name }, {});
      if (status === 'VSC'   && prev !== 'VSC')    await driver._vscDeployed.trigger(this, { circuit_name }, {});
      if (prev  === 'VSC'    && status !== 'VSC')  await driver._vscRecalled.trigger(this, { circuit_name }, {});
      if (status === 'YELLOW' && prev !== 'YELLOW') await driver._yellowFlagShown.trigger(this, { circuit_name }, {});
      if (prev  === 'YELLOW' && status !== 'YELLOW') await driver._yellowFlagEnded.trigger(this, { circuit_name }, {});
      if (status === 'RED')  await driver._redFlagShown.trigger(this, { circuit_name }, {});
      if (status === 'CLEAR' && prev !== null) await driver._greenFlag.trigger(this, { circuit_name }, {});

      this._prevStatus = status;
    }
  }

  // ─── WeatherData ─────────────────────────────────────────────────────────────

  async _onWeatherData(data) {
    if (!data) return;
    const w = data.WeatherData ?? data;

    const trackTemp  = parseFloat(w.TrackTemp);
    const airTemp    = parseFloat(w.AirTemp);
    const humidity   = parseFloat(w.Humidity);
    const windSpeed  = parseFloat(w.WindSpeed);
    const windDir    = parseFloat(w.WindDirection);
    const rainfall   = parseFloat(w.Rainfall);

    if (!isNaN(trackTemp))  await this._setCapSafe('measure_temperature.track', trackTemp);
    if (!isNaN(airTemp))    await this._setCapSafe('measure_temperature.air',   airTemp);
    if (!isNaN(humidity))   await this._setCapSafe('measure_humidity',           humidity);
    if (!isNaN(windSpeed))  await this._setCapSafe('measure_wind_strength',      windSpeed);
    if (!isNaN(windDir))    await this._setCapSafe('f1_wind_direction',          windDir);
    if (!isNaN(rainfall))   await this._setCapSafe('alarm_generic.rainfall',     rainfall > 0);
  }

  // ─── LapCount ────────────────────────────────────────────────────────────────

  async _onLapCount(data) {
    if (!data) return;
    const lc = data.LapCount ?? data;

    const current = parseInt(lc.CurrentLap, 10);
    const total   = parseInt(lc.TotalLaps,  10);

    if (!isNaN(total))   await this._setCapSafe('f1_lap_total',   total);

    if (!isNaN(current)) {
      const prev = this.getCapabilityValue('f1_lap_count');
      await this._setCapSafe('f1_lap_count', current);
      if (current !== prev) {
        await this.driver._newLapStarted.trigger(this, { lap_number: current, circuit_name: this.getCapabilityValue('f1_circuit_name') ?? '' }, {});
      }
    }
  }

  // ─── Helper ──────────────────────────────────────────────────────────────────

  async _setCapSafe(cap, value) {
    if (!this.hasCapability(cap)) return;
    try {
      await this.setCapabilityValue(cap, value);
    } catch (err) {
      this.error(`setCapabilityValue(${cap}) failed:`, err.message);
    }
  }

}

module.exports = F1TrackDevice;
