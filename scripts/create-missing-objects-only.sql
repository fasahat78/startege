-- Create Only Missing Database Objects
-- This script checks what exists and only creates what's missing
-- Run extract-current-schema.sql first to see what exists

-- First, let's create a function to check and create objects safely
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Create enums (only if they don't exist)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SuperLevelGroup') THEN
        CREATE TYPE "SuperLevelGroup" AS ENUM ('FOUNDATION', 'BUILDING', 'ADVANCED', 'MASTERY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExamType') THEN
        CREATE TYPE "ExamType" AS ENUM ('CATEGORY', 'LEVEL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExamStatus') THEN
        CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProgressStatus') THEN
        CREATE TYPE "ProgressStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'PASSED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AttemptStatus') THEN
        CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EVALUATED', 'EXPIRED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CoverageType') THEN
        CREATE TYPE "CoverageType" AS ENUM ('INTRODUCED', 'PRACTICED', 'ASSESSED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PersonaType') THEN
        CREATE TYPE "PersonaType" AS ENUM ('COMPLIANCE_OFFICER', 'AI_ETHICS_RESEARCHER', 'TECHNICAL_AI_DEVELOPER', 'LEGAL_REGULATORY_PROFESSIONAL', 'BUSINESS_EXECUTIVE', 'DATA_PROTECTION_OFFICER', 'AI_GOVERNANCE_CONSULTANT', 'AI_PRODUCT_MANAGER', 'STUDENT_ACADEMIC', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'KnowledgeLevel') THEN
        CREATE TYPE "KnowledgeLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NOT_ASSESSED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OnboardingStatus') THEN
        CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'PERSONA_SELECTED', 'KNOWLEDGE_ASSESSED', 'INTERESTS_SELECTED', 'GOALS_SELECTED', 'COMPLETED', 'SKIPPED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SourceType') THEN
        CREATE TYPE "SourceType" AS ENUM ('REGULATORY', 'NEWS', 'CASE_STUDY', 'STANDARD', 'LEGAL_DECISION', 'ACADEMIC', 'INDUSTRY_REPORT', 'BLOG');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScanType') THEN
        CREATE TYPE "ScanType" AS ENUM ('DAILY_REGULATORY', 'DAILY_NEWS', 'WEEKLY_CASE_STUDIES', 'WEEKLY_FRAMEWORKS', 'MONTHLY_COMPREHENSIVE', 'ON_DEMAND', 'BREAKING_NEWS');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScanStatus') THEN
        CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreditTransactionType') THEN
        CREATE TYPE "CreditTransactionType" AS ENUM ('ALLOCATION', 'USAGE', 'RESET', 'PURCHASE', 'BONUS', 'REFUND');
    END IF;
END $$;

-- Now we'll use a different approach: wrap CREATE INDEX and ALTER TABLE in DO blocks
-- that check for existence

-- Note: For indexes and constraints, PostgreSQL doesn't support IF NOT EXISTS directly
-- So we'll wrap them in DO blocks with exception handling

SELECT 'Enums created/verified. Now creating tables...' AS status;

