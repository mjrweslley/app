# Arquitetura local-first

- app_net: frontend, API e PostgreSQL.
- mqtt_net: API, Mosquitto e Zigbee2MQTT.
- MQTT e PostgreSQL não publicam portas no host.
- Zigbee2MQTT não publica o painel administrativo.
- Nginx publica a aplicação web na LAN.
- Tablet ligado por Wi-Fi à mesma LAN.

Fluxo: Zigbee -> coordenador USB -> Zigbee2MQTT -> MQTT -> FastAPI -> PostgreSQL -> API -> Expo.

O comando aceite pelo broker não é confirmação de estado. O estado real é atualizado quando o dispositivo reporta o valor. A compatibilidade é validada por modelo e firmware, não apenas pela marca.

Antes de produção: autenticação, autorização, CORS restrito, ACL MQTT, TLS, Alembic, backups testados, watchdog, política de disponibilidade, SBOM e testes de segurança.
