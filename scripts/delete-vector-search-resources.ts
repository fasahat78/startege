/**
 * Script to delete Vector Search resources from GCP
 * 
 * This script helps clean up Vector Search resources:
 * 1. Undeploy the index from the endpoint
 * 2. Delete the index endpoint
 * 3. Delete the Vector Search index
 * 4. Delete Cloud Storage bucket (if used for Vector Search)
 * 
 * Usage:
 *   npx tsx scripts/delete-vector-search-resources.ts
 */

// Try to import GoogleAuth, fallback to manual instructions if not available
let GoogleAuth: any;
try {
  GoogleAuth = require('google-auth-library').GoogleAuth;
} catch (error) {
  console.log('⚠️  google-auth-library not found. Will provide manual instructions instead.\n');
}

// Vector Search resource IDs (from cloudbuild.yaml)
const VECTOR_SEARCH_CONFIG = {
  projectId: process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'startege',
  projectNumber: process.env.GCP_PROJECT_NUMBER || '785373873454',
  location: process.env.GCP_LOCATION || 'us-central1',
  indexId: '3161010167949033472',
  endpointId: '3780782882293809152',
  deploymentId: 'startege_vector_search_end_1767344026840',
  gcsBucket: 'startege-vector-search', // Bucket used for Vector Search imports
};

async function getAccessToken(): Promise<string> {
  if (!GoogleAuth) {
    throw new Error('GoogleAuth not available. Install google-auth-library or use gcloud CLI method.');
  }
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) {
    throw new Error('Failed to get access token');
  }
  return tokenResponse.token;
}

async function makeRequest(
  method: string,
  url: string,
  accessToken: string,
  body?: any
): Promise<any> {
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const text = await response.text();
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${text}`);
  }

  return text ? JSON.parse(text) : {};
}

async function undeployIndex(accessToken: string): Promise<void> {
  console.log('\n📤 Step 1: Undeploying index from endpoint...');
  const url = `https://${VECTOR_SEARCH_CONFIG.location}-aiplatform.googleapis.com/v1/projects/${VECTOR_SEARCH_CONFIG.projectNumber}/locations/${VECTOR_SEARCH_CONFIG.location}/indexEndpoints/${VECTOR_SEARCH_CONFIG.endpointId}:undeployIndex`;
  
  const body = {
    deployedIndexId: VECTOR_SEARCH_CONFIG.deploymentId,
  };

  try {
    const response = await makeRequest('POST', url, accessToken, body);
    console.log('✅ Undeploy operation started:', response.name || 'Operation started');
    console.log('   ⏳ This may take a few minutes. Check operation status in GCP Console.');
    return response;
  } catch (error: any) {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      console.log('   ⚠️  Index already undeployed or does not exist');
      return;
    }
    throw error;
  }
}

async function deleteIndexEndpoint(accessToken: string): Promise<void> {
  console.log('\n🗑️  Step 2: Deleting index endpoint...');
  const url = `https://${VECTOR_SEARCH_CONFIG.location}-aiplatform.googleapis.com/v1/projects/${VECTOR_SEARCH_CONFIG.projectNumber}/locations/${VECTOR_SEARCH_CONFIG.location}/indexEndpoints/${VECTOR_SEARCH_CONFIG.endpointId}`;

  try {
    await makeRequest('DELETE', url, accessToken);
    console.log('✅ Index endpoint deletion started');
    console.log('   ⏳ This may take a few minutes. Check operation status in GCP Console.');
  } catch (error: any) {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      console.log('   ⚠️  Index endpoint already deleted or does not exist');
      return;
    }
    throw error;
  }
}

async function deleteIndex(accessToken: string): Promise<void> {
  console.log('\n🗑️  Step 3: Deleting Vector Search index...');
  const url = `https://${VECTOR_SEARCH_CONFIG.location}-aiplatform.googleapis.com/v1/projects/${VECTOR_SEARCH_CONFIG.projectNumber}/locations/${VECTOR_SEARCH_CONFIG.location}/indexes/${VECTOR_SEARCH_CONFIG.indexId}`;

  try {
    await makeRequest('DELETE', url, accessToken);
    console.log('✅ Index deletion started');
    console.log('   ⏳ This may take a few minutes. Check operation status in GCP Console.');
  } catch (error: any) {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      console.log('   ⚠️  Index already deleted or does not exist');
      return;
    }
    throw error;
  }
}

