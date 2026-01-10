/**
 * Market Scan Orchestrator
 * Coordinates the daily scanning process
 */

import { prisma } from '@/lib/db';
import { VERIFIED_SOURCES, getEnabledSources } from './sources';
import { fetchFromSource, FetchedArticle } from './fetcher';
import { verifyArticle } from './verifier';
import { isDuplicate } from './deduplication';
import { createArticleEmbedding } from './embeddings';

// Helper functions to extract basic metadata when verification fails
function extractBasicTopics(title: string, content: string): string[] {
  const text = (title + ' ' + content).toLowerCase();
  const topics: string[] = [];
  
  if (text.includes('ai') || text.includes('artificial intelligence')) topics.push('AI Governance');
  if (text.includes('gdpr') || text.includes('data protection')) topics.push('Data Protection');
  if (text.includes('regulation') || text.includes('regulatory')) topics.push('Regulation');
  if (text.includes('compliance')) topics.push('Compliance');
  if (text.includes('bias') || text.includes('fairness')) topics.push('Algorithmic Bias');
  if (text.includes('transparency') || text.includes('explainability')) topics.push('Transparency');
  if (text.includes('privacy')) topics.push('Privacy');
  if (text.includes('ethics') || text.includes('ethical')) topics.push('Ethics');
  
  return topics.length > 0 ? topics : ['AI Governance'];
}

function extractFrameworks(content: string): string[] {
  const text = content.toLowerCase();
  const frameworks: string[] = [];
  
  if (text.includes('gdpr')) frameworks.push('GDPR');
  if (text.includes('ai act') || text.includes('artificial intelligence act')) frameworks.push('AI Act');
  if (text.includes('iso 42001') || text.includes('iso/iec 42001')) frameworks.push('ISO 42001');
  if (text.includes('nist')) frameworks.push('NIST AI Framework');
  if (text.includes('ccpa')) frameworks.push('CCPA');
  
  return frameworks;
}

export interface ScanResult {
  scanJobId: string;
  articlesFound: number;
  articlesProcessed: number;
  articlesAdded: number;
  errors: any[];
}

/**
 * Run daily market scan
 */
