-- CreateEnum
CREATE TYPE "PersonaType" AS ENUM ('COMPLIANCE_OFFICER', 'AI_ETHICS_RESEARCHER', 'TECHNICAL_AI_DEVELOPER', 'LEGAL_REGULATORY_PROFESSIONAL', 'BUSINESS_EXECUTIVE', 'DATA_PROTECTION_OFFICER', 'AI_GOVERNANCE_CONSULTANT', 'AI_PRODUCT_MANAGER', 'STUDENT_ACADEMIC', 'OTHER');

-- CreateEnum
CREATE TYPE "KnowledgeLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NOT_ASSESSED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'PERSONA_SELECTED', 'KNOWLEDGE_ASSESSED', 'INTERESTS_SELECTED', 'GOALS_SELECTED', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('REGULATORY', 'NEWS', 'CASE_STUDY', 'STANDARD', 'LEGAL_DECISION', 'ACADEMIC', 'INDUSTRY_REPORT', 'BLOG');

-- CreateEnum
CREATE TYPE "ScanType" AS ENUM ('DAILY_REGULATORY', 'DAILY_NEWS', 'WEEKLY_CASE_STUDIES', 'WEEKLY_FRAMEWORKS', 'MONTHLY_COMPREHENSIVE', 'ON_DEMAND', 'BREAKING_NEWS');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
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

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interest" TEXT NOT NULL,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,

    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "OnboardingScenarioAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingScenarioAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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
    "embeddingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketScanArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleCitation" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "citedArticleId" TEXT NOT NULL,
    "citationType" TEXT NOT NULL,
    "relevance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ArticleCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleRelation" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "relatedArticleId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ArticleRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_personaType_idx" ON "UserProfile"("personaType");

-- CreateIndex
CREATE INDEX "UserProfile_onboardingStatus_idx" ON "UserProfile"("onboardingStatus");

-- CreateIndex
CREATE INDEX "UserInterest_userId_idx" ON "UserInterest"("userId");

-- CreateIndex
CREATE INDEX "UserInterest_interest_idx" ON "UserInterest"("interest");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_userId_interest_key" ON "UserInterest"("userId", "interest");

-- CreateIndex
CREATE INDEX "UserGoal_userId_idx" ON "UserGoal"("userId");

-- CreateIndex
CREATE INDEX "UserGoal_goal_idx" ON "UserGoal"("goal");

-- CreateIndex
CREATE UNIQUE INDEX "UserGoal_userId_goal_key" ON "UserGoal"("userId", "goal");

-- CreateIndex
CREATE INDEX "OnboardingScenario_personaType_idx" ON "OnboardingScenario"("personaType");

-- CreateIndex
CREATE INDEX "OnboardingScenario_questionOrder_idx" ON "OnboardingScenario"("questionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingScenario_personaType_questionOrder_key" ON "OnboardingScenario"("personaType", "questionOrder");

-- CreateIndex
CREATE INDEX "OnboardingScenarioAnswer_userId_idx" ON "OnboardingScenarioAnswer"("userId");

-- CreateIndex
CREATE INDEX "OnboardingScenarioAnswer_scenarioId_idx" ON "OnboardingScenarioAnswer"("scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingScenarioAnswer_userId_scenarioId_key" ON "OnboardingScenarioAnswer"("userId", "scenarioId");

-- CreateIndex
CREATE INDEX "PromptTemplate_personaType_idx" ON "PromptTemplate"("personaType");

-- CreateIndex
CREATE INDEX "PromptTemplate_scenarioType_idx" ON "PromptTemplate"("scenarioType");

-- CreateIndex
CREATE INDEX "PromptTemplate_tags_idx" ON "PromptTemplate"("tags");

-- CreateIndex
CREATE INDEX "PromptUsage_userId_idx" ON "PromptUsage"("userId");

-- CreateIndex
CREATE INDEX "PromptUsage_templateId_idx" ON "PromptUsage"("templateId");

-- CreateIndex
CREATE INDEX "PromptUsage_createdAt_idx" ON "PromptUsage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketScanArticle_sourceUrl_key" ON "MarketScanArticle"("sourceUrl");

-- CreateIndex
CREATE INDEX "MarketScanArticle_publishedAt_idx" ON "MarketScanArticle"("publishedAt");

-- CreateIndex
CREATE INDEX "MarketScanArticle_sourceType_idx" ON "MarketScanArticle"("sourceType");

-- CreateIndex
CREATE INDEX "MarketScanArticle_category_idx" ON "MarketScanArticle"("category");

-- CreateIndex
CREATE INDEX "MarketScanArticle_jurisdiction_idx" ON "MarketScanArticle"("jurisdiction");

-- CreateIndex
CREATE INDEX "MarketScanArticle_relevanceScore_idx" ON "MarketScanArticle"("relevanceScore");

-- CreateIndex
CREATE INDEX "ArticleCitation_articleId_idx" ON "ArticleCitation"("articleId");

-- CreateIndex
CREATE INDEX "ArticleCitation_citedArticleId_idx" ON "ArticleCitation"("citedArticleId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCitation_articleId_citedArticleId_key" ON "ArticleCitation"("articleId", "citedArticleId");

-- CreateIndex
CREATE INDEX "ArticleRelation_articleId_idx" ON "ArticleRelation"("articleId");

-- CreateIndex
CREATE INDEX "ArticleRelation_relatedArticleId_idx" ON "ArticleRelation"("relatedArticleId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleRelation_articleId_relatedArticleId_key" ON "ArticleRelation"("articleId", "relatedArticleId");

-- CreateIndex
CREATE INDEX "ScanJob_scanType_idx" ON "ScanJob"("scanType");

-- CreateIndex
CREATE INDEX "ScanJob_status_idx" ON "ScanJob"("status");

-- CreateIndex
CREATE INDEX "ScanJob_startedAt_idx" ON "ScanJob"("startedAt");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingScenarioAnswer" ADD CONSTRAINT "OnboardingScenarioAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingScenarioAnswer" ADD CONSTRAINT "OnboardingScenarioAnswer_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "OnboardingScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptUsage" ADD CONSTRAINT "PromptUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptUsage" ADD CONSTRAINT "PromptUsage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCitation" ADD CONSTRAINT "ArticleCitation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "MarketScanArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleCitation" ADD CONSTRAINT "ArticleCitation_citedArticleId_fkey" FOREIGN KEY ("citedArticleId") REFERENCES "MarketScanArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleRelation" ADD CONSTRAINT "ArticleRelation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "MarketScanArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleRelation" ADD CONSTRAINT "ArticleRelation_relatedArticleId_fkey" FOREIGN KEY ("relatedArticleId") REFERENCES "MarketScanArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

