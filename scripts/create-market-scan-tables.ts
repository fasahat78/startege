/**
 * Create Market Scan tables
 * Run: tsx scripts/create-market-scan-tables.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createEnums() {
  const enums = [
    {
      name: 'ScanJobStatus',
      values: ['RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    },
    {
      name: 'ScanJobType',
      values: ['DAILY_NEWS', 'MANUAL', 'SCHEDULED'],
    },
    {
      name: 'ComplianceImpact',
      values: ['High', 'Medium', 'Low'],
    },
    {
      name: 'Sentiment',
      values: ['positive', 'negative', 'neutral'],
    },
    {
      name: 'Urgency',
      values: ['breaking', 'high', 'medium', 'low'],
    },
    {
      name: 'ImpactScope',
      values: ['global', 'regional', 'local', 'industry_specific'],
    },
    {
      name: 'ComplexityLevel',
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
  ];

  for (const enumDef of enums) {
    try {
      const values = enumDef.values.map(v => `'${v}'`).join(', ');
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "${enumDef.name}" AS ENUM (${values});
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
      `);
      console.log(`✅ Created enum: ${enumDef.name}`);
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`ℹ️  Enum ${enumDef.name} already exists`);
      } else {
        console.error(`❌ Error creating enum ${enumDef.name}:`, error.message);
      }
    }
  }
}

async function createTables() {
  // Create ScanJob table
  try {
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✅ Created table: ScanJob');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Table ScanJob already exists');
    } else {
      console.error('❌ Error creating ScanJob:', error.message);
    }
  }

  // Create indexes for ScanJob
  const scanJobIndexes = [
    'CREATE INDEX IF NOT EXISTS "ScanJob_status_idx" ON "ScanJob"("status");',
    'CREATE INDEX IF NOT EXISTS "ScanJob_startedAt_idx" ON "ScanJob"("startedAt");',
    'CREATE INDEX IF NOT EXISTS "ScanJob_scanType_idx" ON "ScanJob"("scanType");',
  ];

  for (const indexSql of scanJobIndexes) {
    try {
      await prisma.$executeRawUnsafe(indexSql);
    } catch (error: any) {
      console.warn(`Warning creating index: ${error.message}`);
    }
  }

  // Create MarketScanArticle table
  try {
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✅ Created table: MarketScanArticle');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Table MarketScanArticle already exists');
    } else {
      console.error('❌ Error creating MarketScanArticle:', error.message);
    }
  }

  // Create indexes for MarketScanArticle
  const articleIndexes = [
    'CREATE INDEX IF NOT EXISTS "MarketScanArticle_sourceUrl_idx" ON "MarketScanArticle"("sourceUrl");',
    'CREATE INDEX IF NOT EXISTS "MarketScanArticle_publishedAt_idx" ON "MarketScanArticle"("publishedAt");',
    'CREATE INDEX IF NOT EXISTS "MarketScanArticle_scannedAt_idx" ON "MarketScanArticle"("scannedAt");',
    'CREATE INDEX IF NOT EXISTS "MarketScanArticle_jurisdiction_idx" ON "MarketScanArticle"("jurisdiction");',
    'CREATE INDEX IF NOT EXISTS "MarketScanArticle_category_idx" ON "MarketScanArticle"("category");',
    'CREATE INDEX IF NOT EXISTS "MarketScanArticle_relevanceScore_idx" ON "MarketScanArticle"("relevanceScore");',
    'CREATE INDEX IF NOT EXISTS "MarketScanArticle_isActive_idx" ON "MarketScanArticle"("isActive");',
  ];

  for (const indexSql of articleIndexes) {
    try {
      await prisma.$executeRawUnsafe(indexSql);
    } catch (error: any) {
      console.warn(`Warning creating index: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Creating Market Scan tables...\n');
  
  try {
    await createEnums();
    await createTables();
    
    // Verify tables exist
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('MarketScanArticle', 'ScanJob')
    `;
    
    console.log('\n✅ Tables created successfully!');
    console.log('Created tables:', tables.map(t => t.table_name).join(', '));
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

