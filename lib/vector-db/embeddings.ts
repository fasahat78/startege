/**
 * Embedding Generation Service
 * 
 * Generates embeddings using Vertex AI Embeddings API
 * Uses text-embedding-004 model (768 dimensions)
 */

import { VertexAI } from "@google-cloud/vertexai";
import { VECTOR_SEARCH_CONFIG, getVectorSearchConfig } from "./config";

let vertexAIInstance: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertexAIInstance) {
    const config = getVectorSearchConfig();
    vertexAIInstance = new VertexAI({
      project: config.projectId,
      location: config.location,
    });
  }
  return vertexAIInstance;
}

/**
 * Generate embedding for a single text
 * Uses text-embedding-004 model with RETRIEVAL_DOCUMENT task type
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const config = getVectorSearchConfig();
    
    // Use REST API directly for embeddings (more reliable)
    const apiUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${VECTOR_SEARCH_CONFIG.embeddingModel}:predict`;
    
    // Get access token
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    // For text-embedding-004, use the embeddings API endpoint
    const embeddingsUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${VECTOR_SEARCH_CONFIG.embeddingModel}:predict`;
    
    const requestBody = {
      instances: [
        {
          task_type: "RETRIEVAL_DOCUMENT",
          content: text.substring(0, 10000), // Limit to 10k chars
        },
      ],
    };
    
    const response = await fetch(embeddingsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const embedding = data.predictions?.[0]?.embeddings?.values || data.predictions?.[0]?.embeddings;
    
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Failed to generate embedding: invalid response format");
    }
    
    if (embedding.length !== VECTOR_SEARCH_CONFIG.embeddingDimensions) {
      console.warn(
        `[VECTOR_DB] Expected ${VECTOR_SEARCH_CONFIG.embeddingDimensions} dimensions, got ${embedding.length}`
      );
    }
    
    return embedding;
  } catch (error: any) {
    console.error("[VECTOR_DB] Error generating embedding:", error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embedding for a query
 * Uses RETRIEVAL_QUERY task type for better query matching
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const config = getVectorSearchConfig();
    
    // Use REST API directly for embeddings
    const embeddingsUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${VECTOR_SEARCH_CONFIG.embeddingModel}:predict`;
    
    // Get access token
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    const requestBody = {
      instances: [
        {
          task_type: "RETRIEVAL_QUERY",
          content: query.substring(0, 10000),
        },
      ],
    };
    
    const response = await fetch(embeddingsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Query Embedding API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const embedding = data.predictions?.[0]?.embeddings?.values || data.predictions?.[0]?.embeddings;
    
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Failed to generate query embedding: invalid response format");
    }
    
    return embedding;
  } catch (error: any) {
    console.error("[VECTOR_DB] Error generating query embedding:", error.message);
    throw new Error(`Failed to generate query embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * More efficient than calling generateEmbedding multiple times
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
): Promise<number[][]> {
  try {
    const config = getVectorSearchConfig();
    
    // Get access token for authentication
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    const embeddingsUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${VECTOR_SEARCH_CONFIG.embeddingModel}:predict`;
    
    // Process in batches to avoid rate limits
    const batchSize = 10;
    const results: number[][] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      // Prepare batch request
      const requestBody = {
        instances: batch.map(text => ({
          task_type: taskType,
          content: text.substring(0, 10000),
        })),
      };
      
      const response = await fetch(embeddingsUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Batch Embedding API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Extract embeddings from response
      if (data.predictions && Array.isArray(data.predictions)) {
        for (const prediction of data.predictions) {
          const embedding = prediction.embeddings?.values || prediction.embeddings;
          if (embedding && Array.isArray(embedding)) {
            results.push(embedding);
          } else {
            throw new Error("Failed to extract embedding from batch response");
          }
        }
      } else {
        throw new Error("Invalid batch embedding response format");
      }
      
      // Small delay to avoid rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
  } catch (error: any) {
    console.error("[VECTOR_DB] Error generating batch embeddings:", error.message);
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
}

