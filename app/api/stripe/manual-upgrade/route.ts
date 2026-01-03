import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

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
    let stripeSubscription = null;
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

    // Check if subscription is active in Stripe
    const isActive = stripeSubscription?.status === "active" || stripeSubscription?.status === "trialing";

    if (isActive) {
      // Normalize Stripe interval to our planType format
      const stripeInterval = stripeSubscription.items.data[0]?.price.recurring?.interval || "month";
      const normalizedPlanType = stripeInterval === "year" ? "annual" : stripeInterval === "month" ? "monthly" : "monthly";

      // Update database subscription status
      if (dbSubscription) {
        await prisma.subscription.update({
          where: { userId: user.id },
          data: {
            status: stripeSubscription.status,
            stripeSubscriptionId: stripeSubscription.id,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            planType: normalizedPlanType,
          },
        });
      } else {
        // Create subscription record if it doesn't exist
        const customerId = stripeSubscription.customer as string;
        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: stripeSubscription.id,
            status: stripeSubscription.status,
            planType: normalizedPlanType,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
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
        stripeStatus: stripeSubscription.status,
      });
    }

    return NextResponse.json({
      success: false,
      message: stripeSubscription 
        ? `Subscription status: ${stripeSubscription.status}` 
        : "No active subscription found in Stripe",
      dbStatus: dbSubscription?.status,
      stripeStatus: stripeSubscription?.status,
    });
  } catch (error: any) {
    console.error("Manual upgrade error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update premium status" },
      { status: 500 }
    );
  }
}

