Formel 1 för Homey

Strömma Formel 1-data i realtid till ditt Homey-smarthus.

Appen ansluter till F1 Live Timing (SignalR) och exponerar banförhållanden,
sessionsstatus och förardata som Homey-enheter med rikt stöd för flödeskort.


ENHETER

F1 Bana
  Banstatus, väder (ban-/lufttemperatur, luftfuktighet, vind),
  safety car-larm, varvräknare

F1 Session
  Sessionsstatus, sessionsklocka (återstående/förfluten tid),
  race control-meddelanden, snabbaste varv

F1 Förare
  Per-förar tiddata, däcksblandningar, depåstopp-detektering, snabbaste varv


DATAKÄLLA

Livedata strömmas från livetiming.formula1.com via det klassiska
SignalR-protokollet. Säsongskalender och ställningar kommer från Jolpica API
(Ergast-kompatibelt).


CREDITS

Inspirerad av F1 Sensor Home Assistant-integrationen av Nicxe.
