Formel 1 for Homey

Stream sanntids Formel 1-data til ditt Homey smarthjem.

Denne appen kobler til F1 Live Timing (SignalR) og gjør baneforhold, sesjonsstatus
og førerdata tilgjengelig som Homey-enheter med utvidet støtte for flytkort.


ENHETER

F1 Bane
  Banestatus, vær (bane-/lufttemperatur, luftfuktighet, vind),
  sikkerhetsbildalarmer, rundeteller

F1 Sesjon
  Sesjonsstatus, sesjonsklokke (gjenstående/forløpt), race control-meldinger, raskeste runde

F1 Bil
  Førespesifikke tidsdata, dekkmiks, depåstopp-deteksjon, raskeste runde


FLYTKORT

Utløsere (NÅR)
  - Sikkerhetsbil utplassert / tilbakekalt
  - Virtuell sikkerhetsbil utplassert / tilbakekalt
  - Rødt flagg vist / Grønt flagg — banen fri
  - Ny runde startet
  - Sesjon startet / avsluttet
  - Sesjonsstatus endret
  - Race control-melding mottatt
  - Kvalifiseringsdel endret (Q1/Q2/Q3)
  - Raskeste runde oppdatert
  - Fører kjørte inn i / ut av depågate
  - Fører fullførte en runde
  - Fører endret posisjon
  - Fører satte personlig rekord

Betingelser (OG)
  - Banestatus er [FRI / GUL / SIKKERHETSBIL / VIRTUELL SIKKERHETSBIL / RØDT FLAGG]
  - Sikkerhetsbil er / er ikke aktiv
  - Det regner / regner ikke på banen
  - Sesjonen er / er ikke live
  - Sesjonstype er [Løp / Kvalifisering / Trening 1/2/3 / Sprint / Sprint-kvalifisering]
  - Sesjonsstatus er [Inaktiv / Startet / Avbrutt / Avsluttet / Ferdigstilt / Stoppet]
  - Fører er / er ikke i depå
  - Dekkmiks er [SOFT / MEDIUM / HARD / INTERMEDIATE / WET]
  - Førerposisjon er / er ikke i topp N


DATAKILDE

Live-data strømmes fra livetiming.formula1.com via den klassiske SignalR-protokollen.
Sesongkalender og stillinger hentes fra Jolpica API (Ergast-kompatibel).


UTVIKLING

  npm install
  homey app validate
  homey app run

Krever Homey CLI (npm i -g homey) og en Homey-enhet på nettverket.


ÆRESOMTALE

Inspirert av F1 Sensor Home Assistant-integrasjonen av Nicxe.
