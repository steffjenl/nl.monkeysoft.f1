Formula 1 per Homey

Trasmetti i dati di Formula 1 in tempo reale nella tua casa intelligente Homey.

Questa app si connette a F1 Live Timing (SignalR) ed espone le condizioni della pista,
lo stato della sessione e i dati dei piloti come dispositivi Homey con pieno supporto
per le schede di flusso.


DISPOSITIVI

F1 Pista
  Stato della pista, meteo (temperatura pista/aria, umidità, vento),
  allarmi safety car, contatore giri

F1 Sessione
  Stato sessione, orologio di sessione (tempo rimanente/trascorso), messaggi della
  direzione gara, giro più veloce

F1 Auto
  Dati di cronometraggio per pilota, mescola pneumatici, rilevamento soste ai box,
  giro più veloce


SCHEDE DI FLUSSO

Trigger (QUANDO)
  - Safety car schierata / ritirata
  - Safety car virtuale schierata / ritirata
  - Bandiera rossa mostrata / Bandiera verde — pista libera
  - Nuovo giro iniziato
  - Sessione iniziata / terminata
  - Stato sessione cambiato
  - Messaggio dalla direzione gara ricevuto
  - Parte delle qualifiche cambiata (Q1/Q2/Q3)
  - Giro più veloce aggiornato
  - Pilota entrato / uscito dalla corsia dei box
  - Pilota ha completato un giro
  - Posizione del pilota cambiata
  - Pilota ha stabilito il miglior tempo personale

Condizioni (E)
  - Stato pista è [LIBERA / GIALLA / SAFETY CAR / SAFETY CAR VIRTUALE / BANDIERA ROSSA]
  - Safety car è / non è attiva
  - Sta / non sta piovendo sulla pista
  - La sessione è / non è live
  - Il tipo di sessione è [Gara / Qualifiche / Prove libere 1/2/3 / Sprint / Qualifiche Sprint]
  - Lo stato sessione è [Inattiva / Avviata / Interrotta / Terminata / Finalizzata / Fermata]
  - Il pilota è / non è ai box
  - La mescola dei pneumatici è [MORBIDA / MEDIA / DURA / INTERMEDIA / WET]
  - La posizione del pilota è / non è nella top N


FONTE DEI DATI

I dati live vengono trasmessi da livetiming.formula1.com tramite il protocollo SignalR classico.
Il calendario della stagione e le classifiche provengono dall'API Jolpica (compatibile con Ergast).


SVILUPPO

  npm install
  homey app validate
  homey app run

Richiede Homey CLI (npm i -g homey) e un dispositivo Homey sulla rete.


CREDITI

Ispirato all'integrazione F1 Sensor di Home Assistant di Nicxe.
