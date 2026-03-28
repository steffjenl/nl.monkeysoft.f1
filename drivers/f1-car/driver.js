'use strict';

const Homey = require('homey');

class F1CarDriver extends Homey.Driver {

  async onInit() {
    // Triggers — one device = one driver, so no driver_number tokens needed
    this._enteredPit       = this.homey.flow.getDeviceTriggerCard('driver_entered_pit');
    this._exitedPit        = this.homey.flow.getDeviceTriggerCard('driver_exited_pit');
    this._lapCompleted     = this.homey.flow.getDeviceTriggerCard('driver_lap_completed');
    this._positionChanged  = this.homey.flow.getDeviceTriggerCard('driver_position_changed');
    this._fastestLap       = this.homey.flow.getDeviceTriggerCard('driver_fastest_lap');
    this._drsActivated     = this.homey.flow.getDeviceTriggerCard('drs_activated');
    this._wentOffTrack     = this.homey.flow.getDeviceTriggerCard('driver_went_off_track');
    this._onTrackAgain     = this.homey.flow.getDeviceTriggerCard('driver_on_track_again');

    // Conditions
    this.homey.flow.getConditionCard('driver_is_on_track')
      .registerRunListener((args) => {
        return !!args.device.getCapabilityValue('f1_car_on_track');
      });

    this.homey.flow.getConditionCard('driver_is_in_pit')
      .registerRunListener((args) => {
        return !!args.device.getCapabilityValue('alarm_generic.pit_active');
      });

    this.homey.flow.getConditionCard('driver_tyre_compound_is')
      .registerRunListener((args) => {
        return args.device.getCapabilityValue('f1_tyre_compound') === args.compound;
      });

    this.homey.flow.getConditionCard('driver_position_is_in_top')
      .registerRunListener((args) => {
        const pos = args.device.getCapabilityValue('f1_position');
        return typeof pos === 'number' && pos > 0 && pos <= args.top_n;
      });
  }

  async onPair(session) {
    session.setHandler('list_devices', async () => {
      try {
        const jc = this.homey.app.getJolpicaClient();
        const data = await jc.getDriverStandings();
        const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
        return standings.map((entry) => {
          const d = entry.Driver;
          const num = String(d.permanentNumber ?? d.code ?? d.driverId);
          return {
            name: `#${num} ${d.givenName} ${d.familyName}`,
            data: { id: `f1-car-${num}`, racingNumber: num },
          };
        });
      } catch (err) {
        this.error('Failed to fetch driver list:', err.message);
        return [];
      }
    });
  }

}

module.exports = F1CarDriver;
