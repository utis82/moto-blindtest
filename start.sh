#!/bin/sh
set -e

echo "🚀 Starting Moto Blindtest..."

# Create data directory if it doesn't exist
mkdir -p /data

# Database path
DB_PATH="/data/dev.db"

# Set DATABASE_URL for all operations
export DATABASE_URL="file:$DB_PATH"

# Navigate to db directory
cd /app/db

# Always run migrations (idempotent - safe to run multiple times)
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

# Always seed (upsert is idempotent - will update existing or create new)
echo "🌱 Seeding database with motorcycles..."
npx prisma db seed || echo "⚠️ Seeding failed but continuing..."

echo "✅ Database operations completed!"

# Navigate back to backend
cd /app/backend

# Start the application
echo "🎮 Starting Node.js server..."
cd /app/backend
exec node dist/backend/src/index.js
