-- Fix Production Database Issues
-- Run this script via Cloud SQL Proxy or Cloud SQL Studio

-- 1. Create AgentConversation table (missing from migrations)
CREATE TABLE IF NOT EXISTS "AgentConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "messages" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "contextUsed" JSONB,
    "sourcesCited" JSONB,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentConversation_pkey" PRIMARY KEY ("id")
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS "AgentConversation_userId_idx" ON "AgentConversation"("userId");
CREATE INDEX IF NOT EXISTS "AgentConversation_createdAt_idx" ON "AgentConversation"("createdAt");

-- 3. Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'AgentConversation_userId_fkey'
    ) THEN
        ALTER TABLE "AgentConversation" 
        ADD CONSTRAINT "AgentConversation_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Verify concepts are assigned to challenges
-- (This is informational - concepts should be assigned via scripts)
-- Note: concepts column is text[], not jsonb, so we check array length differently
SELECT 
    'Total Concepts' as metric,
    COUNT(*)::text as value
FROM "ConceptCard"
UNION ALL
SELECT 
    'Total Challenges',
    COUNT(*)::text
FROM "Challenge"
UNION ALL
SELECT 
    'Challenges with Concepts',
    COUNT(*)::text
FROM "Challenge"
WHERE "concepts" IS NOT NULL 
AND array_length("concepts", 1) > 0;

