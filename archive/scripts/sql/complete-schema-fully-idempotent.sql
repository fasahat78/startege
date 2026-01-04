-- Complete Database Schema for Startege (Fully Idempotent)
-- Safe to run multiple times - checks for existence of all objects

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

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateEnum
-- CreateTable

-- Create table User
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User') THEN
        CREATE TABLE "User" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "name" TEXT,
            "password" TEXT,
            "firebaseUid" TEXT,
            "emailVerified" BOOLEAN NOT NULL DEFAULT false,
            "emailVerifiedAt" TIMESTAMP(3),
            "image" TEXT,
            "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
            "currentLevel" INTEGER NOT NULL DEFAULT 1,
            "maxUnlockedLevel" INTEGER NOT NULL DEFAULT 1,
            "totalChallengesCompleted" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table Account
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Account') THEN
        CREATE TABLE "Account" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "provider" TEXT NOT NULL,
            "providerAccountId" TEXT NOT NULL,
            "refresh_token" TEXT,
            "access_token" TEXT,
            "expires_at" INTEGER,
            "token_type" TEXT,
            "scope" TEXT,
            "id_token" TEXT,
            "session_state" TEXT,
        
            CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table Session
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Session') THEN
        CREATE TABLE "Session" (
            "id" TEXT NOT NULL,
            "sessionToken" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "expires" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table VerificationToken
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'VerificationToken') THEN
        CREATE TABLE "VerificationToken" (
            "identifier" TEXT NOT NULL,
            "token" TEXT NOT NULL,
            "expires" TIMESTAMP(3) NOT NULL
    END IF;
END $$;
-- CreateTable

-- Create table Domain
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Domain') THEN
        CREATE TABLE "Domain" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "order" INTEGER NOT NULL,
            "description" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table Category
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Category') THEN
        CREATE TABLE "Category" (
            "id" TEXT NOT NULL,
            "domainId" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "order" INTEGER NOT NULL,
            "description" TEXT,
            "examSystemPrompt" TEXT NOT NULL DEFAULT 'Generate exam questions for this category.',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table ConceptCard
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ConceptCard') THEN
        CREATE TABLE "ConceptCard" (
            "id" TEXT NOT NULL,
            "domain" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            "categoryId" TEXT,
            "concept" TEXT NOT NULL,
            "name" TEXT,
            "definition" TEXT NOT NULL,
            "examples" TEXT,
            "scenarioQuestion" TEXT,
            "optionA" TEXT,
            "optionB" TEXT,
            "optionC" TEXT,
            "optionD" TEXT,
            "correctAnswer" TEXT,
            "rationale" TEXT,
            "difficulty" TEXT NOT NULL,
            "importance" TEXT NOT NULL DEFAULT 'medium',
            "estimatedReadTime" INTEGER NOT NULL DEFAULT 0,
            "domainClassification" TEXT,
            "overview" TEXT,
            "governanceContext" TEXT,
            "ethicalImplications" TEXT,
            "keyTakeaways" TEXT,
            "shortDefinition" TEXT,
            "boundary" TEXT,
            "version" TEXT DEFAULT '1.0.0',
            "source" TEXT,
            "sourceUrl" TEXT,
            "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedBy" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "ConceptCard_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserProgress
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserProgress') THEN
        CREATE TABLE "UserProgress" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "conceptCardId" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'not_started',
            "completedAt" TIMESTAMP(3),
            "timeSpent" INTEGER NOT NULL DEFAULT 0,
            "masteryScore" DOUBLE PRECISION DEFAULT 0,
            "timesSeen" INTEGER NOT NULL DEFAULT 0,
            "timesCorrect" INTEGER NOT NULL DEFAULT 0,
            "timesIncorrect" INTEGER NOT NULL DEFAULT 0,
            "lastSeen" TIMESTAMP(3),
            "lastCorrect" TIMESTAMP(3),
            "lastIncorrect" TIMESTAMP(3),
            "isWeakArea" BOOLEAN NOT NULL DEFAULT false,
            "flaggedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserPoints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserPoints') THEN
        CREATE TABLE "UserPoints" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "totalPoints" INTEGER NOT NULL DEFAULT 0,
            "pointsEarnedToday" INTEGER NOT NULL DEFAULT 0,
            "lastPointsReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "UserPoints_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table Badge
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Badge') THEN
        CREATE TABLE "Badge" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "iconUrl" TEXT,
            "badgeType" TEXT NOT NULL,
            "rarity" TEXT NOT NULL DEFAULT 'common',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
            CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserBadge
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserBadge') THEN
        CREATE TABLE "UserBadge" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "badgeId" TEXT NOT NULL,
            "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
            CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserStreak
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserStreak') THEN
        CREATE TABLE "UserStreak" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "currentStreak" INTEGER NOT NULL DEFAULT 0,
            "longestStreak" INTEGER NOT NULL DEFAULT 0,
            "lastActivityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table Challenge
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Challenge') THEN
        CREATE TABLE "Challenge" (
            "id" TEXT NOT NULL,
            "levelNumber" INTEGER,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "superLevelGroup" "SuperLevelGroup",
            "isBoss" BOOLEAN NOT NULL DEFAULT false,
            "examSystemPrompt" TEXT NOT NULL DEFAULT 'Generate exam questions for this level.',
            "level" INTEGER NOT NULL,
            "questionCount" INTEGER NOT NULL DEFAULT 10,
            "timeLimit" INTEGER NOT NULL DEFAULT 20,
            "passingScore" INTEGER NOT NULL DEFAULT 70,
            "concepts" TEXT[],
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table ChallengeAttempt
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ChallengeAttempt') THEN
        CREATE TABLE "ChallengeAttempt" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "challengeId" TEXT NOT NULL,
            "score" DOUBLE PRECISION NOT NULL,
            "percentage" DOUBLE PRECISION NOT NULL,
            "timeSpent" INTEGER NOT NULL,
            "passed" BOOLEAN NOT NULL,
            "isFirstAttempt" BOOLEAN NOT NULL DEFAULT true,
            "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
            CONSTRAINT "ChallengeAttempt_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table ChallengeQuestion
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ChallengeQuestion') THEN
        CREATE TABLE "ChallengeQuestion" (
            "id" TEXT NOT NULL,
            "challengeId" TEXT NOT NULL,
            "questionText" TEXT NOT NULL,
            "questionType" TEXT NOT NULL DEFAULT 'multiple_choice',
            "options" JSONB NOT NULL,
            "correctAnswer" TEXT NOT NULL,
            "rationale" TEXT NOT NULL,
            "conceptIds" TEXT[],
            "difficulty" TEXT NOT NULL,
            "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
            "order" INTEGER NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
            CONSTRAINT "ChallengeQuestion_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table ChallengeAnswer
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ChallengeAnswer') THEN
        CREATE TABLE "ChallengeAnswer" (
            "id" TEXT NOT NULL,
            "attemptId" TEXT NOT NULL,
            "questionId" TEXT NOT NULL,
            "selectedAnswer" TEXT NOT NULL,
            "isCorrect" BOOLEAN NOT NULL,
            "timeSpent" INTEGER NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
            CONSTRAINT "ChallengeAnswer_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table LevelCategoryCoverage
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'LevelCategoryCoverage') THEN
        CREATE TABLE "LevelCategoryCoverage" (
            "id" TEXT NOT NULL,
            "levelNumber" INTEGER NOT NULL,
            "categoryId" TEXT NOT NULL,
            "coverageType" "CoverageType" NOT NULL,
            "weight" DOUBLE PRECISION DEFAULT 1.0,
        
            CONSTRAINT "LevelCategoryCoverage_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table Exam
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Exam') THEN
        CREATE TABLE "Exam" (
            "id" TEXT NOT NULL,
            "type" "ExamType" NOT NULL,
            "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT',
            "version" INTEGER NOT NULL DEFAULT 1,
            "categoryId" TEXT,
            "levelNumber" INTEGER,
            "systemPromptSnapshot" TEXT NOT NULL,
            "generationConfig" JSONB NOT NULL,
            "questions" JSONB NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table ExamAttempt
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ExamAttempt') THEN
        CREATE TABLE "ExamAttempt" (
            "id" TEXT NOT NULL,
            "examId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "attemptNumber" INTEGER NOT NULL DEFAULT 1,
            "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
            "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "submittedAt" TIMESTAMP(3),
            "evaluatedAt" TIMESTAMP(3),
            "score" DOUBLE PRECISION,
            "pass" BOOLEAN,
            "answers" JSONB NOT NULL,
            "feedback" JSONB,
            "nextEligibleAt" TIMESTAMP(3),
        
            CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table AIGPExam
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'AIGPExam') THEN
        CREATE TABLE "AIGPExam" (
            "id" TEXT NOT NULL,
            "examId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "version" TEXT NOT NULL,
            "description" TEXT,
            "totalQuestions" INTEGER NOT NULL DEFAULT 100,
            "estimatedTimeMin" INTEGER NOT NULL,
            "passMark" DOUBLE PRECISION,
            "domainDistribution" JSONB NOT NULL,
            "difficultyDistribution" JSONB NOT NULL,
            "jurisdictionDistribution" JSONB NOT NULL,
            "status" "ExamStatus" NOT NULL DEFAULT 'PUBLISHED',
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "AIGPExam_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table AIGPQuestion
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'AIGPQuestion') THEN
        CREATE TABLE "AIGPQuestion" (
            "id" TEXT NOT NULL,
            "examId" TEXT NOT NULL,
            "questionId" TEXT NOT NULL,
            "question" TEXT NOT NULL,
            "options" JSONB NOT NULL,
            "correctAnswer" TEXT NOT NULL,
            "explanation" TEXT NOT NULL,
            "domain" TEXT NOT NULL,
            "topic" TEXT NOT NULL,
            "difficulty" TEXT NOT NULL,
            "isCaseStudy" BOOLEAN NOT NULL DEFAULT false,
            "estimatedTimeSec" INTEGER NOT NULL,
            "jurisdiction" TEXT NOT NULL,
            "sourceRefs" TEXT[],
            "questionOrder" INTEGER NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "AIGPQuestion_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table AIGPExamAttempt
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'AIGPExamAttempt') THEN
        CREATE TABLE "AIGPExamAttempt" (
            "id" TEXT NOT NULL,
            "examId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "attemptNumber" INTEGER NOT NULL DEFAULT 1,
            "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
            "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "pausedAt" TIMESTAMP(3),
            "resumedAt" TIMESTAMP(3),
            "submittedAt" TIMESTAMP(3),
            "evaluatedAt" TIMESTAMP(3),
            "isTimed" BOOLEAN NOT NULL DEFAULT true,
            "timeLimitSec" INTEGER,
            "timeRemainingSec" INTEGER,
            "score" DOUBLE PRECISION,
            "rawScore" INTEGER,
            "totalQuestions" INTEGER,
            "pass" BOOLEAN,
            "domainScores" JSONB,
            "difficultyScores" JSONB,
            "jurisdictionScores" JSONB,
            "topicScores" JSONB,
            "flaggedQuestions" TEXT[],
        
            CONSTRAINT "AIGPExamAttempt_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table AIGPExamAnswer
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'AIGPExamAnswer') THEN
        CREATE TABLE "AIGPExamAnswer" (
            "id" TEXT NOT NULL,
            "attemptId" TEXT NOT NULL,
            "questionId" TEXT NOT NULL,
            "selectedAnswer" TEXT,
            "isCorrect" BOOLEAN,
            "timeSpentSec" INTEGER,
            "optionOrder" JSONB,
            "shuffledOrder" JSONB,
            "isFlagged" BOOLEAN NOT NULL DEFAULT false,
        
            CONSTRAINT "AIGPExamAnswer_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserCategoryProgress
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserCategoryProgress') THEN
        CREATE TABLE "UserCategoryProgress" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "categoryId" TEXT NOT NULL,
            "status" "ProgressStatus" NOT NULL DEFAULT 'LOCKED',
            "bestScore" DOUBLE PRECISION,
            "passedAt" TIMESTAMP(3),
        
            CONSTRAINT "UserCategoryProgress_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserLevelProgress
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserLevelProgress') THEN
        CREATE TABLE "UserLevelProgress" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "levelNumber" INTEGER NOT NULL,
            "status" "ProgressStatus" NOT NULL DEFAULT 'LOCKED',
            "bestScore" DOUBLE PRECISION,
            "passedAt" TIMESTAMP(3),
            "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "attemptsCount" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "UserLevelProgress_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table RemediationSession
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'RemediationSession') THEN
        CREATE TABLE "RemediationSession" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "examId" TEXT NOT NULL,
            "attemptId" TEXT NOT NULL,
            "weakConceptIds" TEXT[],
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "completedAt" TIMESTAMP(3),
        
            CONSTRAINT "RemediationSession_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table Subscription
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Subscription') THEN
        CREATE TABLE "Subscription" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "stripeCustomerId" TEXT NOT NULL,
            "stripeSubscriptionId" TEXT,
            "stripePriceId" TEXT,
            "status" TEXT NOT NULL,
            "planType" TEXT,
            "currentPeriodStart" TIMESTAMP(3),
            "currentPeriodEnd" TIMESTAMP(3),
            "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table Payment
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Payment') THEN
        CREATE TABLE "Payment" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "stripePaymentId" TEXT NOT NULL,
            "amount" INTEGER NOT NULL,
            "currency" TEXT NOT NULL DEFAULT 'usd',
            "status" TEXT NOT NULL,
            "planType" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
            CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserProfile
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserProfile') THEN
        CREATE TABLE "UserProfile" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "personaType" "PersonaType",
            "customPersona" TEXT,
            "knowledgeLevel" "KnowledgeLevel" NOT NULL DEFAULT 'NOT_ASSESSED',
            "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
            "completedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserInterest
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserInterest') THEN
        CREATE TABLE "UserInterest" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "interest" TEXT NOT NULL,
        
            CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserGoal
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserGoal') THEN
        CREATE TABLE "UserGoal" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "goal" TEXT NOT NULL,
        
            CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table UserSettings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserSettings') THEN
        CREATE TABLE "UserSettings" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
            "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
            "learningReminders" BOOLEAN NOT NULL DEFAULT false,
            "reminderTime" TEXT,
            "profileVisibility" TEXT NOT NULL DEFAULT 'private',
            "dataSharing" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table OnboardingScenario
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'OnboardingScenario') THEN
        CREATE TABLE "OnboardingScenario" (
            "id" TEXT NOT NULL,
            "personaType" "PersonaType" NOT NULL,
            "questionOrder" INTEGER NOT NULL,
            "scenario" TEXT NOT NULL,
            "question" TEXT NOT NULL,
            "optionA" TEXT NOT NULL,
            "optionB" TEXT NOT NULL,
            "optionC" TEXT NOT NULL,
            "optionD" TEXT NOT NULL,
            "correctAnswer" TEXT NOT NULL,
            "explanation" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "OnboardingScenario_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table OnboardingScenarioAnswer
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'OnboardingScenarioAnswer') THEN
        CREATE TABLE "OnboardingScenarioAnswer" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "scenarioId" TEXT NOT NULL,
            "selectedAnswer" TEXT NOT NULL,
            "isCorrect" BOOLEAN NOT NULL,
            "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
            CONSTRAINT "OnboardingScenarioAnswer_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table PromptTemplate
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'PromptTemplate') THEN
        CREATE TABLE "PromptTemplate" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "personaType" "PersonaType",
            "scenarioType" TEXT,
            "template" TEXT NOT NULL,
            "description" TEXT,
            "tags" TEXT[],
            "usageCount" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table PromptUsage
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'PromptUsage') THEN
        CREATE TABLE "PromptUsage" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "templateId" TEXT NOT NULL,
            "userScenario" TEXT NOT NULL,
            "generatedPrompt" TEXT NOT NULL,
            "response" TEXT,
            "rating" INTEGER,
            "feedback" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
            CONSTRAINT "PromptUsage_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table AgentConversation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'AgentConversation') THEN
        CREATE TABLE "AgentConversation" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "title" TEXT,
            "messages" JSONB NOT NULL,
            "contextUsed" JSONB,
            "sourcesCited" JSONB,
            "messageCount" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "AgentConversation_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table MarketScanArticle
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'MarketScanArticle') THEN
        CREATE TABLE "MarketScanArticle" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "content" TEXT NOT NULL,
            "summary" TEXT,
            "source" TEXT NOT NULL,
            "sourceUrl" TEXT,
            "sourceType" "SourceType" NOT NULL,
            "category" TEXT NOT NULL,
            "jurisdiction" TEXT,
            "publishedAt" TIMESTAMP(3) NOT NULL,
            "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "relevanceTags" TEXT[],
            "keyTopics" TEXT[],
            "affectedFrameworks" TEXT[],
            "riskAreas" TEXT[],
            "complianceImpact" TEXT,
            "sentiment" TEXT,
            "urgency" TEXT,
            "impactScope" TEXT,
            "affectedIndustries" TEXT[],
            "regulatoryBodies" TEXT[],
            "relatedRegulations" TEXT[],
            "actionItems" TEXT[],
            "timeline" TEXT,
            "geographicRegions" TEXT[],
            "mentionedEntities" TEXT[],
            "enforcementActions" TEXT[],
            "readingTimeMinutes" INTEGER,
            "complexityLevel" TEXT,
            "language" TEXT DEFAULT 'en',
            "author" TEXT,
            "publisher" TEXT,
            "embeddingId" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "MarketScanArticle_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table ArticleCitation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ArticleCitation') THEN
        CREATE TABLE "ArticleCitation" (
            "id" TEXT NOT NULL,
            "articleId" TEXT NOT NULL,
            "citedArticleId" TEXT NOT NULL,
            "citationType" TEXT NOT NULL,
            "relevance" DOUBLE PRECISION NOT NULL DEFAULT 0,
        
            CONSTRAINT "ArticleCitation_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table ArticleRelation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ArticleRelation') THEN
        CREATE TABLE "ArticleRelation" (
            "id" TEXT NOT NULL,
            "articleId" TEXT NOT NULL,
            "relatedArticleId" TEXT NOT NULL,
            "relationType" TEXT NOT NULL,
            "strength" DOUBLE PRECISION NOT NULL DEFAULT 0,
        
            CONSTRAINT "ArticleRelation_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table ScanJob
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ScanJob') THEN
        CREATE TABLE "ScanJob" (
            "id" TEXT NOT NULL,
            "scanType" "ScanType" NOT NULL,
            "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
            "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "completedAt" TIMESTAMP(3),
            "articlesFound" INTEGER NOT NULL DEFAULT 0,
            "articlesProcessed" INTEGER NOT NULL DEFAULT 0,
            "articlesAdded" INTEGER NOT NULL DEFAULT 0,
            "errors" JSONB,
            "metadata" JSONB,
        
            CONSTRAINT "ScanJob_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table AICredit
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'AICredit') THEN
        CREATE TABLE "AICredit" (
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
            "updatedAt" TIMESTAMP(3) NOT NULL,
        
            CONSTRAINT "AICredit_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;
-- CreateTable

-- Create table CreditTransaction
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'CreditTransaction') THEN
        CREATE TABLE "CreditTransaction" (
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
    END IF;
END $$;
-- CreateIndex

-- Create index User_email_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'User_email_key') THEN
        CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
    END IF;
END $$;
-- CreateIndex

-- Create index User_firebaseUid_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'User_firebaseUid_key') THEN
        CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");
    END IF;
END $$;
-- CreateIndex

-- Create index Account_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Account_userId_idx') THEN
        CREATE INDEX "Account_userId_idx" ON "Account"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index Account_provider_providerAccountId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Account_provider_providerAccountId_key') THEN
        CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
    END IF;
END $$;
-- CreateIndex

-- Create index Session_sessionToken_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Session_sessionToken_key') THEN
        CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
    END IF;
END $$;
-- CreateIndex

-- Create index Session_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Session_userId_idx') THEN
        CREATE INDEX "Session_userId_idx" ON "Session"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index VerificationToken_token_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'VerificationToken_token_key') THEN
        CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
    END IF;
END $$;
-- CreateIndex

-- Create index VerificationToken_identifier_token_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'VerificationToken_identifier_token_key') THEN
        CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
    END IF;
END $$;
-- CreateIndex

-- Create index Domain_name_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Domain_name_key') THEN
        CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");
    END IF;
END $$;
-- CreateIndex

-- Create index Domain_order_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Domain_order_key') THEN
        CREATE UNIQUE INDEX "Domain_order_key" ON "Domain"("order");
    END IF;
END $$;
-- CreateIndex

-- Create index Category_domainId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Category_domainId_idx') THEN
        CREATE INDEX "Category_domainId_idx" ON "Category"("domainId");
    END IF;
END $$;
-- CreateIndex

-- Create index Category_domainId_name_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Category_domainId_name_key') THEN
        CREATE UNIQUE INDEX "Category_domainId_name_key" ON "Category"("domainId", "name");
    END IF;
END $$;
-- CreateIndex

-- Create index Category_domainId_order_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Category_domainId_order_key') THEN
        CREATE UNIQUE INDEX "Category_domainId_order_key" ON "Category"("domainId", "order");
    END IF;
END $$;
-- CreateIndex

-- Create index ConceptCard_name_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ConceptCard_name_key') THEN
        CREATE UNIQUE INDEX "ConceptCard_name_key" ON "ConceptCard"("name");
    END IF;
END $$;
-- CreateIndex

-- Create index UserProgress_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserProgress_userId_idx') THEN
        CREATE INDEX "UserProgress_userId_idx" ON "UserProgress"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserProgress_conceptCardId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserProgress_conceptCardId_idx') THEN
        CREATE INDEX "UserProgress_conceptCardId_idx" ON "UserProgress"("conceptCardId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserProgress_isWeakArea_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserProgress_isWeakArea_idx') THEN
        CREATE INDEX "UserProgress_isWeakArea_idx" ON "UserProgress"("isWeakArea");
    END IF;
END $$;
-- CreateIndex

-- Create index UserProgress_userId_conceptCardId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserProgress_userId_conceptCardId_key') THEN
        CREATE UNIQUE INDEX "UserProgress_userId_conceptCardId_key" ON "UserProgress"("userId", "conceptCardId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserPoints_userId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserPoints_userId_key') THEN
        CREATE UNIQUE INDEX "UserPoints_userId_key" ON "UserPoints"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index Badge_name_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Badge_name_key') THEN
        CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");
    END IF;
END $$;
-- CreateIndex

-- Create index UserBadge_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserBadge_userId_idx') THEN
        CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserBadge_userId_badgeId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserBadge_userId_badgeId_key') THEN
        CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserStreak_userId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserStreak_userId_key') THEN
        CREATE UNIQUE INDEX "UserStreak_userId_key" ON "UserStreak"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index Challenge_levelNumber_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Challenge_levelNumber_key') THEN
        CREATE UNIQUE INDEX "Challenge_levelNumber_key" ON "Challenge"("levelNumber");
    END IF;
END $$;
-- CreateIndex

-- Create index Challenge_levelNumber_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Challenge_levelNumber_idx') THEN
        CREATE INDEX "Challenge_levelNumber_idx" ON "Challenge"("levelNumber");
    END IF;
END $$;
-- CreateIndex

-- Create index Challenge_superLevelGroup_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Challenge_superLevelGroup_idx') THEN
        CREATE INDEX "Challenge_superLevelGroup_idx" ON "Challenge"("superLevelGroup");
    END IF;
END $$;
-- CreateIndex

-- Create index ChallengeAttempt_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ChallengeAttempt_userId_idx') THEN
        CREATE INDEX "ChallengeAttempt_userId_idx" ON "ChallengeAttempt"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index ChallengeAttempt_challengeId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ChallengeAttempt_challengeId_idx') THEN
        CREATE INDEX "ChallengeAttempt_challengeId_idx" ON "ChallengeAttempt"("challengeId");
    END IF;
END $$;
-- CreateIndex

-- Create index ChallengeAttempt_completedAt_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ChallengeAttempt_completedAt_idx') THEN
        CREATE INDEX "ChallengeAttempt_completedAt_idx" ON "ChallengeAttempt"("completedAt");
    END IF;
END $$;
-- CreateIndex

-- Create index ChallengeQuestion_challengeId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ChallengeQuestion_challengeId_idx') THEN
        CREATE INDEX "ChallengeQuestion_challengeId_idx" ON "ChallengeQuestion"("challengeId");
    END IF;
END $$;
-- CreateIndex

-- Create index ChallengeQuestion_order_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ChallengeQuestion_order_idx') THEN
        CREATE INDEX "ChallengeQuestion_order_idx" ON "ChallengeQuestion"("order");
    END IF;
END $$;
-- CreateIndex

-- Create index ChallengeAnswer_attemptId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ChallengeAnswer_attemptId_idx') THEN
        CREATE INDEX "ChallengeAnswer_attemptId_idx" ON "ChallengeAnswer"("attemptId");
    END IF;
END $$;
-- CreateIndex

-- Create index ChallengeAnswer_questionId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ChallengeAnswer_questionId_idx') THEN
        CREATE INDEX "ChallengeAnswer_questionId_idx" ON "ChallengeAnswer"("questionId");
    END IF;
END $$;
-- CreateIndex

-- Create index LevelCategoryCoverage_levelNumber_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'LevelCategoryCoverage_levelNumber_idx') THEN
        CREATE INDEX "LevelCategoryCoverage_levelNumber_idx" ON "LevelCategoryCoverage"("levelNumber");
    END IF;
END $$;
-- CreateIndex

-- Create index LevelCategoryCoverage_categoryId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'LevelCategoryCoverage_categoryId_idx') THEN
        CREATE INDEX "LevelCategoryCoverage_categoryId_idx" ON "LevelCategoryCoverage"("categoryId");
    END IF;
END $$;
-- CreateIndex

-- Create index LevelCategoryCoverage_levelNumber_categoryId_coverageType_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'LevelCategoryCoverage_levelNumber_categoryId_coverageType_key') THEN
        CREATE UNIQUE INDEX "LevelCategoryCoverage_levelNumber_categoryId_coverageType_key" ON "LevelCategoryCoverage"("levelNumber", "categoryId", "coverageType");
    END IF;
END $$;
-- CreateIndex

-- Create index Exam_type_status_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Exam_type_status_idx') THEN
        CREATE INDEX "Exam_type_status_idx" ON "Exam"("type", "status");
    END IF;
END $$;
-- CreateIndex

-- Create index Exam_categoryId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Exam_categoryId_idx') THEN
        CREATE INDEX "Exam_categoryId_idx" ON "Exam"("categoryId");
    END IF;
END $$;
-- CreateIndex

-- Create index Exam_levelNumber_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Exam_levelNumber_idx') THEN
        CREATE INDEX "Exam_levelNumber_idx" ON "Exam"("levelNumber");
    END IF;
END $$;
-- CreateIndex

-- Create index ExamAttempt_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ExamAttempt_userId_idx') THEN
        CREATE INDEX "ExamAttempt_userId_idx" ON "ExamAttempt"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index ExamAttempt_examId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ExamAttempt_examId_idx') THEN
        CREATE INDEX "ExamAttempt_examId_idx" ON "ExamAttempt"("examId");
    END IF;
END $$;
-- CreateIndex

-- Create index ExamAttempt_status_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ExamAttempt_status_idx') THEN
        CREATE INDEX "ExamAttempt_status_idx" ON "ExamAttempt"("status");
    END IF;
END $$;
-- CreateIndex

-- Create index ExamAttempt_examId_userId_attemptNumber_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ExamAttempt_examId_userId_attemptNumber_key') THEN
        CREATE UNIQUE INDEX "ExamAttempt_examId_userId_attemptNumber_key" ON "ExamAttempt"("examId", "userId", "attemptNumber");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExam_examId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExam_examId_key') THEN
        CREATE UNIQUE INDEX "AIGPExam_examId_key" ON "AIGPExam"("examId");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExam_status_isActive_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExam_status_isActive_idx') THEN
        CREATE INDEX "AIGPExam_status_isActive_idx" ON "AIGPExam"("status", "isActive");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPQuestion_examId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPQuestion_examId_idx') THEN
        CREATE INDEX "AIGPQuestion_examId_idx" ON "AIGPQuestion"("examId");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPQuestion_domain_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPQuestion_domain_idx') THEN
        CREATE INDEX "AIGPQuestion_domain_idx" ON "AIGPQuestion"("domain");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPQuestion_difficulty_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPQuestion_difficulty_idx') THEN
        CREATE INDEX "AIGPQuestion_difficulty_idx" ON "AIGPQuestion"("difficulty");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPQuestion_jurisdiction_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPQuestion_jurisdiction_idx') THEN
        CREATE INDEX "AIGPQuestion_jurisdiction_idx" ON "AIGPQuestion"("jurisdiction");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPQuestion_topic_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPQuestion_topic_idx') THEN
        CREATE INDEX "AIGPQuestion_topic_idx" ON "AIGPQuestion"("topic");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPQuestion_examId_questionOrder_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPQuestion_examId_questionOrder_key') THEN
        CREATE UNIQUE INDEX "AIGPQuestion_examId_questionOrder_key" ON "AIGPQuestion"("examId", "questionOrder");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPQuestion_questionId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPQuestion_questionId_key') THEN
        CREATE UNIQUE INDEX "AIGPQuestion_questionId_key" ON "AIGPQuestion"("questionId");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExamAttempt_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExamAttempt_userId_idx') THEN
        CREATE INDEX "AIGPExamAttempt_userId_idx" ON "AIGPExamAttempt"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExamAttempt_examId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExamAttempt_examId_idx') THEN
        CREATE INDEX "AIGPExamAttempt_examId_idx" ON "AIGPExamAttempt"("examId");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExamAttempt_status_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExamAttempt_status_idx') THEN
        CREATE INDEX "AIGPExamAttempt_status_idx" ON "AIGPExamAttempt"("status");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExamAttempt_submittedAt_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExamAttempt_submittedAt_idx') THEN
        CREATE INDEX "AIGPExamAttempt_submittedAt_idx" ON "AIGPExamAttempt"("submittedAt");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExamAttempt_examId_userId_attemptNumber_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExamAttempt_examId_userId_attemptNumber_key') THEN
        CREATE UNIQUE INDEX "AIGPExamAttempt_examId_userId_attemptNumber_key" ON "AIGPExamAttempt"("examId", "userId", "attemptNumber");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExamAnswer_attemptId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExamAnswer_attemptId_idx') THEN
        CREATE INDEX "AIGPExamAnswer_attemptId_idx" ON "AIGPExamAnswer"("attemptId");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExamAnswer_questionId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExamAnswer_questionId_idx') THEN
        CREATE INDEX "AIGPExamAnswer_questionId_idx" ON "AIGPExamAnswer"("questionId");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExamAnswer_isCorrect_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExamAnswer_isCorrect_idx') THEN
        CREATE INDEX "AIGPExamAnswer_isCorrect_idx" ON "AIGPExamAnswer"("isCorrect");
    END IF;
END $$;
-- CreateIndex

-- Create index AIGPExamAnswer_attemptId_questionId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AIGPExamAnswer_attemptId_questionId_key') THEN
        CREATE UNIQUE INDEX "AIGPExamAnswer_attemptId_questionId_key" ON "AIGPExamAnswer"("attemptId", "questionId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserCategoryProgress_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserCategoryProgress_userId_idx') THEN
        CREATE INDEX "UserCategoryProgress_userId_idx" ON "UserCategoryProgress"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserCategoryProgress_categoryId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserCategoryProgress_categoryId_idx') THEN
        CREATE INDEX "UserCategoryProgress_categoryId_idx" ON "UserCategoryProgress"("categoryId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserCategoryProgress_userId_categoryId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserCategoryProgress_userId_categoryId_key') THEN
        CREATE UNIQUE INDEX "UserCategoryProgress_userId_categoryId_key" ON "UserCategoryProgress"("userId", "categoryId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserLevelProgress_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserLevelProgress_userId_idx') THEN
        CREATE INDEX "UserLevelProgress_userId_idx" ON "UserLevelProgress"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserLevelProgress_levelNumber_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserLevelProgress_levelNumber_idx') THEN
        CREATE INDEX "UserLevelProgress_levelNumber_idx" ON "UserLevelProgress"("levelNumber");
    END IF;
END $$;
-- CreateIndex

-- Create index UserLevelProgress_userId_levelNumber_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserLevelProgress_userId_levelNumber_key') THEN
        CREATE UNIQUE INDEX "UserLevelProgress_userId_levelNumber_key" ON "UserLevelProgress"("userId", "levelNumber");
    END IF;
END $$;
-- CreateIndex

-- Create index RemediationSession_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'RemediationSession_userId_idx') THEN
        CREATE INDEX "RemediationSession_userId_idx" ON "RemediationSession"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index RemediationSession_examId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'RemediationSession_examId_idx') THEN
        CREATE INDEX "RemediationSession_examId_idx" ON "RemediationSession"("examId");
    END IF;
END $$;
-- CreateIndex

-- Create index RemediationSession_status_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'RemediationSession_status_idx') THEN
        CREATE INDEX "RemediationSession_status_idx" ON "RemediationSession"("status");
    END IF;
END $$;
-- CreateIndex

-- Create index RemediationSession_userId_examId_attemptId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'RemediationSession_userId_examId_attemptId_key') THEN
        CREATE UNIQUE INDEX "RemediationSession_userId_examId_attemptId_key" ON "RemediationSession"("userId", "examId", "attemptId");
    END IF;
