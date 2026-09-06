#!/bin/bash
# Dubbelklicka — öppnar mäss-sidan (mejla länk) i webbläsaren.

cd "$(dirname "$0")"

URL="http://127.0.0.1:3010/massa"

open -a Safari "$URL" 2>/dev/null || open "$URL"

echo "Öppnade: $URL"
echo ""
echo "Servern måste köra (npm run dev). Tryck Enter för att stänga..."
read
