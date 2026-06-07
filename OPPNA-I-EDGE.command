#!/bin/bash
# Dubbelklicka den här filen — öppnar Skapa förening i Microsoft Edge.
# Kräver att dev-servern körs (npm run dev i projektmappen).

URL="http://127.0.0.1:3010/prova-gratis"

if open -a "Microsoft Edge" "$URL" 2>/dev/null; then
  exit 0
fi

# Fallback om Edge heter annat på svenska Mac
open -a "Microsoft Edge Canary" "$URL" 2>/dev/null || open "$URL"
