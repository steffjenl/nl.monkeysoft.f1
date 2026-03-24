# Events and Flows

This document lists all Homey flow cards provided by the app.

---

## F1 Track — Flow Cards

### Triggers

| Card ID | Title | Tokens |
|---|---|---|
| `track_status_changed` | Track status changed | `status: string` |
| `safety_car_deployed` | Safety car deployed ★ | — |
| `safety_car_recalled` | Safety car recalled ★ | — |
| `vsc_deployed` | Virtual safety car deployed ★ | — |
| `vsc_recalled` | Virtual safety car recalled | — |
| `red_flag_shown` | Red flag shown ★ | — |
| `green_flag` | Green flag — track clear | — |
| `new_lap_started` | New lap started | `lap_number: number` |

_★ highlighted (shows in device overview)_

### Conditions

| Card ID | Title | Args |
|---|---|---|
| `track_status_is` | Track status is/isn't | `status` dropdown (CLEAR/YELLOW/SC/VSC/RED) |
| `safety_car_is_active` | Safety car is/isn't active | — |
| `is_raining_at_track` | It is/isn't raining at the track | — |

---

## F1 Session — Flow Cards

### Triggers

| Card ID | Title | Tokens |
|---|---|---|
| `session_status_changed` | Session status changed | `status: string` |
| `session_started` | Session started ★ | `session_type: string` |
| `session_finished` | Session finished | — |
| `race_control_message_received` | Race control message received | `message`, `flag`, `category` |
| `qualifying_part_changed` | Qualifying part changed | `part: string` (Q1/Q2/Q3) |
| `fastest_lap_updated` | Fastest lap updated | `driver: string`, `time: string` |

### Conditions

| Card ID | Title | Args |
|---|---|---|
| `session_is_live` | Session is/isn't live | — |
| `session_type_is` | Session type is/isn't | `type` dropdown |
| `session_status_is` | Session status is/isn't | `status` dropdown |

---

## F1 Car Data — Flow Cards

### Triggers

| Card ID | Title | Tokens |
|---|---|---|
| `driver_entered_pit` | Driver entered pit lane | `driver_number`, `driver_name` |
| `driver_exited_pit` | Driver exited pit lane | `driver_number`, `driver_name` |
| `fastest_lap_set` | New fastest lap set ★ | `driver_number`, `driver_name`, `lap_time` |
| `position_change` | Driver position changed | `driver_number`, `driver_name`, `position` |
| `top_three_updated` | Top 3 positions updated | `p1_driver`, `p2_driver`, `p3_driver` |

### Conditions

| Card ID | Title | Args |
|---|---|---|
| `driver_is_in_pit` | Driver is/isn't in pit | `driver_number: text` |
| `driver_tyre_compound_is` | Driver tyre compound is/isn't | `driver_number: text`, `compound` dropdown |

---

## Example Flow Recipes

### Announce safety car on Sonos

```
WHEN  [F1 Track] Safety car deployed
THEN  Sonos: Say "Safety car has been deployed"
```

### Flash lights red on red flag

```
WHEN  [F1 Track] Red flag shown
THEN  All Lights: Set colour to red
      All Lights: Flash 3 times
```

### Notify on race start

```
WHEN  [F1 Session] Session started
IF    [F1 Session] Session type is Race
THEN  Phone: Send notification "The race has started!"
```

### Announce fastest lap

```
WHEN  [F1 Car Data] New fastest lap set
THEN  Google Home: Say "Fastest lap by driver [lap_time] seconds"
```

### Race control message → push notification

```
WHEN  [F1 Session] Race control message received
THEN  Homey: Send notification [[message]]
```

### Pit stop light strip 

```
WHEN  [F1 Car Data] Driver entered pit
IF    [F1 Car Data] Driver number is "1"
THEN  Light strip: Set colour to team colour
```
