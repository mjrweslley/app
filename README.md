# Smart Home Platform

Plataforma de domótica **local-first**, preparada para operar sem Internet. Mantém a aplicação React Native/Expo existente e moderniza o backend com FastAPI, PostgreSQL, Mosquitto e Zigbee2MQTT.

## Stack
- Frontend: Expo 54 / React Native / Expo Router.
- Backend: Python 3.12 / FastAPI / SQLAlchemy.
- Base de dados: PostgreSQL.
- Mensagens: Mosquitto MQTT em rede Docker interna.
- Zigbee: Zigbee2MQTT e coordenador USB local.
- Deploy: Debian 13 + Docker Compose + Nginx.

## Início rápido
1. Instalar Debian 13 e Docker Engine + Compose.
2. Copiar .env.example para .env e definir uma password PostgreSQL forte, URL-safe.
3. Ligar o coordenador e obter o caminho com ls -l /dev/serial/by-id/.
4. Definir ZIGBEE_SERIAL_PORT no .env.
5. Executar docker compose --env-file .env up -d --build.
6. Abrir http://IP-DO-HUB:8080.

Ver docs/INSTALLATION.md, docs/ARCHITECTURE.md e docs/OFFLINE-TESTS.md.

## Migração
No primeiro arranque, os dispositivos de backend/devices.json são importados uma única vez para PostgreSQL. O ficheiro original não é alterado. Registos Tapo antigos são preservados, mas não recebem comandos até existir um adaptador local validado. Credenciais antigas não são importadas.

## Limites do MVP
Zigbee inclui descoberta, estado, disponibilidade, comandos on/off e emparelhamento por janela. Modbus tem modelo de dados e endpoints; o driver físico para o contador monofásico é a próxima etapa. Câmaras, automações visuais, acesso remoto e multi-tenant ainda não estão incluídos.

Antes de uso comercial: implementar autenticação/autorização, CORS restrito, ACL MQTT, TLS local, migrações Alembic, backups testados, SBOM e testes de segurança. Instalações elétricas devem ser feitas por profissional qualificado.
