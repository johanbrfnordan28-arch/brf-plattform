#!/usr/bin/env bash
# Koppla lokalt repo till GitHub och pusha main.
# Kör efter att du skapat ett tomt repo på github.com (utan README).

set -euo pipefail
cd "$(dirname "$0")/.."

GITHUB_USER="${GITHUB_USER:-johancarlsen}"
REPO_NAME="${REPO_NAME:-brf-plattform}"
REMOTE_URL="${REMOTE_URL:-https://github.com/${GITHUB_USER}/${REPO_NAME}.git}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Fel: ingen git-repo här. Kör från projektmappen."
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "Origin finns redan: $(git remote get-url origin)"
else
  git remote add origin "$REMOTE_URL"
  echo "Lade till origin: $REMOTE_URL"
fi

echo "Pushar main till GitHub..."
git push -u origin main

echo ""
echo "Klart! Nästa steg — Vercel:"
echo "  1. https://vercel.com/new"
echo "  2. Import Git Repository → välj ${REPO_NAME}"
echo "  3. Deploy (standardinställningar för Next.js)"
echo ""
