-- Copy flashcards from 'postgres' database to 'startege' database
-- IMPORTANT: This script needs to be run in two steps:
-- Step 1: Connect to 'postgres' database and export data
-- Step 2: Connect to 'startege' database and import data

-- ============================================
-- STEP 1: Run this while connected to 'postgres' database
-- ============================================
-- Export all flashcards (copy the results)
SELECT 
    "id",
    "flashcardId",
    "status",
    "cardType",
    "domain",
    "subDomain",
    "topics",
    "priority",
    "frontPrompt",
    "backAnswer",
    "examCue",
    "commonTrap",
    "sourceFramework",
    "sourcePointer",
    "batchId",
    "version",
    "createdAt",
    "updatedAt"
FROM "AIGPFlashcard"
WHERE status = 'ACTIVE'
ORDER BY domain, "flashcardId";

-- ============================================
-- STEP 2: Connect to 'startege' database and run this
-- ============================================
-- First, make sure table exists in startege database
CREATE TABLE IF NOT EXISTS "AIGPFlashcard" (
    "id" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "cardType" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "subDomain" TEXT NOT NULL,
    "topics" TEXT[] NOT NULL,
    "priority" TEXT NOT NULL,
    "frontPrompt" TEXT NOT NULL,
    "backAnswer" TEXT NOT NULL,
    "examCue" TEXT NOT NULL,
    "commonTrap" TEXT NOT NULL,
    "sourceFramework" TEXT,
    "sourcePointer" TEXT,
    "batchId" TEXT,
    "version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIGPFlashcard_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AIGPFlashcard_flashcardId_key" ON "AIGPFlashcard"("flashcardId");
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_domain_idx" ON "AIGPFlashcard"("domain");
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_subDomain_idx" ON "AIGPFlashcard"("subDomain");
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_cardType_idx" ON "AIGPFlashcard"("cardType");
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_priority_idx" ON "AIGPFlashcard"("priority");
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_status_idx" ON "AIGPFlashcard"("status");

-- Then insert the data (you'll need to format the SELECT results as INSERT statements)
-- Or use pg_dump/pg_restore, or re-run the import script with correct database

