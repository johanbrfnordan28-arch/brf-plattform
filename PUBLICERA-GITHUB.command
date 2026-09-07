#!/bin/bash
# Dubbelklicka för att skicka upp alla ändringar till GitHub.
# Gör automatiskt: git add → commit → push

cd "$(dirname "$0")"

echo "════════════════════════════════════════"
echo "  BRF-plattform → GitHub"
echo "════════════════════════════════════════"
echo ""

if ! ./scripts/publicera.sh; then
  echo ""
  echo "✗ Det gick inte. Kontrollera:"
  echo "  1. Repot ${REPO_NAME:-brf-plattform} finns på github.com"
  echo "  2. Du är inloggad med rätt konto"
  echo "  3. Du har internet"
  echo ""
  echo "Tips: kör manuellt i terminalen med:"
  echo "  cd $(pwd) && npm run publicera"
  echo ""
fi

echo "Tryck Enter för att stänga..."
read
