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
        { name: 'Race',              data: { id: 'f1-session-race',              sessionType: 'Race' } },
        { name: 'Qualifying',        data: { id: 'f1-session-qualifying',        sessionType: 'Qualifying' } },
        { name: 'Practice 1',        data: { id: 'f1-session-practice-1',        sessionType: 'Practice 1' } },
        { name: 'Practice 2',        data: { id: 'f1-session-practice-2',        sessionType: 'Practice 2' } },
        { name: 'Practice 3',        data: { id: 'f1-session-practice-3',        sessionType: 'Practice 3' } },
        { name: 'Sprint',            data: { id: 'f1-session-sprint',            sessionType: 'Sprint' } },
        { name: 'Sprint Qualifying', data: { id: 'f1-session-sprint-qualifying', sessionType: 'Sprint Qualifying' } },
      ];
    });
  }

}

module.exports = F1SessionDriver;
