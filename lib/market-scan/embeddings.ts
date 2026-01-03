/**
 * Embeddings service for Market Scan
 * Generates embeddings using Vertex AI Embeddings API
 * 
 * Note: Vertex AI Vector Search integration will be added in Phase 4
 * For now, we generate embeddings and store the embeddingId reference
 */

import { VertexAI } from "@google-cloud/vertexai";

let vertexAIInstance: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertexAIInstance) {
    const projectId = process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION || process.env.NEXT_PUBLIC_GCP_LOCATION || "us-central1";
    
    if (!projectId) {
      throw new Error("GCP_PROJECT_ID environment variable is not set");
    }
    
    vertexAIInstance = new VertexAI({
      project: projectId,
      location: location,
    });
  }
  return vertexAIInstance;
}

/**
 * Generate embedding for text using Vertex AI Embeddings API
 * Uses text-embedding-004 model
 * 
 * Now uses the centralized embedding service from lib/vector-db/embeddings
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use the centralized embedding service
    const { generateEmbedding: generateEmbeddingFromService } = await import('@/lib/vector-db/embeddings');
    return await generateEmbeddingFromService(text);
  } catch (error: any) {
    // If Vector Search is not configured, return empty array (graceful degradation)
    if (error.message?.includes('VECTOR_SEARCH') || error.message?.includes('not set')) {
      console.log("[MARKET_SCAN_EMBEDDINGS] Vector Search not configured, skipping embedding generation");
      return [];
    }
    console.error("[MARKET_SCAN_EMBEDDINGS] Error generating embedding:", error.message);
    // Return empty array so articles can still be saved
    return [];
  }
}

/**
 * Create article embedding and store in Vector DB
 * Returns embedding ID for storage in PostgreSQL
 * 
 * TODO: Implement Vertex AI Vector Search integration
 */
export async function createArticleEmbedding(
  articleId: string,
  title: string,
  content: string,
  summary?: string
): Promise<string | undefined> {
  try {
    // TODO: Implement actual embedding generation when Vector Search is set up
    // For now, return undefined so articles can be saved without embeddings
    console.log(`[MARKET_SCAN_EMBEDDINGS] Embedding generation skipped for article ${articleId} (will be implemented in Phase 4)`);
    return undefined;
    
    // Future implementation:
    // const textToEmbed = `${title}\n\n${summary || ''}\n\n${content.substring(0, 2000)}`;
    // const embedding = await generateEmbedding(textToEmbed);
    // // Store in Vertex AI Vector Search and return ID
    // return `embedding-${articleId}`;
  } catch (error: any) {
    console.error("[MARKET_SCAN_EMBEDDINGS] Error creating article embedding:", error.message);
    // Don't throw - return undefined so article can still be saved
    return undefined;
  }
}