export async function runDailyScan(): Promise<ScanResult> {
  console.log('[MARKET_SCAN] Starting daily scan...');
  
  // Create scan job record
  const scanJob = await prisma.scanJob.create({
    data: {
      scanType: 'DAILY_NEWS',
      status: 'RUNNING',
    },
  });

  let articlesFound = 0;
  let articlesProcessed = 0;
  let articlesAdded = 0;
  const errors: any[] = [];

  try {
    const enabledSources = getEnabledSources();
    console.log(`[MARKET_SCAN] Processing ${enabledSources.length} enabled sources`);

    for (const source of enabledSources) {
      try {
        console.log(`[MARKET_SCAN] Fetching from source: ${source.name}`);
        
        // Fetch articles from source
        const fetchedArticles = await fetchFromSource(source);
        articlesFound += fetchedArticles.length;
        console.log(`[MARKET_SCAN] Found ${fetchedArticles.length} articles from ${source.name}`);

        // Process each article
        for (const article of fetchedArticles) {
          try {
            articlesProcessed++;

            // Check for duplicates
            const isDup = await isDuplicate(article.title, article.url, article.content);
            if (isDup) {
              console.log(`[MARKET_SCAN] ⚠️ Skipping duplicate: ${article.title.substring(0, 50)}...`);
              continue;
            }
            console.log(`[MARKET_SCAN] ✅ Article passed duplicate check: ${article.title.substring(0, 50)}...`);

            // Verify relevance
            console.log(`[MARKET_SCAN] Verifying article: ${article.title.substring(0, 50)}...`);
            const verification = await verifyArticle(
              article.title,
              article.content,
              article.source
            );

            console.log(`[MARKET_SCAN] Verification result for "${article.title.substring(0, 50)}...": verified=${verification.isVerified}, score=${verification.relevanceScore}, reason=${verification.reason || 'N/A'}`);

            // TEMPORARY: For testing, accept articles even if verification fails
            // Extract basic metadata from article if verification failed
            let metadata = verification;
            if (!verification.isVerified && verification.relevanceScore === 0) {
              // Verification failed - extract basic metadata from article content
              console.log(`[MARKET_SCAN] ⚠️ Verification failed, extracting basic metadata from article content`);
              metadata = {
                ...verification,
                isVerified: true, // Accept for testing
                relevanceScore: 0.5, // Default score
                summary: article.content.substring(0, 200) + '...',
                keyTopics: extractBasicTopics(article.title, article.content),
                affectedFrameworks: extractFrameworks(article.content),
                riskAreas: [],
                readingTimeMinutes: Math.ceil(article.content.split(/\s+/).length / 200),
              };
            }
            
            // Skip only if explicitly rejected with very low score
            if (!metadata.isVerified && metadata.relevanceScore < 0.1) {
              console.log(`[MARKET_SCAN] ⚠️ Skipping article (verified: ${metadata.isVerified}, score: ${metadata.relevanceScore}, reason: ${metadata.reason || 'N/A'})`);
              continue;
            }
            
            console.log(`[MARKET_SCAN] ✅ Article accepted: ${article.title.substring(0, 50)}... (score: ${metadata.relevanceScore})`);

            // Generate embedding (optional - won't block article creation)
            let embeddingId: string | undefined;
            try {
              embeddingId = await createArticleEmbedding(
                `article-${Date.now()}-${articlesProcessed}`,
                article.title,
                article.content,
                verification.summary
              );
              if (embeddingId) {
                console.log(`[MARKET_SCAN] ✅ Generated embedding: ${embeddingId}`);
              } else {
                console.log(`[MARKET_SCAN] ℹ️ Embedding skipped (not yet implemented)`);
              }
            } catch (embedError: any) {
              console.warn(`[MARKET_SCAN] ⚠️ Embedding generation failed (non-blocking): ${embedError.message}`);
              // Continue without embedding - article can still be saved
              embeddingId = undefined;
            }

            // Store in PostgreSQL with enhanced metadata
            try {
              await prisma.marketScanArticle.create({
                data: {
                  title: article.title,
                  content: article.content,
                  summary: metadata.summary,
                  source: article.source,
                  sourceUrl: article.url,
                  sourceType: article.sourceType as any,
                  category: article.category?.[0] || 'News',
                  jurisdiction: article.jurisdiction || null,
                  publishedAt: article.publishedAt,
                  relevanceScore: metadata.relevanceScore,
                  relevanceTags: metadata.affectedFrameworks,
                  keyTopics: metadata.keyTopics || [],
                  affectedFrameworks: metadata.affectedFrameworks || [],
                  riskAreas: metadata.riskAreas || [],
                  complianceImpact: metadata.complianceImpact as any,
                  
                  // Enhanced metadata (use verification data if available, otherwise null)
                  sentiment: metadata.sentiment as any,
                  urgency: metadata.urgency as any,
                  // Normalize impactScope: convert 'industry-specific' to 'industry_specific' if needed
                  impactScope: metadata.impactScope === 'industry-specific' ? 'industry_specific' : (metadata.impactScope as any),
                  affectedIndustries: metadata.affectedIndustries || [],
                  regulatoryBodies: metadata.regulatoryBodies || [],
                  relatedRegulations: metadata.relatedRegulations || [],
                  actionItems: metadata.actionItems || [],
                  timeline: metadata.timeline || null,
                  geographicRegions: metadata.geographicRegions || [],
                  mentionedEntities: metadata.mentionedEntities || [],
                  enforcementActions: metadata.enforcementActions || [],
                  readingTimeMinutes: metadata.readingTimeMinutes || Math.ceil(article.content.split(/\s+/).length / 200),
                  complexityLevel: metadata.complexityLevel as any,
                  language: metadata.language || 'en',
                  author: metadata.author || null,
                  publisher: metadata.publisher || null,
                  
                  embeddingId,
                },
              });

              articlesAdded++;
              console.log(`[MARKET_SCAN] ✅ Added article: ${article.title.substring(0, 50)}...`);
            } catch (dbError: any) {
              console.error(`[MARKET_SCAN] Database error creating article:`, dbError);
              throw dbError;
            }
          } catch (error: any) {
            const errorMsg = `Error processing article "${article.title}": ${error.message}`;
            console.error(`[MARKET_SCAN] ${errorMsg}`);
            errors.push({ article: article.title, error: errorMsg });
          }
        }
      } catch (error: any) {
        const errorMsg = `Error fetching from source "${source.name}": ${error.message}`;
        console.error(`[MARKET_SCAN] ${errorMsg}`);
        errors.push({ source: source.name, error: errorMsg });
      }
    }

    // Update scan job with results
    await prisma.scanJob.update({
      where: { id: scanJob.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        articlesFound,
        articlesProcessed,
        articlesAdded,
        errors: errors.length > 0 ? errors : undefined,
      },
    });

    console.log(`[MARKET_SCAN] ✅ Scan completed: ${articlesAdded} articles added, ${errors.length} errors`);

    return {
      scanJobId: scanJob.id,
      articlesFound,
      articlesProcessed,
      articlesAdded,
      errors,
    };
  } catch (error: any) {
    // Mark scan job as failed
    await prisma.scanJob.update({
      where: { id: scanJob.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errors: [{ error: String(error) }],
      },
    });

    console.error(`[MARKET_SCAN] ❌ Scan failed: ${error.message}`);
    throw error;
  }
}

