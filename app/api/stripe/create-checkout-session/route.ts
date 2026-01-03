import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { stripe, STRIPE_PRICE_IDS, STRIPE_URLS } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, planType, returnUrl } = body;

    // If priceId not provided, use planType to get from env
    let finalPriceId = priceId;
    if (!finalPriceId && planType) {
      finalPriceId =
        planType === "monthly"
          ? STRIPE_PRICE_IDS.monthly
          : planType === "annual"
          ? STRIPE_PRICE_IDS.annual
          : planType === "lifetime"
          ? STRIPE_PRICE_IDS.lifetime
          : STRIPE_PRICE_IDS.monthly; // Default to monthly
    }

    if (!finalPriceId) {
      return NextResponse.json(
        { error: "Price ID or plan type is required" },
        { status: 400 }
      );
    }

    // Validate plan type
    const validPlanTypes = ["monthly", "annual", "lifetime"];
    if (planType && !validPlanTypes.includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string;

    // Check if user already has a Stripe customer ID
    const existingSubscription = await (prisma as any).subscription.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    });

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Store customer ID in database (create subscription record)
      await (prisma as any).subscription.upsert({
        where: { userId: user.id },
        update: {
          stripeCustomerId: customerId,
        },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          status: "incomplete",
        },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: planType === "lifetime" ? "payment" : "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: returnUrl ? `${returnUrl}?upgraded=true` : STRIPE_URLS.success,
      cancel_url: returnUrl || STRIPE_URLS.cancel,
      metadata: {
        userId: user.id,
        planType: planType || (finalPriceId === STRIPE_PRICE_IDS.annual ? "annual" : finalPriceId === STRIPE_PRICE_IDS.lifetime ? "lifetime" : "monthly"),
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error("Stripe checkout session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

