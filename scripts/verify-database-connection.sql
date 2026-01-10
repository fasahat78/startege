-- Check which database and user you're connected as
SELECT current_database() as current_database, current_user as current_user;

-- Check if table exists in current database
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'AIGPFlashcard';

-- Check if table exists in startege database specifically
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'AIGPFlashcard'
AND schemaname = 'public';

