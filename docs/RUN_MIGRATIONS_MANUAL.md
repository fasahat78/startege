# Run Migrations Manually (Recommended)

## One-Time Setup

### Step 1: Open Cloud SQL Studio

1. Go to: https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
2. Click on `startege` database
3. Click **"Query"** tab (or "Open Cloud SQL Studio")

### Step 2: Run Baseline Migration

Copy the entire contents of `prisma/migrations/0_baseline/migration.sql` and paste into the query editor, then click **"Run"**.

This will create all tables, enums, and indexes.

### Step 3: Run Additional Migrations (if any)

If there are other migration files in `prisma/migrations/`, run them in order:
1. `20251228130834_add_onboarding_startegizer_market_scan/migration.sql`
2. `20251229132037_add_ai_credits/migration.sql`

### Step 4: Verify Tables

Run this query to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE' 
ORDER BY table_name;
```

You should see tables like:
- `Account`
- `Badge`
- `Category`
- `Challenge`
- `ConceptCard`
- `Domain`
- `User`
- And many more...

## Future Schema Changes

When you update `schema.prisma`:

1. **Generate migration locally:**
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. **Copy the SQL** from the new migration file in `prisma/migrations/`

3. **Run it manually** in Cloud SQL Studio

## Why Manual?

- ✅ Simpler Cloud Build (no migration complexity)
- ✅ Better control over when migrations run
- ✅ Easier to debug migration issues
- ✅ Matches your working pattern (VQVB, Toastmanager)
- ✅ One-time setup, then only when schema changes

