/**
 * Check Vector Search Index Operation Status
 * 
 * Checks the status of recent index operations to see if they're complete
 */

import 'dotenv/config';
import { getVectorSearchConfig, isVectorSearchConfigured } from '../lib/vector-db/config';

async function checkIndexOperations() {
  console.log('🔍 Checking Vector Search Index Operations...\n');

  if (!isVectorSearchConfigured()) {
    console.error('❌ Vector Search not configured!');
    process.exit(1);
  }

  try {
    const config = getVectorSearchConfig();
    
    // Get access token
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // List recent operations for the index
    const operationsUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/indexes/${config.indexId}/operations`;
    
    console.log(`📋 Fetching operations for index: ${config.indexId}\n`);

    const response = await fetch(operationsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.operations && data.operations.length > 0) {
      console.log(`✅ Found ${data.operations.length} recent operations:\n`);
      
      // Show last 10 operations
      const recentOps = data.operations.slice(0, 10);
      
      recentOps.forEach((op: any, index: number) => {
        const opName = op.name || 'Unknown';
        const opType = opName.split('/').pop() || 'Unknown';
        const done = op.done || false;
        const status = done ? '✅ Done' : '⏳ In Progress';
        
        console.log(`${index + 1}. ${status} - ${opType}`);
        if (op.metadata) {
          console.log(`   Metadata: ${JSON.stringify(op.metadata).substring(0, 100)}...`);
        }
        if (op.error) {
          console.log(`   ❌ Error: ${JSON.stringify(op.error)}`);
        }
        console.log('');
      });
      
      // Check if any operations are still in progress
      const inProgress = recentOps.filter((op: any) => !op.done);
      if (inProgress.length > 0) {
        console.log(`⏳ ${inProgress.length} operation(s) still in progress`);
        console.log('💡 Wait for these to complete before querying the index\n');
      } else {
        console.log('✅ All recent operations are complete!');
        console.log('💡 Index should be ready for queries\n');
      }
    } else {
      console.log('ℹ️  No recent operations found');
      console.log('💡 Index may be ready, or operations may have completed\n');
    }

    // Also check index status directly
    const indexUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/indexes/${config.indexId}`;
    
    console.log('📊 Checking index status...\n');
    
    const indexResponse = await fetch(indexUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (indexResponse.ok) {
      const indexData = await indexResponse.json();
      console.log('Index Details:');
      console.log(`  Name: ${indexData.displayName || 'N/A'}`);
      console.log(`  State: ${indexData.indexStats?.vectorsCount || 'N/A'} vectors`);
      console.log(`  Metadata: ${JSON.stringify(indexData.metadata || {}).substring(0, 200)}...`);
    }

  } catch (error: any) {
    console.error('❌ Error checking operations:', error.message);
    console.error('\n💡 You can also check operations in GCP Console:');
    console.error('   Vertex AI → Vector Search → Indexes → [Your Index] → Operations');
  }
}

checkIndexOperations().catch(console.error);
