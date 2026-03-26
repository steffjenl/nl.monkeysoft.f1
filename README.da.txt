Formel 1 til Homey

Stream realtids Formel 1-data til dit Homey smarthome.

Denne app forbinder til F1 Live Timing (SignalR) og giver adgang til baneforhold,
sessionstilstand og kørerdaten som Homey-enheder med udvidet flow-kortsupport.


ENHEDER

F1 Bane
  Banestatus, vejr (bane-/lufttemperatur, luftfugtighed, vind),
  sikkerhedsbilsalarmer, rundetal

F1 Session
  Sessionstatus, sessionur (resterende/forløbet),
  race control-beskeder, hurtigste omgang

F1 Kører
  Kørerspesifikke tidsdata, dæksammensætning, pitstop-registrering,
  hurtigste omgang


DATAKILDE

Live-data streames fra livetiming.formula1.com via den klassiske SignalR-protokol.
Sæsonkalender og stillinger hentes fra Jolpica API (Ergast-kompatibel).


CREDITS

Inspireret af F1 Sensor Home Assistant-integrationen af Nicxe.