END $$;
-- CreateIndex

-- Create index Subscription_userId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Subscription_userId_key') THEN
        CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index Subscription_stripeCustomerId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Subscription_stripeCustomerId_key') THEN
        CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");
    END IF;
END $$;
-- CreateIndex

-- Create index Subscription_stripeSubscriptionId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Subscription_stripeSubscriptionId_key') THEN
        CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
    END IF;
END $$;
-- CreateIndex

-- Create index Subscription_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Subscription_userId_idx') THEN
        CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index Subscription_stripeCustomerId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Subscription_stripeCustomerId_idx') THEN
        CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");
    END IF;
END $$;
-- CreateIndex

-- Create index Subscription_status_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Subscription_status_idx') THEN
        CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
    END IF;
END $$;
-- CreateIndex

-- Create index Payment_stripePaymentId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Payment_stripePaymentId_key') THEN
        CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");
    END IF;
END $$;
-- CreateIndex

-- Create index Payment_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Payment_userId_idx') THEN
        CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index Payment_stripePaymentId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Payment_stripePaymentId_idx') THEN
        CREATE INDEX "Payment_stripePaymentId_idx" ON "Payment"("stripePaymentId");
    END IF;
END $$;
-- CreateIndex

-- Create index Payment_status_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'Payment_status_idx') THEN
        CREATE INDEX "Payment_status_idx" ON "Payment"("status");
    END IF;
