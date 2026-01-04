# Seeding Production Database

This guide explains how to seed the production database with all required data (concepts, exams, levels, badges, etc.).

## Prerequisites

1. **Cloud SQL Proxy running** (for local connection)
   ```bash
   cloud-sql-proxy startege:us-central1:startege-db --port=5432
   ```

2. **DATABASE_URL set** to production database
   ```bash
   export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege"
   ```

## Quick Start

Run the automated seeding script:

```bash
# Set database URL
export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege"

# Run seeding script
./scripts/seed-production.sh
```

## What Gets Seeded

The script seeds the following data in order:

1. **Domains and Categories** - Creates 4 domains and 36 categories
2. **Concept Cards** - Imports concepts from `AIGP_concepts_wix_clean.csv`
3. **Levels/Challenges** - Creates 40 challenge levels
4. **Badges** - Creates gamification badges
5. **Challenges** - Assigns concepts to levels
6. **AIGP Exams** - Imports AIGP exam data from `aigp_exams/` directory
7. **Onboarding Data** - Seeds interests, goals, and onboarding scenarios
8. **Level-Category Coverage** - Maps categories to levels

## Manual Seeding (Step by Step)

If you prefer to run steps individually:

```bash
# Set database URL
export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege"

# Step 1: Domains and Categories
npm run seed:domains-categories

# Step 2: Import Concepts
npm run import:concepts

# Step 3: Create Levels
npm run create:levels

# Step 4: Create Badges
npm run create:badges

# Step 5: Seed Challenges
npm run seed:challenges

# Step 6: Import AIGP Exams
tsx scripts/ingest-aigp-exams.ts

# Step 7: Seed Onboarding
tsx scripts/seed-interests-and-goals.ts
tsx scripts/seed-onboarding-scenarios.ts

# Step 8: Seed Coverage
npm run seed:coverage
```

## Required Files

Make sure these files exist in the project root:

- `AIGP_concepts_wix_clean.csv` - Concept cards CSV
- `aigp_exams/` - Directory with exam JSON files

## Verification

After seeding, verify the data:

```bash
# Connect to database
gcloud sql connect startege-db --user=postgres

# Check counts
SELECT COUNT(*) FROM "ConceptCard";
SELECT COUNT(*) FROM "Challenge";
SELECT COUNT(*) FROM "Badge";
SELECT COUNT(*) FROM "AigpExam";
```

Expected counts:
- Concepts: ~200+ (depends on CSV)
- Levels: 40
- Badges: ~20+
- AIGP Exams: Depends on exam files

## Troubleshooting

### Error: "CSV file not found"

Make sure `AIGP_concepts_wix_clean.csv` exists in the project root:
```bash
ls -la AIGP_concepts_wix_clean.csv
```

### Error: "Cannot connect to database"

1. Check Cloud SQL Proxy is running:
   ```bash
   ps aux | grep cloud-sql-proxy
   ```

2. Verify DATABASE_URL is correct:
   ```bash
   echo $DATABASE_URL
   ```

3. Test connection:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```

### Error: "Table does not exist"

Run migrations first:
```bash
export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege"
npx prisma migrate deploy
```

### Partial Seeding

If seeding fails partway through, you can:

1. **Skip already-seeded steps** - The script uses `upsert` operations, so re-running is safe
2. **Start from a specific step** - Run individual commands from the manual section
3. **Clear and re-seed** - Some scripts have `deleteMany` operations (check before running)

## Production Considerations

⚠️ **Warning**: The seeding script may clear existing data for some tables (like concepts). Review the scripts before running in production.

### Safe Re-seeding

Most scripts use `upsert` operations, making them safe to run multiple times:
- Domains/Categories: ✅ Safe (upsert)
- Concepts: ⚠️ Clears existing (check `import-concepts.ts`)
- Levels: ✅ Safe (upsert)
- Badges: ✅ Safe (upsert)
- Exams: ✅ Safe (upsert)

### Backup Before Seeding

Always backup production data before seeding:
```bash
# Create backup
gcloud sql export sql startege-db gs://your-bucket/backup-$(date +%Y%m%d).sql \
  --database=startege
```

## Next Steps

After seeding:
1. ✅ Verify data counts
2. ✅ Test the application
3. ✅ Check concepts appear in UI
4. ✅ Verify exams are accessible
5. ✅ Test level progression

## Automation

For future deployments, consider:
- Adding seeding to Cloud Build (after migrations)
- Creating idempotent seeding scripts
- Adding seeding to deployment pipeline

