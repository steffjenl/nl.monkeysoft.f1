'use strict';

const Homey = require('homey');

/**
 * F1CarDevice — represents a single F1 driver/car.
 * The racing number is stored in device data (set during pairing)
 * and used to filter live timing stream data.
 */
class F1CarDevice extends Homey.Device {

  async onInit() {
    this.log('F1CarDevice onInit — racing number:', this.getData().racingNumber);
    this._racingNumber = String(this.getData().racingNumber);
    this._prevPosition = null;
    this._prevInPit    = false;
    this._unsubs       = [];

    await this.homey.app.deviceConnected();
    const lc = this.homey.app.getLiveTimingClient();

    this._unsubs.push(
      lc.subscribe('TimingData',      this._onTimingData.bind(this)),
      lc.subscribe('TyreStintSeries', this._onTyreStintSeries.bind(this)),
    );
  }

  async onDeleted() {
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
    await this.homey.app.deviceDisconnected();
  }

  // ─── TimingData ──────────────────────────────────────────────────────────────

  async _onTimingData(data) {
    if (!data) return;
    const lines = (data.TimingData ?? data).Lines ?? data;
    const line  = lines[this._racingNumber];
    if (!line || typeof line !== 'object') return;

    // Position
    if (line.Position !== undefined) {
      const pos = parseInt(line.Position, 10) || 0;
      if (pos !== this._prevPosition) {
        this._prevPosition = pos;
        await this._setCapSafe('f1_position', pos);
        await this.driver._positionChanged.trigger(this, { position: pos }, {});
      }
    }

    // Last lap time
    if (line.LastLapTime?.Value) {
      const lapTime = line.LastLapTime.Value;
      await this._setCapSafe('f1_last_lap_time', lapTime);
      const pos = this.getCapabilityValue('f1_position') ?? 0;
      await this.driver._lapCompleted.trigger(this, { lap_time: lapTime, position: pos }, {});
    }

    // Personal best lap
    if (line.BestLapTime?.Value) {
      const best    = line.BestLapTime.Value;
      const prevBest = this.getCapabilityValue('f1_fastest_lap_time');
      await this._setCapSafe('f1_fastest_lap_time', best);
      if (best !== prevBest) {
        await this.driver._fastestLap.trigger(this, { lap_time: best }, {});
      }
    }

    // Gap to leader
    if (line.GapToLeader !== undefined) {
      await this._setCapSafe('f1_gap_to_leader', String(line.GapToLeader));
    }

    // Pit lane
    const inPit = !!(line.InPit ?? line.Pit);
    if (inPit !== this._prevInPit) {
      this._prevInPit = inPit;
      await this._setCapSafe('alarm_generic.pit_active', inPit);
      if (inPit) await this.driver._enteredPit.trigger(this, {}, {});
      else        await this.driver._exitedPit.trigger(this, {}, {});
    }

    // Pit stop count
    if (line.NumberOfPitStops !== undefined) {
      await this._setCapSafe('f1_pit_count', parseInt(line.NumberOfPitStops, 10) || 0);
    }
  }

  // ─── TyreStintSeries ────────────────────────────────────────────────────────

  _onTyreStintSeries(data) {
    if (!data) return;
    const series = data.TyreStintSeries ?? data;
    if (typeof series !== 'object') return;

    const stints = series[this._racingNumber];
    if (!stints || typeof stints !== 'object') return;

    const keys   = Object.keys(stints).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const latest = stints[keys[keys.length - 1]];
    if (!latest) return;

    if (latest.Compound)              this._setCapSafe('f1_tyre_compound', latest.Compound);
    if (latest.TotalLaps !== undefined) this._setCapSafe('f1_tyre_laps', parseInt(latest.TotalLaps, 10) || 0);
  }

  // ─── Utility ────────────────────────────────────────────────────────────────

  async _setCapSafe(cap, value) {
    if (!this.hasCapability(cap)) return;
    try {
      await this.setCapabilityValue(cap, value);
    } catch (err) {
      this.error(`setCapabilityValue(${cap}) failed:`, err.message);
    }
  }

}

