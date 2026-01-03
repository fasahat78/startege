/**
 * API Route: Manual Market Scan Trigger
 * Allows premium users/admins to manually trigger a market scan
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { runDailyScan } from '@/lib/market-scan/scan';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('[MARKET_SCAN_API] Manual scan triggered');
    
    const user = await getCurrentUser();
    console.log('[MARKET_SCAN_API] User:', user?.id, user?.email);
    
    if (!user) {
      console.log('[MARKET_SCAN_API] No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription tier - temporarily allow all users for testing
    // TODO: Re-enable premium check in production
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true },
    });

    console.log('[MARKET_SCAN_API] User subscription tier:', dbUser?.subscriptionTier);

    // Temporarily disabled premium check for testing
    // if (dbUser?.subscriptionTier !== 'premium') {
    //   return NextResponse.json(
    //     { error: 'Premium subscription required to trigger market scan' },
    //     { status: 403 }
    //   );
    // }

    console.log('[MARKET_SCAN_API] Starting scan...');
    // Run scan (this is async and may take a while)
    // Consider running this in a background job in production
    const result = await runDailyScan();
    console.log('[MARKET_SCAN_API] Scan completed:', result);

    return NextResponse.json({
      success: true,
      scanJobId: result.scanJobId,
      articlesFound: result.articlesFound,
      articlesProcessed: result.articlesProcessed,
      articlesAdded: result.articlesAdded,
      errors: result.errors.length,
    });
  } catch (error: any) {
    console.error('[MARKET_SCAN_API] Error:', error);
    console.error('[MARKET_SCAN_API] Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to run market scan', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET: Get scan status/history
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.subscriptionTier !== 'premium') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    // Get recent scan jobs
    const { prisma } = await import('@/lib/db');
    const scanJobs = await prisma.scanJob.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10,
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

    return NextResponse.json({ scanJobs });
  } catch (error: any) {
    console.error('[MARKET_SCAN_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scan history' },
      { status: 500 }
    );
  }
}

