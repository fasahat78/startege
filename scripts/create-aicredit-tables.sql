-- Create AICredit and CreditTransaction tables
-- Run this in Cloud SQL Studio

-- Create CreditTransactionType enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreditTransactionType') THEN
        CREATE TYPE "CreditTransactionType" AS ENUM ('PURCHASE', 'USAGE', 'REFUND', 'ADJUSTMENT');
    END IF;
END $$;

-- Create AICredit table
CREATE TABLE IF NOT EXISTS "AICredit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "monthlyAllowance" INTEGER NOT NULL DEFAULT 1000,
    "currentBalance" INTEGER NOT NULL DEFAULT 1000,
    "purchasedCredits" INTEGER NOT NULL DEFAULT 0,
    "billingCycleStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingCycleEnd" TIMESTAMP(3) NOT NULL,
    "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "creditsUsedThisCycle" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AICredit_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId
CREATE UNIQUE INDEX IF NOT EXISTS "AICredit_userId_key" ON "AICredit"("userId");

-- Create unique index on subscriptionId (if not null)
CREATE UNIQUE INDEX IF NOT EXISTS "AICredit_subscriptionId_key" ON "AICredit"("subscriptionId") WHERE "subscriptionId" IS NOT NULL;

-- Create CreditTransaction table
CREATE TABLE IF NOT EXISTS "CreditTransaction" (
    "id" TEXT NOT NULL,
    "creditId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "service" TEXT,
    "tokensUsed" INTEGER,
    "costPerToken" DOUBLE PRECISION,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "stripePaymentId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "CreditTransaction_creditId_idx" ON "CreditTransaction"("creditId");
CREATE INDEX IF NOT EXISTS "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");
CREATE INDEX IF NOT EXISTS "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'AICredit_userId_fkey'
    ) THEN
        ALTER TABLE "AICredit" 
        ADD CONSTRAINT "AICredit_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'CreditTransaction_creditId_fkey'
    ) THEN
        ALTER TABLE "CreditTransaction" 
        ADD CONSTRAINT "CreditTransaction_creditId_fkey" 
        FOREIGN KEY ("creditId") REFERENCES "AICredit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'CreditTransaction_userId_fkey'
    ) THEN
        ALTER TABLE "CreditTransaction" 
        ADD CONSTRAINT "CreditTransaction_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

