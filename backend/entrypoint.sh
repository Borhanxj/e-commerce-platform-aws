#!/bin/sh
set -e

if echo "${DATABASE_URL:-}" | grep -q "rds.amazonaws.com"; then
  export PGSSLMODE=no-verify
  case "$DATABASE_URL" in
    *\?*) export DATABASE_URL="${DATABASE_URL}&sslmode=no-verify" ;;
    *) export DATABASE_URL="${DATABASE_URL}?sslmode=no-verify" ;;
  esac
fi

echo "Waiting for PostgreSQL to be ready..."
until node -e "require('./db').query('SELECT 1').then(() => process.exit(0)).catch(() => process.exit(1))" 2>/dev/null; do
  echo "  Postgres not ready, retrying in 2s..."
  sleep 2
done
echo "PostgreSQL is ready."

echo "Running migrations..."
npm run migrate:up

if [ "${RUN_SEEDS:-0}" = "1" ]; then
  echo "Seeding admin user..."
  node scripts/seed-admin.js

  echo "Seeding sales manager..."
  node scripts/seed-sales-manager.js

  echo "Seeding product manager..."
  node scripts/seed-product-manager.js

  echo "Seeding products..."
  node scripts/seed-products.js
else
  echo "Skipping seeds (set RUN_SEEDS=1 to run them)."
fi

echo "Starting server..."
if [ "$#" -gt 0 ]; then
  exec "$@"
else
  exec npm run dev
fi
