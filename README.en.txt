Formule 1 for Homey

Stream real-time Formula 1 data into your Homey smart home.

This app connects to F1 Live Timing (SignalR) and exposes track conditions, session
state, and driver data as Homey devices with rich flow-card support.


DEVICES

F1 Track
  Track status, weather (track/air temp, humidity, wind), safety car alarms, lap count

F1 Session
  Session status, session clock (remaining/elapsed), race control messages, fastest lap

F1 Car Data
  Per-driver timing data, tyre compounds, pit stop detection, fastest lap


FLOW CARDS

Triggers (WHEN)
  - Safety car deployed / recalled
  - Virtual safety car deployed / recalled
  - Red flag shown / Green flag — track clear
  - New lap started
  - Session started / finished
  - Session status changed
  - Race control message received
  - Qualifying part changed (Q1/Q2/Q3)
  - Fastest lap updated
  - Driver entered / exited pit lane
  - Driver completed a lap
  - Driver position changed
  - Driver set personal best lap

Conditions (AND)
  - Track status is [CLEAR / YELLOW / SAFETY CAR / VIRTUAL SAFETY CAR / RED FLAG]
  - Safety car is / isn't active
  - It is / isn't raining at the track
  - Session is / isn't live
  - Session type is [Race / Qualifying / Practice 1/2/3 / Sprint / Sprint Qualifying]
  - Session status is [Inactive / Started / Aborted / Finished / Finalised / Ended]
  - Driver is / isn't in pit
  - Driver tyre compound is [SOFT / MEDIUM / HARD / INTERMEDIATE / WET]
  - Driver position is / isn't in top N


DATA SOURCE

Live data is streamed from livetiming.formula1.com using the classic SignalR protocol.
Season schedule and standings come from the Jolpica API (Ergast-compatible).


DEVELOPMENT

  npm install
  homey app validate
  homey app run

Requires Homey CLI (npm i -g homey) and a Homey device on your network.


CREDITS

Inspired by the F1 Sensor Home Assistant integration by Nicxe.
