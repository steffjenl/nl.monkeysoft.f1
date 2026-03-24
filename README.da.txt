Formule 1 for Homey

Stream realtids Formel 1-data til dit Homey smarthome.

Denne app forbinder til F1 Live Timing (SignalR) og giver adgang til baneforhold,
sessionstilstand og kørerdaten som Homey-enheder med udvidet flow-kortsupport.


ENHEDER

F1 Bane
  Banestatus, vejr (bane-/lufttemperatur, luftfugtighed, vind), sikkerhedsbilsalarmer,
  rundetal

F1 Session
  Sessionstatus, sessionur (resterende/forløbet), race control-beskeder, hurtigste omgang

F1 Bil
  Kørerspesifikke tidsdata, dæksammensætning, depotstop-detektion, hurtigste omgang


FLOW-KORT

Udløsere (NÅR)
  - Sikkerhedsbil udsendt / tilbagekaldt
  - Virtuel sikkerhedsbil udsendt / tilbagekaldt
  - Rødt flag vist / Grønt flag — banen fri
  - Ny omgang startet
  - Session startet / afsluttet
  - Sessionstatus ændret
  - Race control-besked modtaget
  - Kvalifikationsdel ændret (Q1/Q2/Q3)
  - Hurtigste omgang opdateret
  - Kører er kørt ind i / ud af depotet
  - Kører har afsluttet en omgang
  - Kørers position ændret
  - Kører satte personlig rekord

Betingelser (OG)
  - Banestatus er [FRI / GUL / SIKKERHEDSBIL / VIRTUEL SIKKERHEDSBIL / RØDT FLAG]
  - Sikkerhedsbil er / er ikke aktiv
  - Det regner / regner ikke på banen
  - Session er / er ikke live
  - Sessionstype er [Løb / Kvalifikation / Træning 1/2/3 / Sprint / Sprint-kvalifikation]
  - Sessionstatus er [Inaktiv / Startet / Afbrudt / Afsluttet / Færdiggjort / Stoppet]
  - Kører er / er ikke i depotet
  - Dæksammensætning er [SOFT / MEDIUM / HARD / INTERMEDIATE / WET]
  - Kørers position er / er ikke i top N


DATAKILDE

Live-data streames fra livetiming.formula1.com via den klassiske SignalR-protokol.
Sæsonkalender og stillinger hentes fra Jolpica API (Ergast-kompatibel).


UDVIKLING

  npm install
  homey app validate
  homey app run

Kræver Homey CLI (npm i -g homey) og en Homey-enhed på dit netværk.


CREDITS

Inspireret af F1 Sensor Home Assistant-integrationen af Nicxe.
