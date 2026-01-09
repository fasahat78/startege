#!/bin/bash

# Baseline Production Database
# This marks existing migrations as already applied

set -e

echo "🗄️  Baseline Production Database"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set${NC}"
    echo ""
    echo "Set it with:"
    echo "  export DATABASE_URL='postgresql://postgres:PASSWORD@127.0.0.1:5432/startege'"
    exit 1
fi

# Verify we're connecting to production (not local)
if [[ "$DATABASE_URL" == *"127.0.0.1:5433"* ]] || [[ "$DATABASE_URL" == *"localhost:5433"* ]]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL points to local database (port 5433)${NC}"
    echo "This script is for PRODUCTION database only!"
    exit 1
fi

echo -e "${GREEN}✓ DATABASE_URL is set${NC}"
echo ""

# List migrations
echo "📋 Existing Migrations:"
echo "----------------------"
MIGRATIONS=$(ls -d prisma/migrations/*/ | xargs -n1 basename | grep -v "^\.$")
for migration in $MIGRATIONS; do
    echo "  - $migration"
done
echo ""

read -p "Mark these migrations as already applied? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "🔧 Marking migrations as applied..."
echo ""

# Mark each migration as applied
for migration in $MIGRATIONS; do
    echo "Marking $migration as applied..."
    npx prisma migrate resolve --applied "$migration" || {
        echo -e "${YELLOW}⚠️  Migration $migration might already be marked${NC}"
    }
done

echo ""
echo -e "${GREEN}✅ Database baselined!${NC}"
echo ""

# Check status
echo "📊 Migration Status:"
echo "-------------------"
npx prisma migrate status

echo ""
echo "🎉 Done! Now you can:"
echo "1. Create new migrations if needed"
echo "2. Or use 'prisma db push' for schema changes"

