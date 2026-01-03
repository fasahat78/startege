import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { stripe, STRIPE_URLS } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Stripe customer ID and current subscription
    const dbSubscription = await (prisma as any).subscription.findUnique({
      where: { userId: user.id },
      select: { 
        stripeCustomerId: true,
        planType: true,
        stripeSubscriptionId: true,
      },
    });

    if (!dbSubscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Get Stripe subscription to check current plan
    let stripeSubscription: Stripe.Subscription | null = null;
    if (dbSubscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          dbSubscription.stripeSubscriptionId
        );
      } catch (error) {
        console.error("Error retrieving Stripe subscription:", error);
      }
    }

    // Configure portal based on subscription type
    const portalParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: dbSubscription.stripeCustomerId,
      return_url: STRIPE_URLS.success,
    };

    // If user has annual plan, configure portal to prevent downgrades
    if (dbSubscription.planType === "annual" || dbSubscription.planType === "year") {
      // For annual plans, configure portal to:
      // 1. Allow cancellation (at period end)
      // 2. Prevent downgrade to monthly
      portalParams.configuration = {
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end", // Best practice: cancel at period end
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "too_complex",
              "low_quality",
              "other",
            ],
          },
        },
        subscription_update: {
          enabled: false, // Disable subscription updates to prevent downgrades
          // Note: Stripe Portal doesn't have a direct way to allow only upgrades
          // We'll handle this in the webhook as a safety check
        },
        subscription_pause: {
          enabled: false, // Don't allow pausing annual subscriptions
        },
      };
    } else {
      // For monthly plans, allow normal portal access
      portalParams.configuration = {
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end", // Best practice: cancel at period end
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "too_complex",
              "low_quality",
              "other",
            ],
          },
        },
        subscription_update: {
          enabled: true, // Allow upgrades to annual
          default_allowed_updates: ["price"],
          proration_behavior: "create_prorations",
        },
        subscription_pause: {
          enabled: false, // Don't allow pausing subscriptions
        },
      };
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create(portalParams);

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error: any) {
    console.error("Stripe portal session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}
