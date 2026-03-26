Formuła 1 dla Homey

Przesyłaj dane Formuły 1 w czasie rzeczywistym do swojego inteligentnego domu Homey.

Ta aplikacja łączy się z F1 Live Timing (SignalR) i udostępnia warunki toru, stan sesji
oraz dane kierowców jako urządzenia Homey z obsługą kart przepływu.


URZĄDZENIA

Tor F1
  Status toru, pogoda (temperatura toru/powietrza, wilgotność, wiatr),
  alarmy samochodu bezpieczeństwa, licznik okrążeń

Sesja F1
  Status sesji, zegar sesji (pozostały/miniony),
  komunikaty kontroli wyścigu, najszybsze okrążenie

Kierowca F1
  Dane czasowe per kierowca, mieszanki opon,
  wykrywanie postojów w boksach, najszybsze okrążenie


ŹRÓDŁO DANYCH

Dane na żywo są przesyłane z livetiming.formula1.com przy użyciu klasycznego
protokołu SignalR. Harmonogram sezonu i klasyfikacje pochodzą z API Jolpica
(kompatybilnego z Ergast).


PODZIĘKOWANIA

Zainspirowane integracją F1 Sensor Home Assistant autorstwa Nicxe.
