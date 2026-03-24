'use strict';

// ─── Jolpica / Ergast REST endpoints ────────────────────────────────────────
const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';

const JOLPICA_URLS = {
  current:             `${JOLPICA_BASE}/current.json`,
  driverStandings:     `${JOLPICA_BASE}/current/driverstandings.json`,
  constructorStandings:`${JOLPICA_BASE}/current/constructorstandings.json`,
  lastRaceResults:     `${JOLPICA_BASE}/current/last/results.json`,
  seasonResults:       `${JOLPICA_BASE}/current/results.json`,
  sprintResults:       `${JOLPICA_BASE}/current/sprint.json`,
};

// Cache TTLs (milliseconds)
const TTL = {
  SCHEDULE:     24 * 60 * 60 * 1000,   // 24 h – race schedule rarely changes
  STANDINGS:    24 * 60 * 60 * 1000,   // 24 h
  LAST_RACE:    24 * 60 * 60 * 1000,
  SEASON:        6 * 60 * 60 * 1000,   // 6 h  – latest results page
  SPRINT:       24 * 60 * 60 * 1000,
};

// ─── F1 Live Timing SignalR endpoints ────────────────────────────────────────
const LIVETIMING_HOST = 'https://livetiming.formula1.com';
const LIVETIMING_SIGNALR = `${LIVETIMING_HOST}/signalr`;
const LIVETIMING_INDEX_URL = `${LIVETIMING_HOST}/static/{year}/Index.json`;
const LIVETIMING_HUB = 'Streaming';
const LIVETIMING_CLIENT_PROTOCOL = '1.5';

// Streams to subscribe to (each string is a SignalR hub method name)
const LIVE_STREAMS = {
  // Session
  SESSION_STATUS:      'SessionStatus',
  SESSION_INFO:        'SessionInfo',
  SESSION_DATA:        'SessionData',
  EXTRAPOLATED_CLOCK:  'ExtrapolatedClock',
  HEARTBEAT:           'Heartbeat',
  // Race management
  TRACK_STATUS:        'TrackStatus',
  RACE_CONTROL:        'RaceControlMessages',
  LAP_COUNT:           'LapCount',
  // Driver data
  DRIVER_LIST:         'DriverList',
  TIMING_DATA:         'TimingData',
  TIMING_APP_DATA:     'TimingAppData',
  TYRE_STINT_SERIES:   'TyreStintSeries',
  PITSTOP_SERIES:      'PitStopSeries',
  TOP_THREE:           'TopThree',
  // Weather
  WEATHER_DATA:        'WeatherData',
};

// ─── Track status codes (from F1 feed) ──────────────────────────────────────
const TRACK_STATUS = {
  '1': 'CLEAR',
  '2': 'YELLOW',
  '3': 'YELLOW',    // double yellow / sector yellow (also shows as 3)
  '4': 'SC',        // Safety Car deployed
  '5': 'RED',
  '6': 'VSC',       // Virtual Safety Car deployed
  '7': 'VSC',       // VSC ending
};

const TRACK_STATUS_DISPLAY = {
  CLEAR:   'All Clear',
  YELLOW:  'Yellow Flag',
  SC:      'Safety Car',
  RED:     'Red Flag',
  VSC:     'Virtual Safety Car',
  UNKNOWN: 'Unknown',
};

// ─── Session status strings (from F1 feed) ──────────────────────────────────
const SESSION_STATUS = {
  INACTIVE:   'Inactive',
  STARTED:    'Started',
  ABORTED:    'Aborted',
  FINISHED:   'Finished',
  FINALISED:  'Finalised',
  ENDS:       'Ends',
};

// ─── Tyre compound colours ───────────────────────────────────────────────────
const TYRE_COMPOUND_COLOR = {
  SOFT:         '#FF0000',
  MEDIUM:       '#FFD700',
  HARD:         '#FFFFFF',
  INTERMEDIATE: '#39B54A',
  WET:          '#0067FF',
};

// Race Control flag categories
const RC_FLAGS = {
  RED:            'RED',
  YELLOW:         'YELLOW',
  DOUBLE_YELLOW:  'DOUBLE YELLOW',
  GREEN:          'GREEN',
  BLUE:           'BLUE',
  WHITE:          'WHITE',
  BLACK:          'BLACK',
  CHEQUERED:      'CHEQUERED',
  CLEAR:          'CLEAR',
};

// 2026 active aero / straight mode constants
const STRAIGHT_MODE = {
  NORMAL:   'normal',
  LOW:      'low',
  DISABLED: 'disabled',
};

module.exports = {
  JOLPICA_BASE,
  JOLPICA_URLS,
  TTL,
  LIVETIMING_HOST,
  LIVETIMING_SIGNALR,
  LIVETIMING_INDEX_URL,
  LIVETIMING_HUB,
  LIVETIMING_CLIENT_PROTOCOL,
  LIVE_STREAMS,
  TRACK_STATUS,
  TRACK_STATUS_DISPLAY,
  SESSION_STATUS,
  TYRE_COMPOUND_COLOR,
  RC_FLAGS,
  STRAIGHT_MODE,
};
