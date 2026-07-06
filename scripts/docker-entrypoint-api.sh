#!/bin/sh
set -e

cd /app/packages/database

echo "Running database migrations..."
MIGRATE_OUTPUT=$(pnpm prisma migrate deploy 2>&1) || MIGRATE_EXIT=$?
echo "$MIGRATE_OUTPUT"

if [ "${MIGRATE_EXIT:-0}" -ne 0 ]; then
  if echo "$MIGRATE_OUTPUT" | grep -q "P3005"; then
    echo "Non-empty database without migration history — syncing schema and baselining..."
    pnpm prisma db push --skip-generate
    pnpm prisma migrate resolve --applied "20260706132606_"
  else
    exit "$MIGRATE_EXIT"
  fi
fi

cd /app/apps/api-gateway
exec node dist/main.js
