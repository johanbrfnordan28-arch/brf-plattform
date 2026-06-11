#!/bin/bash
# Dubbelklicka — öppnar BRF Företag-startsidan i webbläsaren.
# Kräver att dev-servern körs (npm run dev i Cursor).

URL="http://127.0.0.1:3010/"

open -a Safari "$URL" 2>/dev/null || open "$URL"
