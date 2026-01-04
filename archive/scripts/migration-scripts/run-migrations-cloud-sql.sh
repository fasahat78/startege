#!/bin/bash

# Script to run Prisma migrations against Cloud SQL
# Usage: ./scripts/run-migrations-cloud-sql.sh

set -e

echo "🚀 Running Prisma Migrations on Cloud SQL"
echo "=========================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it to your Cloud SQL connection string:"
    echo "  export DATABASE_URL='postgresql://postgres:Zoya%4057Bruce@YOUR_PUBLIC_IP:5432/startege?sslmode=require'"
    echo ""
    echo "Or for Unix socket (from Cloud Run):"
    echo "  export DATABASE_URL='postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db'"
    exit 1
fi

echo "✅ DATABASE_URL is set"
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
echo "  2. Seed initial data if needed"
echo "  3. Test the application"

