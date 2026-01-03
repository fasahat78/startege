/**
 * Check Vector Search Index Operation Status
 * 
 * Monitors index update operations and reports when ready
 */

import 'dotenv/config';
import { getVectorSearchConfig } from '../lib/vector-db/config';

interface Operation {
  name: string;
  done: boolean;
  error?: any;
  response?: any;
}

async function checkOperationStatus(operationName: string): Promise<Operation> {
  const config = getVectorSearchConfig();
  
  // Get access token
  const { GoogleAuth } = require('google-auth-library');
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  // Check operation status
  const operationUrl = `https://${config.location}-aiplatform.googleapis.com/v1/${operationName}`;
  
  const response = await fetch(operationUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Operation check failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function checkAllOperations() {
  console.log('🔍 Checking Vector Search Index Operation Status...\n');

  const config = getVectorSearchConfig();
  
  // List of operation names from backfill
  // These are the operations that were triggered during backfill
  const operationNames = [
    'projects/785373873454/locations/us-central1/indexes/3161010167949033472/operations/2806431532145704960', // Articles batch 1
    'projects/785373873454/locations/us-central1/indexes/3161010167949033472/operations/2777158134567796736', // Articles batch 2
    'projects/785373873454/locations/us-central1/indexes/3161010167949033472/operations/6732233401073401856', // Articles batch 3
    'projects/785373873454/locations/us-central1/indexes/3161010167949033472/operations/9199291203198124032', // Articles batch 4
    'projects/785373873454/locations/us-central1/indexes/3161010167949033472/operations/953200285482745856',  // Articles batch 5
    'projects/785373873454/locations/us-central1/indexes/3161010167949033472/operations/4266723711320588288', // Standards batch 1
    'projects/785373873454/locations/us-central1/indexes/3161010167949033472/operations/319107531697815552',  // Standards batch 2
  ];

  console.log(`📊 Checking ${operationNames.length} operations...\n`);

  const results: Array<{ name: string; status: string; done: boolean; error?: any }> = [];

  for (const operationName of operationNames) {
    try {
      const operation = await checkOperationStatus(operationName);
      const status = operation.done 
        ? (operation.error ? 'FAILED' : 'SUCCEEDED')
        : 'RUNNING';
      
      results.push({
        name: operationName.split('/').pop() || 'unknown',
        status,
        done: operation.done,
        error: operation.error,
      });

      const statusIcon = status === 'SUCCEEDED' ? '✅' : status === 'FAILED' ? '❌' : '⏳';
      console.log(`${statusIcon} Operation ${operationName.split('/').pop()}: ${status}`);
      
      if (operation.error) {
        console.log(`   Error: ${JSON.stringify(operation.error)}`);
      }
    } catch (error: any) {
      console.error(`❌ Error checking operation ${operationName.split('/').pop()}: ${error.message}`);
      results.push({
        name: operationName.split('/').pop() || 'unknown',
        status: 'ERROR',
        done: false,
        error: error.message,
      });
    }
  }

  // Summary
  const succeeded = results.filter(r => r.status === 'SUCCEEDED').length;
  const running = results.filter(r => r.status === 'RUNNING').length;
  const failed = results.filter(r => r.status === 'FAILED').length;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Operation Status Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Succeeded: ${succeeded}/${operationNames.length}`);
  console.log(`⏳ Running: ${running}/${operationNames.length}`);
  console.log(`❌ Failed: ${failed}/${operationNames.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (succeeded === operationNames.length) {
    console.log('🎉 All operations completed successfully!');
    console.log('✅ Vector Search index is ready');
    console.log('✅ Semantic search is now active\n');
    return true;
  } else if (running > 0) {
    console.log('⏳ Some operations are still running...');
    console.log('   Check again in a few minutes\n');
    return false;
  } else if (failed > 0) {
    console.log('❌ Some operations failed. Check errors above.\n');
    return false;
  }

  return false;
}

async function pollUntilComplete(maxWaitMinutes: number = 30) {
  console.log(`🔄 Polling operations until complete (max ${maxWaitMinutes} minutes)...\n`);
  
  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;
  const pollIntervalMs = 30 * 1000; // Check every 30 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const allComplete = await checkAllOperations();
    
    if (allComplete) {
      console.log('✅ Ready to proceed with Phase 4.7 testing!\n');
      return true;
    }

    const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
    console.log(`⏳ Waiting... (${elapsedMinutes}/${maxWaitMinutes} minutes elapsed)\n`);
    
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  console.log(`⏰ Max wait time reached (${maxWaitMinutes} minutes)`);
  console.log('   Some operations may still be running');
  console.log('   Check GCP Console for final status\n');
  return false;
}

// Main
const args = process.argv.slice(2);
const shouldPoll = args.includes('--poll') || args.includes('-p');
const maxWait = args.find(arg => arg.startsWith('--wait='))?.split('=')[1] || '30';

if (shouldPoll) {
  pollUntilComplete(parseInt(maxWait)).catch(console.error);
} else {
  checkAllOperations().catch(console.error);
}