END $$;
-- CreateIndex

-- Create index UserProfile_userId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserProfile_userId_key') THEN
        CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserProfile_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserProfile_userId_idx') THEN
        CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserProfile_personaType_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserProfile_personaType_idx') THEN
        CREATE INDEX "UserProfile_personaType_idx" ON "UserProfile"("personaType");
    END IF;
END $$;
-- CreateIndex

-- Create index UserProfile_onboardingStatus_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserProfile_onboardingStatus_idx') THEN
        CREATE INDEX "UserProfile_onboardingStatus_idx" ON "UserProfile"("onboardingStatus");
    END IF;
END $$;
-- CreateIndex

-- Create index UserInterest_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserInterest_userId_idx') THEN
        CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserInterest_interest_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserInterest_interest_idx') THEN
        CREATE INDEX "UserInterest_interest_idx" ON "UserInterest"("interest");
    END IF;
END $$;
-- CreateIndex

-- Create index UserInterest_userId_interest_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserInterest_userId_interest_key') THEN
        CREATE UNIQUE INDEX "UserInterest_userId_interest_key" ON "UserInterest"("userId", "interest");
    END IF;
END $$;
-- CreateIndex

-- Create index UserGoal_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserGoal_userId_idx') THEN
        CREATE INDEX "UserGoal_userId_idx" ON "UserGoal"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserGoal_goal_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserGoal_goal_idx') THEN
        CREATE INDEX "UserGoal_goal_idx" ON "UserGoal"("goal");
    END IF;
