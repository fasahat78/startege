#!/bin/bash
# Copy Dev Database to Production
# This ensures production matches dev exactly

set -e

echo "=== COPYING DEV DATABASE TO PRODUCTION ==="
echo ""
echo "This will:"
echo "1. Export dev database (localhost:5433)"
echo "2. Import to production (via Cloud SQL Proxy on 5435)"
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

DEV_DB="postgresql://fasahatferoze@localhost:5433/startege"
PROD_DB="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5435/startege"

echo ""
echo "Step 1: Exporting dev database..."
pg_dump -h localhost -p 5433 -U fasahatferoze -d startege \
    --no-owner --no-acl --clean --if-exists \
    > /tmp/dev-full-export.sql

echo "✅ Dev database exported"
echo ""

echo "Step 2: Importing to production..."
echo "⚠️  This will DROP existing tables and recreate from dev"
read -p "Continue with import? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

psql "$PROD_DB" -f /tmp/dev-full-export.sql

echo ""
echo "✅ Production database now matches dev!"
echo ""
echo "Next steps:"
echo "1. Refresh your production app"
echo "2. Verify all features work"
echo "3. Check /api/debug/production"

