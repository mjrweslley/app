# Domotica Hub MVP Concluído

Central de domótica 24/7 para tablet com mapa **isométrico 3D-style** da planta da casa, ligada a um backend FastAPI+MongoDB que serve de camada de abstracção para o servidor Flask local do utilizador.

**Construído:**
- **Dashboard** — Mapa isométrico SVG da casa (5 cómodos) com 11 dispositivos clicáveis e brilho ambiente quando luzes/tomadas estão ligadas; status strip (Luzes ON, Potência, Temp média, Dispositivos online); sidebar com toggles rápidos filtráveis por cómodo
- **Detalhe do Dispositivo** — Controlos por tipo (brilho luz, posição persiana, ±°C climatização, leituras de sensor), gráfico SVG de consumo 24h, regras de alerta CRUD (métrica/operador/threshold)
- **Gestão de Dispositivos** — Add/remove com escolha de **tipo** (luz/persiana/tomada/clima/sensor) e **fabricante** (Tapo / Shelly / Sonoff / Genérico) — multi-vendor pronto
- **Definições** — URL do servidor Flask + API key (configurável), nome da casa, idioma (pt-PT/pt-BR/en/es), switches para **Alexa** e **Agente IA local** (preparados para futuro)
- **Alertas** — Histórico com severidade (info/warning/critical)
- Backend FastAPI com 16 endpoints `/api/*`, dados seed (5 cómodos + 11 dispositivos), simulação de consumo determinística por dispositivo
- Tema dark luxury (preto/âmbar/azul), ícones Feather, SafeArea, testIDs em todos os interactivos

**Testado:** 10/10 testes backend ✓ — todos os flows frontend ✓

**Integração Flask (MOCKED):** Toggle/state actualizam o MongoDB local. Para ligar ao seu Flask real, configure a URL em Definições — o passo seguinte é adaptar `server.py` para fazer proxy dos comandos para o Flask via HTTP usando `flask_server_url`.

**PRD com comparação iPad vs Tablet Android** em `/app/memory/PRD.md`: recomendamos **Lenovo Tab M10 / Samsung Tab A9+ Android** pela flexibilidade de modo quiosque 24/7, integração nativa com Alexa, e melhor relação preço/funcionalidade vs iPad.

**Next Action Items:**
1. Adaptar os endpoints do FastAPI para fazer proxy/HTTP ao seu Flask real usando `flask_server_url`
2. Adicionar **Cenas** (ex: "Boa noite" → apaga luzes + fecha persianas + AC em modo eco)
3. Integrar **Alexa Skill** + **agente IA por voz** (Whisper + Claude + ElevenLabs) — os toggles já estão prontos em Definições
4. Upgrade do mapa para **react-three-fiber WebGL** quando precisar de uma vista 3D verdadeira com rotação/zoom
5. **💡 Smart business enhancement:** adicionar cálculo de **custo €/kWh em tempo real** no dashboard (consumo × tarifa) com previsão mensal — converte a app de "controlo" para "poupança visível", aumentando o uso diário pelos membros da casa
Action: finish
Observation: Summary: ## Domotica Hub MVP Concluído

Central de domótica 24/7 para tablet com mapa **isométrico 3D-style** da planta da casa, ligada a um backend FastAPI+MongoDB que serve de camada de abstracção para o servidor Flask local do utilizador.

**Construído:**
- **Dashboard** — Mapa isométrico SVG da casa (5 cómodos) com 11 dispositivos clicáveis e brilho ambiente quando luzes/tomadas estão ligadas; status strip (Luzes ON, Potência, Temp média, Dispositivos online); sidebar com toggles rápidos filtráveis por cómodo
- **Detalhe do Dispositivo** — Controlos por tipo (brilho luz, posição persiana, ±°C climatização, leituras de sensor), gráfico SVG de consumo 24h, regras de alerta CRUD (métrica/operador/threshold)
- **Gestão de Dispositivos** — Add/remove com escolha de **tipo** (luz/persiana/tomada/clima/sensor) e **fabricante** (Tapo / Shelly / Sonoff / Genérico) — multi-vendor pronto
- **Definições** — URL do servidor Flask + API key (configurável), nome da casa, idioma (pt-PT/pt-BR/en/es), switches para **Alexa** e **Agente IA local** (preparados para futuro)
- **Alertas** — Histórico com severidade (info/warning/critical)
- Backend FastAPI com 16 endpoints `/api/*`, dados seed (5 cómodos + 11 dispositivos), simulação de consumo determinística por dispositivo
- Tema dark luxury (preto/âmbar/azul), ícones Feather, SafeArea, testIDs em todos os interactivos

**Testado:** 10/10 testes backend ✓ — todos os flows frontend ✓

**Integração Flask (MOCKED):** Toggle/state actualizam o MongoDB local. Para ligar ao seu Flask real, configure a URL em Definições — o passo seguinte é adaptar `server.py` para fazer proxy dos comandos para o Flask via HTTP usando `flask_server_url`.

**PRD com comparação iPad vs Tablet Android** em `/app/memory/PRD.md`: recomendamos **Lenovo Tab M10 / Samsung Tab A9+ Android** pela flexibilidade de modo quiosque 24/7, integração nativa com Alexa, e melhor relação preço/funcionalidade vs iPad.

**Next Action Items:**
1. Adaptar os endpoints do FastAPI para fazer proxy/HTTP ao seu Flask real usando `flask_server_url`
2. Adicionar **Cenas** (ex: "Boa noite" → apaga luzes + fecha persianas + AC em modo eco)
3. Integrar **Alexa Skill** + **agente IA por voz** (Whisper + Claude + ElevenLabs) — os toggles já estão prontos em Definições
4. Upgrade do mapa para **react-three-fiber WebGL** quando precisar de uma vista 3D verdadeira com rotação/zoom
5. **💡 Smart business enhancement:** adicionar cálculo de **custo €/kWh em tempo real** no dashboard (consumo × tarifa) com previsão mensal — converte a app de "controlo" para "poupança visível", aumentando o uso diário pelos membros da casa