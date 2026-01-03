/**
 * Backfill Embeddings for Market Scan Articles
 * 
 * Generates embeddings for existing articles and indexes them in Vector Search
 */

import 'dotenv/config';
import { prisma } from '../lib/db';
import { isVectorSearchConfigured } from '../lib/vector-db/config';
import { batchIndexDocuments } from '../lib/vector-db/storage';
import { VectorDocument } from '../lib/vector-db/types';

async function backfillArticleEmbeddings() {
  console.log('🚀 Starting Article Embeddings Backfill...\n');

  // Check configuration
  if (!isVectorSearchConfigured()) {
    console.error('❌ Vector Search not configured!');
    console.error('   Please set VECTOR_SEARCH_INDEX_ID and VECTOR_SEARCH_ENDPOINT_ID in .env');
    process.exit(1);
  }

  try {
    // Fetch all articles (excluding standards)
    console.log('📄 Fetching articles from database...');
    const articles = await prisma.marketScanArticle.findMany({
      where: {
        sourceType: { not: 'STANDARD' },
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

    console.log(`   Found ${articles.length} articles to process\n`);

    if (articles.length === 0) {
      console.log('✅ No articles to process');
      return;
    }

    // Prepare documents for indexing
    console.log('🔄 Preparing documents for indexing...');
    const documents: Array<Omit<VectorDocument, 'embedding'> & { text: string }> = articles.map(article => {
      // Combine title, summary, and content for embedding
      const text = [
        article.title,
        article.summary || '',
        article.content.substring(0, 5000), // Limit content to 5k chars
      ].filter(Boolean).join('\n\n');

      return {
        id: article.id,
        text,
        metadata: {
          title: article.title,
          content: article.summary || article.content.substring(0, 1000),
          source: article.source,
          url: article.sourceUrl,
          type: 'market_scan' as const,
          jurisdiction: article.jurisdiction || null,
          publishedDate: article.publishedAt,
          relevanceScore: article.relevanceScore,
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
    console.log(`Total Articles: ${articles.length}`);
    console.log(`Successfully Indexed: ${indexed}`);
    console.log(`Errors: ${errors}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (indexed > 0) {
      console.log('✅ Article embeddings backfill completed!');
      console.log('   Semantic search will now use these embeddings.\n');
    } else {
      console.log('⚠️  No articles were indexed. Check errors above.\n');
    }
  } catch (error: any) {
    console.error('❌ Fatal error during backfill:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfillArticleEmbeddings().catch(console.error);

