import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { stripe, STRIPE_PRICE_IDS, STRIPE_URLS } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { validateDiscountCode, applyDiscountCode } from "@/lib/discount-codes";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { priceId, planType, returnUrl, discountCode } = body;

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

    // Validate and apply discount code if provided
    let discountCouponId: string | undefined;
    let discountAmount = 0;
    let discountCodeId: string | undefined;

    if (discountCode) {
      // Get price amount from Stripe to validate discount
      const price = await stripe.prices.retrieve(finalPriceId);
      const amount = price.unit_amount || 0;

      const validation = await validateDiscountCode(
        discountCode,
        planType || "monthly",
        amount
      );

      if (validation.valid && validation.discount) {
        // Check if user has already used this code
        const hasUsed = await prisma.discountCodeUsage.findFirst({
          where: {
            discountCodeId: validation.discount.id,
            userId: user.id,
          },
        });

        if (hasUsed) {
          return NextResponse.json(
            { error: "You have already used this discount code" },
            { status: 400 }
          );
        }

        // Create Stripe coupon for percentage discounts
        if (validation.discount.type === "PERCENTAGE" && validation.discount.percentageOff) {
          const coupon = await stripe.coupons.create({
            percent_off: validation.discount.percentageOff,
            name: `Discount: ${discountCode}`,
            duration: "once", // For one-time discounts, use "forever" for lifetime
            metadata: {
              discountCodeId: validation.discount.id,
              userId: user.id,
            },
          });
          discountCouponId = coupon.id;
        } else if (validation.discount.type === "FIXED_AMOUNT") {
          // For fixed amount, we'll need to create a coupon with amount_off
          const coupon = await stripe.coupons.create({
            amount_off: validation.discount.amountOff,
            currency: "usd",
            name: `Discount: ${discountCode}`,
            duration: "once",
            metadata: {
              discountCodeId: validation.discount.id,
              userId: user.id,
            },
          });
          discountCouponId = coupon.id;
        }

        discountAmount = validation.discount.amountOff;
        discountCodeId = validation.discount.id;
      } else {
        return NextResponse.json(
          { error: validation.error || "Invalid discount code" },
          { status: 400 }
        );
      }
    }

    // Create checkout session
    const sessionData: any = {
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
        ...(discountCodeId && { discountCodeId }),
      },
    };

    // Add discount coupon if available
    if (discountCouponId) {
      sessionData.discounts = [{ coupon: discountCouponId }];
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionData);

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

