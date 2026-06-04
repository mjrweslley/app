#!/bin/bash
cd /home/mjrweslley/app/frontend

# Usa o servidor nativo do Python para servir a pasta 'dist' na porta 8082
python3 -m http.server 8082 --directory dist