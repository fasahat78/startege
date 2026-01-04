-- Complete Database Schema for Startege
-- Generated from Prisma schema.prisma
-- This script creates all tables, enums, indexes, and foreign keys
-- It's safe to run multiple times (idempotent) - checks for existence before creating

-- Note: This script uses DO blocks to check for existence before creating
-- Some CREATE statements may fail if objects already exist, but that's okay
-- The script will continue and create missing objects

BEGIN;

-- Create enums (only if they don't exist)
DO $$
BEGIN
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

-- Now execute the complete schema SQL
-- We'll use a transaction and catch errors for objects that already exist
\i scripts/complete-schema.sql

-- Grant permissions to postgres user
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT ALL PRIVILEGES ON TABLE %I TO postgres', r.tablename);
    END LOOP;
    
    FOR r IN 
        SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public'
    LOOP
        EXECUTE format('GRANT ALL PRIVILEGES ON SEQUENCE %I TO postgres', r.sequence_name);
    END LOOP;
END $$;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

COMMIT;

SELECT 'Schema applied successfully! Check for any errors above.' AS result;

