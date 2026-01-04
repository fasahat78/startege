#!/bin/bash
# Copy Dev Database to Production
# This ensures production matches dev exactly

set -e

echo "=== COPYING DEV DATABASE TO PRODUCTION ==="
echo ""
echo "This will:"
echo "1. Export dev database (localhost:5433)"
echo "2. Import to production (via Cloud SQL Proxy on 5435)"
echo "3. Production will match dev exactly"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Check Cloud SQL Proxy is running
if ! lsof -i :5435 | grep LISTEN > /dev/null; then
    echo "❌ Cloud SQL Proxy not running on port 5435"
    echo "Start it with:"
    echo "  cloud-sql-proxy startege:us-central1:startege-db --port=5435"
    exit 1
fi

echo ""
echo "Step 1: Exporting dev database..."
export DATABASE_URL="postgresql://fasahatferoze@localhost:5433/startege"
npx tsx scripts/export-dev-database.ts

echo ""
echo "Step 2: Importing to production..."
echo "⚠️  This will REPLACE all production data with dev data"
read -p "Continue with import? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5435/startege"
npx tsx scripts/import-to-production.ts

echo ""
echo "✅ Production database now matches dev!"
echo ""
echo "Next steps:"
echo "1. Refresh your production app"
echo "2. Verify all features work"
echo "3. Check /api/debug/production"
