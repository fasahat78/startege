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

    // Configure portal session
    // Note: Stripe Billing Portal configuration requires creating a configuration first via API
    // For now, use default portal behavior (can be configured in Stripe Dashboard)
    const portalParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: dbSubscription.stripeCustomerId,
      return_url: STRIPE_URLS.success,
    };

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
