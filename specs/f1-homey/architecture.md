# Architecture

## Overview

`nl.monkeysoft.f1` is a Homey SDK v3 application that streams real-time Formula 1 data into the Homey home-automation platform.

Data is sourced from two upstream systems:

| Source | Protocol | URL |
|---|---|---|
| F1 Live Timing | SignalR Core over WebSocket (`@microsoft/signalr`) | `https://livetiming.formula1.com/signalrcore` |
| Jolpica (Ergast-compatible REST) | HTTPS/JSON | `https://api.jolpi.ca/ergast/f1/` |

Authenticated telemetry streams (`CarData.z`, `Position.z`) require an F1 TV Pro subscription token managed by `F1AuthClient`.

---

## High-Level Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Homey App Process                      │
│                                                           │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ LiveTimingClient │  │ JolpicaClient│  │F1AuthClient│  │
│  │  @microsoft/     │  │  TTL-cached  │  │ JWT token  │  │
│  │  signalr Core    │  │  HTTP GET    │  │ lifecycle  │  │
│  └────────┬─────────┘  └──────────────┘  └─────┬──────┘  │
│           │ pub/sub per stream                  │token    │
│           │◄────────────────────────────────────┘         │
│  ┌────────▼─────────────────────────────────────────────┐ │
│  │ Devices                                              │ │
│  │  F1TrackDevice   ← TrackStatus, WeatherData,         │ │
│  │                     LapCount                         │ │
│  │  F1SessionDevice ← SessionStatus, SessionInfo,       │ │
│  │                     ExtrapolatedClock,               │ │
│  │                     RaceControlMessages              │ │
│  │  F1CarDevice     ← TimingData, TyreStintSeries,      │ │
│  │                     CarData.z*, Position.z*          │ │
│  │                     (* F1 TV Pro required)           │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
         ↑                          ↑
F1 Live Timing (SignalR Core)   Jolpica REST (HTTP)
```

---

## F1 TV Pro Authentication

Users with an F1 TV Pro subscription can unlock live telemetry streams. Authentication uses a popup-based relay flow:

1. User clicks "Connect with F1 TV Pro" in the **Account** settings tab.
2. A popup opens the relay page (`auth/index.html`) which posts credentials to the F1 API (`api.formula1.com`).
3. The relay page calls `window.opener.postMessage({ type: 'f1auth:token', subscriptionToken })`.
4. The settings page receives the JWT and stores it via `Homey.set('f1auth:token', jwt)`.
5. `F1AuthClient` (watching settings changes) emits `tokenChanged(jwt)`.
6. `app.js` calls `liveClient.setAuthToken(jwt)` → triggers a SignalR reconnect with `accessTokenFactory`.
7. The server now delivers `CarData.z` and `Position.z` streams.

The JWT is parsed (no signature verification) to extract expiry and subscription product name. An expiry timer fires `tokenExpired` 5 minutes before the token expires.

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
