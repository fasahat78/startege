-- Create AIGP Exam tables
-- Run this in Cloud SQL Studio or via psql

-- Create ExamStatus enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExamStatus') THEN
        CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
    END IF;
END $$;

-- Create AttemptStatus enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AttemptStatus') THEN
        CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'PAUSED', 'SUBMITTED', 'EVALUATED', 'ABANDONED');
    END IF;
END $$;

-- Create AIGPExam table
CREATE TABLE IF NOT EXISTS "AIGPExam" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIGPExam_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for examId
CREATE UNIQUE INDEX IF NOT EXISTS "AIGPExam_examId_key" ON "AIGPExam"("examId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "AIGPExam_examId_idx" ON "AIGPExam"("examId");
CREATE INDEX IF NOT EXISTS "AIGPExam_status_isActive_idx" ON "AIGPExam"("status", "isActive");

-- Create AIGPQuestion table
CREATE TABLE IF NOT EXISTS "AIGPQuestion" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIGPQuestion_pkey" PRIMARY KEY ("id")
);


-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "AIGPQuestion_examId_questionOrder_key" ON "AIGPQuestion"("examId", "questionOrder");
CREATE UNIQUE INDEX IF NOT EXISTS "AIGPQuestion_questionId_key" ON "AIGPQuestion"("questionId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "AIGPQuestion_examId_idx" ON "AIGPQuestion"("examId");
CREATE INDEX IF NOT EXISTS "AIGPQuestion_questionId_idx" ON "AIGPQuestion"("questionId");
CREATE INDEX IF NOT EXISTS "AIGPQuestion_domain_idx" ON "AIGPQuestion"("domain");
CREATE INDEX IF NOT EXISTS "AIGPQuestion_difficulty_idx" ON "AIGPQuestion"("difficulty");
CREATE INDEX IF NOT EXISTS "AIGPQuestion_jurisdiction_idx" ON "AIGPQuestion"("jurisdiction");
CREATE INDEX IF NOT EXISTS "AIGPQuestion_topic_idx" ON "AIGPQuestion"("topic");

-- Add foreign key constraint to AIGPExam
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIGPQuestion_examId_fkey') THEN
        ALTER TABLE "AIGPQuestion" ADD CONSTRAINT "AIGPQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "AIGPExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Create AIGPExamAttempt table
CREATE TABLE IF NOT EXISTS "AIGPExamAttempt" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIGPExamAttempt_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for examId, userId, attemptNumber
CREATE UNIQUE INDEX IF NOT EXISTS "AIGPExamAttempt_examId_userId_attemptNumber_key" ON "AIGPExamAttempt"("examId", "userId", "attemptNumber");

-- Create indexes
CREATE INDEX IF NOT EXISTS "AIGPExamAttempt_examId_idx" ON "AIGPExamAttempt"("examId");
CREATE INDEX IF NOT EXISTS "AIGPExamAttempt_userId_idx" ON "AIGPExamAttempt"("userId");
CREATE INDEX IF NOT EXISTS "AIGPExamAttempt_status_idx" ON "AIGPExamAttempt"("status");
CREATE INDEX IF NOT EXISTS "AIGPExamAttempt_submittedAt_idx" ON "AIGPExamAttempt"("submittedAt");
CREATE INDEX IF NOT EXISTS "AIGPExamAttempt_createdAt_idx" ON "AIGPExamAttempt"("createdAt");

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIGPExamAttempt_examId_fkey') THEN
        ALTER TABLE "AIGPExamAttempt" ADD CONSTRAINT "AIGPExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "AIGPExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIGPExamAttempt_userId_fkey') THEN
        ALTER TABLE "AIGPExamAttempt" ADD CONSTRAINT "AIGPExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Create AIGPExamAnswer table
CREATE TABLE IF NOT EXISTS "AIGPExamAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "timeSpentSec" INTEGER,
    "optionOrder" JSONB,
    "shuffledOrder" JSONB,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIGPExamAnswer_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for attemptId, questionId
CREATE UNIQUE INDEX IF NOT EXISTS "AIGPExamAnswer_attemptId_questionId_key" ON "AIGPExamAnswer"("attemptId", "questionId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "AIGPExamAnswer_attemptId_idx" ON "AIGPExamAnswer"("attemptId");
CREATE INDEX IF NOT EXISTS "AIGPExamAnswer_questionId_idx" ON "AIGPExamAnswer"("questionId");
CREATE INDEX IF NOT EXISTS "AIGPExamAnswer_isCorrect_idx" ON "AIGPExamAnswer"("isCorrect");

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIGPExamAnswer_attemptId_fkey') THEN
        ALTER TABLE "AIGPExamAnswer" ADD CONSTRAINT "AIGPExamAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AIGPExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AIGPExamAnswer_questionId_fkey') THEN
        ALTER TABLE "AIGPExamAnswer" ADD CONSTRAINT "AIGPExamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AIGPQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON TABLE "AIGPExam" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "AIGPQuestion" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "AIGPExamAttempt" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "AIGPExamAnswer" TO postgres;

-- Set ownership
ALTER TABLE "AIGPExam" OWNER TO postgres;
ALTER TABLE "AIGPQuestion" OWNER TO postgres;
ALTER TABLE "AIGPExamAttempt" OWNER TO postgres;
ALTER TABLE "AIGPExamAnswer" OWNER TO postgres;

