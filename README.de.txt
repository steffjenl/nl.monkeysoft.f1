Formule 1 for Homey

Streame Echtzeit-Formel-1-Daten in dein Homey-Smart-Home.

Diese App verbindet sich mit F1 Live Timing (SignalR) und stellt Streckenbedingungen,
Sitzungszustand und Fahrerdaten als Homey-Geräte mit umfangreicher Flow-Karten-Unterstützung bereit.


GERÄTE

F1 Strecke
  Streckenstatus, Wetter (Strecken-/Lufttemperatur, Luftfeuchtigkeit, Wind),
  Safety-Car-Alarme, Rundenzähler

F1 Session
  Sessionstatus, Sitzungsuhr (verbleibend/verstrichen), Rennkontrollnachrichten, schnellste Runde

F1 Auto
  Fahrerspezifische Zeitdaten, Reifenmischung, Boxenstopp-Erkennung, schnellste Runde


FLOW-KARTEN

Auslöser (WENN)
  - Safety Car eingesetzt / zurückgezogen
  - Virtuelles Safety Car eingesetzt / zurückgezogen
  - Rote Flagge gezeigt / Grüne Flagge — Strecke frei
  - Neue Runde gestartet
  - Session gestartet / beendet
  - Sessionstatus geändert
  - Rennkontrollnachricht empfangen
  - Qualifying-Teil geändert (Q1/Q2/Q3)
  - Schnellste Runde aktualisiert
  - Fahrer hat Boxengasse betreten / verlassen
  - Fahrer hat Runde abgeschlossen
  - Fahrer hat Position geändert
  - Fahrer neue Bestzeit gefahren

Bedingungen (UND)
  - Streckenstatus ist [FREI / GELB / SAFETY CAR / VIRTUELLES SAFETY CAR / ROTE FLAGGE]
  - Safety Car ist / ist nicht aktiv
  - Es regnet / regnet nicht an der Strecke
  - Session ist / ist nicht live
  - Sessiontyp ist [Rennen / Qualifying / Training 1/2/3 / Sprint / Sprint-Qualifying]
  - Sessionstatus ist [Inaktiv / Gestartet / Abgebrochen / Beendet / Finalisiert / Gestoppt]
  - Fahrer ist / ist nicht in der Box
  - Reifenmischung ist [SOFT / MEDIUM / HARD / INTERMEDIATE / WET]
  - Fahrerposition ist / ist nicht in Top N


DATENQUELLE

Live-Daten werden von livetiming.formula1.com über das klassische SignalR-Protokoll gestreamt.
Saisonkalender und Standings stammen von der Jolpica API (Ergast-kompatibel).


ENTWICKLUNG

  npm install
  homey app validate
  homey app run

Erfordert Homey CLI (npm i -g homey) und ein Homey-Gerät in deinem Netzwerk.


DANKSAGUNG

Inspiriert durch die F1 Sensor Home-Assistant-Integration von Nicxe.
