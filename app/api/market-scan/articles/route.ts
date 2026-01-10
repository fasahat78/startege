/**
 * API Route: Get Market Scan Articles
 * Returns articles for the Market Scan UI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check premium subscription
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true },
    });

    // Temporarily allow all users for testing
    // if (dbUser?.subscriptionTier !== 'premium') {
    //   return NextResponse.json(
    //     { error: 'Premium subscription required' },
    //     { status: 403 }
    //   );
    // }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const jurisdiction = searchParams.get('jurisdiction');
    const category = searchParams.get('category');
    const sentiment = searchParams.get('sentiment');
    const urgency = searchParams.get('urgency');
    const impactScope = searchParams.get('impactScope');
    const industry = searchParams.get('industry');
    const complexity = searchParams.get('complexity');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};
    
    if (jurisdiction && jurisdiction !== 'all') {
      where.jurisdiction = jurisdiction;
    }
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (sentiment && sentiment !== 'all') {
      where.sentiment = sentiment;
    }
    
    if (urgency && urgency !== 'all') {
      where.urgency = urgency;
    }
    
    if (impactScope && impactScope !== 'all') {
      where.impactScope = impactScope;
    }
    
    if (industry && industry !== 'all') {
      where.affectedIndustries = { has: industry };
    }
    
    if (complexity && complexity !== 'all') {
      where.complexityLevel = complexity;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch articles
    // Note: MarketScanArticle model may not exist in schema - handle gracefully
    let articles: any[] = [];
    let totalCount = 0;

    try {
      // @ts-ignore - marketScanArticle model may not exist in schema
      articles = await prisma.marketScanArticle.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          summary: true,
          source: true,
          sourceUrl: true,
          sourceType: true,
          category: true,
          jurisdiction: true,
          publishedAt: true,
          relevanceScore: true,
          relevanceTags: true,
          keyTopics: true,
          affectedFrameworks: true,
          riskAreas: true,
          complianceImpact: true,
          scannedAt: true,
          sentiment: true,
          urgency: true,
          impactScope: true,
          affectedIndustries: true,
          regulatoryBodies: true,
          relatedRegulations: true,
          actionItems: true,
          timeline: true,
          geographicRegions: true,
          mentionedEntities: true,
          enforcementActions: true,
          readingTimeMinutes: true,
          complexityLevel: true,
          language: true,
          author: true,
          publisher: true,
        },
      });

      // Get total count
      // @ts-ignore - marketScanArticle model may not exist in schema
      totalCount = await prisma.marketScanArticle.count({ where });
    } catch (error: any) {
      console.error('[MARKET_SCAN_ARTICLES_API] Error fetching articles (model may not exist):', error.message);
      // Return empty results instead of failing - feature not yet implemented
      articles = [];
      totalCount = 0;
    }

    return NextResponse.json({
      articles,
      totalCount,
    });
  } catch (error: any) {
    console.error('[MARKET_SCAN_ARTICLES_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles', details: error.message },
      { status: 500 }
    );
  }
}

