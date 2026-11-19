# Instalação no Mini PC (Proxmox + Debian VM + Home Assistant OS)

O destino recomendado é um Mini PC x86-64 Intel N100/N150, 16 GB RAM e SSD NVMe de 500/512 GB, ligado por Ethernet ao router. Para a configuração completa, usar Proxmox VE como hypervisor com duas VMs independentes.

## 1. Preparar o host Proxmox

1. Instalar Proxmox VE no Mini PC. Se não houver computador disponível para criar o USB de instalação, pedir ao vendedor/assistência que entregue o equipamento com Proxmox instalado; a instalação inicial pode exigir temporariamente monitor e teclado.
2. Configurar hostname, rede Ethernet, IP reservado no router e acesso à interface web Proxmox apenas na LAN.
3. Ativar no BIOS "Restore on AC Power Loss" / arranque após reposição de energia.
4. Ligar o Mini PC e o router a uma UPS de 650 VA ou superior, com tomadas Schuko adequadas.

## 2. Criar as VMs

### VM 1 — Home Assistant OS
- 2 vCPU, 4 GB RAM, disco 32–64 GB.
- Instalar Home Assistant OS pelo método oficial para Proxmox.
- Configurar IP reservado no router.
- Instalar/ativar Matter Server e OpenThread Border Router (OTBR) conforme a documentação atual do Home Assistant.
- Fazer passthrough USB do Home Assistant Connect ZBT-2 para esta VM e configurar o rádio como Thread RCP.

### VM 2 — Debian 13
- 4 vCPU, 8 GB RAM, disco 100–150 GB ou superior.
- Configurar IP reservado no router.
- Fazer passthrough USB do SONOFF ZBDongle-E para esta VM.
- Instalar Docker Engine + Compose pelo guia oficial: https://docs.docker.com/engine/install/debian/

Manter RAM livre para o Proxmox. Configurar as duas VMs para arrancarem automaticamente com o host.

## 3. Configurar Zigbee e a plataforma

1. Na VM Debian, identificar o rádio com ls -l /dev/serial/by-id/.
2. Copiar o caminho persistente para ZIGBEE_SERIAL_PORT no .env. Não usar /dev/ttyACM0 se existir caminho /dev/serial/by-id/.
3. Copiar .env.example para .env e definir uma password PostgreSQL longa, aleatória e URL-safe.
4. Validar e iniciar:

```bash
docker compose --env-file .env -f infrastructure/docker-compose.yml config
docker compose --env-file .env -f infrastructure/docker-compose.yml up -d --build
docker compose --env-file .env -f infrastructure/docker-compose.yml ps
```

5. Abrir http://IP-DA-VM-DEBIAN:8080 no iPhone/tablet na mesma LAN.

## 4. Configurar Thread e Matter

- O ZBT-2 fica dedicado a Thread e ligado à VM Home Assistant OS; não o configurar como Zigbee.
- Configurar OTBR para criar/manter a rede Thread.
- Ativar Matter Server e adicionar os dispositivos Matter através do Home Assistant.
- Matter-over-Thread depende do Thread Border Router. Matter-over-Wi-Fi não precisa do rádio Thread, mas precisa de um Matter Controller.
- Confirmar o suporte de cada modelo/firmware antes da compra.

**Estado da integração:** esta revisão do backend ainda não comunica diretamente com a API Matter/Thread do Home Assistant. Os rádios e o Home Assistant preparam a infraestrutura, mas a integração FastAPI, sincronização de entidades e commissioning a partir da interface SMART HOME são trabalho de software por implementar. Não assumir que o dashboard atual já controla dispositivos Matter.

## 5. Rede e segurança

O frontend fica disponível na LAN em http://IP-DA-VM-DEBIAN:8080. Manter Proxmox, Home Assistant, MQTT, PostgreSQL e painéis administrativos sem exposição direta à Internet. Para a futura integração FastAPI -> Home Assistant, criar uma rota/rede de integração controlada e permitir apenas o acesso da API ao endereço/porta local do Home Assistant. Não tornar as redes MQTT/PostgreSQL públicas.

Antes de acesso remoto, configurar autenticação/autorização, firewall, CORS restrito, ACL MQTT, TLS e atualizações de segurança.

## 6. Backups

- Guardar cópia cifrada de .env fora do repositório.
- Fazer backup agendado de PostgreSQL, configuração Zigbee2MQTT, Home Assistant e VMs Proxmox.
- Guardar uma cópia fora do servidor (SSD externo ou destino remoto cifrado).
- Testar o restauro, não apenas a criação dos backups.

Exemplo de backup PostgreSQL:

```bash
mkdir -p backups
docker compose --env-file .env -f infrastructure/docker-compose.yml exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backups/smarthome-$(date +%F-%H%M).sql
```

## 7. Teste de funcionamento local

1. Reiniciar host e confirmar arranque automático das VMs/serviços.
2. Emparelhar um dispositivo Zigbee e confirmar estado MQTT/API.
3. Adicionar um dispositivo Matter-over-Thread no Home Assistant.
4. Adicionar um dispositivo Matter-over-Wi-Fi no Home Assistant.
5. Desligar temporariamente a WAN e confirmar que os controlos locais continuam operacionais.
6. Restaurar um backup num ambiente de teste.

Para testes offline adicionais, consultar docs/OFFLINE-TESTS.md.
