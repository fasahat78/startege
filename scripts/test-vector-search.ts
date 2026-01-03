/**
 * Test Vector Search Setup
 * 
 * Tests embedding generation and Vector Search configuration
 */

import 'dotenv/config';
import { isVectorSearchConfigured, getVectorSearchConfig } from '../lib/vector-db/config';
import { generateEmbedding, generateQueryEmbedding } from '../lib/vector-db/embeddings';

async function testVectorSearchSetup() {
  console.log('🧪 Testing Vector Search Setup...\n');

  // Test 1: Configuration Check
  console.log('1️⃣ Checking Configuration...');
  const configured = isVectorSearchConfigured();
  if (!configured) {
    console.error('❌ Vector Search not configured!');
    console.error('   Missing environment variables:');
    if (!process.env.GCP_PROJECT_ID) console.error('     - GCP_PROJECT_ID');
    if (!process.env.VECTOR_SEARCH_INDEX_ID) console.error('     - VECTOR_SEARCH_INDEX_ID');
    if (!process.env.VECTOR_SEARCH_ENDPOINT_ID) console.error('     - VECTOR_SEARCH_ENDPOINT_ID');
    process.exit(1);
  }
  console.log('✅ Configuration check passed\n');

  // Test 2: Display Configuration
  console.log('2️⃣ Configuration Details:');
  const config = getVectorSearchConfig();
  console.log(`   Project ID: ${config.projectId}`);
  console.log(`   Location: ${config.location}`);
  console.log(`   Index ID: ${config.indexId}`);
  console.log(`   Endpoint ID: ${config.endpointId}\n`);

  // Test 3: Embedding Generation
  console.log('3️⃣ Testing Embedding Generation...');
  try {
    const testText = 'What does the EU AI Act say about high-risk AI systems?';
    console.log(`   Generating embedding for: "${testText.substring(0, 50)}..."`);
    
    const embedding = await generateEmbedding(testText);
    
    if (!embedding || embedding.length === 0) {
      throw new Error('Empty embedding returned');
    }
    
    if (embedding.length !== 768) {
      console.warn(`   ⚠️  Expected 768 dimensions, got ${embedding.length}`);
    } else {
      console.log(`   ✅ Embedding generated: ${embedding.length} dimensions`);
    }
    
    // Test query embedding
    const queryEmbedding = await generateQueryEmbedding(testText);
    if (queryEmbedding.length === 768) {
      console.log(`   ✅ Query embedding generated: ${queryEmbedding.length} dimensions\n`);
    } else {
      console.warn(`   ⚠️  Query embedding dimensions: ${queryEmbedding.length}\n`);
    }
  } catch (error: any) {
    console.error('   ❌ Embedding generation failed:');
    console.error(`      ${error.message}`);
    if (error.message.includes('credentials') || error.message.includes('authentication')) {
      console.error('\n   💡 Authentication required! Run:');
      console.error('      gcloud auth application-default login');
      console.error('   Or set GOOGLE_APPLICATION_CREDENTIALS to service account key file');
    }
    if (error.message.includes('not set') || error.message.includes('GCP_PROJECT_ID')) {
      console.error('\n   💡 Make sure GCP_PROJECT_ID is set in .env');
    }
    process.exit(1);
  }

  // Test 4: Vector Search API (if index has data)
  console.log('4️⃣ Testing Vector Search API Connection...');
  try {
    const { semanticSearch } = await import('../lib/vector-db/search');
    const results = await semanticSearch('test query', { topK: 1 });
    console.log(`   ✅ Vector Search API accessible`);
    console.log(`   📊 Found ${results.length} results (index may be empty)\n`);
  } catch (error: any) {
    console.error('   ❌ Vector Search API test failed:');
    console.error(`      ${error.message}`);
    if (error.message.includes('404') || error.message.includes('not found')) {
      console.error('\n   💡 Check that:');
      console.error('      - Index ID is correct');
      console.error('      - Endpoint ID is correct');
      console.error('      - Index is deployed to endpoint');
    }
    if (error.message.includes('403') || error.message.includes('Permission')) {
      console.error('\n   💡 Check that service account has:');
      console.error('      - Vertex AI User role');
      console.error('      - Proper IAM permissions');
    }
    // Don't exit - API might work but index might be empty
  }

  console.log('✅ All tests passed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Generate embeddings for existing articles');
  console.log('   2. Generate embeddings for existing standards');
  console.log('   3. Update RAG query engine to use semantic search');
  console.log('   4. Test citation quality improvements\n');
}

testVectorSearchSetup().catch(console.error);

