Formule 1 pour Homey

Diffusez les données Formule 1 en temps réel dans votre maison connectée Homey.

Cette app se connecte à F1 Live Timing (SignalR) et expose les conditions de piste,
l'état de la session et les données des pilotes comme des appareils Homey avec une
prise en charge complète des cartes de flux.


APPAREILS

Circuit F1
  Statut de la piste, météo (température piste/air, humidité, vent),
  alarmes voiture de sécurité, compteur de tours

Session F1
  Statut de session, horloge de session (temps restant/écoulé),
  messages de la direction de course, meilleur tour

Pilote F1
  Données de chronométrage par pilote, composé de pneus,
  détection des arrêts aux stands, meilleur tour


SOURCE DES DONNÉES

Les données en direct sont diffusées depuis livetiming.formula1.com via le protocole
SignalR classique. Le calendrier de la saison et les classements proviennent de l'API
Jolpica (compatible Ergast).


CRÉDITS

Inspiré par l'intégration F1 Sensor de Home Assistant par Nicxe.
