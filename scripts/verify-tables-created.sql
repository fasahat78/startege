-- Verification Queries
-- Run these in Cloud SQL Studio to verify everything was created

-- 1. Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('AIGPFlashcardProgress', 'DiscountCode', 'DiscountCodeUsage')
ORDER BY table_name;

-- 2. Check enums exist
SELECT typname 
FROM pg_type 
WHERE typname IN ('FlashcardStatus', 'DiscountCodeType', 'DiscountCodeStatus', 'EarlyAdopterTier')
ORDER BY typname;

-- 3. Check User table has new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'User' 
AND column_name IN ('isAdmin', 'role')
ORDER BY column_name;

-- 4. Check indexes were created
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('AIGPFlashcardProgress', 'DiscountCode', 'DiscountCodeUsage')
ORDER BY tablename, indexname;

