Fórmula 1 para o Homey

Transmita dados de Fórmula 1 em tempo real para a sua casa inteligente Homey.

Esta aplicação liga-se ao F1 Live Timing (SignalR) e expõe as condições da pista,
o estado da sessão e os dados dos pilotos como dispositivos Homey com suporte
completo a cartões de fluxo.


DISPOSITIVOS

F1 Pista
  Estado da pista, meteorologia (temperatura da pista/ar, humidade, vento),
  alarmes do carro de segurança, contador de voltas

F1 Sessão
  Estado da sessão, relógio da sessão (tempo restante/decorrido), mensagens da
  direção de corrida, volta mais rápida

F1 Carro
  Dados de cronometragem por piloto, composto de pneus, deteção de paragens nos
  boxes, volta mais rápida


CARTÕES DE FLUXO

Ações (QUANDO)
  - Carro de segurança lançado / recolhido
  - Carro de segurança virtual lançado / recolhido
  - Bandeira vermelha mostrada / Bandeira verde — pista livre
  - Nova volta iniciada
  - Sessão iniciada / terminada
  - Estado da sessão alterado
  - Mensagem da direção de corrida recebida
  - Parte da qualificação alterada (Q1/Q2/Q3)
  - Volta mais rápida atualizada
  - Piloto entrou / saiu da pit lane
  - Piloto completou uma volta
  - Posição do piloto alterada
  - Piloto estabeleceu melhor tempo pessoal

Condições (E)
  - Estado da pista é [LIVRE / AMARELO / CARRO DE SEGURANÇA / CARRO DE SEGURANÇA VIRTUAL / BANDEIRA VERMELHA]
  - Carro de segurança está / não está ativo
  - Está / não está a chover na pista
  - A sessão está / não está em direto
  - O tipo de sessão é [Corrida / Qualificação / Treino Livre 1/2/3 / Sprint / Qualificação Sprint]
  - O estado da sessão é [Inativa / Iniciada / Abortada / Terminada / Finalizada / Parada]
  - O piloto está / não está nos boxes
  - O composto de pneus é [MACIO / MÉDIO / DURO / INTERMÉDIO / CHUVA]
  - A posição do piloto está / não está no top N


FONTE DE DADOS

Os dados em tempo real são transmitidos de livetiming.formula1.com usando o protocolo
SignalR clássico. O calendário da temporada e as classificações provêm da API Jolpica
(compatível com Ergast).


DESENVOLVIMENTO

  npm install
  homey app validate
  homey app run

Requer Homey CLI (npm i -g homey) e um dispositivo Homey na sua rede.


CRÉDITOS

Inspirado na integração F1 Sensor para Home Assistant por Nicxe.
