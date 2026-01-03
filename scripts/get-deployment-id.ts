/**
 * Get Vector Search Deployment ID
 * 
 * Fetches the deployment ID from the endpoint
 */

import 'dotenv/config';
import { getVectorSearchConfig } from '../lib/vector-db/config';

async function getDeploymentId() {
  console.log('🔍 Fetching Vector Search Deployment Details...\n');

  try {
    const config = getVectorSearchConfig();
    
    // Get access token
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Get endpoint details
    const endpointUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/indexEndpoints/${config.endpointId}`;
    
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Endpoint API error: ${response.status} - ${errorText}`);
    }

    const endpointData = await response.json();
    
    console.log('📊 Endpoint Details:');
    console.log(`   Name: ${endpointData.name}`);
    console.log(`   Display Name: ${endpointData.displayName}`);
    console.log(`   Status: ${endpointData.state || 'N/A'}\n`);

    if (endpointData.deployedIndexes && endpointData.deployedIndexes.length > 0) {
      console.log('📦 Deployed Indexes:');
      endpointData.deployedIndexes.forEach((deployment: any, idx: number) => {
        console.log(`\n   [${idx + 1}] Deployment:`);
        console.log(`      ID: ${deployment.id}`);
        console.log(`      Index: ${deployment.index}`);
        console.log(`      Display Name: ${deployment.displayName || 'N/A'}`);
        console.log(`      Enable Access Logging: ${deployment.enableAccessLogging || false}`);
        console.log(`      Dedicated Resources: ${deployment.dedicatedResources ? 'Yes' : 'No'}`);
        
        if (deployment.dedicatedResources) {
          console.log(`      Machine Type: ${deployment.dedicatedResources.machineSpec?.machineType || 'N/A'}`);
          console.log(`      Min Replica Count: ${deployment.dedicatedResources.minReplicaCount || 'N/A'}`);
          console.log(`      Max Replica Count: ${deployment.dedicatedResources.maxReplicaCount || 'N/A'}`);
        }
      });

      // The deployment ID is the 'id' field, not the index ID
      const deploymentId = endpointData.deployedIndexes[0].id;
      console.log(`\n✅ Deployment ID: ${deploymentId}`);
      console.log(`\n💡 Update your .env:`);
      console.log(`   VECTOR_SEARCH_DEPLOYMENT_ID=${deploymentId}`);
      
      return deploymentId;
    } else {
      console.log('⚠️  No deployed indexes found on this endpoint');
      return null;
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getDeploymentId().catch(console.error);

