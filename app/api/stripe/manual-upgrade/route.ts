import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

// Type alias to avoid conflict with Prisma Subscription model
type StripeSubscription = Stripe.Subscription;

/**
 * Manual upgrade endpoint (for testing/debugging)
 * Checks Stripe subscription directly and updates user status
 */
export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check database subscription record
    const dbSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: {
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        status: true,
      },
    });

    // If no subscription record, check Stripe directly by customer ID
    let stripeSubscription: StripeSubscription | null = null;
    if (dbSubscription?.stripeCustomerId) {
      try {
        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: dbSubscription.stripeCustomerId,
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          stripeSubscription = subscriptions.data[0];
        }
      } catch (error) {
        console.error("Error fetching Stripe subscription:", error);
      }
    }

    // If we have a subscription ID, check it directly
    if (dbSubscription?.stripeSubscriptionId && !stripeSubscription) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          dbSubscription.stripeSubscriptionId
        );
      } catch (error) {
        console.error("Error retrieving Stripe subscription:", error);
      }
    }

    // Check if subscription exists
    if (!stripeSubscription) {
      return NextResponse.json(
        { error: "No active subscription found in Stripe" },
        { status: 404 }
      );
    }

    // TypeScript narrowing: stripeSubscription is now definitely Stripe.Subscription
    // Access properties directly from stripeSubscription to avoid type inference issues
    // Extract all needed values before any Prisma operations
    const stripeSub = stripeSubscription as Stripe.Subscription;
    const status = stripeSub.status;
    const subscriptionId = stripeSub.id;
    const customerId = stripeSub.customer as string;
    const stripeInterval = stripeSub.items.data[0]?.price.recurring?.interval || "month";
    
    // Extract period timestamps using bracket notation to bypass type checking
    const periodStartTimestamp = (stripeSub as any).current_period_start as number | undefined;
    const periodEndTimestamp = (stripeSub as any).current_period_end as number | undefined;
    
    // Only create Date objects if timestamps are valid numbers
    const periodStart = periodStartTimestamp ? new Date(periodStartTimestamp * 1000) : new Date();
    const periodEnd = periodEndTimestamp ? new Date(periodEndTimestamp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days from now
    
    console.log(`[MANUAL UPGRADE] Subscription details:`, {
      status,
      subscriptionId,
      customerId,
      stripeInterval,
      periodStartTimestamp,
      periodEndTimestamp,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
    });

    // Check if subscription is active in Stripe
    const isActive = status === "active" || status === "trialing";

    if (isActive) {
      // Normalize Stripe interval to our planType format
      const normalizedPlanType = stripeInterval === "year" ? "annual" : stripeInterval === "month" ? "monthly" : "monthly";

      // Update database subscription status
      if (dbSubscription) {
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status,
            stripeSubscriptionId: subscriptionId,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            planType: normalizedPlanType,
          },
        });
      } else {
        // Create subscription record if it doesn't exist
        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status,
            planType: normalizedPlanType,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          },
        });
      }

      // Update user to premium
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionTier: "premium" },
      });

      // Set Firebase custom claims
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { firebaseUid: true },
      });

      if (dbUser?.firebaseUid) {
        try {
          const { setCustomClaims } = await import("@/lib/firebase-server");
          await setCustomClaims(dbUser.firebaseUid, {
            subscriptionTier: "premium",
            planType: normalizedPlanType,
          });
          console.log(`✅ Set Firebase custom claims for user ${user.id}`);
        } catch (claimsError: any) {
          console.error(`⚠️ Failed to set custom claims (non-critical):`, claimsError.message);
        }
      }

      // Allocate monthly credits if not already done
      try {
        const { allocateMonthlyCredits } = await import("@/lib/ai-credits");
        const subscription = await prisma.subscription.findUnique({
          where: { userId: user.id },
        });
        if (subscription) {
          await allocateMonthlyCredits(user.id, subscription.id);
        }
      } catch (error) {
        console.error("Error allocating credits:", error);
      }

      return NextResponse.json({
        success: true,
        message: "Premium status updated",
        subscriptionTier: "premium",
        stripeStatus: status,
      });
    }

    return NextResponse.json({
      success: false,
      message: `Subscription status: ${status}`,
      dbStatus: dbSubscription?.status,
      stripeStatus: status,
    });
  } catch (error: any) {
    console.error("Manual upgrade error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update premium status" },
      { status: 500 }
    );
  }
}

