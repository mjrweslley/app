# Smart Home Platform

Plataforma de domótica **local-first**, preparada para operar sem Internet. Mantém a aplicação React Native/Expo existente e moderniza o backend com FastAPI, PostgreSQL, Mosquitto e Zigbee2MQTT.

## Stack
- Frontend: Expo 54 / React Native / Expo Router.
- Backend: Python 3.12 / FastAPI / SQLAlchemy.
- Base de dados: PostgreSQL.
- Mensagens: Mosquitto MQTT em rede Docker interna.
- Zigbee: Zigbee2MQTT e coordenador USB local.
- Thread/Matter: Home Assistant OS + OpenThread Border Router + Matter Server, em VM separada.
- Host 24/7 recomendado: Proxmox VE num Mini PC x86-64 Intel N100/N150, 16 GB RAM, SSD NVMe 500/512 GB.
- Deploy da aplicação: Debian 13 VM + Docker Compose + Nginx.

## Arquitetura de hardware recomendada
Para a configuração com Zigbee e Thread simultâneos, usar **dois rádios dedicados**:
- SONOFF ZBDongle-E para Zigbee2MQTT, ligado por USB passthrough à VM Debian.
- Home Assistant Connect ZBT-2 dedicado a Thread RCP/OTBR, ligado por USB passthrough à VM Home Assistant OS.

O ZBT-2 só pode operar Zigbee ou Thread de cada vez; nesta arquitetura fica reservado para Thread. Matter pode funcionar por Wi-Fi ou Thread. Matter-over-Thread exige Thread Border Router. O projeto ainda não tem integração FastAPI <-> Home Assistant/Matter implementada; a arquitetura prepara essa integração, que deve ser adicionada e testada antes de declarar Matter plenamente suportado.

Ver **docs/HARDWARE-DEPLOYMENT.md** para lista de componentes, orçamento indicativo, dimensionamento das VMs, rede, UPS e sequência de instalação a partir de iPhone/tablet.

## Início rápido da VM Debian
1. Instalar Debian 13 na VM e Docker Engine + Compose.
2. Copiar .env.example para .env e definir uma password PostgreSQL forte, URL-safe.
3. Ligar o coordenador Zigbee à VM Debian e obter o caminho com ls -l /dev/serial/by-id/.
4. Definir ZIGBEE_SERIAL_PORT no .env.
5. Executar docker compose --env-file .env -f infrastructure/docker-compose.yml up -d --build.
6. Abrir http://IP-DA-VM-DEBIAN:8080.

Ver docs/INSTALLATION.md, docs/ARCHITECTURE.md, docs/HARDWARE-DEPLOYMENT.md e docs/OFFLINE-TESTS.md.

## Migração
No primeiro arranque, os dispositivos de backend/devices.json são importados uma única vez para PostgreSQL. O ficheiro original não é alterado. Registos Tapo antigos são preservados, mas não recebem comandos até existir um adaptador local validado. Credenciais antigas não são importadas.

## Limites do MVP
Zigbee inclui descoberta, estado, disponibilidade, comandos on/off e emparelhamento por janela. Modbus tem modelo de dados e endpoints; o driver físico para o contador monofásico é a próxima etapa. Integração Matter/Thread na aplicação, câmaras, automações visuais, acesso remoto e multi-tenant ainda não estão concluídos.

Antes de uso comercial: implementar autenticação/autorização, CORS restrito, ACL MQTT, TLS local, migrações Alembic, backups testados, SBOM e testes de segurança. Instalações elétricas devem ser feitas por profissional qualificado.
