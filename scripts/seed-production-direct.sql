-- Production Database Seeding Script
-- Run this directly in Cloud SQL Studio: https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
-- Click "Open Cloud SQL Studio" and paste this entire script

-- Step 1: Create AgentConversation table if missing
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

-- Note: This SQL script only creates the AgentConversation table.
-- For seeding concepts, challenges, badges, etc., you need to run the TypeScript scripts
-- via Cloud SQL Proxy or use the seed-production.sh script.

-- To seed all data, run this locally with Cloud SQL Proxy:
-- export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5434/startege"
-- bash scripts/seed-production.sh

