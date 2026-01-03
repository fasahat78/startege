/**
 * Script to ingest AI Governance standards and frameworks into Vector DB
 * Only uses publicly available content (no paid sources)
 * Usage: tsx scripts/ingest-standards.ts
 */

import 'dotenv/config';
import { KEY_STANDARDS } from '../lib/knowledge-base/standards';
import { prisma } from '../lib/db';
import { generateEmbedding } from '../lib/market-scan/embeddings';
import { fetchPublicContent } from '../lib/knowledge-base/fetcher';

/**
 * Fetch standard content from public URL
 * Only fetches from publicly available sources
 */
async function fetchStandardContent(standard: typeof KEY_STANDARDS[0]): Promise<string> {
  console.log(`  Fetching from public URL: ${standard.url}`);
  
  const fetched = await fetchPublicContent(standard);
  
  if (!fetched) {
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
}

async function main() {
  console.log('🚀 Starting Standards Ingestion...\n');
  console.log(`Found ${KEY_STANDARDS.length} standards to ingest\n`);

  let ingested = 0;
  let errors = 0;

  for (const standard of KEY_STANDARDS) {
    try {
      console.log(`📄 Processing: ${standard.name}...`);

      // Fetch content
      const content = await fetchStandardContent(standard);
      
      // Generate embedding
      console.log(`  Generating embedding...`);
      const embedding = await generateEmbedding(
        `${standard.name} ${standard.description} ${content.substring(0, 1000)}`
      );

      if (!embedding) {
        console.log(`  ⚠️  Skipping (embedding generation not available)`);
        continue;
      }

      // Store in database
      // TODO: Create KnowledgeBaseDocument model in Prisma schema
      // For now, we'll store in MarketScanArticle with a special type
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
          // Store metadata in a way we can identify standards
          // We'll use a special pattern in the title or add a field
        },
      });

      ingested++;
      console.log(`  ✅ Ingested: ${standard.name}`);
    } catch (error: any) {
      errors++;
      console.error(`  ❌ Error ingesting ${standard.name}:`, error.message);
    }
  }

  console.log('\n✅ Standards Ingestion Completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Standards Processed: ${KEY_STANDARDS.length}`);
  console.log(`Successfully Ingested: ${ingested}`);
  console.log(`Errors: ${errors}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (errors > 0) {
    console.log('⚠️  Some standards failed to ingest. Check logs above.');
  }
}

main().catch(console.error);

