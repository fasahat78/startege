#!/bin/bash
# Start development server with correct environment

set -e

echo "🚀 Starting development server..."

# Ensure Cloud SQL Proxy is running
if ! lsof -i :5435 | grep LISTEN > /dev/null; then
    echo "⚠️  Cloud SQL Proxy not running on port 5435"
    echo "Starting Cloud SQL Proxy..."
    cloud-sql-proxy startege:us-central1:startege-db --port=5435 &
    sleep 3
fi

# Verify DATABASE_URL
export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5435/startege"
echo "✅ DATABASE_URL set to: postgresql://postgres:***@127.0.0.1:5435/startege"

# Start Next.js dev server
npm run dev

