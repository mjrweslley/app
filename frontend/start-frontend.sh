#!/bin/bash
cd /home/mjrweslley/app/frontend

# 1. Apaga a pasta de produção antiga para evitar conflitos
rm -rf dist/

# 2. Exporta o projeto web (A sintaxe moderna do Expo 50+)
npx expo export

# 3. Serve a pasta 'dist', forçando a escuta no IP público (0.0.0.0) na porta 8082
npx serve dist -l tcp://0.0.0.0:8082 -s