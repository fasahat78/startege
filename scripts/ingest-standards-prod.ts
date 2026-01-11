/**
 * Ingest AI Governance Standards to Production Database
 * 
 * Uses Cloud SQL Proxy to connect to production database
 * Run with: npx tsx scripts/ingest-standards-prod.ts
 * 
 * Make sure Cloud SQL Proxy is running:
 * cloud-sql-proxy startege:us-central1:startege-db --port=5436
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { KEY_STANDARDS } from '../lib/knowledge-base/standards';
import { fetchPublicContent } from '../lib/knowledge-base/fetcher';

// Production database connection via Cloud SQL Proxy
const PROD_USER = 'postgres';
const PROD_PASSWORD = 'Zoya@57Bruce';
const PROD_DB = 'startege';
const PROXY_PORT = process.env.PROXY_PORT || '5436';

// Create connection string for Cloud SQL Proxy (TCP connection via proxy)
const prodDatabaseUrl = `postgresql://${PROD_USER}:${encodeURIComponent(PROD_PASSWORD)}@127.0.0.1:${PROXY_PORT}/${PROD_DB}`;

console.log(`[INGEST] Connecting to production database...`);
console.log(`[INGEST] Database: ${PROD_DB}`);
console.log(`[INGEST] User: ${PROD_USER}`);
console.log(`[INGEST] Proxy Port: ${PROXY_PORT}`);
console.log(`[INGEST] Make sure Cloud SQL Proxy is running: cloud-sql-proxy startege:us-central1:startege-db --port=${PROXY_PORT}\n`);

// Temporarily override DATABASE_URL to ensure production connection
const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = prodDatabaseUrl;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDatabaseUrl,
    },
  },
});

/**
 * Fetch standard content from public URL
 */
async function fetchStandardContent(standard: typeof KEY_STANDARDS[0]): Promise<string> {
  console.log(`  📥 Fetching from: ${standard.url}`);
  
  try {
    const fetched = await fetchPublicContent(standard);
    
    if (!fetched || !fetched.content) {
      console.log(`  ⚠️  Could not fetch content, using metadata only`);
      // Fallback to metadata if fetch fails
      return `
${standard.name}
Organization: ${standard.organization}
Jurisdiction: ${standard.jurisdiction}
Published: ${standard.publishedDate || 'N/A'}
Effective: ${standard.effectiveDate || 'N/A'}

Description: ${standard.description}

Key Topics: ${standard.topics.join(', ')}

AIGP Domains: ${standard.domains.join(', ')}

Note: Full content could not be fetched automatically. Please visit: ${standard.url}
`;
    }
    
    // Combine metadata with fetched content
    return `
${standard.name}
Organization: ${standard.organization}
Jurisdiction: ${standard.jurisdiction}
Published: ${standard.publishedDate || 'N/A'}
Effective: ${standard.effectiveDate || 'N/A'}

Description: ${standard.description}

Key Topics: ${standard.topics.join(', ')}

AIGP Domains: ${standard.domains.join(', ')}

---

FULL CONTENT:
${fetched.content}

Source URL: ${standard.url}
Fetched: ${fetched.fetchedAt.toISOString()}
`;
  } catch (error: any) {
    console.error(`  ❌ Error fetching content:`, error.message);
    // Return metadata-only content
    return `
${standard.name}
Organization: ${standard.organization}
Jurisdiction: ${standard.jurisdiction}
Published: ${standard.publishedDate || 'N/A'}
Effective: ${standard.effectiveDate || 'N/A'}

Description: ${standard.description}

Key Topics: ${standard.topics.join(', ')}

AIGP Domains: ${standard.domains.join(', ')}

Note: Content fetch failed. Please visit: ${standard.url}
Error: ${error.message}
`;
  }
}

async function main() {
  console.log('🚀 Starting Standards Ingestion to Production...\n');
  console.log(`Found ${KEY_STANDARDS.length} standards to ingest\n`);

  let ingested = 0;
  let errors = 0;
  const errorsList: Array<{ standard: string; error: string }> = [];

  for (const standard of KEY_STANDARDS) {
    try {
      console.log(`\n📄 Processing: ${standard.name}...`);
      console.log(`   Type: ${standard.type}`);
      console.log(`   Organization: ${standard.organization}`);

      // Check if already exists
      const existing = await prisma.marketScanArticle.findFirst({
        where: {
          sourceType: 'STANDARD',
          title: standard.name,
        },
      });

      if (existing) {
        console.log(`   ⚠️  Already exists (ID: ${existing.id}), skipping...`);
        continue;
      }

      // Fetch content
      const content = await fetchStandardContent(standard);
      
      if (!content || content.trim().length === 0) {
        console.log(`   ⚠️  No content fetched, skipping...`);
        errors++;
        errorsList.push({ standard: standard.name, error: 'No content fetched' });
        continue;
      }

      // Store in database
      await prisma.marketScanArticle.create({
        data: {
          title: standard.name,
          content: content,
          summary: standard.description,
          source: standard.organization,
          sourceUrl: standard.url,
          sourceType: 'STANDARD',
          category: 'Standard/Framework',
          jurisdiction: standard.jurisdiction,
          publishedAt: standard.publishedDate ? new Date(standard.publishedDate) : new Date(),
          relevanceScore: 1.0, // Standards are always highly relevant
          relevanceTags: standard.topics,
          keyTopics: standard.topics,
          affectedFrameworks: [standard.name],
          riskAreas: [],
          complianceImpact: 'High',
        },
      });

      ingested++;
      console.log(`   ✅ Successfully ingested: ${standard.name}`);
    } catch (error: any) {
      errors++;
      const errorMsg = error.message || String(error);
      errorsList.push({ standard: standard.name, error: errorMsg });
      console.error(`   ❌ Error ingesting ${standard.name}:`, errorMsg);
      
      // If it's a unique constraint error, it might already exist with different title
      if (error.code === 'P2002') {
        console.log(`   💡 Tip: This standard might already exist with a slightly different title`);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Standards Ingestion Completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Standards Processed: ${KEY_STANDARDS.length}`);
  console.log(`Successfully Ingested: ${ingested}`);
  console.log(`Skipped (already exists): ${KEY_STANDARDS.length - ingested - errors}`);
  console.log(`Errors: ${errors}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (errors > 0) {
    console.log('⚠️  Errors encountered:');
    errorsList.forEach(({ standard, error }) => {
      console.log(`   - ${standard}: ${error}`);
    });
    console.log('');
  }

  // Verify final count
  const finalCount = await prisma.marketScanArticle.count({
    where: {
      sourceType: 'STANDARD',
    },
  });

  console.log(`📊 Final count in database: ${finalCount} standards`);
  
  if (finalCount >= KEY_STANDARDS.length) {
    console.log('✅ All standards are now in the database!\n');
  } else {
    console.log(`⚠️  Expected ${KEY_STANDARDS.length} standards, found ${finalCount}\n`);
  }
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Restore original DATABASE_URL
    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

