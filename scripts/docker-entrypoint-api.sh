#!/bin/sh
set -e

cd /app/packages/database

echo "Running database migrations..."
pnpm prisma migrate deploy

cd /app/apps/api-gateway
exec node dist/main.js
