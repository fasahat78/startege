-- Fix permissions for AIGPFlashcard table
-- Run these queries one at a time in SQL Studio

-- 1. Check table owner
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'AIGPFlashcard';

-- 2. Grant SELECT permission to current user (replace 'postgres' with your actual username if different)
GRANT SELECT ON "AIGPFlashcard" TO postgres;

-- 3. Grant SELECT permission to public (allows all users)
GRANT SELECT ON "AIGPFlashcard" TO PUBLIC;

-- 4. Verify permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
AND table_name = 'AIGPFlashcard';

