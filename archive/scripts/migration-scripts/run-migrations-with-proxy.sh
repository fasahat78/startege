#!/bin/bash

# Run migrations using Cloud SQL Proxy (Unix socket)
# This avoids needing the Public IP

set -e

echo "🚀 Running Prisma Migrations via Cloud SQL Proxy"
echo "================================================="

# Check if Cloud SQL Proxy is installed
if ! command -v cloud-sql-proxy &> /dev/null; then
    echo "📦 Installing Cloud SQL Proxy..."
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.arm64
        chmod +x cloud-sql-proxy
        sudo mv cloud-sql-proxy /usr/local/bin/cloud-sql-proxy || mv cloud-sql-proxy ./cloud-sql-proxy
    else
        echo "❌ Please install Cloud SQL Proxy manually"
        echo "   https://cloud.google.com/sql/docs/postgres/sql-proxy"
        exit 1
    fi
fi

echo "✅ Cloud SQL Proxy ready"
echo ""

# Start Cloud SQL Proxy in background
CONNECTION_NAME="startege:us-central1:startege-db"
SOCKET_DIR="/tmp/cloudsql"

echo "🔌 Starting Cloud SQL Proxy..."
mkdir -p "$SOCKET_DIR"

# Start proxy in background
cloud-sql-proxy "$CONNECTION_NAME" --unix-socket="$SOCKET_DIR" &
PROXY_PID=$!

# Wait for proxy to start
sleep 3

# Set DATABASE_URL for Unix socket
export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=$SOCKET_DIR/$CONNECTION_NAME"

echo "✅ Connected to Cloud SQL"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""

# Run migrations
echo "🔄 Applying migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Migrations completed successfully!"

# Cleanup
echo "🧹 Stopping Cloud SQL Proxy..."
kill $PROXY_PID 2>/dev/null || true

echo ""
echo "✅ Done!"

