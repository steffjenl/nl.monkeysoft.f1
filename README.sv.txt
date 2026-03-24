Formel 1 för Homey

Strömma realtidsdata från Formel 1 till ditt Homey-smarta hem.

Den här appen ansluter till F1 Live Timing (SignalR) och exponerar banförhållanden,
sessionsstatus och förardata som Homey-enheter med utökat stöd för flödeskort.


ENHETER

F1 Bana
  Banstatus, väder (ban-/lufttemperatur, luftfuktighet, vind),
  säkerhetsbilsalarmer, varvräknare

F1 Session
  Sessionsstatus, sessionsklocka (återstående/förfluten tid), race control-meddelanden,
  snabbaste varv

F1 Bil
  Förarspecifik tiddata, däckblandning, depåstopp-detektering, snabbaste varv


FLÖDESKORT

Utlösare (NÄR)
  - Säkerhetsbil utplacerad / återkallad
  - Virtuell säkerhetsbil utplacerad / återkallad
  - Röd flagg visad / Grön flagg — banan fri
  - Nytt varv startat
  - Session startad / avslutad
  - Sessionsstatus ändrad
  - Race control-meddelande mottaget
  - Kvaldel ändrad (Q1/Q2/Q3)
  - Snabbaste varv uppdaterat
  - Förare körde in i / ut ur depågata
  - Förare genomförde ett varv
  - Förares position ändrad
  - Förare satte personligt rekord

Villkor (OCH)
  - Banstatus är [FRI / GUL / SÄKERHETSBIL / VIRTUELL SÄKERHETSBIL / RÖD FLAGG]
  - Säkerhetsbil är / är inte aktiv
  - Det regnar / regnar inte på banan
  - Session är / är inte live
  - Sessionstyp är [Lopp / Kvalificering / Träning 1/2/3 / Sprint / Sprint-kvalificering]
  - Sessionsstatus är [Inaktiv / Startad / Avbruten / Avslutad / Slutförd / Stoppad]
  - Förare är / är inte i depå
  - Däckblandning är [SOFT / MEDIUM / HARD / INTERMEDIATE / WET]
  - Förarposition är / är inte i topp N


DATAKÄLLA

Livedata strömmas från livetiming.formula1.com via det klassiska SignalR-protokollet.
Säsongskalender och ställningar hämtas från Jolpica API (Ergast-kompatibelt).


UTVECKLING

  npm install
  homey app validate
  homey app run

Kräver Homey CLI (npm i -g homey) och en Homey-enhet i ditt nätverk.


TACK TILL

Inspirerad av F1 Sensor Home Assistant-integrationen av Nicxe.
