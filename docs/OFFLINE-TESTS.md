# Testes offline

Executar com Hub e tablet na mesma LAN. Desligar apenas a WAN do router, não a LAN.

1. Abrir http://IP-DO-HUB:8080 no tablet.
2. Consultar /api/health, /api/devices e /api/summary.
3. Ativar emparelhamento Zigbee e associar um dispositivo suportado.
4. Enviar ON/OFF a um dispositivo com capacidade switch.
5. Confirmar atualização reportada via MQTT.
6. Reiniciar o Hub e confirmar que os dados persistem.
7. Criar backup SQL e testar restauração numa base de teste.

Critério: dashboard, API, MQTT, Zigbee e persistência continuam funcionais sem WAN. Downloads, atualizações e acesso remoto não fazem parte do teste offline.
