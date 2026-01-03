/**
 * Vertex AI Vector Search Configuration
 * 
 * Configuration for Vector Search index and embedding generation
 */

export const VECTOR_SEARCH_CONFIG = {
  // Embedding model configuration
  embeddingModel: 'text-embedding-004',
  embeddingDimensions: 768,
  
  // Vector Search index configuration
  indexId: process.env.VECTOR_SEARCH_INDEX_ID || 'startege-knowledge-base',
  indexEndpoint: process.env.VECTOR_SEARCH_ENDPOINT_ID || '',
  deploymentId: process.env.VECTOR_SEARCH_DEPLOYMENT_ID || '', // Deployment ID (different from index ID)
  indexLocation: process.env.GCP_LOCATION || 'us-central1',
  
  // Search configuration
  defaultTopK: 5,
  maxTopK: 20,
  
  // Distance metric
  distanceMeasureType: 'COSINE_DISTANCE' as const,
  
  // Index algorithm
  algorithmConfig: {
    treeAhConfig: {
      leafNodeEmbeddingCount: 500,
      leafNodesToSearchPercent: 10,
    },
  },
};

/**
 * Check if Vector Search is configured
 */
export function isVectorSearchConfigured(): boolean {
  return !!(
    process.env.GCP_PROJECT_ID &&
    process.env.VECTOR_SEARCH_INDEX_ID &&
    process.env.VECTOR_SEARCH_ENDPOINT_ID
  );
}

/**
 * Get Vector Search project configuration
 */
export function getVectorSearchConfig() {
  const projectId = process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION || process.env.NEXT_PUBLIC_GCP_LOCATION || 'us-central1';
  
  if (!projectId) {
    throw new Error('GCP_PROJECT_ID environment variable is not set');
  }
  
  return {
    projectId,
    location,
    indexId: VECTOR_SEARCH_CONFIG.indexId,
    endpointId: VECTOR_SEARCH_CONFIG.indexEndpoint,
    deploymentId: VECTOR_SEARCH_CONFIG.deploymentId || VECTOR_SEARCH_CONFIG.indexId, // Fallback to indexId if not set
  };
}

