-- SQL Script to Create Flashcards, Admin, and Discount Code Tables
-- Run this directly in Cloud SQL Studio
-- This matches your Prisma schema exactly

-- ============================================
-- 1. Create FlashcardStatus Enum
-- ============================================
CREATE TYPE "FlashcardStatus" AS ENUM ('NOT_STARTED', 'REVIEWING', 'MASTERED');

-- ============================================
-- 2. Create AIGPFlashcardProgress Table
-- ============================================
CREATE TABLE "AIGPFlashcardProgress" (
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

-- Create indexes for AIGPFlashcardProgress
CREATE UNIQUE INDEX "AIGPFlashcardProgress_userId_flashcardId_key" ON "AIGPFlashcardProgress"("userId", "flashcardId");
CREATE INDEX "AIGPFlashcardProgress_userId_idx" ON "AIGPFlashcardProgress"("userId");
CREATE INDEX "AIGPFlashcardProgress_flashcardId_idx" ON "AIGPFlashcardProgress"("flashcardId");
CREATE INDEX "AIGPFlashcardProgress_status_idx" ON "AIGPFlashcardProgress"("status");

-- Add foreign key constraint
ALTER TABLE "AIGPFlashcardProgress" 
ADD CONSTRAINT "AIGPFlashcardProgress_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 3. Add Admin Fields to User Table
-- ============================================
-- Add isAdmin column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT false;

-- Add role column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'USER';

-- ============================================
-- 4. Create Discount Code Enums
-- ============================================
CREATE TYPE "DiscountCodeType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

CREATE TYPE "DiscountCodeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

CREATE TYPE "EarlyAdopterTier" AS ENUM ('FOUNDING_MEMBER', 'EARLY_ADOPTER', 'LAUNCH_USER');

-- ============================================
-- 5. Create DiscountCode Table
-- ============================================
CREATE TABLE "DiscountCode" (
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

-- Create indexes for DiscountCode
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");
CREATE INDEX "DiscountCode_code_idx" ON "DiscountCode"("code");
CREATE INDEX "DiscountCode_status_idx" ON "DiscountCode"("status");
CREATE INDEX "DiscountCode_earlyAdopterTier_idx" ON "DiscountCode"("earlyAdopterTier");
CREATE INDEX "DiscountCode_validFrom_idx" ON "DiscountCode"("validFrom");
CREATE INDEX "DiscountCode_validUntil_idx" ON "DiscountCode"("validUntil");

-- ============================================
-- 6. Create DiscountCodeUsage Table
-- ============================================
CREATE TABLE "DiscountCodeUsage" (
    "id" TEXT NOT NULL,
    "discountCodeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "paymentId" TEXT,
    "amountSaved" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscountCodeUsage_pkey" PRIMARY KEY ("id")
);

-- Create indexes for DiscountCodeUsage
CREATE INDEX "DiscountCodeUsage_discountCodeId_idx" ON "DiscountCodeUsage"("discountCodeId");
CREATE INDEX "DiscountCodeUsage_userId_idx" ON "DiscountCodeUsage"("userId");
CREATE INDEX "DiscountCodeUsage_createdAt_idx" ON "DiscountCodeUsage"("createdAt");

-- Add foreign key constraints
ALTER TABLE "DiscountCodeUsage" 
ADD CONSTRAINT "DiscountCodeUsage_discountCodeId_fkey" 
FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiscountCodeUsage" 
ADD CONSTRAINT "DiscountCodeUsage_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- Verification Queries (run these separately)
-- ============================================
-- Check tables exist:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('AIGPFlashcardProgress', 'DiscountCode', 'DiscountCodeUsage')
-- ORDER BY table_name;

-- Check enums exist:
-- SELECT typname 
-- FROM pg_type 
-- WHERE typname IN ('FlashcardStatus', 'DiscountCodeType', 'DiscountCodeStatus', 'EarlyAdopterTier')
-- ORDER BY typname;

-- Check User table has new columns:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'User' 
-- AND column_name IN ('isAdmin', 'role')
-- ORDER BY column_name;

-- ============================================
-- Create Admin User (run separately after tables are created)
-- ============================================
-- UPDATE "User" SET "isAdmin" = true, "role" = 'ADMIN' WHERE email = 'fasahat@gmail.com';
