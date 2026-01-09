-- SQL Script to Create Flashcards, Admin, and Discount Code Tables
-- SAFE VERSION - Checks before creating (run this if you get errors)
-- Run this directly in Cloud SQL Studio

-- ============================================
-- 1. Create FlashcardStatus Enum (if not exists)
-- ============================================
-- Check if enum exists first, then create
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FlashcardStatus') THEN
        CREATE TYPE "FlashcardStatus" AS ENUM ('NOT_STARTED', 'REVIEWING', 'MASTERED');
    END IF;
END$$;

-- ============================================
-- 2. Create AIGPFlashcardProgress Table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS "AIGPFlashcardProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "status" "FlashcardStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "timesViewed" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "masteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIGPFlashcardProgress_pkey" PRIMARY KEY ("id")
);

-- Create indexes (ignore if exists)
CREATE UNIQUE INDEX IF NOT EXISTS "AIGPFlashcardProgress_userId_flashcardId_key" ON "AIGPFlashcardProgress"("userId", "flashcardId");
CREATE INDEX IF NOT EXISTS "AIGPFlashcardProgress_userId_idx" ON "AIGPFlashcardProgress"("userId");
CREATE INDEX IF NOT EXISTS "AIGPFlashcardProgress_flashcardId_idx" ON "AIGPFlashcardProgress"("flashcardId");
CREATE INDEX IF NOT EXISTS "AIGPFlashcardProgress_status_idx" ON "AIGPFlashcardProgress"("status");

-- Add foreign key (ignore if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AIGPFlashcardProgress_userId_fkey'
    ) THEN
        ALTER TABLE "AIGPFlashcardProgress" 
        ADD CONSTRAINT "AIGPFlashcardProgress_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END$$;

-- ============================================
-- 3. Add Admin Fields to User Table
-- ============================================
-- Add isAdmin column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT false;

-- Add role column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'USER';

-- ============================================
-- 4. Create Discount Code Enums (if not exists)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountCodeType') THEN
        CREATE TYPE "DiscountCodeType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountCodeStatus') THEN
        CREATE TYPE "DiscountCodeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EarlyAdopterTier') THEN
        CREATE TYPE "EarlyAdopterTier" AS ENUM ('FOUNDING_MEMBER', 'EARLY_ADOPTER', 'LAUNCH_USER');
    END IF;
END$$;

-- ============================================
-- 5. Create DiscountCode Table (if not exists)
-- ============================================
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
    "applicableToPlanTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
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

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "DiscountCode_code_key" ON "DiscountCode"("code");
CREATE INDEX IF NOT EXISTS "DiscountCode_code_idx" ON "DiscountCode"("code");
CREATE INDEX IF NOT EXISTS "DiscountCode_status_idx" ON "DiscountCode"("status");
CREATE INDEX IF NOT EXISTS "DiscountCode_earlyAdopterTier_idx" ON "DiscountCode"("earlyAdopterTier");
CREATE INDEX IF NOT EXISTS "DiscountCode_validFrom_idx" ON "DiscountCode"("validFrom");
CREATE INDEX IF NOT EXISTS "DiscountCode_validUntil_idx" ON "DiscountCode"("validUntil");

-- ============================================
-- 6. Create DiscountCodeUsage Table (if not exists)
-- ============================================
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

-- Create indexes
CREATE INDEX IF NOT EXISTS "DiscountCodeUsage_discountCodeId_idx" ON "DiscountCodeUsage"("discountCodeId");
CREATE INDEX IF NOT EXISTS "DiscountCodeUsage_userId_idx" ON "DiscountCodeUsage"("userId");
CREATE INDEX IF NOT EXISTS "DiscountCodeUsage_createdAt_idx" ON "DiscountCodeUsage"("createdAt");

-- Add foreign keys (ignore if exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DiscountCodeUsage_discountCodeId_fkey'
    ) THEN
        ALTER TABLE "DiscountCodeUsage" 
        ADD CONSTRAINT "DiscountCodeUsage_discountCodeId_fkey" 
        FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DiscountCodeUsage_userId_fkey'
    ) THEN
        ALTER TABLE "DiscountCodeUsage" 
        ADD CONSTRAINT "DiscountCodeUsage_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END$$;

