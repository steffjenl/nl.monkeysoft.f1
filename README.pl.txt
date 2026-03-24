Formuła 1 dla Homey

Strumieniuj dane Formuły 1 w czasie rzeczywistym do swojego inteligentnego domu Homey.

Ta aplikacja łączy się z F1 Live Timing (SignalR) i udostępnia warunki na torze,
stan sesji i dane kierowców jako urządzenia Homey z rozbudowaną obsługą kart przepływu.


URZĄDZENIA

F1 Tor
  Status toru, pogoda (temperatura toru/powietrza, wilgotność, wiatr),
  alarmy samochodu bezpieczeństwa, licznik okrążeń

F1 Sesja
  Status sesji, zegar sesji (pozostały/upłynął czas), komunikaty dyrekcji wyścigu,
  najszybsze okrążenie

F1 Samochód
  Dane czasowe per kierowca, mieszanka opon, wykrywanie pit stopów, najszybsze okrążenie


KARTY PRZEPŁYWU

Wyzwalacze (KIEDY)
  - Samochód bezpieczeństwa wyjeżdża / wraca
  - Wirtualny samochód bezpieczeństwa wyjeżdża / wraca
  - Pokazana czerwona flaga / Zielona flaga — tor wolny
  - Nowe okrążenie rozpoczęte
  - Sesja rozpoczęta / zakończona
  - Status sesji zmieniony
  - Odebrano komunikat dyrekcji wyścigu
  - Zmieniono część kwalifikacji (Q1/Q2/Q3)
  - Najszybsze okrążenie zaktualizowane
  - Kierowca wjechał / opuścił aleję pit
  - Kierowca ukończył okrążenie
  - Pozycja kierowcy zmieniona
  - Kierowca ustanowił osobisty rekord

Warunki (I)
  - Status toru to [WOLNY / ŻÓŁTY / SAMOCHÓD BEZPIECZEŃSTWA / WIRTUALNY SAMOCHÓD BEZPIECZEŃSTWA / CZERWONA FLAGA]
  - Samochód bezpieczeństwa jest / nie jest aktywny
  - Na torze pada / nie pada deszcz
  - Sesja jest / nie jest na żywo
  - Typ sesji to [Wyścig / Kwalifikacje / Trening 1/2/3 / Sprint / Kwalifikacje Sprint]
  - Status sesji to [Nieaktywna / Rozpoczęta / Przerwana / Zakończona / Sfinalizowana / Zatrzymana]
  - Kierowca jest / nie jest w boksach
  - Mieszanka opon to [SOFT / MEDIUM / HARD / INTERMEDIATE / WET]
  - Pozycja kierowcy jest / nie jest w top N


ŹRÓDŁO DANYCH

Dane na żywo są przesyłane strumieniowo z livetiming.formula1.com za pomocą
klasycznego protokołu SignalR. Kalendarz sezonu i wyniki pochodzą z API Jolpica
(kompatybilne z Ergast).


PROGRAMOWANIE

  npm install
  homey app validate
  homey app run

Wymaga Homey CLI (npm i -g homey) i urządzenia Homey w sieci.


PODZIĘKOWANIA

Zainspirowane integracją F1 Sensor dla Home Assistant autorstwa Nicxe.
