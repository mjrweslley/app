# Arquitetura local-first

## Infraestrutura física

- Mini PC x86-64 Intel N100/N150, 16 GB RAM, SSD NVMe, ligado por Ethernet.
- Proxmox VE como hypervisor.
- VM Home Assistant OS: Matter Server e OpenThread Border Router.
- VM Debian 13: aplicação SMART HOME via Docker Compose.

## Redes e serviços da VM Debian

- app_net: frontend, API e PostgreSQL.
- mqtt_net: API, Mosquitto e Zigbee2MQTT.
- MQTT e PostgreSQL não publicam portas no host.
- Zigbee2MQTT não publica o painel administrativo.
- Nginx publica a aplicação web na LAN.
- Tablet/iPhone ligado por Wi-Fi à mesma LAN.

As redes app_net e mqtt_net são internas no Compose atual. A futura integração FastAPI -> Home Assistant requer uma rede/rota de integração controlada que permita à API alcançar o IP LAN da VM Home Assistant. Não expor MQTT, PostgreSQL, Proxmox ou painéis administrativos à Internet.

## Rádio e protocolos

- Zigbee: SONOFF ZBDongle-E dedicado, USB passthrough para VM Debian, Zigbee2MQTT.
- Thread: Home Assistant Connect ZBT-2 dedicado, USB passthrough para VM Home Assistant OS, Thread RCP + OTBR.
- Matter: Matter Server no Home Assistant OS. Matter pode usar Wi-Fi/Ethernet ou Thread; Matter-over-Thread precisa de Thread Border Router.

O ZBT-2 opera Zigbee ou Thread, não os dois simultaneamente. Nesta arquitetura fica reservado a Thread. Não reutilizar um único rádio para ambos os protocolos ao mesmo tempo.

## Fluxos

Zigbee -> SONOFF coordinator -> Zigbee2MQTT -> MQTT -> FastAPI -> PostgreSQL -> API -> Expo.

Thread -> ZBT-2 -> OTBR -> rede Thread. Matter -> Matter Server / Home Assistant OS.

**Limitação de implementação:** a revisão atual da aplicação ainda não inclui integração FastAPI com a API/eventos do Home Assistant nem commissioning Matter pela UI SMART HOME. O desenho físico prepara a integração; não equivale a suporte Matter já concluído na aplicação.

O comando aceite pelo broker não é confirmação de estado. O estado real é atualizado quando o dispositivo reporta o valor. A compatibilidade é validada por modelo e firmware, não apenas pela marca.

## Continuidade e segurança

- UPS para Mini PC e router.
- BIOS configurada para ligar após reposição de energia.
- VMs com arranque automático.
- Backups cifrados de PostgreSQL, Zigbee2MQTT, Home Assistant e configuração Proxmox.
- Antes de produção: autenticação, autorização, CORS restrito, ACL MQTT, firewall, TLS, Alembic, backups testados, watchdog, política de disponibilidade, SBOM e testes de segurança.
