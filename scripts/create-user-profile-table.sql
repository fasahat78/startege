-- Create UserProfile table and related onboarding tables
-- Run this script in Cloud SQL Studio or via gcloud sql connect

-- First, check if UserProfile table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'UserProfile') THEN
        -- Create UserProfile table
        CREATE TABLE "UserProfile" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "personaType" TEXT,
            "customPersona" TEXT,
            "knowledgeLevel" TEXT NOT NULL DEFAULT 'NOT_ASSESSED',
            "onboardingStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
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
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
        );

        CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");
        ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
        );

        CREATE INDEX "UserGoal_userId_idx" ON "UserGoal"("userId");
        ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        RAISE NOTICE 'UserGoal table created successfully';
    ELSE
        RAISE NOTICE 'UserGoal table already exists';
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

        CREATE INDEX "OnboardingScenarioAnswer_userId_idx" ON "OnboardingScenarioAnswer"("userId");
        ALTER TABLE "OnboardingScenarioAnswer" ADD CONSTRAINT "OnboardingScenarioAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        RAISE NOTICE 'OnboardingScenarioAnswer table created successfully';
    ELSE
        RAISE NOTICE 'OnboardingScenarioAnswer table already exists';
    END IF;
END $$;

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON TABLE "UserProfile" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "UserInterest" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "UserGoal" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "OnboardingScenarioAnswer" TO postgres;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

SELECT 'All onboarding tables created successfully!' AS result;

