# Extract Current Schema and Apply Missing Objects

## Problem
When running the complete schema script, you get errors like:
- `relation "User_email_key" already exists` (indexes)
- `constraint "..." already exists` (constraints)

This happens because some objects already exist in your database.

## Solution: Extract Current Schema First

### Step 1: Extract What Already Exists

1. **Open Cloud SQL Studio:**
   - Go to: https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
   - Click on database: `startege`
   - Click "Open Cloud SQL Studio"

2. **Run the extraction script:**
   - Copy contents of `scripts/extract-current-schema.sql`
   - Paste into SQL editor
   - Click "Run"
   - This will show you what tables, enums, indexes, and constraints already exist

### Step 2: Apply Fully Idempotent Schema

Use the **fully idempotent version** that checks for indexes and constraints:

1. **Copy contents of `scripts/complete-schema-fully-idempotent.sql`**
2. **Paste into SQL editor**
3. **Click "Run"**

This version:
- ✅ Checks for enums before creating
- ✅ Checks for tables before creating  
- ✅ Checks for indexes before creating
- ✅ Checks for constraints before creating

## Alternative: Use Prisma db push

If you prefer using Prisma directly:

```bash
# Set DATABASE_URL to Cloud SQL
export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db"

# Use Cloud SQL Proxy (if running locally)
cloud-sql-proxy startege:us-central1:startege-db

# Then run:
npx prisma db push
```

This will:
- Create missing tables
- Add missing columns
- Create missing indexes
- Skip objects that already exist

## Files Available

1. **`scripts/extract-current-schema.sql`** - Shows what exists
2. **`scripts/complete-schema-idempotent.sql`** - Creates tables/enums (checks existence)
3. **`scripts/complete-schema-fully-idempotent.sql`** - Creates everything (checks indexes/constraints too)

## Recommendation

Use **`scripts/complete-schema-fully-idempotent.sql`** - it's the safest option that checks for all object types before creating them.

