# Create UserProfile Table in Cloud SQL

## Problem
The `UserProfile` table (and related onboarding tables) don't exist in the Cloud SQL database, causing 500 errors when accessing `/onboarding/persona`.

**Error:**
```
The table `public.UserProfile` does not exist in the current database.
```

## Solution

Run the SQL script to create the missing tables.

### Option 1: Using Cloud SQL Studio (Recommended)

1. **Open Cloud SQL Studio:**
   - Go to: https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
   - Click on your database: `startege`
   - Click "Open Cloud SQL Studio" (or use the SQL tab)

2. **Run the SQL script:**
   - Copy the contents of `scripts/create-user-profile-table.sql`
   - Paste into the SQL editor
   - Click "Run"

### Option 2: Using gcloud CLI

```bash
# Connect to Cloud SQL
gcloud sql connect startege-db --user=postgres --database=startege

# Then run the SQL script
\i scripts/create-user-profile-table.sql
```

Or pipe the script directly:

```bash
cat scripts/create-user-profile-table.sql | gcloud sql connect startege-db --user=postgres --database=startege
```

### Option 3: Using Prisma db push (Alternative)

If you prefer using Prisma:

```bash
# Set DATABASE_URL to Cloud SQL
export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db"

# Use Cloud SQL Proxy (if running locally)
# Then run:
npx prisma db push
```

## Tables Created

The script creates:
1. **UserProfile** - Main onboarding profile table
2. **UserInterest** - User interests
3. **UserGoal** - User goals
4. **OnboardingScenarioAnswer** - Answers to onboarding scenario questions

## Verification

After running the script, verify the tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('UserProfile', 'UserInterest', 'UserGoal', 'OnboardingScenarioAnswer');
```

You should see all 4 tables listed.

## After Creating Tables

1. **Test the application:**
   - Try accessing `/onboarding/persona` again
   - The page should load without errors

2. **Check logs:**
   - Cloud Run logs should no longer show "table does not exist" errors
   - The onboarding flow should work correctly

## Related Tables

These tables are related to onboarding:
- `UserProfile` - Links to `User` via `userId`
- `UserInterest` - Links to `UserProfile` (via userId)
- `UserGoal` - Links to `UserProfile` (via userId)
- `OnboardingScenarioAnswer` - Links to `UserProfile` (via userId)

All foreign keys are set up with `ON DELETE CASCADE` to maintain referential integrity.

