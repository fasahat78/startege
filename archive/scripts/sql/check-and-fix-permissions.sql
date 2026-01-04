-- Step 1: Check what user you're connected as
SELECT current_user, session_user;

-- Step 2: Check who owns the tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Step 3: If you're connected as postgres, try this simpler approach
-- Grant permissions without changing ownership (if you own the tables)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT CREATE ON SCHEMA public TO postgres;

-- Step 4: Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

