import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { stripe, STRIPE_URLS } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { getCreditBundleByPrice, CREDIT_BUNDLES } from "@/lib/gemini-pricing";

/**
 * API Route: Purchase AI Credits
 * Creates a Stripe Checkout session for credit purchase
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { creditType } = body;

    if (!creditType) {
      return NextResponse.json(
        { error: "Missing creditType" },
        { status: 400 }
      );
    }

    // Map creditType to price ID
    const priceIdMap: Record<string, string> = {
      small: process.env.STRIPE_PRICE_CREDITS_SMALL || "",
      standard: process.env.STRIPE_PRICE_CREDITS_STANDARD || "",
      large: process.env.STRIPE_PRICE_CREDITS_LARGE || "",
    };

    const priceId = priceIdMap[creditType];

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid creditType" },
        { status: 400 }
      );
    }

    // Credit purchases require premium subscription
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true },
    });

    if (!dbUser || dbUser.subscriptionTier !== "premium") {
      return NextResponse.json(
        { error: "Premium subscription required to purchase credits" },
        { status: 403 }
      );
    }

    // Retrieve price from Stripe to get amount
    const price = await stripe.prices.retrieve(priceId);

    if (!price || price.type !== "one_time") {
      return NextResponse.json(
        { error: "Invalid price ID or not a one-time payment" },
        { status: 400 }
      );
    }

    // Verify it's a credit purchase price
    const purchasePriceInCents = price.unit_amount || 0;
    const bundle = getCreditBundleByPrice(purchasePriceInCents);

    if (!bundle) {
      return NextResponse.json(
        { error: "Invalid credit bundle price" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    // Check if user has a subscription record with Stripe customer ID
    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    });

    let stripeCustomerId = subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Create or update subscription record with Stripe customer ID
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          stripeCustomerId: customer.id,
        },
        create: {
          userId: user.id,
          stripeCustomerId: customer.id,
          status: "incomplete", // Will be updated when subscription is created
        },
      });
    }

    // Create checkout session for one-time payment
    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment", // One-time payment
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${STRIPE_URLS.success}?credits_purchased=true`,
      cancel_url: `${STRIPE_URLS.cancel}?credits_cancelled=true`,
      metadata: {
        userId: user.id,
        purchaseType: "credit_topup",
        purchasePrice: purchasePriceInCents.toString(),
        apiUsageCredits: bundle.apiUsageCredits.toString(),
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("[STRIPE_CREDIT_PURCHASE_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve available credit bundles
 */
export async function GET() {
  try {
    return NextResponse.json({
      bundles: Object.values(CREDIT_BUNDLES).map((bundle) => ({
        purchasePrice: bundle.purchasePrice,
        purchasePriceUSD: `$${(bundle.purchasePrice / 100).toFixed(2)}`,
        apiUsageCredits: bundle.apiUsageCredits,
        apiUsageCreditsUSD: `$${(bundle.apiUsageCredits / 100).toFixed(2)}`,
        label: bundle.label,
        bonus: bundle.purchasePrice > 1000 
          ? `${Math.round(((bundle.apiUsageCredits / bundle.purchasePrice) - 0.5) * 200)}%`
          : null,
      })),
    });
  } catch (error: any) {
    console.error("[CREDIT_BUNDLES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

