-- Fix permissions: Grant all privileges and change ownership to postgres
-- Run this in Cloud SQL Studio

-- First, change ownership of all tables to postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO postgres';
    END LOOP;
END $$;

-- Change ownership of all sequences to postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' OWNER TO postgres';
    END LOOP;
END $$;

-- Grant all privileges on all tables in public schema to postgres user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres;

-- Grant create privilege (needed for future migrations)
GRANT CREATE ON SCHEMA public TO postgres;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

-- Verify ownership
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'User';

-- Verify permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'postgres' 
AND table_schema = 'public'
AND table_name = 'User'
ORDER BY privilege_type;

