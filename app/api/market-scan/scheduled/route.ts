/**
 * Scheduled Market Scan Endpoint
 * 
 * This endpoint is designed to be called by Cloud Scheduler
 * It runs the daily market scan automatically
 * 
 * Authentication: Uses service account or API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { runDailyScan } from '@/lib/market-scan/scan';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';

/**
 * Verify the request is from Cloud Scheduler
 * Cloud Scheduler sends requests with specific headers
 */
function verifySchedulerRequest(request: NextRequest): boolean {
  // Option 1: Check for Cloud Scheduler user agent
  const userAgent = request.headers.get('user-agent') || '';
  if (userAgent.includes('Google-Cloud-Scheduler')) {
    return true;
  }

  // Option 2: Check for custom header (set in Cloud Scheduler)
  const schedulerKey = request.headers.get('x-scheduler-key');
  const expectedKey = process.env.CLOUD_SCHEDULER_SECRET_KEY;
  
  if (expectedKey && schedulerKey === expectedKey) {
    return true;
  }

  // Option 3: Allow if no secret key is set (for development)
  // In production, always set CLOUD_SCHEDULER_SECRET_KEY
  if (!expectedKey) {
    console.warn('[SCHEDULED_SCAN] No CLOUD_SCHEDULER_SECRET_KEY set - allowing request (dev mode)');
    return true;
  }

  return false;
}

/**
 * POST /api/market-scan/scheduled
 * 
 * Runs the daily market scan
 * Called by Cloud Scheduler
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request is from Cloud Scheduler
    if (!verifySchedulerRequest(request)) {
      console.error('[SCHEDULED_SCAN] Unauthorized request - not from Cloud Scheduler');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[SCHEDULED_SCAN] Starting scheduled market scan...');
    console.log('[SCHEDULED_SCAN] Timestamp:', new Date().toISOString());

    // Run the daily scan
    const result = await runDailyScan();

    console.log('[SCHEDULED_SCAN] Scan completed:', {
      articlesFound: result.articlesFound,
      articlesAdded: result.articlesAdded,
      articlesProcessed: result.articlesProcessed,
      errors: result.errors,
      scanJobId: result.scanJobId,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Market scan completed',
      result: {
        articlesFound: result.articlesFound,
        articlesAdded: result.articlesAdded,
        articlesProcessed: result.articlesProcessed,
        errors: result.errors,
        scanJobId: result.scanJobId,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('[SCHEDULED_SCAN] Error running scheduled scan:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to run market scan',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/market-scan/scheduled
 * 
 * Health check endpoint for Cloud Scheduler
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'market-scan-scheduled',
    timestamp: new Date().toISOString(),
  });
}