async function deleteGCSBucket(): Promise<void> {
  console.log('\n🗑️  Step 4: Deleting Cloud Storage bucket...');
  console.log(`   Bucket: gs://${VECTOR_SEARCH_CONFIG.gcsBucket}`);
  console.log('\n   ⚠️  Cloud Storage bucket deletion must be done manually:');
  console.log(`   1. Go to: https://console.cloud.google.com/storage/browser?project=${VECTOR_SEARCH_CONFIG.projectId}`);
  console.log(`   2. Find bucket: ${VECTOR_SEARCH_CONFIG.gcsBucket}`);
  console.log('   3. Click on the bucket');
  console.log('   4. Click "Delete" button');
  console.log('   5. Type the bucket name to confirm');
  console.log('\n   Or use gcloud CLI:');
  console.log(`   gsutil rm -r gs://${VECTOR_SEARCH_CONFIG.gcsBucket}`);
}

async function main() {
  console.log('🗑️  Vector Search Resource Cleanup Script');
  console.log('==========================================\n');
  console.log('This script will delete the following Vector Search resources:');
  console.log(`  - Index ID: ${VECTOR_SEARCH_CONFIG.indexId}`);
  console.log(`  - Endpoint ID: ${VECTOR_SEARCH_CONFIG.endpointId}`);
  console.log(`  - Deployment ID: ${VECTOR_SEARCH_CONFIG.deploymentId}`);
  console.log(`  - GCS Bucket: ${VECTOR_SEARCH_CONFIG.gcsBucket}`);
  console.log(`\nProject: ${VECTOR_SEARCH_CONFIG.projectId} (${VECTOR_SEARCH_CONFIG.projectNumber})`);
  console.log(`Location: ${VECTOR_SEARCH_CONFIG.location}\n`);

  // Check if user wants to proceed
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question('⚠️  This will DELETE Vector Search resources. Continue? (yes/no): ', resolve);
  });
  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Cancelled. No resources deleted.');
    process.exit(0);
  }

  try {
    let accessToken: string;
    try {
      accessToken = await getAccessToken();
      console.log('✅ Authenticated with GCP\n');
    } catch (authError: any) {
      if (authError.message?.includes('GoogleAuth not available')) {
        console.log('\n⚠️  Cannot use automated deletion (missing dependencies)');
        console.log('📋 Please use one of these methods instead:\n');
        console.log('Method 1: Use gcloud CLI (recommended)');
        console.log('----------------------------------------');
        console.log(`gcloud config set project ${VECTOR_SEARCH_CONFIG.projectId}`);
        console.log(`gcloud ai index-endpoints undeploy-index ${VECTOR_SEARCH_CONFIG.endpointId} --deployed-index-id=${VECTOR_SEARCH_CONFIG.deploymentId} --region=${VECTOR_SEARCH_CONFIG.location}`);
        console.log(`gcloud ai index-endpoints delete ${VECTOR_SEARCH_CONFIG.endpointId} --region=${VECTOR_SEARCH_CONFIG.location}`);
        console.log(`gcloud ai indexes delete ${VECTOR_SEARCH_CONFIG.indexId} --region=${VECTOR_SEARCH_CONFIG.location}`);
        console.log(`gsutil rm -r gs://${VECTOR_SEARCH_CONFIG.gcsBucket}`);
        console.log('\nMethod 2: Use GCP Console');
        console.log('-------------------------');
        console.log('See docs/DELETE_VECTOR_SEARCH.md for detailed instructions');
        process.exit(0);
      }
      throw authError;
    }

    // Step 1: Undeploy index
    await undeployIndex(accessToken);

    // Step 2: Delete endpoint
    await deleteIndexEndpoint(accessToken);

    // Step 3: Delete index
    await deleteIndex(accessToken);

    // Step 4: Instructions for GCS bucket
    await deleteGCSBucket();

    console.log('\n✅ Cleanup operations started!');
    console.log('\n📋 Next Steps:');
    console.log('1. Monitor operations in GCP Console:');
    console.log(`   https://console.cloud.google.com/vertex-ai/vector-search/indexes?project=${VECTOR_SEARCH_CONFIG.projectId}`);
    console.log('2. Delete the Cloud Storage bucket manually (see Step 4 above)');
    console.log('3. Verify all resources are deleted');
    console.log('\n💡 Note: Deletion operations may take several minutes to complete.');

  } catch (error: any) {
    console.error('\n❌ Error during cleanup:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Ensure you have proper GCP permissions');
    console.error('2. Check that resources exist in GCP Console');
    console.error('3. Verify GCP_PROJECT_ID and GCP_LOCATION are set correctly');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
