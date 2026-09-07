#!/usr/bin/env bash
# Vercel build: kör migrationer om DATABASE_URL finns, annars bara generate + build.
set -euo pipefail

URL="${DATABASE_URL:-}"
if [[ "$URL" == postgresql://* || "$URL" == postgres://* ]]; then
  # Neon sätter DATABASE_URL_UNPOOLED — Prisma migrate behöver DIRECT_URL
  if [[ -z "${DIRECT_URL:-}" && -n "${DATABASE_URL_UNPOOLED:-}" ]]; then
    export DIRECT_URL="$DATABASE_URL_UNPOOLED"
  fi
  echo "→ DATABASE_URL satt — kör prisma migrate deploy"
  npx prisma migrate deploy
else
  echo "→ DATABASE_URL saknas — hoppar över migrate deploy (demoläge)"
fi

npx prisma generate
npx next build
