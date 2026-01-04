# Diagnose Cloud SQL Permissions Issue

## The Problem

Getting `permission denied for table User` error when the application tries to query the database.

## Root Cause Analysis

Before fixing, we need to understand:

1. **Who owns the tables?** - Tables might be owned by a different user than `postgres`
2. **What user is Cloud SQL Studio using?** - The connection might be using a different user
3. **What permissions does postgres have?** - The `postgres` user in DATABASE_URL might not have access
4. **Can we grant permissions without changing ownership?** - Maybe we don't need superuser access

## Diagnostic Steps

### Step 1: Run Diagnostic SQL

In Cloud SQL Studio, run the diagnostic script:

```sql
-- Check what user you're connected as
SELECT 
    current_user as "Current User",
    session_user as "Session User",
    current_database() as "Current Database";

-- Check who owns the tables
SELECT 
    tablename,
    tableowner,
    CASE 
        WHEN tableowner = 'postgres' THEN '✅ Owned by postgres'
        ELSE '❌ Not owned by postgres'
    END as "Status"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check permissions on User table
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name = 'User'
ORDER BY grantee;
```

### Step 2: Understand the Results

**If tables are owned by `startege-db` or another user:**
- The migration was run by a different user
- We need to either change ownership OR grant permissions

**If `postgres` user has no permissions:**
- We need to grant permissions (doesn't require superuser if table owner grants them)

**If `postgres` user doesn't exist:**
- We need to create it or use a different user in DATABASE_URL

## Possible Solutions (Based on Diagnosis)

### Solution A: Grant Permissions (If Table Owner Can Grant)

If you're connected as the table owner, you can grant permissions without superuser:

```sql
-- Grant permissions (run as table owner)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;
```

### Solution B: Change DATABASE_URL User

If `postgres` user doesn't exist or can't be fixed, use the table owner in DATABASE_URL:

```
postgresql://TABLE_OWNER:PASSWORD@localhost/startege?host=/cloudsql/startege:us-central1:startege-db
```

### Solution C: Use cloudsqlsuperuser in Cloud SQL Studio

If you can connect as `cloudsqlsuperuser` in Cloud SQL Studio, you can change ownership.

## Next Steps

1. Run the diagnostic SQL above
2. Share the results
3. Based on results, we'll apply the correct fix

