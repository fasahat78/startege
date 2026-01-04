# Simple Fix for Cloud SQL Permissions

## The Problem

You're connected as `startege-db` (database name) instead of a superuser, so you can't change table ownership.

## Solution: Connect as cloudsqlsuperuser

### Step 1: Use gcloud CLI

Run this command:

```bash
gcloud sql connect startege-db --user=cloudsqlsuperuser --database=startege --project=startege
```

When prompted, enter your Cloud SQL root password.

### Step 2: Run This SQL

Once connected, paste and run:

```sql
-- Change ownership of all tables to postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO postgres';
    END LOOP;
END $$;

-- Grant all privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO postgres;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
```

### Step 3: Verify

Check that tables are owned by postgres:

```sql
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

All tables should show `tableowner = postgres`.

## Alternative: Use the Script

Run the automated script:

```bash
./scripts/fix-permissions-via-gcloud.sh
```

## Why This Works

- `cloudsqlsuperuser` is a special Cloud SQL role with superuser privileges
- It can change ownership and grant permissions
- Your `DATABASE_URL` uses `postgres` user, so tables need to be owned by `postgres`

## After Fixing

Your application should work! The `postgres` user in your `DATABASE_URL` will have full access to all tables.

