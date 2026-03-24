'use strict';

const Homey = require('homey');

class F1SessionDriver extends Homey.Driver {

  async onInit() {
    // Triggers
    this._sessionStatusChanged     = this.homey.flow.getDeviceTriggerCard('session_status_changed');
    this._sessionStarted           = this.homey.flow.getDeviceTriggerCard('session_started');
    this._sessionFinished          = this.homey.flow.getDeviceTriggerCard('session_finished');
    this._raceControlMessageRcvd   = this.homey.flow.getDeviceTriggerCard('race_control_message_received');
    this._qualifyingPartChanged    = this.homey.flow.getDeviceTriggerCard('qualifying_part_changed');
    this._fastestLapUpdated        = this.homey.flow.getDeviceTriggerCard('fastest_lap_updated');

    // Conditions
    this.homey.flow.getConditionCard('session_is_live')
      .registerRunListener((args) => {
        const status = args.device.getCapabilityValue('f1_session_status');
        return status === 'started';
      });

    this.homey.flow.getConditionCard('session_type_is')
      .registerRunListener((args) => {
        return args.device.getCapabilityValue('f1_session_type') === args.type;
      });

    this.homey.flow.getConditionCard('session_status_is')
      .registerRunListener((args) => {
        return args.device.getCapabilityValue('f1_session_status') === args.status;
      });
  }

  async onPair(session) {
    session.setHandler('list_devices', async () => {
      return [
        {
          name: 'F1 Session',
          data: { id: 'f1-session' },
        },
      ];
    });
  }

}

module.exports = F1SessionDriver;
