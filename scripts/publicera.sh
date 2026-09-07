#!/usr/bin/env bash
# Allt-i-ett: stage, commit (vid behov) och push till GitHub.
# Kör via PUBLICERA-GITHUB.command (dubbelklick) eller: npm run publicera

set -euo pipefail
cd "$(dirname "$0")/.."

GITHUB_USER="${GITHUB_USER:-johanbrfnordan28-arch}"
REPO_NAME="${REPO_NAME:-brf-plattform}"
REMOTE_URL="${REMOTE_URL:-https://github.com/${GITHUB_USER}/${REPO_NAME}.git}"
AUTO_COMMIT_MSG="${AUTO_COMMIT_MSG:-}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Fel: ingen git-repo här. Kör från projektmappen."
  exit 1
fi

BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  echo "Fel: du är inte på någon branch (detached HEAD)."
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "GitHub: $(git remote get-url origin)"
else
  git remote add origin "$REMOTE_URL"
  echo "Lade till origin: $REMOTE_URL"
fi

echo "Branch: $BRANCH"
echo ""

echo "→ Lägger till alla ändringar..."
git add -A

if git diff --cached --quiet; then
  echo "Inga nya ändringar att committa."
else
  if [[ -z "$AUTO_COMMIT_MSG" ]]; then
    DEFAULT_MSG="Uppdatering $(date '+%Y-%m-%d %H:%M')"
    if [[ "$(uname)" == "Darwin" ]] && command -v osascript >/dev/null 2>&1; then
      AUTO_COMMIT_MSG="$(osascript <<EOF 2>/dev/null || true
set defaultAnswer to "$DEFAULT_MSG"
display dialog "Beskriv kort vad du ändrat:" default answer defaultAnswer buttons {"Avbryt", "Committa"} default button "Committa"
text returned of result
EOF
)"
      if [[ -z "$AUTO_COMMIT_MSG" ]]; then
        AUTO_COMMIT_MSG="$DEFAULT_MSG"
      fi
    else
      AUTO_COMMIT_MSG="$DEFAULT_MSG"
    fi
  fi

  echo "→ Committar: $AUTO_COMMIT_MSG"
  git commit -m "$AUTO_COMMIT_MSG"
fi

echo ""
echo "→ Pushar till GitHub..."
git push -u origin "$BRANCH"

echo ""
echo "✓ Klart! Koden finns på GitHub (branch: $BRANCH)."
echo ""
echo "Nästa steg — publik länk via Vercel (första gången):"
echo "  1. https://vercel.com/new"
echo "  2. Import Git Repository → välj ${REPO_NAME}"
echo "  3. Deploy (standardinställningar för Next.js)"
echo ""
