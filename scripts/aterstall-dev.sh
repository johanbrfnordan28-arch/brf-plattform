#!/usr/bin/env bash
# En Next-server åt gången på port 3010.
# Flera samtidiga «next dev» i samma mapp gör att macOS får slut på
# filbevakare (EMFILE). Då lyssnar 3010 men svarar inte, och webbläsaren
# visar ERR_NETWORK_IO_SUSPENDED.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=3010
HOST="127.0.0.1"

echo "Projekt: $ROOT"
echo "Stoppar Next-processer som tillhör det här projektet …"

pids=$(ps -axo pid=,command= | awk '/[n]ext dev|[n]ext-server|[n]pm exec next dev/ {print $1}')
for pid in $pids; do
  cwd=$(lsof -a -p "$pid" -d cwd 2>/dev/null | awk 'NR==2 {print $NF}')
  if [ "$cwd" = "$ROOT" ]; then
    echo "  stoppar $pid"
    kill "$pid" 2>/dev/null || true
  fi
done

sleep 1

left=$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | awk 'NR>1 {print $2}' || true)
if [ -n "$left" ]; then
  echo "Port $PORT är fortfarande upptagen — tvingar stopp: $left"
  kill -9 $left 2>/dev/null || true
  sleep 1
fi

echo "Startar en server: http://$HOST:$PORT"
ulimit -n 10240
cd "$ROOT"
exec npx next dev -p "$PORT" -H "$HOST"
