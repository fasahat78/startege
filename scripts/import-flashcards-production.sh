#!/bin/bash

# Production Flashcard Import Script
# This script helps import flashcards to production database via Cloud SQL Proxy

set -e

echo "🚀 Production Flashcard Import"
echo "=============================="
echo ""

# Check if Cloud SQL Proxy is running
if ! pgrep -f "cloud-sql-proxy.*startege.*startege-db" > /dev/null; then
  echo "❌ Error: Cloud SQL Proxy is not running."
  echo ""
  echo "Please start it in a separate terminal:"
  echo "  cloud-sql-proxy startege:us-central1:startege-db --port=5434"
  echo ""
  echo "Or if port 5432 is available:"
  echo "  cloud-sql-proxy startege:us-central1:startege-db --port=5432"
  exit 1
fi

echo "✅ Cloud SQL Proxy is running"
echo ""

# Determine which port the proxy is using
PROXY_PORT=$(lsof -i -P | grep cloud-sql-proxy | grep LISTEN | awk '{print $9}' | cut -d: -f2 | head -1)

if [ -z "$PROXY_PORT" ]; then
  echo "⚠️  Could not detect proxy port. Using default 5434..."
  PROXY_PORT=5434
fi

echo "📡 Detected proxy on port: $PROXY_PORT"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set. Please provide your Cloud SQL password:"
  read -sp "Password: " DB_PASSWORD
  echo ""
  export DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@127.0.0.1:${PROXY_PORT}/startege"
  echo "✅ DATABASE_URL set"
else
  echo "✅ DATABASE_URL is already set"
  # Update port if needed
  if [[ "$DATABASE_URL" != *":${PROXY_PORT}"* ]]; then
    echo "⚠️  Warning: DATABASE_URL port doesn't match proxy port $PROXY_PORT"
    echo "   Current DATABASE_URL: ${DATABASE_URL%%:*}:***"
  fi
fi

echo ""
echo "📊 Current DATABASE_URL (masked):"
echo "${DATABASE_URL%%:*}:***@${DATABASE_URL##*@}"
echo ""

# Confirm before proceeding
read -p "Continue with import? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Import cancelled"
  exit 1
fi

echo ""
echo "🔄 Step 1: Running database migration..."
npx prisma db push --skip-generate

echo ""
echo "📥 Step 2: Importing flashcards..."
npm run import-flashcards

echo ""
echo "✅ Import complete!"
echo ""
echo "📊 Verification:"
echo "Run this to check:"
echo "  psql \"$DATABASE_URL\" -c 'SELECT COUNT(*) FROM \"AIGPFlashcard\";'"

