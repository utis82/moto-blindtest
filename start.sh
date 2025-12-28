#!/bin/sh
set -e

echo "🚀 Starting Moto Blindtest..."

# Create data directory if it doesn't exist
mkdir -p /data

# Database path
DB_PATH="/data/dev.db"

# Set DATABASE_URL for all operations
export DATABASE_URL="file:$DB_PATH"

# Navigate to db directory for migrations
cd /app/db

# Always run migrations (idempotent - safe to run multiple times)
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed!"

# Navigate to backend for seeding (has access to node_modules with Prisma client)
cd /app/backend

# Always seed (upsert is idempotent - will update existing or create new)
echo "🌱 Seeding database with motorcycles..."
node ../db/seed.js || echo "⚠️ Seeding failed but continuing..."

echo "✅ Database operations completed!"

# Start the application
echo "🎮 Starting Node.js server..."
cd /app/backend
exec node dist/backend/src/index.js
