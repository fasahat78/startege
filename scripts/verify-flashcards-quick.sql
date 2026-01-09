-- Quick Flashcard Verification
-- Copy and paste this entire block into Cloud SQL Studio and click Run

-- Count check
SELECT 
    'Total Flashcards' as metric,
    COUNT(*)::text as value
FROM "AIGPFlashcard"
UNION ALL
SELECT 
    'Active Flashcards' as metric,
    COUNT(*)::text as value
FROM "AIGPFlashcard"
WHERE status = 'ACTIVE';

-- Show first 5 flashcards
SELECT 
    "flashcardId",
    domain,
    "cardType",
    LEFT("frontPrompt", 50) || '...' as prompt_preview
FROM "AIGPFlashcard"
WHERE status = 'ACTIVE'
ORDER BY domain, "flashcardId"
LIMIT 5;
