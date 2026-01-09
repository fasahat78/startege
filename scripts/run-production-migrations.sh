#!/bin/bash

# Production Database Migration Script
# Run this BEFORE deploying code to production

set -e

echo "🗄️  Production Database Migration"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Cloud SQL Proxy is running
if ! pgrep -f "cloud-sql-proxy" > /dev/null; then
    echo -e "${YELLOW}⚠️  Cloud SQL Proxy doesn't appear to be running${NC}"
    echo ""
    echo "Start it with:"
    echo "  cloud-sql-proxy startege:us-central1:startege-db --port=5432"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL environment variable is not set${NC}"
    echo ""
    echo "Set it with:"
    echo "  export DATABASE_URL='postgresql://postgres:PASSWORD@127.0.0.1:5432/startege'"
    echo ""
    echo "⚠️  Use production database credentials!"
    exit 1
fi

# Verify we're connecting to production (not local)
if [[ "$DATABASE_URL" == *"127.0.0.1:5433"* ]] || [[ "$DATABASE_URL" == *"localhost:5433"* ]]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL points to local database (port 5433)${NC}"
    echo "This script is for PRODUCTION migrations only!"
    echo ""
    echo "Production should use Cloud SQL Proxy on port 5432"
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
echo ""

# Show what will be migrated
echo "📋 Migration Preview:"
echo "-------------------"
npx prisma migrate status
echo ""

read -p "Continue with migration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

# Run migrations
echo ""
echo "🚀 Running migrations..."
echo "----------------------"
npx prisma migrate deploy

echo ""
echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify tables exist:"
echo "   - AIGPFlashcardProgress"
echo "   - DiscountCode"
echo "   - DiscountCodeUsage"
echo "   - User table has isAdmin and role columns"
echo ""
echo "2. Create admin user (if needed):"
echo "   UPDATE \"User\" SET \"isAdmin\" = true, \"role\" = 'ADMIN' WHERE email = 'fasahat@gmail.com';"
echo ""
echo "3. Deploy code using Cloud Build"

