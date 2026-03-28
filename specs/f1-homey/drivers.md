# Drivers

This document describes the three Homey device drivers included in `nl.monkeysoft.f1`.

---

## F1 Track (`f1-track`)

**Purpose**: Exposes circuit and weather conditions, safety car status, and lap count.

**Device name**: `F1 Track`  
**Device data ID**: `f1-track`

### Capabilities

| Capability | Type | Description |
|---|---|---|
| `f1_track_status` | enum | Track status (CLEAR / YELLOW / SC / VSC / RED) |
| `alarm_generic.safety_car` | boolean | True when safety car is deployed |
| `alarm_generic.vsc` | boolean | True when virtual safety car is deployed |
| `alarm_generic.red_flag` | boolean | True when red flag is shown |
| `alarm_generic.rainfall` | boolean | True when rainfall > 0 at circuit |
| `f1_lap_count` | number | Current lap number |
| `f1_lap_total` | number | Total scheduled laps |
| `measure_temperature.track` | number | Track surface °C |
| `measure_temperature.air` | number | Air temperature °C |
| `measure_humidity` | number | Relative humidity % |
| `measure_wind_strength` | number | Wind speed m/s |
| `f1_wind_direction` | number | Wind direction ° |

### Subscribed Streams

| Stream | Data used |
|---|---|
| `TrackStatus` | `Status` field (integer code → enum) |
| `WeatherData` | `TrackTemp`, `AirTemp`, `Humidity`, `WindSpeed`, `WindDirection`, `Rainfall` |
| `LapCount` | `CurrentLap`, `TotalLaps` |

### Status Code Mapping

| Code | Status |
|---|---|
| `1` | CLEAR |
| `2`, `3` | YELLOW |
| `4` | SC |
| `5` | RED |
| `6`, `7` | VSC |

---

## F1 Session (`f1-session`)

**Purpose**: Exposes session lifecycle, session clock, and race control messages.

**Device name**: `F1 Session`  
**Device data ID**: `f1-session`

### Capabilities

| Capability | Type | Description |
|---|---|---|
| `f1_session_status` | enum | Session lifecycle state |
| `f1_session_type` | string | Session name (Race / Qualifying / Practice N) |
| `f1_clock_remaining` | number | Seconds remaining on clock |
| `f1_clock_elapsed` | number | Seconds elapsed since session start |
| `f1_clock_phase` | enum | idle / running / paused / finished |
| `f1_race_control_message` | string | Latest Race Control message text |
| `f1_race_control_flag` | string | Flag from latest message |
| `f1_race_control_category` | string | Category from latest message |
| `f1_fastest_lap_time` | string | Fastest lap time (M:SS.mmm) |
| `f1_fastest_lap_driver` | string | Driver number holding fastest lap |

### Subscribed Streams

| Stream | Data used |
|---|---|
| `SessionStatus` | `Status` string |
| `SessionInfo` | `Type` / `Name` |
| `ExtrapolatedClock` | `Remaining`, `Elapsed`, `Extrapolating` |
| `RaceControlMessages` | `Messages` dict — latest entry |
| `TimingData` | `Lines[n].BestLapTime.Value` for fastest lap tracking |

### Clock Interpolation

The `ExtrapolatedClock` stream delivers updates roughly every second during a live session. `F1SessionDevice` also starts a local 1-second `setInterval` to keep `f1_clock_remaining` / `f1_clock_elapsed` ticking smoothly between stream updates, using the last received sync timestamp as the reference.

---

## F1 Car (`f1-car`)

**Purpose**: Tracks all driver positions, tyre compounds, pit stops, fastest lap, and live telemetry across the field.

**Device name**: `F1 Car`  
**Device data ID**: `f1-car`

### Capabilities

| Capability | Type | Description | Requires F1 TV Pro |
|---|---|---|---|
| `f1_drivers_json` | string (JSON) | Full driver state map — see [data-schemas.md](data-schemas.md) | No |
| `f1_fastest_lap_time` | string | Fastest lap time in field | No |
| `f1_fastest_lap_driver` | string | Driver number holding fastest lap | No |
| `alarm_generic.pit_active` | boolean | A driver is currently in pit | No |
| `f1_tyre_compound.p1` | enum | P1 driver tyre compound | No |
| `f1_tyre_compound.p2` | enum | P2 driver tyre compound | No |
| `f1_tyre_compound.p3` | enum | P3 driver tyre compound | No |
| `f1_car_speed` | number | Speed in km/h | Yes |
| `f1_car_rpm` | number | Engine RPM | Yes |
| `f1_car_gear` | number | Current gear (0 = neutral) | Yes |
| `f1_car_throttle` | number | Throttle position 0–100% | Yes |
| `f1_car_brake` | number | Brake applied 0 or 1 | Yes |
| `f1_car_drs` | number | DRS status value (12/14 = open) | Yes |
| `f1_car_on_track` | boolean | Driver is on track (not off track/stopped) | Yes |

### Subscribed Streams

| Stream | Data used | Requires F1 TV Pro |
|---|---|---|
| `DriverList` | `Tla` (short name), `TeamName`, `RacingNumber` | No |
| `TimingData` | `Lines[n]`: Position, LastLapTime, BestLapTime, GapToLeader, InPit, NumberOfPitStops, Sectors | No |
| `TyreStintSeries` | Latest stint per driver: `Compound`, `TotalLaps` | No |
| `TopThree` | `Lines` — top 3 positions for `top_three_updated` trigger | No |
| `CarData.z` | Per-driver channel map: Speed, RPM, Gear, Throttle, Brake, DRS | Yes |
| `Position.z` | Per-driver position and on-track status | Yes |

### State Management

`F1CarDevice` maintains an internal `_driversState` map keyed by racing number (string). This map is built incrementally:

1. `DriverList` populates `ShortName` and `TeamName`
2. `TimingData` delivers **incremental deltas** — only changed fields are present; the device merges these into the existing state
3. `TyreStintSeries` updates `TyreCompound` and `TyreLaps` per driver
4. `CarData.z` updates live telemetry values and fires `drs_activated` trigger on DRS state change
5. `Position.z` updates `f1_car_on_track` capability and fires `driver_went_off_track` / `driver_on_track_again` triggers

After each public-data update, the entire map is serialised to JSON and written to `f1_drivers_json`.
