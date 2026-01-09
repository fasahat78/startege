SELECT "flashcardId", domain, "cardType", LEFT("frontPrompt", 50) as prompt FROM "AIGPFlashcard" WHERE status = 'ACTIVE' LIMIT 10;

