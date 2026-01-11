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
    console.log(`[VECTOR_DB] Starting semantic search for query: "${query.substring(0, 100)}"`);
    const config = getVectorSearchConfig();
    const topK = options.topK || VECTOR_SEARCH_CONFIG.defaultTopK;
    const minSimilarity = options.minSimilarity || 0.5; // Minimum similarity threshold

    console.log(`[VECTOR_DB] Config:`, {
      projectId: config.projectId,
      location: config.location,
      indexId: config.indexId,
      endpointId: config.endpointId,
      deploymentId: config.deploymentId,
    });

    // Generate query embedding
    console.log(`[VECTOR_DB] Generating query embedding...`);
    const queryEmbedding = await generateQueryEmbedding(query);
    console.log(`[VECTOR_DB] Query embedding generated: ${queryEmbedding.length} dimensions`);
    
    // Call Vertex AI Vector Search REST API
    // For batch indexes deployed to endpoints, use findNeighbors
    // Try using the public domain endpoint first (recommended for REST API)
    // Public domain format: https://{PUBLIC_DOMAIN}/v1beta1/{INDEX_ENDPOINT}:findNeighbors
    // Standard format: https://{LOCATION}-aiplatform.googleapis.com/v1/{INDEX_ENDPOINT}:findNeighbors
    
    const indexEndpointPath = `projects/${config.projectId}/locations/${config.location}/indexEndpoints/${config.endpointId}`;
    
    // Use public domain endpoint if available, otherwise fallback to standard endpoint
    // Public domain: 1305817985.us-central1-785373873454.vdb.vertexai.goog
    let apiUrl: string;
    if (config.publicDomainName) {
      // Use public domain endpoint with v1beta1 API version
      apiUrl = `https://${config.publicDomainName}/v1beta1/${indexEndpointPath}:findNeighbors`;
      console.log(`[VECTOR_DB] Using public domain endpoint: ${apiUrl}`);
    } else {
      // Fallback to standard Vertex AI endpoint
      apiUrl = `https://${config.location}-aiplatform.googleapis.com/v1/${indexEndpointPath}:findNeighbors`;
      console.log(`[VECTOR_DB] Using standard endpoint: ${apiUrl}`);
    }
    
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
    console.log(`[VECTOR_DB] API Response received:`, {
      hasNearestNeighbors: !!data.nearestNeighbors,
      nearestNeighborsLength: data.nearestNeighbors?.length || 0,
      neighborsCount: data.nearestNeighbors?.[0]?.neighbors?.length || 0,
      fullResponse: JSON.stringify(data).substring(0, 1000), // First 1000 chars of response
    });
    
    // Transform results to SearchResult format
    const results: SearchResult[] = [];
    
    if (data.nearestNeighbors && data.nearestNeighbors.length > 0) {
      const neighbors = data.nearestNeighbors[0].neighbors || [];
      
      console.log(`[VECTOR_DB] Processing ${neighbors.length} neighbors from API response`);
      
      // Extract datapoint IDs
      const datapointIds = neighbors
        .map((n: any) => n.datapoint?.datapointId)
        .filter(Boolean) as string[];
      
      console.log(`[VECTOR_DB] Extracted ${datapointIds.length} datapoint IDs`);
      
      if (datapointIds.length === 0) {
        console.log(`[VECTOR_DB] No datapoint IDs found - neighbors structure:`, {
          sampleNeighbor: neighbors[0] ? {
            hasDatapoint: !!neighbors[0].datapoint,
            datapointKeys: neighbors[0].datapoint ? Object.keys(neighbors[0].datapoint) : [],
            distance: neighbors[0].distance,
          } : null,
        });
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

      console.log(`[VECTOR_DB] Processing ${neighbors.length} neighbors, minSimilarity threshold: ${minSimilarity}`);
      
      // Build results with metadata from database
      let filteredCount = 0;
      for (const neighbor of neighbors) {
        const distance = neighbor.distance || 0;
        const similarityScore = 1 - distance; // Convert distance to similarity
        
        // Log first few neighbors for debugging
        if (results.length < 3) {
          console.log(`[VECTOR_DB] Neighbor ${results.length + 1}:`, {
            datapointId: neighbor.datapoint?.datapointId,
            distance,
            similarityScore,
            passesThreshold: similarityScore >= minSimilarity,
          });
        }
        
        // Filter by minimum similarity
        if (similarityScore < minSimilarity) {
          filteredCount++;
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
    
    console.log(`[VECTOR_DB] Final results: ${results.length} after filtering (${filteredCount} filtered out by similarity threshold)`);
    
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
  console.log(`[VECTOR_DB] searchMarketScanSemantic called with query: "${query.substring(0, 100)}", topK: ${topK}`);
  try {
    const results = await semanticSearch(query, {
      topK,
      filter: { type: 'market_scan' },
      minSimilarity: 0.6, // Higher threshold for articles
    });
    console.log(`[VECTOR_DB] searchMarketScanSemantic returned ${results.length} results`);
    return results;
  } catch (error: any) {
    console.error(`[VECTOR_DB] searchMarketScanSemantic error:`, error.message);
    throw error;
  }
}

/**
 * Search Standards/Frameworks using semantic search
 */
export async function searchStandardsSemantic(
  query: string,
  topK: number = 3
): Promise<SearchResult[]> {
  console.log(`[VECTOR_DB] searchStandardsSemantic called with query: "${query.substring(0, 100)}", topK: ${topK}`);
  try {
    const results = await semanticSearch(query, {
      topK,
      filter: { type: 'standard' },
      minSimilarity: 0.5, // Lower threshold for standards (more lenient)
    });
    console.log(`[VECTOR_DB] searchStandardsSemantic returned ${results.length} results`);
    return results;
  } catch (error: any) {
    console.error(`[VECTOR_DB] searchStandardsSemantic error:`, error.message);
    throw error;
  }
}
