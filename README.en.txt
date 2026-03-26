Formula 1 for Homey

Stream real-time Formula 1 data into your Homey smart home.

This app connects to F1 Live Timing (SignalR) and exposes track conditions, session
state, and driver data as Homey devices with rich flow-card support.


DEVICES

F1 Track
  Track status, weather (track/air temp, humidity, wind), safety car alarms, lap count

F1 Session
  Session status, session clock (remaining/elapsed), race control messages, fastest lap

F1 Driver
  Per-driver timing data, tyre compounds, pit stop detection, fastest lap


DATA SOURCE

Live data is streamed from livetiming.formula1.com using the classic SignalR protocol.
Season schedule and standings come from the Jolpica API (Ergast-compatible).


CREDITS

Inspired by the F1 Sensor Home Assistant integration by Nicxe.
