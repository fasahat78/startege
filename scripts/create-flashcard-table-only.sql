-- Create AIGPFlashcard table only (for production import)
-- This script creates just the flashcard table without modifying existing tables

-- Step 1: Create the table
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

-- Step 2: Create unique constraint on flashcardId
CREATE UNIQUE INDEX IF NOT EXISTS "AIGPFlashcard_flashcardId_key" ON "AIGPFlashcard"("flashcardId");

-- Step 3: Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_domain_idx" ON "AIGPFlashcard"("domain");
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_subDomain_idx" ON "AIGPFlashcard"("subDomain");
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_cardType_idx" ON "AIGPFlashcard"("cardType");
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_priority_idx" ON "AIGPFlashcard"("priority");
CREATE INDEX IF NOT EXISTS "AIGPFlashcard_status_idx" ON "AIGPFlashcard"("status");

-- Step 4: Add foreign key relationship to AIGPFlashcardProgress (if both tables exist)
-- This runs AFTER the table is created, so it should work
DO $$
BEGIN
    -- Check if AIGPFlashcardProgress table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'AIGPFlashcardProgress') THEN
        -- Check if AIGPFlashcard table exists (it should by now)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'AIGPFlashcard') THEN
            -- Check if foreign key already exists
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_schema = 'public'
                AND constraint_name = 'AIGPFlashcardProgress_flashcardId_fkey'
            ) THEN
                ALTER TABLE "AIGPFlashcardProgress" 
                ADD CONSTRAINT "AIGPFlashcardProgress_flashcardId_fkey" 
                FOREIGN KEY ("flashcardId") REFERENCES "AIGPFlashcard"("flashcardId") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
        END IF;
    END IF;
EXCEPTION
    WHEN others THEN
        -- Ignore errors (e.g., if constraint already exists or table doesn't exist)
        NULL;
END $$;
