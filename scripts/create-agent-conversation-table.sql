-- Create AgentConversation table for Startegizer
-- Run this in Cloud SQL Studio

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

CREATE INDEX IF NOT EXISTS "AgentConversation_userId_idx" ON "AgentConversation"("userId");

CREATE INDEX IF NOT EXISTS "AgentConversation_createdAt_idx" ON "AgentConversation"("createdAt");

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

