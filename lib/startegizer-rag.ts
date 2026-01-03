/**
 * Startegizer RAG (Retrieval-Augmented Generation) Engine
 * Retrieves relevant context from Market Scan articles and AI Governance standards
 * 
 * Uses keyword search as primary method (cost-effective, proven quality)
 * Note: Semantic search via Vector Search requires streaming indexes (higher cost)
 */

import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  url?: string | null;
  type: 'market_scan' | 'standard' | 'framework';
  relevanceScore: number;
  metadata?: {
    jurisdiction?: string;
    domain?: string;
    topic?: string;
    publishedDate?: Date;
  };
}

export interface RAGContext {
  documents: RAGDocument[];
  query: string;
  totalResults: number;
}

/**
 * Search Market Scan articles using keyword search (cost-effective, proven quality)
 */
async function searchMarketScanKeyword(
  query: string,
  topK: number = 3
): Promise<RAGDocument[]> {
  try {
    console.log('[RAG] Using keyword search for Market Scan articles');
    const queryLower = query.toLowerCase();
    const stopWords = ['what', 'does', 'the', 'say', 'about', 'is', 'are', 'how', 'when', 'where', 'why', 'can', 'will', 'would', 'should', 'could'];
    const keywords = queryLower
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w))
      .slice(0, 5);

    const searchTerms = keywords.length > 0 ? keywords : [queryLower.substring(0, 20)];

    const articles = await prisma.marketScanArticle.findMany({
      where: {
        sourceType: { not: 'STANDARD' },
        OR: [
          { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { summary: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ...searchTerms.map(term => ({ title: { contains: term, mode: Prisma.QueryMode.insensitive } })),
          ...searchTerms.map(term => ({ summary: { contains: term, mode: Prisma.QueryMode.insensitive } })),
          { keyTopics: { hasSome: searchTerms } },
          { affectedFrameworks: { hasSome: searchTerms } },
        ],
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: topK,
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        source: true,
        sourceUrl: true,
        jurisdiction: true,
        publishedAt: true,
        relevanceScore: true,
        keyTopics: true,
        affectedFrameworks: true,
      },
    });

    return articles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.summary || article.content.substring(0, 1000),
      source: article.source,
      url: article.sourceUrl,
      type: 'market_scan' as const,
      relevanceScore: article.relevanceScore,
      metadata: {
        jurisdiction: article.jurisdiction || undefined,
        publishedDate: article.publishedAt,
      },
    }));
  } catch (error: any) {
    console.error('[RAG] Error searching Market Scan:', error);
    return [];
  }
}

/**
 * Search AI Governance standards and frameworks using keyword search (cost-effective, proven quality)
 */
async function searchStandardsKeyword(
  query: string,
  topK: number = 3
): Promise<RAGDocument[]> {
  try {
    console.log('[RAG] Using keyword search for standards');
    const queryLower = query.toLowerCase();
    const stopWords = ['what', 'does', 'the', 'say', 'about', 'is', 'are', 'how', 'when', 'where', 'why', 'can', 'will', 'would', 'should', 'could'];
    const keywords = queryLower
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w))
      .slice(0, 5);

    const searchTerms = keywords.length > 0 ? keywords : [queryLower.substring(0, 20)];

    const standards = await prisma.marketScanArticle.findMany({
      where: {
        sourceType: 'STANDARD',
        OR: [
          { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { summary: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ...searchTerms.map(term => ({ title: { contains: term, mode: Prisma.QueryMode.insensitive } })),
          ...searchTerms.map(term => ({ summary: { contains: term, mode: Prisma.QueryMode.insensitive } })),
          { keyTopics: { hasSome: searchTerms } },
          { affectedFrameworks: { hasSome: searchTerms } },
        ],
      },
      orderBy: [
        { relevanceScore: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: topK,
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        source: true,
        sourceUrl: true,
        jurisdiction: true,
        publishedAt: true,
        relevanceScore: true,
        keyTopics: true,
        affectedFrameworks: true,
      },
    });

    return standards.map(standard => ({
      id: standard.id,
      title: standard.title,
      content: standard.summary || standard.content.substring(0, 1000),
      source: standard.source,
      url: standard.sourceUrl,
      type: 'standard' as const,
      relevanceScore: standard.relevanceScore,
      metadata: {
        jurisdiction: standard.jurisdiction || undefined,
        publishedDate: standard.publishedAt,
      },
    }));
  } catch (error: any) {
    console.error('[RAG] Error searching standards:', error);
    return [];
  }
}

/**
 * Retrieve RAG context for a user query
 * Combines results from Market Scan and Standards
 */
export async function retrieveRAGContext(
  query: string,
  options: {
    marketScanTopK?: number;
    standardsTopK?: number;
    minRelevanceScore?: number;
  } = {}
): Promise<RAGContext> {
  const {
    marketScanTopK = 3,
    standardsTopK = 3,
    minRelevanceScore = 0.3,
  } = options;

  console.log(`[RAG] Retrieving context for query: "${query}"`);

  // Use keyword search as primary method (cost-effective, proven quality)
  console.log("[RAG] Using keyword search (cost-effective, proven quality)...");
  
  // Search both knowledge bases in parallel
  const [marketScanResults, standardsResults] = await Promise.all([
    searchMarketScanKeyword(query, marketScanTopK),
    searchStandardsKeyword(query, standardsTopK),
  ]);

  // Combine and filter by relevance
  let filteredResults = [...marketScanResults, ...standardsResults]
    .filter(doc => doc.relevanceScore >= minRelevanceScore);
  
  // If no results above threshold, accept all (keyword search is lenient)
  if (filteredResults.length === 0) {
    console.log(`[RAG] No results above threshold ${minRelevanceScore}, accepting all results`);
    filteredResults = [...marketScanResults, ...standardsResults];
  }
  
  const allResults = filteredResults
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, marketScanTopK + standardsTopK); // Limit total results

  console.log(`[RAG] Found ${allResults.length} relevant documents using keyword search (${marketScanResults.length} articles, ${standardsResults.length} standards)`);

  return {
    documents: allResults,
    query,
    totalResults: allResults.length,
  };
}

/**
 * Format RAG context for prompt inclusion
 */
export function formatRAGContext(context: RAGContext): string {
  if (context.documents.length === 0) {
    return '';
  }

  const formattedDocs = context.documents.map((doc, idx) => {
    const citation = `[${idx + 1}]`;
    const source = doc.url ? `${doc.source} (${doc.url})` : doc.source;
    const content = doc.content.length > 500 
      ? doc.content.substring(0, 500) + '...' 
      : doc.content;

    return `${citation} ${doc.title}
Source: ${source}
Type: ${doc.type === 'market_scan' ? 'Market Scan Article' : 'Standard/Framework'}
${doc.metadata?.jurisdiction ? `Jurisdiction: ${doc.metadata.jurisdiction}` : ''}
Content: ${content}`;
  }).join('\n\n');

  return `**Relevant Context from Knowledge Base:**

${formattedDocs}

**Instructions**: Use the above context to provide accurate, cited answers. Reference sources using [1], [2], etc.`;
}

/**
 * Generate citations list for UI display
 */
export function generateCitations(context: RAGContext): Array<{
  number: number;
  title: string;
  source: string;
  url?: string | null;
  type: string;
}> {
  return context.documents.map((doc, idx) => ({
    number: idx + 1,
    title: doc.title,
    source: doc.source,
    url: doc.url,
    type: doc.type === 'market_scan' ? 'Article' : 'Standard',
  }));
}

