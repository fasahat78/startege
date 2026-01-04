-- Comprehensive fix for all permissions and ownership issues
-- Run this in Cloud SQL Studio as a superuser (cloudsqlsuperuser or postgres)

-- Step 1: Change ownership of ALL database objects to postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Change ownership of all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO postgres';
        RAISE NOTICE 'Changed ownership of table: %', r.tablename;
    END LOOP;
    
    -- Change ownership of all sequences
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' OWNER TO postgres';
        RAISE NOTICE 'Changed ownership of sequence: %', r.sequence_name;
    END LOOP;
    
    -- Change ownership of all types/enums
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
        EXECUTE 'ALTER TYPE public.' || quote_ident(r.typname) || ' OWNER TO postgres';
        RAISE NOTICE 'Changed ownership of type: %', r.typname;
    END LOOP;
END $$;

-- Step 2: Grant schema usage
GRANT USAGE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO postgres;

-- Step 3: Grant all privileges on all existing objects
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TYPES IN SCHEMA public TO postgres;

-- Step 4: Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TYPES TO postgres;

-- Step 5: Verify VerificationToken table specifically
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'VerificationToken';

-- Step 6: Check permissions on VerificationToken
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name = 'VerificationToken'
ORDER BY grantee, privilege_type;

-- Step 7: List all tables and their owners
SELECT 
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

