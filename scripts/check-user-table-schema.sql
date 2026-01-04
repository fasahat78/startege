-- Check User table schema to see if it matches Prisma schema
-- Run this in Cloud SQL Studio

-- Check all columns in User table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'User'
ORDER BY ordinal_position;

-- Specifically check for firebaseUid column
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'User' 
            AND column_name = 'firebaseUid'
        ) THEN '✅ firebaseUid column exists'
        ELSE '❌ firebaseUid column MISSING'
    END as firebase_uid_status;

-- Check for emailVerified column and its type
SELECT 
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'boolean' THEN '✅ Correct type'
        WHEN data_type = 'timestamp without time zone' THEN '⚠️ Wrong type (should be boolean)'
        ELSE '⚠️ Unexpected type'
    END as type_status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'User'
AND column_name IN ('emailVerified', 'emailVerifiedAt', 'firebaseUid');

