import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";

/**
 * API Route: Check Subscription Status
 * Used to refresh subscription status after Stripe checkout
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get latest subscription status from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionTier: true,
        subscription: {
          select: {
            status: true,
            planType: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    return NextResponse.json({
      subscriptionTier: dbUser?.subscriptionTier || "free",
      subscriptionStatus: dbUser?.subscription?.status || null,
      planType: dbUser?.subscription?.planType || null,
      currentPeriodEnd: dbUser?.subscription?.currentPeriodEnd || null,
    });
  } catch (error: any) {
    console.error("Check subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check subscription" },
      { status: 500 }
    );
  }
}

