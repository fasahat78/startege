/**
 * Semantic Search Service
 * 
 * Performs semantic similarity search using Vertex AI Vector Search
 * Replaces keyword search with vector similarity for better relevance
 * 
 * NOTE: This uses the Vertex AI REST API directly since the SDK doesn't
 * have a direct Vector Search client. We'll use fetch to call the API.
 */

import { getVectorSearchConfig, isVectorSearchConfigured, VECTOR_SEARCH_CONFIG } from "./config";
import { SearchResult, SearchFilter, VectorSearchOptions } from "./types";
import { generateQueryEmbedding } from "./embeddings";

/**
 * Perform semantic search on Vector Search index using REST API
 */
export async function semanticSearch(
  query: string,
  options: VectorSearchOptions = {}
): Promise<SearchResult[]> {
  if (!isVectorSearchConfigured()) {
    console.warn("[VECTOR_DB] Vector Search not configured, falling back to empty results");
    return [];
  }

  try {
    const config = getVectorSearchConfig();
    const topK = options.topK || VECTOR_SEARCH_CONFIG.defaultTopK;
    const minSimilarity = options.minSimilarity || 0.5; // Minimum similarity threshold

    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Call Vertex AI Vector Search REST API
    // For batch indexes deployed to endpoints, use findNeighbors
    // Try using the public domain endpoint first, fallback to standard API endpoint
    // Public domain format: https://{PUBLIC_DOMAIN}/v1beta1/{INDEX_ENDPOINT}:findNeighbors
    // Standard format: https://{LOCATION}-aiplatform.googleapis.com/v1/{INDEX_ENDPOINT}:findNeighbors
    
    // Get public domain name from endpoint if available, otherwise use standard endpoint
    // Note: Public domain is typically: {NUMBER}.{LOCATION}-{PROJECT_NUMBER}.vdb.vertexai.goog
    // For now, use the standard REST API endpoint format
    const indexEndpointPath = `projects/${config.projectId}/locations/${config.location}/indexEndpoints/${config.endpointId}`;
    const apiUrl = `https://${config.location}-aiplatform.googleapis.com/v1/${indexEndpointPath}:findNeighbors`;
    
    console.log(`[VECTOR_DB] API URL: ${apiUrl}`);
    console.log(`[VECTOR_DB] Index endpoint path: ${indexEndpointPath}`);
    
    // Build query datapoint (simplified - no restricts for now to test)
    const queryDatapoint: any = {
      datapointId: `query-${Date.now()}`,
      featureVector: queryEmbedding,
    };
    
    // TODO: Add restricts filtering once basic query works
    // For now, we'll filter results after retrieval
    
    // Use deploymentId if available, otherwise fallback to indexId
    // For batch indexes deployed to endpoints, we need the deployment ID, not the index ID
    const deployedIndexId = config.deploymentId || config.indexId;
    
    const requestBody: any = {
      deployedIndexId: deployedIndexId,
      queries: [
        {
          datapoint: queryDatapoint,
          neighborCount: topK * 2, // Get more results, filter by type after
        },
      ],
      returnFullDatapoint: false, // We only need IDs, will fetch metadata from DB
    };
    
    console.log(`[VECTOR_DB] Querying with deployedIndexId: ${deployedIndexId}`);
    console.log(`[VECTOR_DB] Request details:`, {
      apiUrl,
      deployedIndexId,
      queryEmbeddingLength: queryEmbedding.length,
      neighborCount: topK * 2,
    });

    // Get access token for authentication
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const response = await fetch(apiUrl, {
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

    const data = await response.json();
    
    // Transform results to SearchResult format
    const results: SearchResult[] = [];
    
    if (data.nearestNeighbors && data.nearestNeighbors.length > 0) {
      const neighbors = data.nearestNeighbors[0].neighbors || [];
      
      // Extract datapoint IDs
      const datapointIds = neighbors
        .map((n: any) => n.datapoint?.datapointId)
        .filter(Boolean) as string[];
      
      if (datapointIds.length === 0) {
        return [];
      }

      // Fetch metadata from database
      const { prisma } = await import('@/lib/db');
      const articles = await prisma.marketScanArticle.findMany({
        where: {
          id: { in: datapointIds },
        },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          source: true,
          sourceUrl: true,
          jurisdiction: true,
          publishedAt: true,
          sourceType: true,
        },
      });

      // Create a map for quick lookup
      const articleMap = new Map(articles.map(a => [a.id, a]));

      // Build results with metadata from database
      for (const neighbor of neighbors) {
        const distance = neighbor.distance || 0;
        const similarityScore = 1 - distance; // Convert distance to similarity
        
        // Filter by minimum similarity
        if (similarityScore < minSimilarity) {
          continue;
        }

        const datapointId = neighbor.datapoint?.datapointId;
        if (!datapointId) continue;

        const article = articleMap.get(datapointId);
        if (!article) {
          console.warn(`[VECTOR_DB] Article not found for datapointId: ${datapointId}`);
          continue;
        }

        const type = article.sourceType === 'STANDARD' ? 'standard' : 'market_scan';
        
        // Apply filter if specified (filter by type after retrieval)
        if (options.filter?.type && type !== options.filter.type) {
          continue;
        }
        
        // Apply other filters if specified
        if (options.filter?.jurisdiction && article.jurisdiction !== options.filter.jurisdiction) {
          continue;
        }
        
        if (options.filter?.source && article.source !== options.filter.source) {
          continue;
        }
        
        results.push({
          id: article.id,
          title: article.title,
          content: article.summary || article.content.substring(0, 1000),
          source: article.source,
          url: article.sourceUrl,
          type: type as 'market_scan' | 'standard' | 'framework',
          similarityScore,
          metadata: {
            jurisdiction: article.jurisdiction || undefined,
            publishedDate: article.publishedAt,
          },
        });
      }
    }

    // Sort by similarity score (descending)
    results.sort((a, b) => b.similarityScore - a.similarityScore);
    
    // Apply topK limit after filtering
    return results.slice(0, topK);
  } catch (error: any) {
    console.error("[VECTOR_DB] Error performing semantic search:", error.message);
    console.error("[VECTOR_DB] Error details:", {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      status: error.status || 'unknown',
    });
    // Return empty results on error (graceful degradation)
    return [];
  }
}

/**
 * Search Market Scan articles using semantic search
 */
export async function searchMarketScanSemantic(
  query: string,
  topK: number = 3
): Promise<SearchResult[]> {
  return semanticSearch(query, {
    topK,
    filter: { type: 'market_scan' },
    minSimilarity: 0.6, // Higher threshold for articles
  });
}

/**
 * Search Standards/Frameworks using semantic search
 */
export async function searchStandardsSemantic(
  query: string,
  topK: number = 3
): Promise<SearchResult[]> {
  return semanticSearch(query, {
    topK,
    filter: { type: 'standard' },
    minSimilarity: 0.5, // Lower threshold for standards (more lenient)
  });
}
