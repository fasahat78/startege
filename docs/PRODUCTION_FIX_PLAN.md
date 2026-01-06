# Production Fix Plan

## Critical Issues Identified

1. **✅ FIXED: Concepts Page Logic**
   - Reverted to exact dev version
   - No logic changes - code is correct

2. **❌ MISSING: AgentConversation Table**
   - Table exists in `schema.prisma` but NOT in migrations
   - This causes Startegizer to fail with "table does not exist" error
   - **Fix**: Run `scripts/fix-production-database.sql`

3. **❓ UNKNOWN: Concept Assignments**
   - Need to verify if concepts are assigned to challenges in production
   - Dev works because local DB has assignments
   - Production may have empty `concepts` arrays

## Action Plan

### Step 1: Fix Production Database ✅

Run the fix script via Cloud SQL Proxy:

```bash
export DATABASE_URL="postgresql://postgres:PASSWORD@127.0.0.1:5434/startege"
psql $DATABASE_URL -f scripts/fix-production-database.sql
```

Or via Cloud SQL Studio:
1. Go to Cloud SQL Console
2. Open SQL Studio
3. Copy/paste contents of `scripts/fix-production-database.sql`
4. Execute

### Step 2: Verify Concept Assignments

Check if concepts are assigned to challenges:

```sql
SELECT 
    "levelNumber",
    title,
    jsonb_array_length("concepts"::jsonb) as concept_count
FROM "Challenge"
WHERE "levelNumber" <= 40
ORDER BY "levelNumber";
```

If concepts are NOT assigned (all show 0), you need to run the concept assignment script.

### Step 3: Test Locally First ⚠️

**BEFORE deploying to production:**

1. Start local dev server:
   ```bash
   npm run dev
   ```

2. Verify:
   - ✅ Concepts page shows all concepts
   - ✅ Startegizer page loads (may need AgentConversation table locally too)
   - ✅ No console errors

3. Only deploy if localhost works perfectly

### Step 4: Deploy

Once localhost works:
- Push to GitHub
- Cloud Build will deploy automatically
- Verify production works

## What NOT to Do

❌ **DO NOT:**
- Change working dev logic
- Delete GitHub repo (unnecessary)
- Deploy without testing locally first
- Modify concepts page logic (it's correct)

## Root Cause Analysis

**Why dev works but prod doesn't:**

1. **Dev environment:**
   - Local database has all tables (created via `prisma db push`)
   - Concepts are assigned to challenges
   - Everything works

2. **Production environment:**
   - Migrations may not have run completely
   - AgentConversation table missing (not in migrations)
   - Concepts may not be assigned to challenges
   - Same code, different database state

**Solution:** Fix production database state, don't change code.

