#!/usr/bin/env bash
# =============================================================
# setupserviceweb — Project setup script
# Usage: ./setup.sh <AppName> <admin@email.com>
# =============================================================
set -e

APP_NAME="${1:-MyApp}"
ADMIN_EMAIL="${2:-admin@example.com}"
JWT_SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9!@#$%^&*' < /dev/urandom | head -c 40)

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║           setupserviceweb — project init             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  App name    : $APP_NAME"
echo "  Admin email : $ADMIN_EMAIL"
echo ""

# ── 1. Replace APP_NAME placeholder everywhere ──────────────
echo "→ Replacing APP_NAME with '$APP_NAME'…"

find src -type f \( -name "*.svelte" -o -name "*.ts" -o -name "*.css" \) \
  -exec sed -i "s/APP_NAME/$APP_NAME/g" {} +

sed -i "s/APP_NAME/$APP_NAME/g" \
  src/lib/i18n/en.json \
  src/lib/i18n/fr.json \
  CHANGELOG.md \
  package.json

# ── 2. Create .env ──────────────────────────────────────────
if [ ! -f .env ]; then
  echo "→ Creating .env…"
  cp .env.example .env
  sed -i "s|APP_NAME=MyApp|APP_NAME=$APP_NAME|g"     .env
  sed -i "s|admin@example.com|$ADMIN_EMAIL|g"         .env
  sed -i "s|change_this_to_a_random_32_char_secret|$JWT_SECRET|g" .env
  echo "  ✓ .env created (JWT_SECRET auto-generated)"
else
  echo "  ⚠ .env already exists, skipping."
fi

# ── 3. Install dependencies ─────────────────────────────────
echo "→ Installing dependencies…"
npm install

# ── 4. Reset git history ────────────────────────────────────
echo "→ Resetting git history…"
rm -rf .git
git init
git add -A
git commit -m "Initial commit — $APP_NAME (from setupserviceweb template)"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Done! Next steps:                                   ║"
echo "║  1. Configure .env (SMTP settings)                   ║"
echo "║  2. npm run dev                                      ║"
echo "║  3. Open http://localhost:5173                       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
