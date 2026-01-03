/**
 * Content Fetcher for Market Scan
 * Fetches articles from various verified sources
 */

import { ScanSource } from './sources';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000, // 10 second timeout
  maxRedirects: 5,
});

export interface FetchedArticle {
  title: string;
  content: string;
  url: string;
  publishedAt: Date;
  source: string;
  sourceType: string;
  jurisdiction?: string;
  category?: string[];
}

/**
 * Fetch articles from a source
 */
export async function fetchFromSource(source: ScanSource): Promise<FetchedArticle[]> {
  console.log(`[MARKET_SCAN_FETCHER] Fetching from source: ${source.name} (${source.type})`);
  
  try {
    switch (source.type) {
      case 'RSS':
        return await fetchFromRSS(source);
      case 'API':
        return await fetchFromAPI(source);
      case 'SCRAPE':
        // TODO: Implement web scraping for sources without RSS/API
        console.warn(`[MARKET_SCAN_FETCHER] Scraping not yet implemented for ${source.name}`);
        return [];
      case 'MANUAL':
        // Manual sources are handled separately
        return [];
      default:
        console.warn(`[MARKET_SCAN_FETCHER] Unknown source type: ${source.type}`);
        return [];
    }
  } catch (error: any) {
    console.error(`[MARKET_SCAN_FETCHER] Error fetching from ${source.name}:`, error.message);
    throw new Error(`Failed to fetch from ${source.name}: ${error.message}`);
  }
}

/**
 * Fetch articles from RSS feed
 */
async function fetchFromRSS(source: ScanSource): Promise<FetchedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);
    
    if (!feed.items || feed.items.length === 0) {
      console.log(`[MARKET_SCAN_FETCHER] No items found in RSS feed: ${source.url}`);
      return [];
    }

    const articles: FetchedArticle[] = feed.items
      .filter(item => item.title && item.link) // Filter out invalid items
      .map(item => ({
        title: item.title || '',
        content: item.contentSnippet || item.content || item.summary || '',
        url: item.link || '',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        source: source.name,
        sourceType: getSourceTypeFromCategory(source.category),
        jurisdiction: source.jurisdiction,
        category: source.category,
      }));

    console.log(`[MARKET_SCAN_FETCHER] Fetched ${articles.length} articles from ${source.name}`);
    return articles;
  } catch (error: any) {
    console.error(`[MARKET_SCAN_FETCHER] RSS parsing error for ${source.name}:`, error.message);
    throw error;
  }
}

/**
 * Fetch articles from API
 * TODO: Implement API fetching based on source configuration
 */
async function fetchFromAPI(source: ScanSource): Promise<FetchedArticle[]> {
  // Placeholder for API-based sources
  console.warn(`[MARKET_SCAN_FETCHER] API fetching not yet implemented for ${source.name}`);
  return [];
}

/**
 * Map source category to SourceType enum
 */
function getSourceTypeFromCategory(categories: string[]): string {
  if (categories.includes('Regulatory Update')) {
    return 'REGULATORY';
  }
  if (categories.includes('Standards')) {
    return 'STANDARD';
  }
  if (categories.includes('News')) {
    return 'NEWS';
  }
  if (categories.includes('Case Study') || categories.includes('Enforcement')) {
    return 'CASE_STUDY';
  }
  return 'NEWS'; // Default
}

