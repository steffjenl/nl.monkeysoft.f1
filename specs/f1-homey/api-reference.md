# API Reference

## F1 Live Timing — SignalR

### Base URL
`https://livetiming.formula1.com/signalr`

### Negotiate
```
GET /signalr/negotiate?clientProtocol=1.5&connectionData=[{"name":"Streaming"}]
```
Returns JSON with `ConnectionToken`, `ConnectionId`, `KeepAliveTimeout`, `TryWebSockets`.

### Connect (WebSocket)
```
wss://livetiming.formula1.com/signalr/connect
  ?transport=webSockets
  &clientProtocol=1.5
  &connectionData=[{"name":"Streaming"}]
  &connectionToken=<URL-encoded token>
```

### Subscribe Hub Message
```json
{
  "H": "Streaming",
  "M": "Subscribe",
  "A": [["TrackStatus", "SessionStatus", "WeatherData", ...]],
  "I": 1
}
```

### Message Formats

**Live push** (server → client):
```json
{
  "C": "<cursor>",
  "M": [
    {
      "H": "streaming",
      "M": "feed",
      "A": [
        "TrackStatus",
        { "Status": "4", "Message": "SafetyCar" },
        "<timestamp>"
      ]
    }
  ]
}
```
Parsed as: `streamName = M[i].A[0]`, `data = M[i].A[1]`.

**RPC snapshot** (response to Subscribe):
```json
{
  "I": "1",
  "R": {
    "TrackStatus": { "Status": "1", "Message": "AllClear" },
    "WeatherData": { "AirTemp": "22.0", ... }
  }
}
```
Parsed by iterating `R` object keys.

### Available Streams

| Stream Name | Description |
|---|---|
| `TrackStatus` | Track status code + message |
| `SessionStatus` | Session lifecycle status string |
| `SessionInfo` | Session type, event name, circuit |
| `LapCount` | Current lap / total laps |
| `ExtrapolatedClock` | Session clock remaining/elapsed |
| `TimingData` | Per-driver timing (delta packets) |
| `DriverList` | Driver metadata |
| `RaceControlMessages` | Race control messages dict |
| `TyreStintSeries` | Per-driver tyre stint history |
| `PitLaneTimeCollection` | Pit lane timing |
| `TopThree` | Top 3 driver positions |
| `WeatherData` | Circuit weather |
| `CarData.z` | Car telemetry (compressed, not subscribed by default) |
| `Position.z` | GPS positions (compressed, not subscribed by default) |

---

## Jolpica (Ergast-compatible) REST API

### Base URL
`https://api.jolpi.ca/ergast/f1/`

### Endpoints used

#### Season schedule
```
GET /f1/<year>.json
```
Returns `MRData.RaceTable.Races[]` — array of race objects with `raceName`, `Circuit`, `date`, `time`.

#### Driver standings
```
GET /f1/current/driverStandings.json
```
Returns `MRData.StandingsTable.StandingsLists[0].DriverStandings[]`.

#### Last race results
```
GET /f1/current/last/results.json
```
Returns `MRData.RaceTable.Races[0].Results[]`.

### Response format (Ergast/MRData wrapper)
```json
{
  "MRData": {
    "xmlns": "...",
    "series": "f1",
    "url": "...",
    "limit": "...",
    "offset": "...",
    "total": "...",
    "RaceTable": { ... }
  }
}
```

---

## LiveTimingClient public API

```js
const lc = this.homey.app.getLiveTimingClient();

// Subscribe to a stream. Callback is called immediately with cached state
// (if any), then on each subsequent update.
// Returns an unsubscribe function.
const unsub = lc.subscribe(streamName, (data) => { /* ... */ });

// Manually connect / disconnect
await lc.connect();
await lc.disconnect();
```

---

## JolpicaClient public API

```js
const jc = this.homey.app.getJolpicaClient();

// Get current/next season schedule
const schedule = await jc.getSchedule();

// Get static helper
const nextRace = JolpicaClient.getNextRace(schedule);

// Get current driver standings
const standings = await jc.getDriverStandings();

// Get last race results
const results = await jc.getLastRaceResults();

// Generic cached GET — returns parsed JSON body
const data = await jc.get(url, ttlMs?);
```
