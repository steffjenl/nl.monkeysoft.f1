Formule 1 pour Homey

Diffusez les données Formule 1 en temps réel dans votre maison connectée Homey.

Cette app se connecte à F1 Live Timing (SignalR) et expose les conditions de piste,
l'état de la session et les données des pilotes comme des appareils Homey avec une
prise en charge complète des cartes de flux.


APPAREILS

F1 Piste
  Statut de la piste, météo (température piste/air, humidité, vent),
  alarmes voiture de sécurité, compteur de tours

F1 Session
  Statut de session, horloge de session (temps restant/écoulé), messages de la
  direction de course, meilleur tour

F1 Voiture
  Données de chronométrage par pilote, composé de pneus, détection des arrêts aux stands,
  meilleur tour


CARTES DE FLUX

Déclencheurs (QUAND)
  - Voiture de sécurité déployée / rappelée
  - Voiture de sécurité virtuelle déployée / rappelée
  - Drapeau rouge montré / Drapeau vert — piste libre
  - Nouveau tour démarré
  - Session démarrée / terminée
  - Statut de session modifié
  - Message de la direction de course reçu
  - Partie de qualification modifiée (Q1/Q2/Q3)
  - Meilleur tour mis à jour
  - Pilote entré / sorti de la voie des stands
  - Pilote a terminé un tour
  - Position du pilote modifiée
  - Pilote établi son meilleur temps personnel

Conditions (ET)
  - Statut de piste est [LIBRE / JAUNE / VOITURE DE SÉCURITÉ / VOITURE DE SÉCURITÉ VIRTUELLE / DRAPEAU ROUGE]
  - Voiture de sécurité est / n'est pas active
  - Il pleut / ne pleut pas sur la piste
  - La session est / n'est pas en direct
  - Le type de session est [Course / Qualifications / Essais libres 1/2/3 / Sprint / Qualifications Sprint]
  - Le statut de session est [Inactif / Démarré / Interrompu / Terminé / Finalisé / Arrêté]
  - Le pilote est / n'est pas dans les stands
  - Le composé de pneus est [TENDRE / MEDIUM / DUR / INTERMÉDIAIRE / PLUIE]
  - La position du pilote est / n'est pas dans le top N


SOURCE DES DONNÉES

Les données en direct sont diffusées depuis livetiming.formula1.com via le protocole
ClassicSignalR. Le calendrier de la saison et les classements proviennent de l'API
Jolpica (compatible Ergast).


DÉVELOPPEMENT

  npm install
  homey app validate
  homey app run

Requiert Homey CLI (npm i -g homey) et un appareil Homey sur votre réseau.


CRÉDITS

Inspiré par l'intégration F1 Sensor de Home Assistant par Nicxe.
