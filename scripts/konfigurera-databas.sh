#!/usr/bin/env bash
# Konfigurerar Neon Postgres via Vercel och kör Prisma-migrationer.
# Kör från projektroten: bash scripts/konfigurera-databas.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Länkar till Vercel-projektet demo.styrelse-navet.se (brf-plattform-57et) …"
npx vercel link --project brf-plattform-57et --yes

echo ""
echo "→ Skapar Neon Postgres (gratis plan, region Frankfurt) …"
echo "  Om CLI ber om godkännande: öppna länken i webbläsaren och acceptera villkoren,"
echo "  kör sedan detta skript igen."
npx vercel integration add neon --non-interactive \
  -e production -e preview \
  -m region=fra1 -m auth=false \
  --plan free_v3 \
  -n brf-plattform-db || {
  echo ""
  echo "Om install misslyckades p.g.a. villkor:"
  echo "  https://vercel.com/johanbrfnordan28-archs-projects/~/integrations/accept-terms/neon?source=cli"
  echo "Acceptera och kör skriptet igen."
  exit 1
}

echo ""
echo "→ Hämtar miljövariabler till .env.local …"
npx vercel env pull .env.local --yes

# Neon sätter DATABASE_URL_UNPOOLED — Prisma behöver DIRECT_URL
if grep -q '^DATABASE_URL_UNPOOLED=' .env.local 2>/dev/null; then
  UNPOOLED="$(grep '^DATABASE_URL_UNPOOLED=' .env.local | cut -d= -f2- | tr -d '"')"
  if ! grep -q '^DIRECT_URL=' .env.local 2>/dev/null; then
    echo "DIRECT_URL=$UNPOOLED" >> .env.local
    printf '%s' "$UNPOOLED" | npx vercel env add DIRECT_URL production preview development
    echo "→ Satte DIRECT_URL från DATABASE_URL_UNPOOLED"
  fi
fi

if ! grep -q '^AUTH_SECRET=' .env.local 2>/dev/null; then
  SECRET="$(openssl rand -base64 32 | tr -d '\n')"
  echo "AUTH_SECRET=\"$SECRET\"" >> .env.local
  printf '%s' "$SECRET" | npx vercel env add AUTH_SECRET production
  printf '%s' "$SECRET" | npx vercel env add AUTH_SECRET preview
  printf '%s' "$SECRET" | npx vercel env add AUTH_SECRET development
  echo "→ Skapade AUTH_SECRET"
fi

if ! grep -q '^NEXT_PUBLIC_APP_URL=' .env.local 2>/dev/null; then
  echo 'NEXT_PUBLIC_APP_URL="https://demo.styrelse-navet.se"' >> .env.local
  printf '%s' "https://demo.styrelse-navet.se" | npx vercel env add NEXT_PUBLIC_APP_URL production
  printf '%s' "https://demo.styrelse-navet.se" | npx vercel env add NEXT_PUBLIC_APP_URL preview
  printf '%s' "https://demo.styrelse-navet.se" | npx vercel env add NEXT_PUBLIC_APP_URL development
  echo "→ Satte NEXT_PUBLIC_APP_URL"
fi

echo ""
echo "→ Kör Prisma migrate deploy …"
set -a
# shellcheck disable=SC1091
source .env.local
set +a
npx prisma migrate deploy

echo ""
echo "→ Redeployar production …"
npx vercel deploy --prod --yes

echo ""
echo "✓ Klart! Testa:"
echo "  curl -s -X POST https://demo.styrelse-navet.se/api/auth/skapa-forening \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"foreningId\":\"test-db\",\"foreningsNamn\":\"Test DB\",\"skapareNamn\":\"Test\",\"skapareEpost\":\"test@example.com\"}'"
