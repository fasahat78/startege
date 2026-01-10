/**
 * Admin Market Scan Management Page
 * Allows admins to trigger scans and view scan history
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import MarketScanAdminClient from "@/components/admin/MarketScanAdminClient";

export const dynamic = 'force-dynamic';

export default async function MarketScanAdminPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/signin-firebase?redirect=/admin/market-scan");
  }

  const hasAdminAccess = await isAdmin();
  
  if (!hasAdminAccess) {
    redirect("/dashboard");
  }

  // Get scan job history
  let recentScans: any[] = [];
  let articleCount = 0;

  try {
    recentScans = await prisma.scanJob.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        scanType: true,
        status: true,
        startedAt: true,
        completedAt: true,
        articlesFound: true,
        articlesProcessed: true,
        articlesAdded: true,
        errors: true,
      },
    });

    articleCount = await prisma.marketScanArticle.count({
      where: { isActive: true },
    });
  } catch (error: any) {
    console.error('[MARKET_SCAN_ADMIN] Error fetching data:', error.message);
    // Continue with empty arrays
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Market Scan Management</h1>
        <p className="text-muted-foreground">
          Trigger market scans, view scan history, and manage articles
        </p>
      </div>

      <MarketScanAdminClient 
        initialScans={recentScans}
        articleCount={articleCount}
      />
    </div>
  );
}

