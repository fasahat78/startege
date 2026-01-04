# Fix Cloud SQL Permissions

## Problem

Getting "permission denied" errors when trying to access tables, even though tables exist.

## Root Cause

In Cloud SQL, tables might be owned by a different user than the one in your `DATABASE_URL`. The `postgres` user needs explicit permissions.

## Solution Options

### Option 1: Connect as cloudsqlsuperuser (Recommended)

Cloud SQL has a special `cloudsqlsuperuser` role. Connect using this user:

1. **In Cloud SQL Studio:**
   - When connecting, use username: `cloudsqlsuperuser`
   - Or use the default admin user for your instance

2. **Then run:**
   ```sql
   -- Change ownership to postgres
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
   ```

### Option 2: Use gcloud CLI

Connect via gcloud and run as superuser:

```bash
gcloud sql connect startege-db --user=cloudsqlsuperuser --database=startege
```

Then run the SQL commands above.

### Option 3: Grant Permissions Without Changing Ownership

If you can't change ownership, try granting permissions:

```sql
-- Check current user
SELECT current_user;

-- If you're the table owner, grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO postgres;

-- Set defaults
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
```

### Option 4: Update DATABASE_URL to Use cloudsqlsuperuser

If permissions can't be fixed, you could temporarily use `cloudsqlsuperuser` in your DATABASE_URL:

```
postgresql://cloudsqlsuperuser:PASSWORD@localhost/startege?host=/cloudsql/startege:us-central1:startege-db
```

**Note:** This is not recommended for production - fix permissions instead.

## Verify Fix

After running the fix, verify:

```sql
-- Check table ownership
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check permissions
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND grantee = 'postgres'
AND table_name = 'User'
ORDER BY privilege_type;
```

## Prevention

For future migrations, ensure tables are created with the correct owner:

1. Connect as `postgres` user when running migrations
2. Or ensure migrations set ownership: `ALTER TABLE ... OWNER TO postgres;`

