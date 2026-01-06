# Seed Production Database via Cloud SQL Studio

Since Cloud SQL Proxy connection isn't working, seed directly via Cloud SQL Studio.

## Steps

1. **Open Cloud SQL Studio:**
   - Go to: https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
   - Click "Open Cloud SQL Studio"

2. **Create AgentConversation Table:**
   ```sql
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
   ```

3. **Seed Data via Local Scripts (Recommended):**
   - Start Cloud SQL Proxy manually:
     ```bash
     cloud-sql-proxy startege:us-central1:startege-db --port=5435
     ```
   - In another terminal:
     ```bash
     export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5435/startege"
     bash scripts/seed-production.sh
     ```

## Alternative: Use Cloud SQL Studio for Everything

If you can't use Cloud SQL Proxy, you'll need to:
1. Export data from local database
2. Import via Cloud SQL Studio SQL scripts

But the TypeScript seeding scripts are easier - they handle all the data transformations automatically.

