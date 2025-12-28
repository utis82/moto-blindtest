#!/bin/sh
set -e

echo "🚀 Starting Moto Blindtest..."

# Create data directory if it doesn't exist
mkdir -p /data

# Database path
DB_PATH="/data/dev.db"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "📦 Database not found. Initializing..."

    # Set DATABASE_URL for migrations
    export DATABASE_URL="file:$DB_PATH"

    # Navigate to db directory
    cd /app/db

    # Run migrations to create database structure
    echo "🔄 Running Prisma migrations..."
    npx prisma migrate deploy

    # Seed the database with motorcycles
    echo "🌱 Seeding database with motorcycles..."
    npx prisma db seed

    echo "✅ Database initialized successfully!"

    # Navigate back to backend
    cd /app/backend
else
    echo "✅ Database already exists at $DB_PATH"
fi

# Start the application
echo "🎮 Starting Node.js server..."
cd /app/backend
exec node dist/backend/src/index.js
