# Connect to Cloud SQL to Fix Permissions

## Problem

You're authenticated as a service account that doesn't have Cloud SQL access.

## Solution: Authenticate with Your Personal Account

### Step 1: Authenticate with Your Personal Account

```bash
gcloud auth login
```

This will open a browser window. Sign in with your Google account that has access to the `startege` project.

### Step 2: Set the Correct Project

```bash
gcloud config set project startege
```

### Step 3: List Cloud SQL Instances

```bash
gcloud sql instances list --project=startege
```

You should see `startege-db` in the list.

### Step 4: Connect to Cloud SQL

```bash
gcloud sql connect startege-db --user=cloudsqlsuperuser --database=startege --project=startege
```

When prompted, enter your Cloud SQL root password (the one you set when creating the instance).

### Step 5: Run the Permission Fix SQL

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

-- Verify
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Step 6: Exit

Type `\q` and press Enter to exit.

## Alternative: Use Cloud SQL Studio (Web UI)

If gcloud CLI doesn't work, use the web UI:

1. Go to: https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
2. Click on `startege` database
3. Click **"Open Cloud SQL Studio"** or **"Query"** tab
4. Make sure you're connected as `cloudsqlsuperuser` (check the connection settings)
5. Run the SQL above

## Verify Fix

After running the SQL, your application should work. Test it:

```bash
curl https://startege-785373873454.us-central1.run.app/api/health
```

You should get a JSON response instead of a redirect.

