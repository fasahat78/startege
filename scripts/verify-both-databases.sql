-- Check flashcards in both databases
-- Run this query while connected to 'postgres' database first, then 'startege' database

-- Check in postgres database
SELECT 
    'postgres' as database_name,
    COUNT(*) as flashcard_count
FROM "AIGPFlashcard"
WHERE status = 'ACTIVE';

-- Then switch to 'startege' database and run:
SELECT 
    'startege' as database_name,
    COUNT(*) as flashcard_count
FROM "AIGPFlashcard"
WHERE status = 'ACTIVE';

