-- Add all admin features: discount codes, early adopters, referrals, feedback
-- Run this in Cloud SQL Studio

-- ============================================
-- ENUMS
-- ============================================

-- DiscountCodeType enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountCodeType') THEN
    CREATE TYPE "DiscountCodeType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL');
  END IF;
END $$;

-- DiscountCodeStatus enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountCodeStatus') THEN
    CREATE TYPE "DiscountCodeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'USED_UP');
  END IF;
END $$;

-- EarlyAdopterTier enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EarlyAdopterTier') THEN
    CREATE TYPE "EarlyAdopterTier" AS ENUM ('FOUNDING_MEMBER', 'EARLY_ADOPTER', 'LAUNCH_USER');
  END IF;
END $$;

-- UserRole enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END $$;

-- FeedbackType enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeedbackType') THEN
    CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'FEATURE_REQUEST', 'UX_ISSUE', 'CONTENT_FEEDBACK', 'GENERAL');
  END IF;
END $$;

-- FeedbackStatus enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeedbackStatus') THEN
    CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
  END IF;
END $$;

-- ============================================
-- USER TABLE COLUMNS
-- ============================================

-- Add early adopter columns to User table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'isEarlyAdopter'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "isEarlyAdopter" BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'earlyAdopterTier'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "earlyAdopterTier" "EarlyAdopterTier";
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'earlyAdopterStartDate'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "earlyAdopterStartDate" TIMESTAMP(3);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'earlyAdopterEndDate'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "earlyAdopterEndDate" TIMESTAMP(3);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'discountCodeUsed'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "discountCodeUsed" TEXT;
  END IF;
END $$;

-- Add referral columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'referralCode'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'referredByUserId'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "referredByUserId" TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'referralCount'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "referralCount" INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'totalReferralCredits'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "totalReferralCredits" INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add unique constraint on referralCode
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_referralCode_key'
  ) THEN
    CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode") WHERE "referralCode" IS NOT NULL;
  END IF;
END $$;

-- ============================================
-- DISCOUNT CODE TABLES
-- ============================================

-- DiscountCode table
CREATE TABLE IF NOT EXISTS "DiscountCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountCodeType" NOT NULL DEFAULT 'PERCENTAGE',
    "value" DOUBLE PRECISION NOT NULL,
    "status" "DiscountCodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
    "applicableToPlanTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "minAmount" INTEGER,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "earlyAdopterTier" "EarlyAdopterTier",
    "createdBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DiscountCode_code_key" ON "DiscountCode"("code");
CREATE INDEX IF NOT EXISTS "DiscountCode_code_idx" ON "DiscountCode"("code");
CREATE INDEX IF NOT EXISTS "DiscountCode_status_idx" ON "DiscountCode"("status");
CREATE INDEX IF NOT EXISTS "DiscountCode_earlyAdopterTier_idx" ON "DiscountCode"("earlyAdopterTier");
CREATE INDEX IF NOT EXISTS "DiscountCode_validFrom_idx" ON "DiscountCode"("validFrom");
CREATE INDEX IF NOT EXISTS "DiscountCode_validUntil_idx" ON "DiscountCode"("validUntil");

-- DiscountCodeUsage table
CREATE TABLE IF NOT EXISTS "DiscountCodeUsage" (
    "id" TEXT NOT NULL,
    "discountCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "paymentId" TEXT,
    "amountSaved" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountCodeUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DiscountCodeUsage_discountCodeId_idx" ON "DiscountCodeUsage"("discountCodeId");
CREATE INDEX IF NOT EXISTS "DiscountCodeUsage_userId_idx" ON "DiscountCodeUsage"("userId");
CREATE INDEX IF NOT EXISTS "DiscountCodeUsage_createdAt_idx" ON "DiscountCodeUsage"("createdAt");

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DiscountCodeUsage_discountCodeId_fkey'
  ) THEN
    ALTER TABLE "DiscountCodeUsage" 
    ADD CONSTRAINT "DiscountCodeUsage_discountCodeId_fkey" 
    FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DiscountCodeUsage_userId_fkey'
  ) THEN
    ALTER TABLE "DiscountCodeUsage" 
    ADD CONSTRAINT "DiscountCodeUsage_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================
-- REFERRAL TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "referrerRewarded" BOOLEAN NOT NULL DEFAULT false,
    "refereeRewarded" BOOLEAN NOT NULL DEFAULT false,
    "rewardCredits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Referral_refereeId_key" ON "Referral"("refereeId");
CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx" ON "Referral"("referrerId");
CREATE INDEX IF NOT EXISTS "Referral_refereeId_idx" ON "Referral"("refereeId");
CREATE INDEX IF NOT EXISTS "Referral_referralCode_idx" ON "Referral"("referralCode");
CREATE INDEX IF NOT EXISTS "Referral_status_idx" ON "Referral"("status");
CREATE INDEX IF NOT EXISTS "Referral_createdAt_idx" ON "Referral"("createdAt");

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Referral_referrerId_fkey'
  ) THEN
    ALTER TABLE "Referral" 
    ADD CONSTRAINT "Referral_referrerId_fkey" 
    FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Referral_refereeId_fkey'
  ) THEN
    ALTER TABLE "Referral" 
    ADD CONSTRAINT "Referral_refereeId_fkey" 
    FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================
-- FEEDBACK TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT,
    "message" TEXT NOT NULL,
    "pageUrl" TEXT,
    "metadata" JSONB,
    "assignedTo" TEXT,
    "priority" TEXT,
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Feedback_userId_idx" ON "Feedback"("userId");
CREATE INDEX IF NOT EXISTS "Feedback_type_idx" ON "Feedback"("type");
CREATE INDEX IF NOT EXISTS "Feedback_status_idx" ON "Feedback"("status");
CREATE INDEX IF NOT EXISTS "Feedback_createdAt_idx" ON "Feedback"("createdAt");
CREATE INDEX IF NOT EXISTS "Feedback_priority_idx" ON "Feedback"("priority");

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Feedback_userId_fkey'
  ) THEN
    ALTER TABLE "Feedback" 
    ADD CONSTRAINT "Feedback_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================
-- USER EVENT TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "UserEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "pageUrl" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UserEvent_userId_idx" ON "UserEvent"("userId");
CREATE INDEX IF NOT EXISTS "UserEvent_eventType_idx" ON "UserEvent"("eventType");
CREATE INDEX IF NOT EXISTS "UserEvent_createdAt_idx" ON "UserEvent"("createdAt");

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('DiscountCode', 'DiscountCodeUsage', 'Referral', 'Feedback', 'UserEvent')
ORDER BY table_name;

-- Verify enums were created
SELECT typname FROM pg_type WHERE typname IN ('DiscountCodeType', 'DiscountCodeStatus', 'EarlyAdopterTier', 'UserRole', 'FeedbackType', 'FeedbackStatus');

