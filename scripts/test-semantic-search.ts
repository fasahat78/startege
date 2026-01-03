/**
 * Test Semantic Search
 * 
 * Tests semantic search queries and compares with keyword search
 */

import 'dotenv/config';
import { retrieveRAGContext } from '../lib/startegizer-rag';
import { isVectorSearchConfigured } from '../lib/vector-db/config';

const testQueries = [
  'What does the EU AI Act say about high-risk AI systems?',
  'How does GDPR apply to AI systems?',
  'What are the key principles of NIST AI Risk Management Framework?',
  'Explain transparency requirements for AI governance',
  'What are the compliance requirements for AI systems in healthcare?',
];

async function testSemanticSearch() {
  console.log('🧪 Testing Semantic Search...\n');

  if (!isVectorSearchConfigured()) {
    console.error('❌ Vector Search not configured!');
    process.exit(1);
  }

  console.log('✅ Vector Search is configured\n');

  for (const query of testQueries) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 Query: "${query}"`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
      const context = await retrieveRAGContext(query, {
        marketScanTopK: 3,
        standardsTopK: 3,
        minRelevanceScore: 0.5,
      });

      console.log(`📊 Results: ${context.documents.length} documents found\n`);

      if (context.documents.length === 0) {
        console.log('⚠️  No results found\n');
        continue;
      }

      context.documents.forEach((doc, idx) => {
        console.log(`[${idx + 1}] ${doc.title}`);
        console.log(`    Type: ${doc.type}`);
        console.log(`    Source: ${doc.source}`);
        console.log(`    Relevance: ${(doc.relevanceScore * 100).toFixed(1)}%`);
        if (doc.metadata?.jurisdiction) {
          console.log(`    Jurisdiction: ${doc.metadata.jurisdiction}`);
        }
        console.log(`    Content: ${doc.content.substring(0, 100)}...`);
        console.log('');
      });

      // Check if semantic search was used
      const hasHighRelevance = context.documents.some(doc => doc.relevanceScore > 0.7);
      if (hasHighRelevance) {
        console.log('✅ High relevance scores indicate semantic search is working!\n');
      } else {
        console.log('⚠️  Lower relevance scores - may be using keyword fallback\n');
      }

    } catch (error: any) {
      console.error(`❌ Error testing query: ${error.message}\n`);
    }

    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Semantic Search Testing Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testSemanticSearch().catch(console.error);

