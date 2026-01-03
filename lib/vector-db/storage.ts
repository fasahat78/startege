/**
 * Vector Search Storage Service
 * 
 * Handles indexing documents in Vertex AI Vector Search
 * Stores embeddings and metadata for semantic search
 */

import { getVectorSearchConfig, isVectorSearchConfigured } from "./config";
import { VectorDocument } from "./types";
import { generateEmbedding } from "./embeddings";

/**
 * Index a single document in Vector Search
 */
export async function indexDocument(doc: Omit<VectorDocument, 'embedding'> & { text: string }): Promise<string> {
  if (!isVectorSearchConfigured()) {
    console.warn("[VECTOR_DB] Vector Search not configured, skipping indexing");
    return '';
  }

  try {
    const config = getVectorSearchConfig();
    
    // Generate embedding for the document text
    const embedding = await generateEmbedding(doc.text);
    
    // Get access token for authentication
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Prepare datapoint for indexing
    const datapoint = {
      datapointId: doc.id,
      featureVector: embedding,
      restricts: [
        {
          namespace: 'type',
          allowList: [doc.metadata.type],
        },
        ...(doc.metadata.jurisdiction ? [{
          namespace: 'jurisdiction',
          allowList: [doc.metadata.jurisdiction],
        }] : []),
      ],
      numericRestricts: [
        ...(doc.metadata.publishedDate ? [{
          namespace: 'publishedDate',
          valueInt: doc.metadata.publishedDate.getTime(),
        }] : []),
      ],
    };

    // For batch update method, we need to use importData instead of upsertDatapoints
    // First, upload to Cloud Storage, then import
    // For now, let's use the importData API with inline data
    const apiUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/indexes/${config.indexId}:importData`;
    
    const requestBody = {
      gcsSource: {
        inputUris: [], // We'll use inline data instead
      },
      dataItemLabels: {
        'aiplatform.googleapis.com/ml_use': 'training',
      },
      // For batch method, we need to provide data inline or via GCS
      // Let's use a workaround: create a temporary approach
    };

    // Actually, for batch indexes, we need to use Cloud Storage
    // But as a workaround, let's try using the deployed index endpoint's upsertDatapoints
    // which might work even for batch indexes
    const endpointApiUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/indexEndpoints/${config.endpointId}:upsertDatapoints`;
    
    const endpointRequestBody = {
      index: config.indexId,
      datapoints: [datapoint],
    };

    const response = await fetch(endpointApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(endpointRequestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If this fails, the index is batch-only and needs GCS import
      throw new Error(`Vector Search API error: ${response.status} - ${errorText}`);
    }

    console.log(`[VECTOR_DB] Indexed document: ${doc.id} (${doc.metadata.title})`);
    return doc.id;
  } catch (error: any) {
    console.error(`[VECTOR_DB] Error indexing document ${doc.id}:`, error.message);
    throw new Error(`Failed to index document: ${error.message}`);
  }
}

/**
 * Index multiple documents in batch (more efficient)
 */
export async function batchIndexDocuments(
  docs: Array<Omit<VectorDocument, 'embedding'> & { text: string }>
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
    const { generateEmbeddingsBatch } = await import('./embeddings');
    const embeddings = await generateEmbeddingsBatch(texts);

    if (embeddings.length !== docs.length) {
      throw new Error(`Embedding count mismatch: expected ${docs.length}, got ${embeddings.length}`);
    }

    // Get access token for authentication
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Prepare datapoints
    const datapoints = docs.map((doc, idx) => ({
      datapointId: doc.id,
      featureVector: embeddings[idx],
      restricts: [
        {
          namespace: 'type',
          allowList: [doc.metadata.type],
        },
        ...(doc.metadata.jurisdiction ? [{
          namespace: 'jurisdiction',
          allowList: [doc.metadata.jurisdiction],
        }] : []),
      ],
      numericRestricts: [
        ...(doc.metadata.publishedDate ? [{
          namespace: 'publishedDate',
          valueInt: doc.metadata.publishedDate.getTime(),
        }] : []),
      ],
    }));

    // Try streaming API first (for streaming indexes)
    // If that fails with 404 or StreamUpdate error, fall back to GCS import
    const batchSize = 100;
    const indexedIds: string[] = [];
    
    // Try endpoint API first
    let useGCSImport = false;
    const endpointApiUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/indexEndpoints/${config.endpointId}:upsertDatapoints`;

    for (let i = 0; i < datapoints.length; i += batchSize) {
      const batch = datapoints.slice(i, i + batchSize);
      
      if (!useGCSImport) {
        // Try streaming API
        const requestBody = {
          index: config.indexId,
          datapoints: batch,
        };

        const response = await fetch(endpointApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          // If 404 or StreamUpdate error, switch to GCS import
          if (response.status === 404 || errorText.includes('StreamUpdate') || errorText.includes('not enabled')) {
            console.log(`[VECTOR_DB] Streaming API not available, switching to Cloud Storage import...`);
            useGCSImport = true;
            // Fall through to GCS import
          } else {
            throw new Error(`Vector Search API error: ${response.status} - ${errorText}`);
          }
        } else {
          // Success with streaming API
          indexedIds.push(...batch.map(d => d.datapointId));
          console.log(`[VECTOR_DB] Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(datapoints.length / batchSize)}`);
          continue;
        }
      }

      // Use Cloud Storage import for batch indexes
      if (useGCSImport) {
        const gcsBucket = process.env.GCS_BUCKET_NAME || `${config.projectId}-vector-search`;
        const { batchIndexDocumentsViaGCS } = await import('./storage-batch');
        
        // Process ALL documents via GCS (single import operation for efficiency)
        console.log(`[VECTOR_DB] Using Cloud Storage import for all ${docs.length} documents...`);
        console.log(`[VECTOR_DB] This will upload to gs://${gcsBucket} and trigger import operation`);
        const gcsIndexedIds = await batchIndexDocumentsViaGCS(docs, gcsBucket);
        indexedIds.push(...gcsIndexedIds);
        break; // Exit loop, GCS import handles all documents
      }
    }

    console.log(`[VECTOR_DB] Successfully indexed ${indexedIds.length} documents`);
    return indexedIds;
  } catch (error: any) {
    console.error("[VECTOR_DB] Error batch indexing documents:", error.message);
    throw new Error(`Failed to batch index documents: ${error.message}`);
  }
}

/**
 * Update an existing document in Vector Search
 */
export async function updateDocument(
  docId: string,
  doc: Omit<VectorDocument, 'embedding' | 'id'> & { text: string }
): Promise<void> {
  // Update is same as index (upsert)
  await indexDocument({ ...doc, id: docId });
}

/**
 * Delete a document from Vector Search
 */
export async function deleteDocument(docId: string): Promise<void> {
  if (!isVectorSearchConfigured()) {
    console.warn("[VECTOR_DB] Vector Search not configured, skipping deletion");
    return;
  }

  try {
    const config = getVectorSearchConfig();
    
    // Get access token for authentication
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Use endpoint API for deletion (works for both batch and streaming)
    const endpointApiUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/indexEndpoints/${config.endpointId}:removeDatapoints`;
    
    const requestBody = {
      index: config.indexId,
      datapointIds: [docId],
    };

    const response = await fetch(endpointApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vector Search API error: ${response.status} - ${errorText}`);
    }
    console.log(`[VECTOR_DB] Deleted document: ${docId}`);
  } catch (error: any) {
    console.error(`[VECTOR_DB] Error deleting document ${docId}:`, error.message);
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}

