# Instalação no Debian 13

1. Instalar Debian 13 minimal, hostname smarthub, SSH e fuso Europe/Lisbon.
2. Atualizar o sistema: sudo apt update && sudo apt full-upgrade -y
3. Instalar Docker Engine e Compose pelo guia oficial: https://docs.docker.com/engine/install/debian/
4. Reservar um IP para o Hub no router. O tablet deve estar na mesma LAN Wi-Fi.
5. Ligar o SONOFF Dongle MG24 numa extensão USB e confirmar firmware em modo coordenador.
6. Executar ls -l /dev/serial/by-id/ e copiar o caminho para ZIGBEE_SERIAL_PORT no .env.
7. Copiar .env.example para .env e definir uma password PostgreSQL longa, alfanumérica e URL-safe.
8. Validar e iniciar:

docker compose --env-file .env -f infrastructure/docker-compose.yml config
docker compose --env-file .env -f infrastructure/docker-compose.yml up -d --build
docker compose --env-file .env -f infrastructure/docker-compose.yml ps

Abrir http://IP-DO-HUB:8080.

O adapter ember deve ser confirmado para o firmware e versão Zigbee2MQTT instalados. Para Android nativo, definir EXPO_PUBLIC_API_BASE_URL para http://IP-DO-HUB:8080/api antes do build. O build web Docker usa /api relativo.

Backup:
mkdir -p backups
docker compose --env-file .env -f infrastructure/docker-compose.yml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/smarthome-$(date +%F-%H%M).sql

Guardar cópia cifrada do .env fora do Git. Nunca adicionar credenciais ao repositório.
