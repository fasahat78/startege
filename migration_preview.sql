-- DropForeignKey
ALTER TABLE "public"."UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserInterest" DROP CONSTRAINT "UserInterest_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserGoal" DROP CONSTRAINT "UserGoal_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnboardingScenarioAnswer" DROP CONSTRAINT "OnboardingScenarioAnswer_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnboardingScenarioAnswer" DROP CONSTRAINT "OnboardingScenarioAnswer_scenarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptUsage" DROP CONSTRAINT "PromptUsage_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromptUsage" DROP CONSTRAINT "PromptUsage_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ArticleCitation" DROP CONSTRAINT "ArticleCitation_articleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ArticleCitation" DROP CONSTRAINT "ArticleCitation_citedArticleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ArticleRelation" DROP CONSTRAINT "ArticleRelation_articleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ArticleRelation" DROP CONSTRAINT "ArticleRelation_relatedArticleId_fkey";

-- DropTable
DROP TABLE "public"."UserProfile";

-- DropTable
DROP TABLE "public"."UserInterest";

-- DropTable
DROP TABLE "public"."UserGoal";

-- DropTable
DROP TABLE "public"."OnboardingScenario";

-- DropTable
DROP TABLE "public"."OnboardingScenarioAnswer";

-- DropTable
DROP TABLE "public"."PromptTemplate";

-- DropTable
DROP TABLE "public"."PromptUsage";

-- DropTable
DROP TABLE "public"."MarketScanArticle";

-- DropTable
DROP TABLE "public"."ArticleCitation";

-- DropTable
DROP TABLE "public"."ArticleRelation";

-- DropTable
DROP TABLE "public"."ScanJob";

-- DropEnum
DROP TYPE "public"."PersonaType";

-- DropEnum
DROP TYPE "public"."KnowledgeLevel";

-- DropEnum
DROP TYPE "public"."OnboardingStatus";

-- DropEnum
DROP TYPE "public"."SourceType";

-- DropEnum
DROP TYPE "public"."ScanType";

-- DropEnum
DROP TYPE "public"."ScanStatus";

