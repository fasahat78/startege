#!/bin/bash
# Production Seeding Script
# Seeds all required data for production database

set -e

echo "🌱 Starting production seeding..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Usage:"
    echo "  export DATABASE_URL='postgresql://postgres:PASSWORD@127.0.0.1:5432/startege'"
    echo "  ./scripts/seed-production.sh"
    echo ""
    exit 1
fi

echo "📊 Database: $DATABASE_URL"
echo ""

# Step 1: Seed Domains and Categories
echo "📚 Step 1/8: Seeding domains and categories..."
npm run seed:domains-categories || {
    echo "❌ Failed to seed domains and categories"
    exit 1
}
echo ""

# Step 2: Import Concepts from CSV
echo "📖 Step 2/8: Importing concepts from CSV..."
npm run import:concepts || {
    echo "❌ Failed to import concepts"
    exit 1
}
echo ""

# Step 3: Create Levels/Challenges
echo "🎮 Step 3/8: Creating levels/challenges..."
npm run create:levels || {
    echo "❌ Failed to create levels"
    exit 1
}
echo ""

# Step 4: Create Badges
echo "🏆 Step 4/8: Creating badges..."
npm run create:badges || {
    echo "❌ Failed to create badges"
    exit 1
}
echo ""

# Step 5: Seed Challenges (assign concepts to levels)
echo "🔗 Step 5/8: Seeding challenges (assigning concepts to levels)..."
npm run seed:challenges || {
    echo "❌ Failed to seed challenges"
    exit 1
}
echo ""

# Step 6: Import AIGP Exams
echo "📝 Step 6/8: Importing AIGP exams..."
tsx scripts/ingest-aigp-exams.ts || {
    echo "❌ Failed to import AIGP exams"
    exit 1
}
echo ""

# Step 7: Seed Onboarding data
echo "🎯 Step 7/8: Seeding onboarding data..."
tsx scripts/seed-interests-and-goals.ts || {
    echo "❌ Failed to seed interests and goals"
    exit 1
}

tsx scripts/seed-onboarding-scenarios.ts || {
    echo "❌ Failed to seed onboarding scenarios"
    exit 1
}
echo ""

# Step 8: Seed Level-Category Coverage
echo "📊 Step 8/8: Seeding level-category coverage..."
npm run seed:coverage || {
    echo "❌ Failed to seed level-category coverage"
    exit 1
}
echo ""

echo "✨ Production seeding complete!"
echo ""
echo "📊 Summary:"
echo "  ✅ Domains and categories seeded"
echo "  ✅ Concepts imported"
echo "  ✅ Levels created"
echo "  ✅ Badges created"
echo "  ✅ Challenges seeded"
echo "  ✅ AIGP exams imported"
echo "  ✅ Onboarding data seeded"
echo "  ✅ Level-category coverage seeded"
echo ""
echo "🎉 All done!"

