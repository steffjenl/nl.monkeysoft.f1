Fórmula 1 para Homey

Transmita dados da Fórmula 1 em tempo real para a sua casa inteligente Homey.

Esta aplicação liga-se ao F1 Live Timing (SignalR) e expõe as condições da pista,
o estado da sessão e os dados dos pilotos como dispositivos Homey com suporte
completo para cartões de fluxo.


DISPOSITIVOS

Pista F1
  Estado da pista, clima (temperatura pista/ar, humidade, vento),
  alarmes do carro de segurança, contador de voltas

Sessão F1
  Estado da sessão, relógio da sessão (restante/decorrido),
  mensagens de controlo de corrida, volta mais rápida

Piloto de F1
  Dados de cronometragem por piloto, compostos de pneus,
  deteção de paragem nas boxes, volta mais rápida


FONTE DE DADOS

Os dados em direto são transmitidos de livetiming.formula1.com através do protocolo
SignalR clássico. O calendário da época e as classificações provêm da API Jolpica
(compatível com Ergast).


CRÉDITOS

Inspirado pela integração F1 Sensor Home Assistant de Nicxe.
