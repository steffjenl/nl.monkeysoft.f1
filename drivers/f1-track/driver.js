'use strict';

const Homey = require('homey');

class F1TrackDriver extends Homey.Driver {

  async onInit() {
    // Track status changed
    this._trackStatusChanged = this.homey.flow.getDeviceTriggerCard('track_status_changed');

    // Safety car / VSC / red flag
    this._safetyCarDeployed  = this.homey.flow.getDeviceTriggerCard('safety_car_deployed');
    this._safetyCarRecalled  = this.homey.flow.getDeviceTriggerCard('safety_car_recalled');
    this._vscDeployed        = this.homey.flow.getDeviceTriggerCard('vsc_deployed');
    this._vscRecalled        = this.homey.flow.getDeviceTriggerCard('vsc_recalled');
    this._redFlagShown       = this.homey.flow.getDeviceTriggerCard('red_flag_shown');
    this._greenFlag          = this.homey.flow.getDeviceTriggerCard('green_flag');
    this._yellowFlagShown    = this.homey.flow.getDeviceTriggerCard('yellow_flag_shown');
    this._yellowFlagEnded    = this.homey.flow.getDeviceTriggerCard('yellow_flag_ended');

    // Lap
    this._newLapStarted = this.homey.flow.getDeviceTriggerCard('new_lap_started');

    // Conditions
    this.homey.flow.getConditionCard('track_status_is')
      .registerRunListener((args, state) => {
        return args.device.getCapabilityValue('f1_track_status') === args.status;
      });

    this.homey.flow.getConditionCard('safety_car_is_active')
      .registerRunListener((args, state) => {
        return !!args.device.getCapabilityValue('alarm_generic.safety_car');
      });

    this.homey.flow.getConditionCard('is_raining_at_track')
      .registerRunListener((args, state) => {
        return !!args.device.getCapabilityValue('alarm_generic.rainfall');
      });
  }

  async onPair(session) {
    session.setHandler('list_devices', async () => {
      return [
        {
          name: 'F1 Track',
          data: { id: 'f1-track' },
        },
      ];
    });
  }

}

module.exports = F1TrackDriver;
