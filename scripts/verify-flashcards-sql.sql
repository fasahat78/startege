-- Comprehensive Flashcard Verification
-- Copy and paste this entire block into Cloud SQL Studio and click Run

-- 1. Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'AIGPFlashcard'
        ) THEN '✅ Table EXISTS'
        ELSE '❌ Table DOES NOT EXIST'
    END as table_status;

-- 2. Count total flashcards
SELECT 
    COUNT(*) as total_flashcards,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_flashcards,
    COUNT(CASE WHEN status != 'ACTIVE' THEN 1 END) as inactive_flashcards
FROM "AIGPFlashcard";

-- 3. Count by Domain
SELECT 
    domain,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_count
FROM "AIGPFlashcard"
GROUP BY domain
ORDER BY domain;

-- 4. Count by Card Type
SELECT 
    "cardType",
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_count
FROM "AIGPFlashcard"
GROUP BY "cardType"
ORDER BY "cardType";

-- 5. Sample flashcards (first 10)
SELECT 
    "flashcardId",
    domain,
    "cardType",
    status,
    priority,
    LEFT("frontPrompt", 60) as prompt_preview
FROM "AIGPFlashcard"
WHERE status = 'ACTIVE'
ORDER BY domain, "flashcardId"
LIMIT 10;

-- 6. Check for any NULL or empty critical fields
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN "flashcardId" IS NULL OR "flashcardId" = '' THEN 1 END) as missing_flashcard_id,
    COUNT(CASE WHEN domain IS NULL OR domain = '' THEN 1 END) as missing_domain,
    COUNT(CASE WHEN "frontPrompt" IS NULL OR "frontPrompt" = '' THEN 1 END) as missing_prompt,
    COUNT(CASE WHEN "backAnswer" IS NULL OR "backAnswer" = '' THEN 1 END) as missing_answer
FROM "AIGPFlashcard"
WHERE status = 'ACTIVE';

-- 7. Verify indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'AIGPFlashcard'
ORDER BY indexname;

-- 8. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'AIGPFlashcard'
ORDER BY ordinal_position;
