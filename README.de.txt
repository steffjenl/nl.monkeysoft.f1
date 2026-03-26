Formel 1 für Homey

Streame Echtzeit-Formel-1-Daten in dein Homey-Smart-Home.

Diese App verbindet sich mit F1 Live Timing (SignalR) und stellt Streckenbedingungen,
Sitzungszustand und Fahrerdaten als Homey-Geräte mit umfangreicher
Flow-Karten-Unterstützung bereit.


GERÄTE

F1 Strecke
  Streckenstatus, Wetter (Strecken-/Lufttemperatur, Luftfeuchtigkeit, Wind),
  Safety-Car-Alarme, Rundenzähler

F1 Session
  Sessionstatus, Sitzungsuhr (verbleibend/verstrichen),
  Rennkontrollnachrichten, schnellste Runde

F1 Fahrer
  Fahrerspezifische Zeitdaten, Reifenmischung, Boxenstopp-Erkennung,
  schnellste Runde


DATENQUELLE

Live-Daten werden von livetiming.formula1.com über das klassische SignalR-Protokoll
gestreamt. Saisonkalender und Wertungen kommen von der Jolpica API
(Ergast-kompatibel).


MITWIRKENDE

Inspiriert durch die F1 Sensor Home Assistant-Integration von Nicxe.
