#!/usr/bin/env bash
set -e
export PATH="/usr/local/bin:/usr/local/sbin:/usr/sbin:/usr/bin:/sbin:/bin"
cd /home/mjrweslley/app/frontend
exec /usr/local/bin/npx expo start --web --port 8082 --clear