END $$;
-- CreateIndex

-- Create index UserGoal_userId_goal_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserGoal_userId_goal_key') THEN
        CREATE UNIQUE INDEX "UserGoal_userId_goal_key" ON "UserGoal"("userId", "goal");
    END IF;
END $$;
-- CreateIndex

-- Create index UserSettings_userId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserSettings_userId_key') THEN
        CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index UserSettings_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'UserSettings_userId_idx') THEN
        CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index OnboardingScenario_personaType_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'OnboardingScenario_personaType_idx') THEN
        CREATE INDEX "OnboardingScenario_personaType_idx" ON "OnboardingScenario"("personaType");
    END IF;
END $$;
-- CreateIndex

-- Create index OnboardingScenario_questionOrder_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'OnboardingScenario_questionOrder_idx') THEN
        CREATE INDEX "OnboardingScenario_questionOrder_idx" ON "OnboardingScenario"("questionOrder");
    END IF;
END $$;
-- CreateIndex

-- Create index OnboardingScenario_personaType_questionOrder_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'OnboardingScenario_personaType_questionOrder_key') THEN
        CREATE UNIQUE INDEX "OnboardingScenario_personaType_questionOrder_key" ON "OnboardingScenario"("personaType", "questionOrder");
    END IF;
END $$;
-- CreateIndex

