#!/bin/bash
# Dubbelklicka — startar dev-server om den inte kör, öppnar mäss-sidan.

cd "$(dirname "$0")"

URL="http://127.0.0.1:3010/massa"

server_up() {
  curl -sf -o /dev/null "$URL" 2>/dev/null
}

if ! server_up; then
  echo "Startar utvecklingsserver (npm run dev)..."
  npm run dev >> /tmp/brf-plattform-dev.log 2>&1 &
  for _ in $(seq 1 60); do
    if server_up; then
      break
    fi
    sleep 1
  done
fi

if ! server_up; then
  echo ""
  echo "Kunde inte nå $URL"
  echo "Starta manuellt i terminalen:  cd $(pwd) && npm run dev"
  echo ""
  echo "Tryck Enter för att stänga..."
  read
  exit 1
fi

open -a Safari "$URL" 2>/dev/null || open "$URL"

echo "Öppnade: $URL"
echo ""
echo "Tryck Enter för att stänga..."
read
