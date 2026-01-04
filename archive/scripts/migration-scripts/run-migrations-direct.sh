#!/bin/bash

# Run migrations directly using Public IP
# Usage: CLOUD_SQL_PUBLIC_IP=YOUR_IP ./scripts/run-migrations-direct.sh

set -e

if [ -z "$CLOUD_SQL_PUBLIC_IP" ]; then
    echo "❌ ERROR: CLOUD_SQL_PUBLIC_IP environment variable is not set"
    echo ""
    echo "Usage:"
    echo "  export CLOUD_SQL_PUBLIC_IP='YOUR_PUBLIC_IP'"
    echo "  ./scripts/run-migrations-direct.sh"
    echo ""
    echo "To get your Public IP:"
    echo "  https://console.cloud.google.com/sql/instances/startege-db?project=startege"
    exit 1
fi

echo "🚀 Running Prisma Migrations on Cloud SQL"
echo "=========================================="
echo "Public IP: $CLOUD_SQL_PUBLIC_IP"
echo ""

# Set DATABASE_URL
export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@$CLOUD_SQL_PUBLIC_IP:5432/startege?sslmode=require"

echo "✅ DATABASE_URL configured"
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
echo ""
echo "Next steps:"
echo "  1. Verify tables exist: npx prisma studio"
echo "  2. Test your application"

