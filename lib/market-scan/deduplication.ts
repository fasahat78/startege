/**
 * Deduplication logic for Market Scan
 * Prevents duplicate articles from being added
 */

import { prisma } from '@/lib/db';

/**
 * Check if an article is a duplicate
 */
export async function isDuplicate(
  title: string,
  url: string,
  content: string
): Promise<boolean> {
  // Check by URL first (fastest and most reliable)
  if (url) {
    const existingByUrl = await prisma.marketScanArticle.findUnique({
      where: { sourceUrl: url },
    });
    if (existingByUrl) {
      console.log(`[MARKET_SCAN_DEDUP] Duplicate found by URL: ${url}`);
      return true;
    }
  }

  // Check by title similarity (fuzzy match)
  const titlePrefix = title.substring(0, 50).trim();
  if (titlePrefix.length > 10) {
    const existingByTitle = await prisma.marketScanArticle.findFirst({
      where: {
        title: {
          contains: titlePrefix,
          mode: 'insensitive',
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    if (existingByTitle) {
      // Simple similarity check: if titles are very similar, consider it a duplicate
      const similarity = calculateTitleSimilarity(title, existingByTitle.title);
      if (similarity > 0.85) {
        console.log(`[MARKET_SCAN_DEDUP] Duplicate found by title similarity (${similarity.toFixed(2)}): ${titlePrefix}...`);
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate simple string similarity (Jaccard similarity on words)
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = new Set(title1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(title2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Check for recent duplicates (within last 7 days)
 * Useful for preventing re-scanning of recent articles
 */
export async function isRecentDuplicate(
  url: string,
  days: number = 7
): Promise<boolean> {
  if (!url) return false;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // @ts-ignore - marketScanArticle model may not exist in schema
  const recent = await prisma.marketScanArticle.findFirst({
    where: {
      sourceUrl: url,
      scannedAt: {
        gte: cutoffDate,
      },
    },
  });

  return !!recent;
}

