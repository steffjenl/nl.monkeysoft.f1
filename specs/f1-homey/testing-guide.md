# Testing Guide

## Prerequisites

```bash
# Homey CLI
npm install --global homey

# App dependencies
cd /path/to/nl-monkeysoft-f1
npm install

# Validate app manifest (no Homey account required)
homey app validate
```

---

## Manifest Validation

```bash
homey app validate
```

Expected output: `App is valid` (with no errors). Warnings about image sizes can be ignored during development.

---

## Running on Homey

```bash
# Deploy and run on local Homey (requires Homey account + device on same network)
homey app run
```

Logs appear in the terminal. Use `this.log()` / `this.error()` in device classes.

---

## Smoke Tests

### 1. LiveTimingClient connection

In `app.js` `onInit()` or a test script, verify the client connects and delivers data:

```js
const lc = this.getLiveTimingClient();
await lc.connect();
const unsub = lc.subscribe('TrackStatus', (data) => {
  console.log('TrackStatus:', data);
  unsub();
});
```

Expected: Within ~5 seconds a snapshot arrives with `{ Status: '1', Message: 'AllClear' }` (or current race state).

### 2. JolpicaClient

```js
const jc = this.getJolpicaClient();
const schedule = await jc.getSchedule();
console.log('Races:', schedule.length);
const next = JolpicaClient.getNextRace(schedule);
console.log('Next race:', next?.raceName);
```

Expected: Prints 2024/2025 schedule with correct next race name.

---

## Manual Flow Testing

1. Add all three devices via Homey app (Settings → Devices → Add Device → nl.monkeysoft.f1)
2. Open device pages and verify capabilities update during a live session
3. Create test flows:
   - **Track**: `WHEN Safety car deployed → Log "SC deployed"`
   - **Session**: `WHEN Session started → Log [session_type]`
   - **Car**: `WHEN Fastest lap set → Log [driver_name] [lap_time]`
4. Wait for a live F1 session or use a replay to trigger events

---

## Testing During Off-Season

When no live session is active, the SignalR connection stays open but emits no updates. You can test capability rendering with simulated data:

```js
// In device.js onInit() — inject test data during development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    this._onTrackStatus({ Status: '4', Message: 'SafetyCar' });
  }, 2000);
}
```

Remove before production.

---

## Reconnection Test

1. Start app with `homey app run`
2. Observe "Connected to F1 Live Timing" in logs
3. Toggle network off/on on the Homey hardware
4. Observe reconnect attempts with exponential back-off in logs
5. Confirm "Connected to F1 Live Timing" reappears after network restores

---

## Common Issues

| Symptom | Likely cause | Fix |
|---|---|---|
| `homey app validate` fails with "capability not found" | Capability JSON missing or `id` mismatch | Check `.homeycompose/capabilities/` file names match capability IDs |
| Device added but capability values never update | SignalR subscribe failed | Check logs for `Subscribe error` |
| `measure_temperature.track` missing from device | Sub-capability not listed in `driver.compose.json` | Add `measure_temperature.track` to `capabilities[]` in `driver.compose.json` |
| Session clock doesn't tick | `ExtrapolatedClock` not subscribed, or `Extrapolating: false` | Check both stream subscription and `f1_clock_phase` value |
| `f1_drivers_json` shows empty `{}` | `DriverList` + `TimingData` not yet received | Wait for next data push; check SignalR subscription message includes both streams |

---

## Log Levels

| Method | When to use |
|---|---|
| `this.log()` | Normal info (connect, first data received) |
| `this.error()` | Errors (failed setCapabilityValue, parse errors) |
| `this.debug()` | Verbose (every message received) — disable in production |
