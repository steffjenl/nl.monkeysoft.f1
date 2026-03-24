# Capabilities

All custom capabilities are defined in `.homeycompose/capabilities/`. They follow Homey SDK v3 conventions.

---

## Enum Capabilities

### `f1_track_status`
- **Type**: `enum`
- **UI Component**: `picker`
- **Values**: `CLEAR`, `YELLOW`, `SC`, `VSC`, `RED`, `UNKNOWN`
- **Description**: Current track status as broadcast by F1 Live Timing (`TrackStatus` stream). Mapped from integer status codes: 1→CLEAR, 2/3→YELLOW, 4→SC, 5→RED, 6/7→VSC.

### `f1_session_status`
- **Type**: `enum`
- **UI Component**: `sensor`
- **Values**: `inactive`, `started`, `aborted`, `finished`, `finalised`, `ends`
- **Description**: Lifecycle state of the current F1 session (`SessionStatus` stream).

### `f1_tyre_compound`
- **Type**: `enum`
- **UI Component**: `picker`
- **Values**: `SOFT`, `MEDIUM`, `HARD`, `INTERMEDIATE`, `WET`, `UNKNOWN`
- **Description**: Current tyre compound. Used as sub-capabilities `f1_tyre_compound.p1`, `.p2`, `.p3`.

### `f1_clock_phase`
- **Type**: `enum`
- **UI Component**: `sensor`
- **Values**: `idle`, `running`, `paused`, `finished`
- **Description**: Whether the session clock is counting down, paused (red flag), or finished.

---

## String Capabilities

### `f1_session_type`
- **Type**: `string`
- **UI Component**: `sensor`
- **Description**: Human-readable session name, e.g. `"Race"`, `"Qualifying"`, `"Practice 1"`.

### `f1_race_control_message`
- **Type**: `string`
- **UI Component**: `sensor`
- **Description**: Text of the latest Race Control message.

### `f1_race_control_flag`
- **Type**: `string`
- **UI Component**: `sensor`
- **Description**: Flag associated with the latest Race Control message (e.g. `"GREEN"`, `"YELLOW"`).

### `f1_race_control_category`
- **Type**: `string`
- **UI Component**: `sensor`
- **Description**: Category of the latest Race Control message (e.g. `"Flag"`, `"SafetyCar"`, `"Drs"`).

### `f1_fastest_lap_time`
- **Type**: `string`
- **UI Component**: `sensor`
- **Description**: Current fastest lap time formatted as `M:SS.mmm`.

### `f1_fastest_lap_driver`
- **Type**: `string`
- **UI Component**: `sensor`
- **Description**: Racing number of the driver holding the fastest lap.

### `f1_drivers_json`
- **Type**: `string`
- **UI Component**: `null` (hidden from device UI)
- **Description**: JSON-serialised map of all driver data. Keyed by racing number. Intended for advanced flows and logic apps. See [data-schemas.md](data-schemas.md) for structure.

---

## Number Capabilities

### `f1_lap_count`
- **Type**: `number`
- **UI Component**: `sensor`
- **Range**: 0 – 100
- **Description**: Current lap number.

### `f1_lap_total`
- **Type**: `number`
- **UI Component**: `sensor`
- **Range**: 0 – 100
- **Description**: Total scheduled laps in the race.

### `f1_clock_remaining`
- **Type**: `number`
- **UI Component**: `sensor`
- **Units**: `s` (seconds)
- **Range**: 0 – 14400 (4 hours)
- **Description**: Seconds remaining on the session clock. Interpolated locally between SignalR updates.

### `f1_clock_elapsed`
- **Type**: `number`
- **UI Component**: `sensor`
- **Units**: `s`
- **Range**: 0 – 14400
- **Description**: Seconds elapsed since session start.

### `f1_wind_direction`
- **Type**: `number`
- **UI Component**: `sensor`
- **Units**: `°` (degrees)
- **Range**: 0 – 360
- **Description**: Wind direction in degrees at the circuit.

---

## Standard Homey Capabilities (Sub-capabilities)

These are standard Homey capabilities used with sub-capability IDs:

| Capability ID | Standard cap | Description |
|---|---|---|
| `measure_temperature.track` | `measure_temperature` | Track surface temperature (°C) |
| `measure_temperature.air` | `measure_temperature` | Air temperature (°C) |
| `measure_humidity` | `measure_humidity` | Relative humidity (%) |
| `measure_wind_strength` | `measure_wind_strength` | Wind speed (m/s) |
| `alarm_generic.safety_car` | `alarm_generic` | Safety car deployed |
| `alarm_generic.vsc` | `alarm_generic` | Virtual safety car deployed |
| `alarm_generic.red_flag` | `alarm_generic` | Red flag shown |
| `alarm_generic.rainfall` | `alarm_generic` | Rainfall detected at circuit |
| `alarm_generic.pit_active` | `alarm_generic` | A driver is currently in the pit lane |
| `f1_tyre_compound.p1` | `f1_tyre_compound` | Tyre compound of P1 |
| `f1_tyre_compound.p2` | `f1_tyre_compound` | Tyre compound of P2 |
| `f1_tyre_compound.p3` | `f1_tyre_compound` | Tyre compound of P3 |