-- Create index OnboardingScenarioAnswer_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'OnboardingScenarioAnswer_userId_idx') THEN
        CREATE INDEX "OnboardingScenarioAnswer_userId_idx" ON "OnboardingScenarioAnswer"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index OnboardingScenarioAnswer_scenarioId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'OnboardingScenarioAnswer_scenarioId_idx') THEN
        CREATE INDEX "OnboardingScenarioAnswer_scenarioId_idx" ON "OnboardingScenarioAnswer"("scenarioId");
    END IF;
END $$;
-- CreateIndex

-- Create index OnboardingScenarioAnswer_userId_scenarioId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'OnboardingScenarioAnswer_userId_scenarioId_key') THEN
        CREATE UNIQUE INDEX "OnboardingScenarioAnswer_userId_scenarioId_key" ON "OnboardingScenarioAnswer"("userId", "scenarioId");
    END IF;
END $$;
-- CreateIndex

-- Create index PromptTemplate_personaType_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'PromptTemplate_personaType_idx') THEN
        CREATE INDEX "PromptTemplate_personaType_idx" ON "PromptTemplate"("personaType");
    END IF;
END $$;
-- CreateIndex

-- Create index PromptTemplate_scenarioType_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'PromptTemplate_scenarioType_idx') THEN
        CREATE INDEX "PromptTemplate_scenarioType_idx" ON "PromptTemplate"("scenarioType");
    END IF;
