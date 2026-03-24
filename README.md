# nl.monkeysoft.f1 — Formula 1 for Homey

Stream real-time Formula 1 data into your Homey smart home.

This app connects to **F1 Live Timing** (SignalR) and exposes track conditions, session state, and driver data as Homey devices with rich flow-card support.

---

## Devices

| Device | Description |
|---|---|
| **F1 Track** | Track status, weather (track/air temp, humidity, wind), safety car alarms, lap count |
| **F1 Session** | Session status, session clock (remaining/elapsed), race control messages, fastest lap |
| **F1 Car Data** | All-driver JSON blob, tyre compounds (P1/P2/P3), pit stop detection, fastest lap |

---

## Flow Cards

### Triggers
- Safety car deployed / recalled
- VSC deployed / recalled
- Red flag shown / Green flag
- New lap started
- Session started / finished
- Race control message received
- Qualifying part changed (Q1/Q2/Q3)
- Driver entered / exited pit
- Fastest lap set
- Driver position changed
- Top 3 updated

### Conditions
- Track status is [CLEAR / YELLOW / SC / VSC / RED]
- Safety car is active
- It is raining at the track
- Session is live
- Session type is [Race / Qualifying / Practice]
- Driver is in pit
- Driver tyre compound is [SOFT / MEDIUM / HARD / INTERMEDIATE / WET]

---

## Data Source

Live data is streamed from `livetiming.formula1.com` using the classic SignalR protocol.  
Season schedule and standings come from the [Jolpica API](https://api.jolpi.ca) (Ergast-compatible).

---

## Specs

Detailed technical documentation is in [`/specs/f1-homey/`](specs/f1-homey/):

- [Architecture](specs/f1-homey/architecture.md)
- [Capabilities](specs/f1-homey/capabilities.md)
- [Drivers](specs/f1-homey/drivers.md)
- [Events & Flows](specs/f1-homey/events-and-flows.md)
- [API Reference](specs/f1-homey/api-reference.md)
- [Data Schemas](specs/f1-homey/data-schemas.md)
- [Testing Guide](specs/f1-homey/testing-guide.md)

---

## Development

```bash
npm install
homey app validate
homey app run
```

Requires Homey CLI (`npm i -g homey`) and a Homey device on your network.

---

## Credits

Inspired by the [F1 Sensor](https://github.com/Nicxe/f1_sensor) Home Assistant integration by Nicxe.

