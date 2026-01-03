/**
 * Backfill Embeddings for Standards
 * 
 * Generates embeddings for existing standards and indexes them in Vector Search
 */

import 'dotenv/config';
import { prisma } from '../lib/db';
import { isVectorSearchConfigured } from '../lib/vector-db/config';
import { batchIndexDocuments } from '../lib/vector-db/storage';
import { VectorDocument } from '../lib/vector-db/types';

async function backfillStandardEmbeddings() {
  console.log('🚀 Starting Standards Embeddings Backfill...\n');

  // Check configuration
  if (!isVectorSearchConfigured()) {
    console.error('❌ Vector Search not configured!');
    console.error('   Please set VECTOR_SEARCH_INDEX_ID and VECTOR_SEARCH_ENDPOINT_ID in .env');
    process.exit(1);
  }

  try {
    // Fetch all standards
    console.log('📄 Fetching standards from database...');
    const standards = await prisma.marketScanArticle.findMany({
      where: {
        sourceType: 'STANDARD',
      },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        source: true,
        sourceUrl: true,
        jurisdiction: true,
        publishedAt: true,
        relevanceScore: true,
        keyTopics: true,
        affectedFrameworks: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    console.log(`   Found ${standards.length} standards to process\n`);

    if (standards.length === 0) {
      console.log('✅ No standards to process');
      return;
    }

    // Prepare documents for indexing
    console.log('🔄 Preparing documents for indexing...');
    const documents: Array<Omit<VectorDocument, 'embedding'> & { text: string }> = standards.map(standard => {
      // Combine title, summary, and content for embedding
      const text = [
        standard.title,
        standard.summary || '',
        standard.content.substring(0, 10000), // Standards can be longer, use 10k chars
      ].filter(Boolean).join('\n\n');

      return {
        id: standard.id,
        text,
        metadata: {
          title: standard.title,
          content: standard.summary || standard.content.substring(0, 2000),
          source: standard.source,
          url: standard.sourceUrl,
          type: 'standard' as const,
          jurisdiction: standard.jurisdiction || null,
          publishedDate: standard.publishedAt,
          relevanceScore: standard.relevanceScore,
        },
      };
    });

    console.log(`   Prepared ${documents.length} documents\n`);

    // Index in batches
    console.log('📊 Indexing documents in Vector Search...');
    const batchSize = 10; // Process 10 at a time to avoid rate limits
    let indexed = 0;
    let errors = 0;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(documents.length / batchSize);

      try {
        console.log(`   Processing batch ${batchNum}/${totalBatches} (${batch.length} documents)...`);
        const indexedIds = await batchIndexDocuments(batch);
        indexed += indexedIds.length;
        console.log(`   ✅ Indexed ${indexedIds.length} documents\n`);
      } catch (error: any) {
        console.error(`   ❌ Error indexing batch ${batchNum}:`, error.message);
        errors += batch.length;
        
        // Continue with next batch
        continue;
      }

      // Small delay between batches to avoid rate limits
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Backfill Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Standards: ${standards.length}`);
    console.log(`Successfully Indexed: ${indexed}`);
    console.log(`Errors: ${errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (indexed > 0) {
      console.log('✅ Standards embeddings backfill completed!');
      console.log('   Semantic search will now use these embeddings.\n');
    } else {
      console.log('⚠️  No standards were indexed. Check errors above.\n');
    }
  } catch (error: any) {
    console.error('❌ Fatal error during backfill:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfillStandardEmbeddings().catch(console.error);

