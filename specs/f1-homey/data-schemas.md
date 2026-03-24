# Data Schemas

## TrackStatus

```json
{
  "Status": "4",
  "Message": "SafetyCar"
}
```

| Field | Type | Description |
|---|---|---|
| `Status` | string (integer) | `1`=CLEAR, `2`/`3`=YELLOW, `4`=SC, `5`=RED, `6`/`7`=VSC |
| `Message` | string | Human label from F1 system |

---

## SessionStatus

```json
{
  "Status": "Started"
}
```

| Value | Mapped to |
|---|---|
| `Inactive` | `inactive` |
| `Started` | `started` |
| `Aborted` | `aborted` |
| `Finished` | `finished` |
| `Finalised` | `finalised` |
| `Ends` | `ends` |

---

## SessionInfo

```json
{
  "Type": "Race",
  "Name": "Race",
  "Meeting": {
    "Name": "British Grand Prix",
    "OfficialName": "FORMULA 1 MSC CRUISES BRITISH GRAND PRIX 2024"
  },
  "Circuit": {
    "ShortName": "Silverstone"
  }
}
```

---

## WeatherData

```json
{
  "AirTemp": "22.4",
  "Humidity": "38.0",
  "Pressure": "1017.1",
  "Rainfall": "0",
  "TrackTemp": "38.3",
  "WindDirection": "213",
  "WindSpeed": "3.1"
}
```

All values are strings from the Live Timing feed; parse with `parseFloat()`.

---

## LapCount

```json
{
  "CurrentLap": 12,
  "TotalLaps": 52
}
```

---

## ExtrapolatedClock

```json
{
  "Remaining": "1:23:45",
  "Elapsed": "0:12:30",
  "Extrapolating": true
}
```

| Field | Description |
|---|---|
| `Remaining` | `H:MM:SS` or `HH:MM:SS` — time left |
| `Elapsed` | Time elapsed since session start |
| `Extrapolating` | `true` when the clock is counting, `false` when paused |

---

## RaceControlMessages

```json
{
  "Messages": {
    "0": {
      "Utc": "2024-07-07T14:01:02",
      "Lap": 1,
      "Category": "Flag",
      "Message": "GREEN FLAG",
      "Flag": "GREEN",
      "Scope": "Track"
    },
    "1": {
      "Utc": "2024-07-07T14:15:00",
      "Lap": 8,
      "Category": "SafetyCar",
      "Message": "SAFETY CAR IN THIS LAP",
      "Flag": "CLEAR",
      "Scope": "Track"
    }
  }
}
```

The dict is keyed by sequential integer strings. The latest message has the highest numeric key.

---

## TimingData (Lines)

```json
{
  "Lines": {
    "1": {
      "GapToLeader": "+0.231",
      "IntervalToPositionAhead": { "Value": "+0.231" },
      "LastLapTime": { "Value": "1:27.456", "Status": 0 },
      "BestLapTime": { "Value": "1:26.890" },
      "Sectors": {
        "0": { "Value": "28.123" },
        "1": { "Value": "32.456" },
        "2": { "Value": "26.311" }
      },
      "Speeds": { "I1": { "Value": "312" }, "FL": { "Value": "290" } },
      "Position": "3",
      "InPit": false,
      "PitOut": false,
      "NumberOfPitStops": 1
    }
  }
}
```

Keys in `Lines` are racing number strings. Fields may be **partial** on live updates — only changed fields are included. Merge incoming data with existing state.

---

## DriverList

```json
{
  "1": {
    "RacingNumber": "1",
    "BroadcastName": "M VERSTAPPEN",
    "FullName": "Max VERSTAPPEN",
    "Tla": "VER",
    "Line": 1,
    "TeamName": "Red Bull Racing",
    "TeamColour": "3671C6",
    "FirstName": "Max",
    "LastName": "Verstappen",
    "Reference": "max_verstappen",
    "HeadshotUrl": "https://..."
  }
}
```

---

## TyreStintSeries

```json
{
  "1": {
    "0": {
      "TotalLaps": 0,
      "StartLaps": 0,
      "Compound": "SOFT",
      "New": "true",
      "TyresNotChanged": "0"
    },
    "1": {
      "TotalLaps": 28,
      "StartLaps": 1,
      "Compound": "MEDIUM",
      "New": "false"
    }
  }
}
```

Outer key = racing number, inner keys = sequential stint index. Latest stint = highest index.

---

## f1_drivers_json Schema

This is the JSON stored in the `f1_drivers_json` capability. It is a map from racing number (string) to a driver state object:

```json
{
  "1": {
    "Num":          "1",
    "ShortName":    "VER",
    "TeamName":     "Red Bull Racing",
    "Position":     1,
    "LastLap":      "1:27.456",
    "BestLap":      "1:26.890",
    "GapToLeader":  "+0.000",
    "InPit":        false,
    "PitCount":     1,
    "TyreCompound": "MEDIUM",
    "TyreLaps":     28,
    "Sectors":      ["28.123", "32.456", "26.311"]
  },
  "44": { ... },
  ...
}
```

| Field | Type | Description |
|---|---|---|
| `Num` | string | Racing number |
| `ShortName` | string | 3-letter TLA abbreviation |
| `TeamName` | string | Constructor name |
| `Position` | number | Current race position (0 = unknown) |
| `LastLap` | string | Last lap time |
| `BestLap` | string | Best lap time this session |
| `GapToLeader` | string | Gap to race leader |
| `InPit` | boolean | Currently in the pit lane |
| `PitCount` | number | Number of completed pit stops |
| `TyreCompound` | string | Current tyre compound |
| `TyreLaps` | number | Laps on current set |
| `Sectors` | string[] | Last sector times [S1, S2, S3] |
