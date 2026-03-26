Formule 1 voor Homey

Stream real-time Formule 1-data naar jouw Homey smarthome.

Deze app verbindt met F1 Live Timing (SignalR) en maakt baanstatus, sessiegegevens
en coureursinformatie beschikbaar als Homey-apparaten met uitgebreide
flow-kaartondersteuning.


APPARATEN

F1 Baan
  Baanstatus, weer (baan-/luchttemperatuur, vochtigheid, wind),
  veiligheidswagen-alarmen, rondenteller

F1 Sessie
  Sessiestatus, sessieklok (resterende/verstreken tijd), race control-berichten,
  snelste ronde

F1 Coureur
  Per-coureur tijddata, bandensamenstelling, pitstop-detectie, snelste ronde


DATABRON

Live data wordt gestreamd van livetiming.formula1.com via het klassieke
SignalR-protocol. Seizoensschema en standen komen van de Jolpica API
(Ergast-compatibel).


CREDITS

Geïnspireerd door de F1 Sensor Home Assistant-integratie van Nicxe.
