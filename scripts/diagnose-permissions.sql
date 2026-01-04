-- Step 1: Check what user you're connected as
SELECT 
    current_user as "Current User",
    session_user as "Session User",
    current_database() as "Current Database";

-- Step 2: Check what users/roles exist in the database
SELECT 
    usename as "Username",
    usesuper as "Is Superuser",
    usecreatedb as "Can Create DB"
FROM pg_user
ORDER BY usename;

-- Step 3: Check who owns the tables
SELECT 
    schemaname,
    tablename,
    tableowner,
    CASE 
        WHEN tableowner = 'postgres' THEN '✅ Owned by postgres'
        ELSE '❌ Not owned by postgres'
    END as "Status"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Step 4: Check current permissions on User table
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name = 'User'
ORDER BY grantee, privilege_type;

-- Step 5: Check if postgres user exists and its properties
SELECT 
    usename,
    usesuper,
    usecreatedb,
    usecreaterole
FROM pg_user
WHERE usename = 'postgres';

-- Step 6: Check schema ownership
SELECT 
    nspname as "Schema Name",
    nspowner::regrole as "Owner"
FROM pg_namespace
WHERE nspname = 'public';

