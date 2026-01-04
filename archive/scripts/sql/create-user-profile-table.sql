-- Create UserProfile table and related onboarding tables
-- Run this script in Cloud SQL Studio or via gcloud sql connect

-- First, create the required enum types if they don't exist
DO $$
BEGIN
    -- Create PersonaType enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PersonaType') THEN
        CREATE TYPE "PersonaType" AS ENUM (
            'COMPLIANCE_OFFICER',
            'AI_ETHICS_RESEARCHER',
            'TECHNICAL_AI_DEVELOPER',
            'LEGAL_REGULATORY_PROFESSIONAL',
            'BUSINESS_EXECUTIVE',
            'DATA_PROTECTION_OFFICER',
            'AI_GOVERNANCE_CONSULTANT',
            'AI_PRODUCT_MANAGER',
            'STUDENT_ACADEMIC',
            'OTHER'
        );
        RAISE NOTICE 'PersonaType enum created successfully';
    ELSE
        RAISE NOTICE 'PersonaType enum already exists';
    END IF;

    -- Create KnowledgeLevel enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'KnowledgeLevel') THEN
        CREATE TYPE "KnowledgeLevel" AS ENUM (
            'BEGINNER',
            'INTERMEDIATE',
            'ADVANCED',
            'NOT_ASSESSED'
        );
        RAISE NOTICE 'KnowledgeLevel enum created successfully';
    ELSE
        RAISE NOTICE 'KnowledgeLevel enum already exists';
    END IF;

    -- Create OnboardingStatus enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OnboardingStatus') THEN
        CREATE TYPE "OnboardingStatus" AS ENUM (
            'NOT_STARTED',
            'PERSONA_SELECTED',
            'KNOWLEDGE_ASSESSED',
            'INTERESTS_SELECTED',
            'GOALS_SELECTED',
            'COMPLETED',
            'SKIPPED'
        );
        RAISE NOTICE 'OnboardingStatus enum created successfully';
    ELSE
        RAISE NOTICE 'OnboardingStatus enum already exists';
    END IF;
END $$;

-- Now create the UserProfile table
-- First, check if UserProfile table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserProfile') THEN
        -- Create UserProfile table
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

        -- Create unique constraint on userId
        CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

        -- Create indexes
        CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");
        CREATE INDEX "UserProfile_personaType_idx" ON "UserProfile"("personaType");
        CREATE INDEX "UserProfile_onboardingStatus_idx" ON "UserProfile"("onboardingStatus");

        -- Add foreign key constraint
        ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        RAISE NOTICE 'UserProfile table created successfully';
    ELSE
        RAISE NOTICE 'UserProfile table already exists';
    END IF;
END $$;

-- Check and create UserInterest table if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserInterest') THEN
        CREATE TABLE "UserInterest" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "interest" TEXT NOT NULL,

            CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
        );

        CREATE UNIQUE INDEX "UserInterest_userId_interest_key" ON "UserInterest"("userId", "interest");
        CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");
        CREATE INDEX "UserInterest_interest_idx" ON "UserInterest"("interest");
        -- Note: UserInterest.userId references UserProfile.id (the profile's ID), not UserProfile.userId
        -- This is because Prisma relation uses UserProfile.id as the reference field
        ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        RAISE NOTICE 'UserInterest table created successfully';
    ELSE
        RAISE NOTICE 'UserInterest table already exists';
    END IF;
END $$;

-- Check and create UserGoal table if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserGoal') THEN
        CREATE TABLE "UserGoal" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "goal" TEXT NOT NULL,

            CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
        );

        CREATE UNIQUE INDEX "UserGoal_userId_goal_key" ON "UserGoal"("userId", "goal");
        CREATE INDEX "UserGoal_userId_idx" ON "UserGoal"("userId");
        CREATE INDEX "UserGoal_goal_idx" ON "UserGoal"("goal");
        -- Note: UserGoal.userId references UserProfile.id (the profile's ID), not UserProfile.userId
        ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        RAISE NOTICE 'UserGoal table created successfully';
    ELSE
        RAISE NOTICE 'UserGoal table already exists';
    END IF;
END $$;

-- Check and create OnboardingScenario table if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'OnboardingScenario') THEN
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

        CREATE UNIQUE INDEX "OnboardingScenario_personaType_questionOrder_key" ON "OnboardingScenario"("personaType", "questionOrder");
        CREATE INDEX "OnboardingScenario_personaType_idx" ON "OnboardingScenario"("personaType");
        CREATE INDEX "OnboardingScenario_questionOrder_idx" ON "OnboardingScenario"("questionOrder");

        RAISE NOTICE 'OnboardingScenario table created successfully';
    ELSE
        RAISE NOTICE 'OnboardingScenario table already exists';
    END IF;
END $$;

-- Check and create OnboardingScenarioAnswer table if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'OnboardingScenarioAnswer') THEN
        CREATE TABLE "OnboardingScenarioAnswer" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "scenarioId" TEXT NOT NULL,
            "selectedAnswer" TEXT NOT NULL,
            "isCorrect" BOOLEAN NOT NULL,
            "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "OnboardingScenarioAnswer_pkey" PRIMARY KEY ("id")
        );

        CREATE UNIQUE INDEX "OnboardingScenarioAnswer_userId_scenarioId_key" ON "OnboardingScenarioAnswer"("userId", "scenarioId");
        CREATE INDEX "OnboardingScenarioAnswer_userId_idx" ON "OnboardingScenarioAnswer"("userId");
        CREATE INDEX "OnboardingScenarioAnswer_scenarioId_idx" ON "OnboardingScenarioAnswer"("scenarioId");
        -- Note: OnboardingScenarioAnswer.userId references UserProfile.id (the profile's ID)
        ALTER TABLE "OnboardingScenarioAnswer" ADD CONSTRAINT "OnboardingScenarioAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        -- Note: OnboardingScenarioAnswer.scenarioId references OnboardingScenario.id
        ALTER TABLE "OnboardingScenarioAnswer" ADD CONSTRAINT "OnboardingScenarioAnswer_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "OnboardingScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        RAISE NOTICE 'OnboardingScenarioAnswer table created successfully';
    ELSE
        RAISE NOTICE 'OnboardingScenarioAnswer table already exists';
    END IF;
END $$;

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON TABLE "UserProfile" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "UserInterest" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "UserGoal" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "OnboardingScenario" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "OnboardingScenarioAnswer" TO postgres;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

SELECT 'All onboarding tables created successfully!' AS result;