END $$;
-- CreateIndex

-- Create index PromptTemplate_tags_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'PromptTemplate_tags_idx') THEN
        CREATE INDEX "PromptTemplate_tags_idx" ON "PromptTemplate"("tags");
    END IF;
END $$;
-- CreateIndex

-- Create index PromptUsage_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'PromptUsage_userId_idx') THEN
        CREATE INDEX "PromptUsage_userId_idx" ON "PromptUsage"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index PromptUsage_templateId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'PromptUsage_templateId_idx') THEN
        CREATE INDEX "PromptUsage_templateId_idx" ON "PromptUsage"("templateId");
    END IF;
END $$;
-- CreateIndex

-- Create index PromptUsage_createdAt_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'PromptUsage_createdAt_idx') THEN
        CREATE INDEX "PromptUsage_createdAt_idx" ON "PromptUsage"("createdAt");
    END IF;
END $$;
-- CreateIndex

-- Create index AgentConversation_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AgentConversation_userId_idx') THEN
        CREATE INDEX "AgentConversation_userId_idx" ON "AgentConversation"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index AgentConversation_createdAt_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AgentConversation_createdAt_idx') THEN
        CREATE INDEX "AgentConversation_createdAt_idx" ON "AgentConversation"("createdAt");
    END IF;
END $$;
-- CreateIndex

-- Create index AgentConversation_updatedAt_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AgentConversation_updatedAt_idx') THEN
        CREATE INDEX "AgentConversation_updatedAt_idx" ON "AgentConversation"("updatedAt");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_sourceUrl_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_sourceUrl_key') THEN
        CREATE UNIQUE INDEX "MarketScanArticle_sourceUrl_key" ON "MarketScanArticle"("sourceUrl");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_publishedAt_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_publishedAt_idx') THEN
        CREATE INDEX "MarketScanArticle_publishedAt_idx" ON "MarketScanArticle"("publishedAt");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_sourceType_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_sourceType_idx') THEN
        CREATE INDEX "MarketScanArticle_sourceType_idx" ON "MarketScanArticle"("sourceType");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_category_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_category_idx') THEN
        CREATE INDEX "MarketScanArticle_category_idx" ON "MarketScanArticle"("category");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_jurisdiction_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_jurisdiction_idx') THEN
        CREATE INDEX "MarketScanArticle_jurisdiction_idx" ON "MarketScanArticle"("jurisdiction");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_relevanceScore_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_relevanceScore_idx') THEN
        CREATE INDEX "MarketScanArticle_relevanceScore_idx" ON "MarketScanArticle"("relevanceScore");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_sentiment_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_sentiment_idx') THEN
        CREATE INDEX "MarketScanArticle_sentiment_idx" ON "MarketScanArticle"("sentiment");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_urgency_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_urgency_idx') THEN
        CREATE INDEX "MarketScanArticle_urgency_idx" ON "MarketScanArticle"("urgency");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_impactScope_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_impactScope_idx') THEN
        CREATE INDEX "MarketScanArticle_impactScope_idx" ON "MarketScanArticle"("impactScope");
    END IF;
