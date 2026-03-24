Formule 1 voor Homey

Stream real-time Formule 1-data naar jouw Homey smarthome.

Deze app verbindt met F1 Live Timing (SignalR) en maakt trackstatus, sessiegegevens
en coureursinformatie beschikbaar als Homey-apparaten met uitgebreide flow-kaartondersteuning.


APPARATEN

F1 Track
  Trackstatus, weer (track-/luchttemperatuur, vochtigheid, wind), veiligheidswagen-alarmen,
  rondenteller

F1 Session
  Sessiestatus, sessieklok (resterende/verstreken tijd), race control-berichten, snelste ronde

F1 Auto
  Per-coureur tijddata, bandensamenstelling, pitstop-detectie, snelste ronde


FLOW-KAARTEN

Triggers (ALS)
  - Veiligheidswagen ingezet / teruggeroepen
  - Virtuele veiligheidswagen ingezet / teruggeroepen
  - Rode vlag getoond / Groene vlag — baan vrij
  - Nieuwe ronde gestart
  - Sessie gestart / beëindigd
  - Sessiestatus gewijzigd
  - Race control-bericht ontvangen
  - Kwalificatiedeel gewijzigd (Q1/Q2/Q3)
  - Snelste ronde bijgewerkt
  - Coureur pitstraat ingereden / verlaten
  - Coureur ronde voltooid
  - Coureur positie gewijzigd
  - Coureur persoonlijk record gereden

Condities (EN)
  - Trackstatus is [VRIJ / GEEL / VEILIGHEIDSWAGEN / VIRTUELE VEILIGHEIDSWAGEN / RODE VLAG]
  - Veiligheidswagen is / is niet actief
  - Het regent / regent niet op het circuit
  - Sessie is / is niet live
  - Sessietype is [Race / Kwalificatie / Vrije training 1/2/3 / Sprint / Sprint Kwalificatie]
  - Sessiestatus is [Inactief / Gestart / Afgebroken / Beëindigd / Afgerond / Gestopt]
  - Coureur is / is niet in de pitstraat
  - Bandensamenstelling is [SOFT / MEDIUM / HARD / INTERMEDIATE / WET]
  - Coureurspositie is / is niet in top N


DATABRON

Live data wordt gestreamd van livetiming.formula1.com via het klassieke SignalR-protocol.
Seizoensschema en standen komen van de Jolpica API (Ergast-compatibel).


ONTWIKKELING

  npm install
  homey app validate
  homey app run

Vereist Homey CLI (npm i -g homey) en een Homey-apparaat in je netwerk.


CREDITS

Geïnspireerd door de F1 Sensor Home Assistant-integratie van Nicxe.
