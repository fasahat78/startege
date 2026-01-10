-- Fix permissions for AIGPFlashcard table
-- Make sure you're connected to the 'startege' database (not 'postgres')
-- And connected as the correct user

-- 1. First, check current connection
SELECT current_database() as database, current_user as user;

-- 2. Check table owner
SELECT tablename, tableowner 
FROM pg_tables 
WHERE tablename = 'AIGPFlashcard';

-- 3. Grant permissions to startege-db user (if that's the app user)
GRANT SELECT, INSERT, UPDATE, DELETE ON "AIGPFlashcard" TO "startege-db";

-- 4. Grant permissions to postgres user (if needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON "AIGPFlashcard" TO postgres;

-- 5. Grant to PUBLIC (allows all users)
GRANT SELECT ON "AIGPFlashcard" TO PUBLIC;

-- 6. Verify permissions were granted
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
AND table_name = 'AIGPFlashcard'
ORDER BY grantee, privilege_type;