END $$;
-- CreateIndex

-- Create index MarketScanArticle_complexityLevel_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'MarketScanArticle_complexityLevel_idx') THEN
        CREATE INDEX "MarketScanArticle_complexityLevel_idx" ON "MarketScanArticle"("complexityLevel");
    END IF;
END $$;
-- CreateIndex

-- Create index ArticleCitation_articleId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ArticleCitation_articleId_idx') THEN
        CREATE INDEX "ArticleCitation_articleId_idx" ON "ArticleCitation"("articleId");
    END IF;
END $$;
-- CreateIndex

-- Create index ArticleCitation_citedArticleId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ArticleCitation_citedArticleId_idx') THEN
        CREATE INDEX "ArticleCitation_citedArticleId_idx" ON "ArticleCitation"("citedArticleId");
    END IF;
END $$;
-- CreateIndex

-- Create index ArticleCitation_articleId_citedArticleId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ArticleCitation_articleId_citedArticleId_key') THEN
        CREATE UNIQUE INDEX "ArticleCitation_articleId_citedArticleId_key" ON "ArticleCitation"("articleId", "citedArticleId");
    END IF;
END $$;
-- CreateIndex

-- Create index ArticleRelation_articleId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ArticleRelation_articleId_idx') THEN
        CREATE INDEX "ArticleRelation_articleId_idx" ON "ArticleRelation"("articleId");
    END IF;
END $$;
-- CreateIndex

-- Create index ArticleRelation_relatedArticleId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ArticleRelation_relatedArticleId_idx') THEN
        CREATE INDEX "ArticleRelation_relatedArticleId_idx" ON "ArticleRelation"("relatedArticleId");
    END IF;
END $$;
-- CreateIndex

-- Create index ArticleRelation_articleId_relatedArticleId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ArticleRelation_articleId_relatedArticleId_key') THEN
        CREATE UNIQUE INDEX "ArticleRelation_articleId_relatedArticleId_key" ON "ArticleRelation"("articleId", "relatedArticleId");
    END IF;
END $$;
-- CreateIndex

-- Create index ScanJob_scanType_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ScanJob_scanType_idx') THEN
        CREATE INDEX "ScanJob_scanType_idx" ON "ScanJob"("scanType");
    END IF;
END $$;
-- CreateIndex

-- Create index ScanJob_status_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ScanJob_status_idx') THEN
        CREATE INDEX "ScanJob_status_idx" ON "ScanJob"("status");
    END IF;
END $$;
-- CreateIndex

-- Create index ScanJob_startedAt_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'ScanJob_startedAt_idx') THEN
        CREATE INDEX "ScanJob_startedAt_idx" ON "ScanJob"("startedAt");
    END IF;
END $$;
-- CreateIndex

-- Create index AICredit_userId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AICredit_userId_key') THEN
        CREATE UNIQUE INDEX "AICredit_userId_key" ON "AICredit"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index AICredit_subscriptionId_key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AICredit_subscriptionId_key') THEN
        CREATE UNIQUE INDEX "AICredit_subscriptionId_key" ON "AICredit"("subscriptionId");
    END IF;
END $$;
-- CreateIndex

-- Create index AICredit_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AICredit_userId_idx') THEN
        CREATE INDEX "AICredit_userId_idx" ON "AICredit"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index AICredit_billingCycleEnd_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AICredit_billingCycleEnd_idx') THEN
        CREATE INDEX "AICredit_billingCycleEnd_idx" ON "AICredit"("billingCycleEnd");
    END IF;
END $$;
-- CreateIndex

-- Create index AICredit_subscriptionId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'AICredit_subscriptionId_idx') THEN
        CREATE INDEX "AICredit_subscriptionId_idx" ON "AICredit"("subscriptionId");
    END IF;
END $$;
-- CreateIndex

-- Create index CreditTransaction_creditId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'CreditTransaction_creditId_idx') THEN
        CREATE INDEX "CreditTransaction_creditId_idx" ON "CreditTransaction"("creditId");
    END IF;
END $$;
-- CreateIndex

-- Create index CreditTransaction_userId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'CreditTransaction_userId_idx') THEN
        CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");
    END IF;
END $$;
-- CreateIndex

-- Create index CreditTransaction_createdAt_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'CreditTransaction_createdAt_idx') THEN
        CREATE INDEX "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");
    END IF;
END $$;
-- CreateIndex

-- Create index CreditTransaction_service_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'CreditTransaction_service_idx') THEN
        CREATE INDEX "CreditTransaction_service_idx" ON "CreditTransaction"("service");
    END IF;
END $$;
-- CreateIndex

-- Create index CreditTransaction_stripePaymentId_idx
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'CreditTransaction_stripePaymentId_idx') THEN
        CREATE INDEX "CreditTransaction_stripePaymentId_idx" ON "CreditTransaction"("stripePaymentId");
    END IF;
END $$;
-- AddForeignKey

