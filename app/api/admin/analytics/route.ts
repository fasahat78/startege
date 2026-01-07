import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET - Get analytics dashboard data
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User metrics
    const [
      totalUsers,
      newUsers,
      premiumUsers,
      earlyAdopters,
      activeUsers,
      totalRevenue,
      monthlyRecurringRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.user.count({
        where: {
          subscriptionTier: "premium",
        },
      }),
      prisma.user.count({
        where: {
          isEarlyAdopter: true,
        },
      }),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: startDate,
          },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: "succeeded",
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.subscription.count({
        where: {
          status: "active",
        },
      }),
    ]);

    // Early adopter breakdown
    const earlyAdopterBreakdown = await prisma.user.groupBy({
      by: ["earlyAdopterTier"],
      where: {
        isEarlyAdopter: true,
      },
      _count: true,
    });

    // Discount code usage
    const discountCodeStats = await prisma.discountCode.findMany({
      select: {
        code: true,
        currentUses: true,
        maxUses: true,
        usages: {
          select: {
            amountSaved: true,
          },
        },
      },
    });

    const discountCodeStatsWithSavings = discountCodeStats.map((code) => ({
      code: code.code,
      uses: code.currentUses,
      maxUses: code.maxUses,
      totalSavings: code.usages.reduce((sum, usage) => sum + usage.amountSaved, 0),
    }));

    // Referral stats
    const referralStats = await prisma.referral.groupBy({
      by: ["status"],
      _count: true,
    });

    // Subscription stats
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ["status", "planType"],
      _count: true,
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsers,
        premiumUsers,
        earlyAdopters,
        activeUsers,
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRecurringRevenue: monthlyRecurringRevenue * 19 * 100, // Approximate MRR
      },
      earlyAdopterBreakdown,
      discountCodeStats: discountCodeStatsWithSavings,
      referralStats,
      subscriptionStats,
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    if (error.message === "Admin access required" || error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

