-- Test script to verify Prisma migrations were applied successfully
-- Run this in Cloud SQL console or via psql

-- 1. Check if key tables exist
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;

-- 2. Count tables (should be > 0)
SELECT 
    COUNT(*) as total_tables
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE';

-- 3. Check for specific key tables
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'User') THEN '✅ User table exists'
        ELSE '❌ User table missing'
    END as user_table_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Challenge') THEN '✅ Challenge table exists'
        ELSE '❌ Challenge table missing'
    END as challenge_table_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ConceptCard') THEN '✅ ConceptCard table exists'
        ELSE '❌ ConceptCard table missing'
    END as concept_card_table_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Badge') THEN '✅ Badge table exists'
        ELSE '❌ Badge table missing'
    END as badge_table_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Domain') THEN '✅ Domain table exists'
        ELSE '❌ Domain table missing'
    END as domain_table_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Category') THEN '✅ Category table exists'
        ELSE '❌ Category table missing'
    END as category_table_check;

-- 4. Check Prisma migration history
SELECT 
    migration_name,
    finished_at,
    applied_steps_count
FROM 
    _prisma_migrations
ORDER BY 
    finished_at DESC
LIMIT 10;

-- 5. Show table row counts (if any data exists)
SELECT 
    'User' as table_name,
    COUNT(*) as row_count
FROM 
    "User"
UNION ALL
SELECT 
    'Challenge',
    COUNT(*)
FROM 
    "Challenge"
UNION ALL
SELECT 
    'ConceptCard',
    COUNT(*)
FROM 
    "ConceptCard"
UNION ALL
SELECT 
    'Badge',
    COUNT(*)
FROM 
    "Badge"
UNION ALL
SELECT 
    'Domain',
    COUNT(*)
FROM 
    "Domain"
UNION ALL
SELECT 
    'Category',
    COUNT(*)
FROM 
    "Category"
ORDER BY 
    table_name;

-- 6. Check for indexes (performance verification)
SELECT 
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename, indexname
LIMIT 20;

-- 7. Verify foreign key constraints exist
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY 
    tc.table_name, kcu.column_name
LIMIT 20;

