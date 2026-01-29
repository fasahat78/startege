/**
 * Script to verify Vector Search resources are deleted and check for charges
 * 
 * Usage:
 *   npx tsx scripts/verify-vector-search-deletion.ts
 */

const VECTOR_SEARCH_CONFIG = {
  projectId: process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'startege',
  projectNumber: process.env.GCP_PROJECT_NUMBER || '785373873454',
  location: process.env.GCP_LOCATION || 'us-central1',
  indexId: '3161010167949033472',
  endpointId: '3780782882293809152',
  deploymentId: 'startege_vector_search_end_1767344026840',
  gcsBucket: 'startege-vector-search',
};

async function checkIndexExists(): Promise<boolean> {
  try {
    const { execSync } = require('child_process');
    const result = execSync(
      `gcloud ai indexes describe ${VECTOR_SEARCH_CONFIG.indexId} --region=${VECTOR_SEARCH_CONFIG.location} --project=${VECTOR_SEARCH_CONFIG.projectId} 2>&1`,
      { encoding: 'utf-8' }
    );
    return !result.includes('NOT_FOUND') && !result.includes('does not exist');
  } catch (error: any) {
    return false; // Index doesn't exist (good!)
  }
}

async function checkEndpointExists(): Promise<boolean> {
  try {
    const { execSync } = require('child_process');
    const result = execSync(
      `gcloud ai index-endpoints describe ${VECTOR_SEARCH_CONFIG.endpointId} --region=${VECTOR_SEARCH_CONFIG.location} --project=${VECTOR_SEARCH_CONFIG.projectId} 2>&1`,
      { encoding: 'utf-8' }
    );
    return !result.includes('NOT_FOUND') && !result.includes('does not exist');
  } catch (error: any) {
    return false; // Endpoint doesn't exist (good!)
  }
}

async function checkBucketExists(): Promise<boolean> {
  try {
    const { execSync } = require('child_process');
    execSync(
      `gsutil ls gs://${VECTOR_SEARCH_CONFIG.gcsBucket} 2>&1`,
      { encoding: 'utf-8' }
    );
    return true;
  } catch (error: any) {
    return false; // Bucket doesn't exist (good!)
  }
}

async function listAllIndexes(): Promise<string[]> {
  try {
    const { execSync } = require('child_process');
    const result = execSync(
      `gcloud ai indexes list --region=${VECTOR_SEARCH_CONFIG.location} --project=${VECTOR_SEARCH_CONFIG.projectId} --format="value(name)" 2>&1`,
      { encoding: 'utf-8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error: any) {
    return [];
  }
}

async function listAllEndpoints(): Promise<string[]> {
  try {
    const { execSync } = require('child_process');
    const result = execSync(
      `gcloud ai index-endpoints list --region=${VECTOR_SEARCH_CONFIG.location} --project=${VECTOR_SEARCH_CONFIG.projectId} --format="value(name)" 2>&1`,
      { encoding: 'utf-8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error: any) {
    return [];
  }
}

async function main() {
  console.log('🔍 Verifying Vector Search Resource Deletion');
  console.log('============================================\n');
  console.log(`Project: ${VECTOR_SEARCH_CONFIG.projectId} (${VECTOR_SEARCH_CONFIG.projectNumber})`);
  console.log(`Location: ${VECTOR_SEARCH_CONFIG.location}\n`);

  // Check specific resources
  console.log('📋 Checking specific Vector Search resources...\n');
  
  const indexExists = await checkIndexExists();
  const endpointExists = await checkEndpointExists();
  const bucketExists = await checkBucketExists();

  console.log(`Index (${VECTOR_SEARCH_CONFIG.indexId}): ${indexExists ? '❌ EXISTS' : '✅ DELETED'}`);
  console.log(`Endpoint (${VECTOR_SEARCH_CONFIG.endpointId}): ${endpointExists ? '❌ EXISTS' : '✅ DELETED'}`);
  console.log(`Bucket (${VECTOR_SEARCH_CONFIG.gcsBucket}): ${bucketExists ? '❌ EXISTS' : '✅ DELETED'}`);

  // List all resources
  console.log('\n📋 Checking for any remaining Vector Search resources...\n');
  
  const allIndexes = await listAllIndexes();
  const allEndpoints = await listAllEndpoints();

  if (allIndexes.length > 0) {
    console.log(`⚠️  Found ${allIndexes.length} index(es) still in project:`);
    allIndexes.forEach(idx => console.log(`   - ${idx}`));
  } else {
    console.log('✅ No indexes found in project');
  }

  if (allEndpoints.length > 0) {
    console.log(`⚠️  Found ${allEndpoints.length} endpoint(s) still in project:`);
    allEndpoints.forEach(ep => console.log(`   - ${ep}`));
  } else {
    console.log('✅ No endpoints found in project');
  }

  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  const allDeleted = !indexExists && !endpointExists && !bucketExists && allIndexes.length === 0 && allEndpoints.length === 0;
  
  if (allDeleted) {
    console.log('✅ All Vector Search resources have been deleted!');
    console.log('\n💰 Next Steps to Verify No Charges:');
    console.log('1. Check GCP Billing Dashboard:');
    console.log(`   https://console.cloud.google.com/billing?project=${VECTOR_SEARCH_CONFIG.projectId}`);
    console.log('\n2. Check Vertex AI Usage:');
    console.log(`   https://console.cloud.google.com/vertex-ai/usage?project=${VECTOR_SEARCH_CONFIG.projectId}`);
    console.log('\n3. Review recent charges (may take 24-48 hours to reflect):');
    console.log(`   https://console.cloud.google.com/billing/${VECTOR_SEARCH_CONFIG.projectId}/reports`);
  } else {
    console.log('⚠️  Some Vector Search resources may still exist.');
    console.log('\n💡 Action Required:');
    if (indexExists) console.log('   - Delete the index');
    if (endpointExists) console.log('   - Delete the endpoint');
    if (bucketExists) console.log('   - Delete the Cloud Storage bucket');
    if (allIndexes.length > 0 || allEndpoints.length > 0) {
      console.log('   - Review and delete any remaining resources');
    }
  }

  console.log('\n📚 For detailed billing verification, see:');
  console.log('   docs/VERIFY_NO_CHARGES.md');
}

if (require.main === module) {
  main().catch(console.error);
}
