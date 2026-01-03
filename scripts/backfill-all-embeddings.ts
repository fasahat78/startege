/**
 * Backfill All Embeddings
 * 
 * Runs both article and standard embeddings backfill
 */

import 'dotenv/config';

async function backfillAllEmbeddings() {
  console.log('🚀 Starting Complete Embeddings Backfill\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Run article backfill
  console.log('📰 Phase 1: Backfilling Article Embeddings');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  try {
    // Note: The script runs itself on import, so we just import it
    await import('./backfill-article-embeddings');
  } catch (error: any) {
    console.error('❌ Article backfill failed:', error.message);
  }

  console.log('\n\n');

  // Run standards backfill
  console.log('📚 Phase 2: Backfilling Standards Embeddings');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  try {
    const standardsModule = await import('./backfill-standard-embeddings');
    // Script runs on import
  } catch (error: any) {
    console.error('❌ Standards backfill failed:', error.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Complete Embeddings Backfill Finished!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Since the scripts run on import, we'll use a different approach
// Let's create a wrapper that executes them sequentially
backfillAllEmbeddings().catch(console.error);