-- Add constraint Account_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'Account_userId_fkey') THEN
        ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint Session_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'Session_userId_fkey') THEN
        ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint Category_domainId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'Category_domainId_fkey') THEN
        ALTER TABLE "Category" ADD CONSTRAINT "Category_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ConceptCard_categoryId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ConceptCard_categoryId_fkey') THEN
        ALTER TABLE "ConceptCard" ADD CONSTRAINT "ConceptCard_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserProgress_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserProgress_userId_fkey') THEN
        ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserProgress_conceptCardId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserProgress_conceptCardId_fkey') THEN
        ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_conceptCardId_fkey" FOREIGN KEY ("conceptCardId") REFERENCES "ConceptCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserPoints_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserPoints_userId_fkey') THEN
        ALTER TABLE "UserPoints" ADD CONSTRAINT "UserPoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserBadge_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserBadge_userId_fkey') THEN
        ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserBadge_badgeId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserBadge_badgeId_fkey') THEN
        ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserStreak_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserStreak_userId_fkey') THEN
        ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ChallengeAttempt_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ChallengeAttempt_userId_fkey') THEN
        ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ChallengeAttempt_challengeId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ChallengeAttempt_challengeId_fkey') THEN
        ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ChallengeQuestion_challengeId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ChallengeQuestion_challengeId_fkey') THEN
        ALTER TABLE "ChallengeQuestion" ADD CONSTRAINT "ChallengeQuestion_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ChallengeAnswer_attemptId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ChallengeAnswer_attemptId_fkey') THEN
        ALTER TABLE "ChallengeAnswer" ADD CONSTRAINT "ChallengeAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ChallengeAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ChallengeAnswer_questionId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ChallengeAnswer_questionId_fkey') THEN
        ALTER TABLE "ChallengeAnswer" ADD CONSTRAINT "ChallengeAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ChallengeQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint LevelCategoryCoverage_levelNumber_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'LevelCategoryCoverage_levelNumber_fkey') THEN
        ALTER TABLE "LevelCategoryCoverage" ADD CONSTRAINT "LevelCategoryCoverage_levelNumber_fkey" FOREIGN KEY ("levelNumber") REFERENCES "Challenge"("levelNumber") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint LevelCategoryCoverage_categoryId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'LevelCategoryCoverage_categoryId_fkey') THEN
        ALTER TABLE "LevelCategoryCoverage" ADD CONSTRAINT "LevelCategoryCoverage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint Exam_categoryId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'Exam_categoryId_fkey') THEN
        ALTER TABLE "Exam" ADD CONSTRAINT "Exam_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint Exam_levelNumber_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'Exam_levelNumber_fkey') THEN
        ALTER TABLE "Exam" ADD CONSTRAINT "Exam_levelNumber_fkey" FOREIGN KEY ("levelNumber") REFERENCES "Challenge"("levelNumber") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ExamAttempt_examId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ExamAttempt_examId_fkey') THEN
        ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ExamAttempt_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ExamAttempt_userId_fkey') THEN
        ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint AIGPQuestion_examId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'AIGPQuestion_examId_fkey') THEN
        ALTER TABLE "AIGPQuestion" ADD CONSTRAINT "AIGPQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "AIGPExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint AIGPExamAttempt_examId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'AIGPExamAttempt_examId_fkey') THEN
        ALTER TABLE "AIGPExamAttempt" ADD CONSTRAINT "AIGPExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "AIGPExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint AIGPExamAttempt_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'AIGPExamAttempt_userId_fkey') THEN
        ALTER TABLE "AIGPExamAttempt" ADD CONSTRAINT "AIGPExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint AIGPExamAnswer_attemptId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'AIGPExamAnswer_attemptId_fkey') THEN
        ALTER TABLE "AIGPExamAnswer" ADD CONSTRAINT "AIGPExamAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AIGPExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint AIGPExamAnswer_questionId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'AIGPExamAnswer_questionId_fkey') THEN
        ALTER TABLE "AIGPExamAnswer" ADD CONSTRAINT "AIGPExamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AIGPQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserCategoryProgress_categoryId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserCategoryProgress_categoryId_fkey') THEN
        ALTER TABLE "UserCategoryProgress" ADD CONSTRAINT "UserCategoryProgress_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserCategoryProgress_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserCategoryProgress_userId_fkey') THEN
        ALTER TABLE "UserCategoryProgress" ADD CONSTRAINT "UserCategoryProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserLevelProgress_levelNumber_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserLevelProgress_levelNumber_fkey') THEN
        ALTER TABLE "UserLevelProgress" ADD CONSTRAINT "UserLevelProgress_levelNumber_fkey" FOREIGN KEY ("levelNumber") REFERENCES "Challenge"("levelNumber") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserLevelProgress_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserLevelProgress_userId_fkey') THEN
        ALTER TABLE "UserLevelProgress" ADD CONSTRAINT "UserLevelProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint RemediationSession_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'RemediationSession_userId_fkey') THEN
        ALTER TABLE "RemediationSession" ADD CONSTRAINT "RemediationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint RemediationSession_examId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'RemediationSession_examId_fkey') THEN
        ALTER TABLE "RemediationSession" ADD CONSTRAINT "RemediationSession_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint Subscription_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'Subscription_userId_fkey') THEN
        ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint Payment_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'Payment_userId_fkey') THEN
        ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserProfile_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserProfile_userId_fkey') THEN
        ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserInterest_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserInterest_userId_fkey') THEN
        ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserGoal_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserGoal_userId_fkey') THEN
        ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint UserSettings_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'UserSettings_userId_fkey') THEN
        ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint OnboardingScenarioAnswer_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'OnboardingScenarioAnswer_userId_fkey') THEN
        ALTER TABLE "OnboardingScenarioAnswer" ADD CONSTRAINT "OnboardingScenarioAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint OnboardingScenarioAnswer_scenarioId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'OnboardingScenarioAnswer_scenarioId_fkey') THEN
        ALTER TABLE "OnboardingScenarioAnswer" ADD CONSTRAINT "OnboardingScenarioAnswer_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "OnboardingScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint PromptUsage_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'PromptUsage_userId_fkey') THEN
        ALTER TABLE "PromptUsage" ADD CONSTRAINT "PromptUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint PromptUsage_templateId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'PromptUsage_templateId_fkey') THEN
        ALTER TABLE "PromptUsage" ADD CONSTRAINT "PromptUsage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint AgentConversation_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'AgentConversation_userId_fkey') THEN
        ALTER TABLE "AgentConversation" ADD CONSTRAINT "AgentConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ArticleCitation_articleId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ArticleCitation_articleId_fkey') THEN
        ALTER TABLE "ArticleCitation" ADD CONSTRAINT "ArticleCitation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "MarketScanArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ArticleCitation_citedArticleId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ArticleCitation_citedArticleId_fkey') THEN
        ALTER TABLE "ArticleCitation" ADD CONSTRAINT "ArticleCitation_citedArticleId_fkey" FOREIGN KEY ("citedArticleId") REFERENCES "MarketScanArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ArticleRelation_articleId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ArticleRelation_articleId_fkey') THEN
        ALTER TABLE "ArticleRelation" ADD CONSTRAINT "ArticleRelation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "MarketScanArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint ArticleRelation_relatedArticleId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'ArticleRelation_relatedArticleId_fkey') THEN
        ALTER TABLE "ArticleRelation" ADD CONSTRAINT "ArticleRelation_relatedArticleId_fkey" FOREIGN KEY ("relatedArticleId") REFERENCES "MarketScanArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint AICredit_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'AICredit_userId_fkey') THEN
        ALTER TABLE "AICredit" ADD CONSTRAINT "AICredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint AICredit_subscriptionId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'AICredit_subscriptionId_fkey') THEN
        ALTER TABLE "AICredit" ADD CONSTRAINT "AICredit_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint CreditTransaction_creditId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'CreditTransaction_creditId_fkey') THEN
        ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "AICredit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
-- AddForeignKey

-- Add constraint CreditTransaction_userId_fkey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND conname = 'CreditTransaction_userId_fkey') THEN
        ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Grant permissions to postgres user
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('GRANT ALL PRIVILEGES ON TABLE %I TO postgres', r.tablename);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

SELECT 'Schema application completed!' AS result;