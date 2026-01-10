-- Check who owns the AIGPFlashcard table
SELECT 
    t.tablename,
    t.tableowner,
    c.relowner,
    u.usename as owner_name
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
JOIN pg_user u ON u.usesysid = c.relowner
WHERE t.tablename = 'AIGPFlashcard';

