/**
 * Market Scan Page
 * Premium feature for browsing regulatory intelligence
 */

// Mark as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import MarketScanClient from '@/components/market-scan/MarketScanClient';

export default async function MarketScanPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin-firebase');
  }

  // Check premium subscription
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionTier: true },
  });

  if (dbUser?.subscriptionTier !== 'premium') {
    redirect('/pricing?feature=market-scan');
  }

  // Fetch recent articles
  const articles = await prisma.marketScanArticle.findMany({
    where: {
      // Add isActive field check if it exists in schema
      // For now, just get all articles
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
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
      // Enhanced metadata
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

  // Get scan job history
  const recentScans = await prisma.scanJob.findMany({
    orderBy: { startedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      scanType: true,
      status: true,
      startedAt: true,
      completedAt: true,
      articlesFound: true,
      articlesProcessed: true,
      articlesAdded: true,
    },
  });

  return (
    <div>
      <MarketScanClient 
        initialArticles={articles} 
        recentScans={recentScans}
      />
    </div>
  );
}

