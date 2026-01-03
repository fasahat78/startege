/**
 * Type definitions for Vector Search documents and operations
 */

export interface VectorDocument {
  id: string;
  embedding: number[];
  metadata: {
    title: string;
    content: string;
    source: string;
    url?: string | null;
    type: 'market_scan' | 'standard' | 'framework';
    jurisdiction?: string | null;
    publishedDate?: Date | null;
    relevanceScore?: number;
    // Additional metadata
    [key: string]: any;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  url?: string | null;
  type: 'market_scan' | 'standard' | 'framework';
  similarityScore: number; // 0-1, higher is more similar
  metadata?: {
    jurisdiction?: string;
    publishedDate?: Date;
    [key: string]: any;
  };
}

export interface SearchFilter {
  type?: 'market_scan' | 'standard' | 'framework';
  jurisdiction?: string;
  minDate?: Date;
  maxDate?: Date;
  source?: string;
}

export interface VectorSearchOptions {
  topK?: number;
  filter?: SearchFilter;
  minSimilarity?: number; // Minimum similarity score threshold
}

