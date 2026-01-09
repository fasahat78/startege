#!/bin/bash

# Production Deployment Script
# This script helps deploy new features to production safely

set -e  # Exit on error

echo "🚀 Starting Production Deployment Process"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Pre-deployment checks
echo "📋 Step 1: Pre-deployment Checks"
echo "-------------------------------"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on main branch (current: $CURRENT_BRANCH)${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    git status --short
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Prisma schema is up to date
echo "✓ Checking Prisma schema..."
if ! npx prisma validate > /dev/null 2>&1; then
    echo -e "${RED}❌ Prisma schema validation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Prisma schema is valid${NC}"

# Check if TypeScript compiles
echo "✓ Checking TypeScript compilation..."
if ! npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    echo "Run 'npx tsc --noEmit' to see errors"
    exit 1
fi
echo -e "${GREEN}✓ TypeScript compilation successful${NC}"

echo ""
echo "📦 Step 2: Database Migration Preparation"
echo "----------------------------------------"
echo ""
echo "⚠️  IMPORTANT: Database migrations MUST be run BEFORE code deployment!"
echo ""
echo "To run migrations on production:"
echo "1. Connect to production database using Cloud SQL Proxy"
echo "2. Run: npx prisma migrate deploy"
echo ""
read -p "Have you run database migrations? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Please run database migrations first!${NC}"
    echo ""
    echo "Migration steps:"
    echo "1. Connect to Cloud SQL:"
    echo "   cloud-sql-proxy startege:us-central1:startege-db --port=5432"
    echo ""
    echo "2. Set DATABASE_URL:"
    echo "   export DATABASE_URL='postgresql://postgres:PASSWORD@127.0.0.1:5432/startege'"
    echo ""
    echo "3. Run migrations:"
    echo "   npx prisma migrate deploy"
    exit 1
fi

echo ""
echo "📝 Step 3: Create Migration (if needed)"
echo "--------------------------------------"
read -p "Do you need to create a new migration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter migration name: " MIGRATION_NAME
    npx prisma migrate dev --name "$MIGRATION_NAME" --create-only
    echo ""
    echo "Review the migration file, then run:"
    echo "  npx prisma migrate deploy"
fi

echo ""
echo "🔨 Step 4: Build Check"
echo "---------------------"
echo "Running local build check..."
if ! npm run build > /dev/null 2>&1; then
    echo -e "${RED}❌ Build failed${NC}"
    echo "Run 'npm run build' to see errors"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

echo ""
echo "📤 Step 5: Git Operations"
echo "-----------------------"
echo "Current changes:"
git status --short
echo ""
read -p "Commit and push changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="feat: Deploy flashcards, admin dashboard, and discount codes"
    fi
    
    git add .
    git commit -m "$COMMIT_MSG"
    echo ""
    echo "Pushing to remote..."
    git push origin main
    echo -e "${GREEN}✓ Changes pushed to remote${NC}"
fi

echo ""
echo "✅ Deployment Process Complete!"
echo "=============================="
echo ""
echo "Next steps:"
echo "1. Monitor Cloud Build: https://console.cloud.google.com/cloud-build/builds"
echo "2. After deployment, verify:"
echo "   - Admin dashboard: /admin"
echo "   - Flashcards: /aigp-exams (Flashcards tab)"
echo "   - Discount codes: Test checkout flow"
echo ""
echo "3. Create admin user in production (if needed):"
echo "   UPDATE \"User\" SET \"isAdmin\" = true, \"role\" = 'ADMIN' WHERE email = 'fasahat@gmail.com';"
echo ""

