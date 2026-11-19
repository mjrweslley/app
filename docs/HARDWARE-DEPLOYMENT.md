# Hardware e instalação 24/7 (Proxmox + Zigbee + Thread/Matter)

## Objetivo e orçamento

Perfil de instalação confirmado: servidor ligado 24/7, Ethernet disponível junto ao router, administração pelo iPhone/tablet e orçamento total de 450–600 EUR.

A configuração de referência usa um Mini PC x86-64 Intel N100/N150, 16 GB RAM e SSD NVMe de 500/512 GB. O orçamento deve reservar aproximadamente 350–365 EUR para o Mini PC, 20–25 EUR para o coordenador Zigbee, 45–60 EUR para o rádio Thread, 85–100 EUR para uma UPS e 10–20 EUR para cabos/extensão USB. Valores indicativos; confirmar preço, vendedor, IVA e entrega para Portugal antes de comprar.

## Arquitetura física e virtual

Instalar Proxmox VE no Mini PC e criar duas VMs:

1. **Home Assistant OS**: 4 GB RAM, 2 vCPU, disco virtual de 32–64 GB. Instalar/ativar Matter Server e OpenThread Border Router (OTBR) através dos add-ons suportados.
2. **Debian 13**: 8 GB RAM, 4 vCPU, disco virtual de 100–150 GB ou maior. Executar a stack desta plataforma via Docker Compose: FastAPI, PostgreSQL, Mosquitto, Zigbee2MQTT e frontend.

Reservar memória suficiente para o Proxmox e não atribuir toda a RAM às VMs. Configurar ambas as VMs para arrancarem automaticamente após o host. Reservar um endereço IP no router para cada VM.

### Rádios — dois dispositivos independentes

- **Zigbee**: SONOFF ZBDongle-E (EFR32MG21), firmware coordenador compatível com Zigbee2MQTT. Fazer passthrough USB para a VM Debian e identificar o dispositivo por /dev/serial/by-id/.
- **Thread**: Home Assistant Connect ZBT-2 com firmware Thread RCP. Fazer passthrough USB para a VM Home Assistant OS e configurar OTBR. O ZBT-2 só opera um protocolo de rádio de cada vez; nesta arquitetura fica dedicado a Thread.

Não tentar usar um único rádio simultaneamente como coordenador Zigbee e rádio Thread. Não assumir que um dispositivo Matter é necessariamente Thread: Matter também pode usar Wi-Fi/Ethernet.

### Rede

- Ligar o Mini PC ao router por Ethernet.
- Manter a interface de gestão Proxmox acessível apenas na LAN.
- Dar IP fixo/reserva DHCP à VM Debian e à VM Home Assistant.
- O backend atual está em redes Docker internas. Para uma futura integração FastAPI -> Home Assistant será necessário permitir, de forma controlada, que apenas o serviço API alcance o endereço LAN da VM Home Assistant (por exemplo, rede Docker de integração não-internal e firewall com destino/porta limitados). Não expor MQTT, PostgreSQL, Proxmox ou os painéis de administração à Internet.
- O frontend fica acessível na LAN em http://IP-DA-VM-DEBIAN:8080.

## Matter e Thread local

Matter-over-Thread requer uma rede Thread funcional e um Thread Border Router. Matter-over-Wi-Fi não precisa do rádio Thread, mas precisa de um Matter Controller. No Home Assistant OS, configurar OTBR e Matter Server; adicionar dispositivos Matter localmente e testar controlo com a WAN desligada.

A plataforma SMART HOME ainda **não tem integração FastAPI com a API Matter/Thread do Home Assistant implementada** nesta revisão. Esta arquitetura prepara a infraestrutura. A próxima alteração de software deve implementar integração autenticada com Home Assistant (API local/eventos) e refletir entidades/estados na plataforma, sem duplicar a gestão de rádio. Não declarar suporte Matter completo até os testes de commissioning, controlo e recuperação offline passarem.

## Alimentação e continuidade

- UPS de 650 VA ou superior com tomadas Schuko compatíveis com a instalação portuguesa. Ligar Mini PC e router à UPS; confirmar potência real e autonomia.
- Ativar no BIOS a opção de ligar automaticamente após restabelecimento de energia (Restore on AC Power Loss).
- Usar extensão USB 2.0 de 1–2 m para afastar o coordenador Zigbee do chassis/portas USB 3.x.
- Manter cópias cifradas de .env, base de dados, configuração Zigbee2MQTT, backups Home Assistant e configuração Proxmox. Guardar uma cópia fora do servidor.

## Sequência de instalação sem computador pessoal

A instalação inicial pode exigir monitor/teclado temporários ou que o vendedor entregue o Mini PC com Proxmox instalado. Depois da instalação, a administração diária é feita pelo browser do iPhone/tablet na LAN.

1. Instalar Proxmox VE no Mini PC e configurar rede/hostname.
2. Criar a VM Home Assistant OS e a VM Debian 13.
3. Fazer passthrough dos dois rádios USB para a VM correta.
4. Instalar Docker Engine + Compose na VM Debian e fazer deploy desta plataforma.
5. Configurar Zigbee2MQTT com o caminho serial persistente.
6. Configurar OTBR e Matter Server no Home Assistant OS.
7. Testar Zigbee, Thread e Matter localmente, incluindo reinício do host e corte temporário da Internet.
8. Configurar backups agendados e alertas de indisponibilidade.

## Critérios de aceitação antes de produção

- [ ] Proxmox, Debian e Home Assistant reiniciam automaticamente após falha de energia.
- [ ] Zigbee2MQTT mantém o coordenador e inventário após reboot.
- [ ] OTBR mantém a rede Thread após reboot.
- [ ] Um dispositivo Matter-over-Thread e um Matter-over-Wi-Fi são comissionados e controlados localmente.
- [ ] Com a WAN desligada, controlo local, dashboard e automações essenciais continuam funcionais.
- [ ] Backup e restauro de PostgreSQL, Zigbee2MQTT e Home Assistant foram testados.
- [ ] Autenticação, autorização, firewall, ACL MQTT e TLS estão configurados antes de acesso remoto.

## Limitações conhecidas

O Mini PC N100 é adequado para o backend e automação doméstica básica, mas não deve ser dimensionado para análise pesada de vídeo/IA. O suporte real de cada dispositivo depende do modelo, firmware e certificação. A integração da plataforma com Home Assistant e o onboarding Matter ainda são trabalho de software por concluir.
