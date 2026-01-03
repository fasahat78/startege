/**
 * Setup Cloud Storage Bucket for Vector Search Import
 * 
 * Creates a GCS bucket for storing Vector Search import data
 */

import 'dotenv/config';
import { Storage } from '@google-cloud/storage';
import { getVectorSearchConfig } from '../lib/vector-db/config';

async function setupGCSBucket() {
  console.log('🚀 Setting up Cloud Storage Bucket for Vector Search...\n');

  try {
    const config = getVectorSearchConfig();
    const bucketName = process.env.GCS_BUCKET_NAME || `${config.projectId}-vector-search`;
    
    console.log(`📦 Bucket Name: ${bucketName}`);
    console.log(`📍 Location: ${config.location}`);
    console.log(`🔑 Project: ${config.projectId}\n`);

    const storage = new Storage({ projectId: config.projectId });
    const bucket = storage.bucket(bucketName);

    // Check if bucket exists
    const [exists] = await bucket.exists();
    
    if (exists) {
      console.log(`✅ Bucket already exists: ${bucketName}`);
      console.log(`   URL: gs://${bucketName}\n`);
    } else {
      console.log(`📦 Creating bucket: ${bucketName}...`);
      
      await storage.createBucket(bucketName, {
        location: config.location,
        storageClass: 'STANDARD',
      });

      console.log(`✅ Bucket created successfully: ${bucketName}`);
      console.log(`   URL: gs://${bucketName}\n`);
    }

    // Set CORS and permissions if needed
    console.log('📋 Bucket Configuration:');
    console.log(`   Name: ${bucketName}`);
    console.log(`   Location: ${config.location}`);
    console.log(`   Storage Class: STANDARD`);
    console.log(`   Purpose: Vector Search import data\n`);

    console.log('✅ Setup complete!');
    console.log(`\nAdd to .env:`);
    console.log(`GCS_BUCKET_NAME=${bucketName}\n`);

  } catch (error: any) {
    console.error('❌ Error setting up bucket:', error.message);
    if (error.message.includes('permission')) {
      console.error('\n💡 Make sure your service account has:');
      console.error('   - Storage Admin role');
      console.error('   - Or Storage Object Creator + Storage Bucket Creator');
    }
    process.exit(1);
  }
}

setupGCSBucket().catch(console.error);

