-- Create Market Scan tables - Simple version
-- Run this script directly in your database (psql or Cloud SQL Studio)

-- Create enums (ignore if already exists)
-- Note: Run each DO block separately in Cloud SQL Studio if needed

DO $$ BEGIN
    CREATE TYPE "ScanJobStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ScanJobType" AS ENUM ('DAILY_NEWS', 'MANUAL', 'SCHEDULED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ComplianceImpact" AS ENUM ('High', 'Medium', 'Low');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Sentiment" AS ENUM ('positive', 'negative', 'neutral');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Urgency" AS ENUM ('breaking', 'high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ImpactScope" AS ENUM ('global', 'regional', 'local', 'industry_specific');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ComplexityLevel" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create ScanJob table
CREATE TABLE IF NOT EXISTS "ScanJob" (
    "id" TEXT NOT NULL,
    "scanType" "ScanJobType" NOT NULL,
    "status" "ScanJobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "articlesFound" INTEGER,
    "articlesProcessed" INTEGER,
    "articlesAdded" INTEGER,
    "errors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScanJob_pkey" PRIMARY KEY ("id")
);

-- Create indexes for ScanJob
CREATE INDEX IF NOT EXISTS "ScanJob_status_idx" ON "ScanJob"("status");
CREATE INDEX IF NOT EXISTS "ScanJob_startedAt_idx" ON "ScanJob"("startedAt");
CREATE INDEX IF NOT EXISTS "ScanJob_scanType_idx" ON "ScanJob"("scanType");

-- Create MarketScanArticle table
CREATE TABLE IF NOT EXISTS "MarketScanArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "category" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "relevanceTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keyTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affectedFrameworks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "riskAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "complianceImpact" "ComplianceImpact",
    "sentiment" "Sentiment",
    "urgency" "Urgency",
    "impactScope" "ImpactScope",
    "affectedIndustries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regulatoryBodies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedRegulations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "actionItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timeline" TEXT,
    "geographicRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mentionedEntities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enforcementActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "readingTimeMinutes" INTEGER,
    "complexityLevel" "ComplexityLevel",
    "language" TEXT NOT NULL DEFAULT 'en',
    "author" TEXT,
    "publisher" TEXT,
    "embeddingId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketScanArticle_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MarketScanArticle_sourceUrl_key" UNIQUE ("sourceUrl")
);

-- Create indexes for MarketScanArticle
CREATE INDEX IF NOT EXISTS "MarketScanArticle_sourceUrl_idx" ON "MarketScanArticle"("sourceUrl");
CREATE INDEX IF NOT EXISTS "MarketScanArticle_publishedAt_idx" ON "MarketScanArticle"("publishedAt");
CREATE INDEX IF NOT EXISTS "MarketScanArticle_scannedAt_idx" ON "MarketScanArticle"("scannedAt");
CREATE INDEX IF NOT EXISTS "MarketScanArticle_jurisdiction_idx" ON "MarketScanArticle"("jurisdiction");
CREATE INDEX IF NOT EXISTS "MarketScanArticle_category_idx" ON "MarketScanArticle"("category");
CREATE INDEX IF NOT EXISTS "MarketScanArticle_relevanceScore_idx" ON "MarketScanArticle"("relevanceScore");
CREATE INDEX IF NOT EXISTS "MarketScanArticle_isActive_idx" ON "MarketScanArticle"("isActive");

