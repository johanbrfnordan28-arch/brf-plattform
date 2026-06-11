#!/bin/bash
# Dubbelklicka EN gång efter att du skapat repot brf-plattform på github.com.
# Logga in om webbläsaren frågar. Tryck Enter i slutet för att stänga fönstret.

cd "$(dirname "$0")"

echo "Skickar upp koden till GitHub..."
echo ""

if ! ./scripts/publicera.sh; then
  echo ""
  echo "Det gick inte än. Kontrollera:"
  echo "  1. Repot brf-plattform finns på github.com"
  echo "  2. Du är inloggad med rätt konto"
  echo ""
fi

echo "Tryck Enter för att stänga..."
read
