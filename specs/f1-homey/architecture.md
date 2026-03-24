# Architecture

## Overview

`nl.monkeysoft.f1` is a Homey SDK v3 application that streams real-time Formula 1 data into the Homey home-automation platform.

Data is sourced from two upstream systems:

| Source | Protocol | URL |
|---|---|---|
| F1 Live Timing | SignalR 2.x (classic ASP.NET) over WebSocket | `https://livetiming.formula1.com/signalr` |
| Jolpica (Ergast-compatible REST) | HTTPS/JSON | `https://api.jolpi.ca/ergast/f1/` |

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Homey App Process                  │
│                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │  LiveTimingClient    │  │   JolpicaClient       │ │
│  │  (lib/LiveTiming     │  │   (lib/Jolpica        │ │
│  │   Client.js)         │  │    Client.js)         │ │
│  │  SignalR subscriber  │  │  TTL-cached HTTP GET  │ │
│  └──────────┬───────────┘  └──────────────────────┘ │
│             │ pub/sub per stream                     │
│  ┌──────────▼──────────────────────────────────────┐ │
│  │ Devices                                         │ │
│  │  F1TrackDevice   ← TrackStatus, WeatherData,    │ │
│  │                     LapCount                    │ │
│  │  F1SessionDevice ← SessionStatus, SessionInfo,  │ │
│  │                     ExtrapolatedClock,          │ │
│  │                     RaceControlMessages,        │ │
│  │                     TimingData (fastest lap)    │ │
│  │  F1CarDevice     ← DriverList, TimingData,      │ │
│  │                     TyreStintSeries, TopThree   │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
         ↑                          ↑
F1 Live Timing (SignalR)    Jolpica REST (HTTP)
```

---

## Connection Lifecycle

`app.js` maintains a reference count of active devices:

- `deviceConnected()` — increments ref count; connects SignalR on first device
- `deviceDisconnected()` — decrements ref count; disconnects SignalR when count reaches zero

This ensures the WebSocket is open only while at least one device is initialised (i.e. when Homey is active).

---

## LiveTimingClient

`lib/LiveTimingClient.js` implements the classic ASP.NET SignalR 2.x handshake manually using Node.js `https` and `WebSocket`:

1. **Negotiate** — `GET /signalr/negotiate?...` → obtains `ConnectionToken`
2. **Connect** — `wss://livetiming.formula1.com/signalr/connect?transport=webSockets&connectionToken=...`
3. **Subscribe** — sends `{"H":"Streaming","M":"Subscribe","A":[["TrackStatus",...]]}` hub invocation
4. **Receive** — parses both live push messages (`M[]`) and RPC snapshots (`R`)
5. **Reconnect** — exponential back-off (5 s → 60 s max) on drop
6. **Ping** — sends `{}` every 30 s to keep the connection alive

Subscribers receive a cached snapshot immediately on subscribe, then live updates as they arrive.

---

## JolpicaClient

`lib/JolpicaClient.js` wraps the Jolpica (Ergast-compatible) REST API:

- **TTL caching** — each URL is cached for a configurable duration (default: 1 h for schedule, 5 min for standings)
- **Inflight deduplication** — concurrent requests for the same URL are coalesced
- **Stale fallback** — on fetch errors, returns the previous cached value rather than throwing
- Convenience methods: `getSchedule()`, `getDriverStandings()`, `getLastRaceResults()`

---

## Device Model

Each driver produces exactly **one device** (no pairing enumeration). All F1 data is global (there is only one F1 race happening at a time).

| Driver class | Device name | Device `data.id` |
|---|---|---|
| `F1TrackDriver` | F1 Track | `f1-track` |
| `F1SessionDriver` | F1 Session | `f1-session` |
| `F1CarDriver` | F1 Car Data | `f1-car` |

---

## File Structure

```
nl-monkeysoft-f1/
├── app.js                              # App entry point
├── package.json
├── .homeycompose/
│   ├── app.json                        # App manifest
│   └── capabilities/
│       ├── f1_track_status.json
│       ├── f1_session_status.json
│       ├── f1_session_type.json
│       ├── f1_tyre_compound.json
│       ├── f1_race_control_message.json
│       ├── f1_race_control_flag.json
│       ├── f1_race_control_category.json
│       ├── f1_clock_phase.json
│       ├── f1_lap_count.json
│       ├── f1_lap_total.json
│       ├── f1_clock_remaining.json
│       ├── f1_clock_elapsed.json
│       ├── f1_wind_direction.json
│       ├── f1_fastest_lap_time.json
│       ├── f1_fastest_lap_driver.json
│       └── f1_drivers_json.json
├── lib/
│   ├── constants.js
│   ├── LiveTimingClient.js
│   └── JolpicaClient.js
└── drivers/
    ├── f1-track/
    │   ├── driver.compose.json
    │   ├── driver.flow.compose.json
    │   ├── driver.js
    │   └── device.js
    ├── f1-session/
    │   ├── driver.compose.json
    │   ├── driver.flow.compose.json
    │   ├── driver.js
    │   └── device.js
    └── f1-car/
        ├── driver.compose.json
        ├── driver.flow.compose.json
        ├── driver.js
        └── device.js
```
