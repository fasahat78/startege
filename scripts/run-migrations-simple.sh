#!/bin/bash

# Simple Migration Runner
# This script guides you through running migrations step by step

set -e

echo "🗄️  Database Migration Runner"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Check prerequisites
echo "📋 Step 1: Checking Prerequisites"
echo "---------------------------------"

# Check Cloud SQL Proxy
if ! command -v cloud-sql-proxy &> /dev/null; then
    echo -e "${YELLOW}⚠️  Cloud SQL Proxy not found${NC}"
    echo ""
    echo "Installing Cloud SQL Proxy..."
    ./scripts/setup-cloud-sql-proxy.sh
    echo ""
    read -p "Press Enter after Cloud SQL Proxy is installed..."
fi

# Check gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found${NC}"
    echo ""
    echo "Install Google Cloud SDK:"
    echo "  https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 2: Check authentication
echo "📋 Step 2: Checking Authentication"
echo "----------------------------------"

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Not authenticated with Google Cloud${NC}"
    echo ""
    echo "Running: gcloud auth login"
    gcloud auth login
fi

# Set project
gcloud config set project startege 2>/dev/null || true

echo -e "${GREEN}✅ Authentication check passed${NC}"
echo ""

# Step 3: Check if Cloud SQL Proxy is running
echo "📋 Step 3: Checking Cloud SQL Proxy"
echo "-----------------------------------"

if ! pgrep -f "cloud-sql-proxy" > /dev/null; then
    echo -e "${YELLOW}⚠️  Cloud SQL Proxy is not running${NC}"
    echo ""
    echo -e "${BLUE}Please open a NEW terminal window and run:${NC}"
    echo ""
    echo "  cloud-sql-proxy startege:us-central1:startege-db --port=5432"
    echo ""
    echo "Keep that terminal open, then come back here and press Enter..."
    read -p "Press Enter when Cloud SQL Proxy is running..."
    
    # Check again
    if ! pgrep -f "cloud-sql-proxy" > /dev/null; then
        echo -e "${RED}❌ Cloud SQL Proxy still not running${NC}"
        echo "Please start it in another terminal first"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Cloud SQL Proxy is running${NC}"
echo ""

# Step 4: Get database password
echo "📋 Step 4: Database Connection"
echo "-----------------------------"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}DATABASE_URL not set${NC}"
    echo ""
    read -sp "Enter your production database password: " DB_PASSWORD
    echo ""
    
    if [ -z "$DB_PASSWORD" ]; then
        echo -e "${RED}❌ Password cannot be empty${NC}"
        exit 1
    fi
    
    export DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@127.0.0.1:5432/startege"
    echo ""
    echo -e "${GREEN}✅ DATABASE_URL set${NC}"
else
    echo -e "${GREEN}✅ DATABASE_URL already set${NC}"
fi

echo ""

# Step 5: Verify connection
echo "📋 Step 5: Verifying Connection"
echo "-------------------------------"

echo "Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo ""
    echo "Please check:"
    echo "1. Cloud SQL Proxy is running"
    echo "2. Database password is correct"
    echo "3. DATABASE_URL is set correctly"
    exit 1
fi

echo ""

# Step 6: Show migration status
echo "📋 Step 6: Migration Status"
echo "--------------------------"

npx prisma migrate status

echo ""

# Step 7: Confirm and run migrations
echo "📋 Step 7: Running Migrations"
echo "-----------------------------"

read -p "Ready to run migrations? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "🚀 Running migrations..."
echo ""

npx prisma migrate deploy

echo ""
echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
echo ""

# Step 8: Verify
echo "📋 Step 8: Verification"
echo "----------------------"

npx prisma migrate status

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
echo ""
echo "Next steps:"
echo "1. Wait for Cloud Build to complete"
echo "2. Create admin user (if needed):"
echo "   UPDATE \"User\" SET \"isAdmin\" = true, \"role\" = 'ADMIN' WHERE email = 'fasahat@gmail.com';"
echo "3. Test the new features!"

