/**
 * Batch Index Storage Service
 * 
 * Handles indexing documents in Vector Search using Cloud Storage import
 * Required for indexes created with "Batch" update method
 */

import { getVectorSearchConfig, isVectorSearchConfigured } from "./config";
import { VectorDocument } from "./types";
import { generateEmbeddingsBatch } from "./embeddings";

/**
 * Index documents using Cloud Storage import (for batch indexes)
 */
export async function batchIndexDocumentsViaGCS(
  docs: Array<Omit<VectorDocument, 'embedding'> & { text: string }>,
  gcsBucket: string,
  gcsPath: string = '' // Empty string = root directory (required by Vector Search)
): Promise<string[]> {
  if (!isVectorSearchConfigured()) {
    console.warn("[VECTOR_DB] Vector Search not configured, skipping batch indexing");
    return [];
  }

  if (docs.length === 0) {
    return [];
  }

  try {
    const config = getVectorSearchConfig();
    
    // Generate embeddings in batch
    const texts = docs.map(doc => doc.text);
    const embeddings = await generateEmbeddingsBatch(texts);

    if (embeddings.length !== docs.length) {
      throw new Error(`Embedding count mismatch: expected ${docs.length}, got ${embeddings.length}`);
    }

    // Get access token
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Prepare data in Vector Search import format
    // Format: JSONL (one JSON object per line)
    const importData: any[] = docs.map((doc, idx) => ({
      id: doc.id,
      embedding: embeddings[idx],
      restricts: [
        {
          namespace: 'type',
          allow: [doc.metadata.type],
        },
        ...(doc.metadata.jurisdiction ? [{
          namespace: 'jurisdiction',
          allow: [doc.metadata.jurisdiction],
        }] : []),
      ],
      numericRestricts: [
        ...(doc.metadata.publishedDate ? [{
          namespace: 'publishedDate',
          valueInt: doc.metadata.publishedDate.getTime(),
        }] : []),
      ],
    }));

    // Upload to Cloud Storage as JSONL
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage({ projectId: config.projectId });
    
    // Ensure bucket exists, create if not
    let bucket = storage.bucket(gcsBucket);
    const [bucketExists] = await bucket.exists();
    
    if (!bucketExists) {
      console.log(`[VECTOR_DB] Creating bucket: ${gcsBucket}`);
      await storage.createBucket(gcsBucket, {
        location: config.location,
        storageClass: 'STANDARD',
      });
      bucket = storage.bucket(gcsBucket);
      console.log(`[VECTOR_DB] Bucket created: ${gcsBucket}`);
    }

    // Upload to root directory (no subdirectories allowed except "delete/")
    const fileName = gcsPath ? `${gcsPath}/import-${Date.now()}.jsonl` : `import-${Date.now()}.jsonl`;
    const file = bucket.file(fileName);

    // Convert to JSONL format (one JSON object per line)
    const jsonlContent = importData.map(item => JSON.stringify(item)).join('\n');
    
    await file.save(jsonlContent, {
      contentType: 'application/jsonl',
      metadata: {
        contentType: 'application/jsonl',
      },
    });

    console.log(`[VECTOR_DB] Uploaded ${importData.length} documents to gs://${gcsBucket}/${fileName}`);

    // For batch indexes, use UpdateIndex API with contentsDeltaUri
    const updateApiUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/indexes/${config.indexId}?update_mask=metadata.contentsDeltaUri,metadata.isCompleteOverwrite`;
    
    // Update index to point to the new GCS data
    // For batch indexes, set contentsDeltaUri to the GCS folder containing the data
    // Must be root directory (no subdirectories allowed except "delete/")
    const gcsFolderUri = gcsPath ? `gs://${gcsBucket}/${gcsPath}` : `gs://${gcsBucket}/`;
    
    // Get current index to preserve other fields
    const getIndexUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/indexes/${config.indexId}`;
    const getResponse = await fetch(getIndexUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
      },
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(`Get Index API error: ${getResponse.status} - ${errorText}`);
    }

    const currentIndex = await getResponse.json();
    
    // Update metadata with new contentsDeltaUri
    const updateRequestBody = {
      ...currentIndex,
      metadata: {
        ...currentIndex.metadata,
        contentsDeltaUri: gcsFolderUri,
        isCompleteOverwrite: false, // Partial update (add new data)
      },
    };

    const updateResponse = await fetch(updateApiUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateRequestBody),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Update Index API error: ${updateResponse.status} - ${errorText}`);
    }

    const updateResult = await updateResponse.json();
    console.log(`[VECTOR_DB] Index update operation started`);
    console.log(`[VECTOR_DB] Operation: ${updateResult.name || 'In progress'}`);
    console.log(`[VECTOR_DB] Note: Batch index updates are asynchronous and may take time to process`);
    
    return docs.map(doc => doc.id);
  } catch (error: any) {
    console.error("[VECTOR_DB] Error batch indexing via GCS:", error.message);
    throw new Error(`Failed to batch index documents via GCS: ${error.message}`);
  }
}

