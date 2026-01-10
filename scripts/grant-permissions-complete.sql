-- Complete GRANT statement for AIGPFlashcard table
-- Run this while connected to the 'startege' database

-- If you're connected as 'postgres' user (the owner), run this:
GRANT SELECT, INSERT, UPDATE, DELETE ON "AIGPFlashcard" TO "startege-db";

-- Also grant to PUBLIC (allows all users)
GRANT SELECT ON "AIGPFlashcard" TO PUBLIC;

-- Verify permissions were granted
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
AND table_name = 'AIGPFlashcard'
ORDER BY grantee, privilege_type;

