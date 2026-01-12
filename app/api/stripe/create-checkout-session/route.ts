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

    console.log("[CHECKOUT SESSION] Request body:", {
      hasPriceId: !!priceId,
      planType,
      hasReturnUrl: !!returnUrl,
      hasDiscountCode: !!discountCode,
    });

    // If priceId not provided, use planType to get from env
    let finalPriceId = priceId;
    if (!finalPriceId && planType) {
      if (planType === "monthly") {
        finalPriceId = STRIPE_PRICE_IDS.monthly;
      } else if (planType === "annual") {
        finalPriceId = STRIPE_PRICE_IDS.annual;
      } else if (planType === "lifetime") {
        finalPriceId = STRIPE_PRICE_IDS.lifetime;
      } else {
        finalPriceId = STRIPE_PRICE_IDS.monthly; // Default to monthly
      }
    }

    console.log("[CHECKOUT SESSION] Price ID resolution:", {
      providedPriceId: priceId,
      resolvedPriceId: finalPriceId,
      planType,
      monthlyPriceId: STRIPE_PRICE_IDS.monthly,
      annualPriceId: STRIPE_PRICE_IDS.annual,
      monthlyPriceIdSet: !!STRIPE_PRICE_IDS.monthly,
      annualPriceIdSet: !!STRIPE_PRICE_IDS.annual,
    });

    // Check if finalPriceId is empty string or undefined/null
    if (!finalPriceId || finalPriceId.trim() === "") {
      console.error("[CHECKOUT SESSION] ❌ No priceId resolved. Details:", {
        providedPriceId: priceId,
        planType,
        monthlyPriceId: STRIPE_PRICE_IDS.monthly,
        annualPriceId: STRIPE_PRICE_IDS.annual,
        requestBody: body,
      });
      
      // Provide more specific error message
      if (planType && !STRIPE_PRICE_IDS.monthly && !STRIPE_PRICE_IDS.annual) {
        return NextResponse.json(
          { error: "Stripe price IDs are not configured. Please contact support." },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Price ID or plan type is required. Plan type provided: ${planType || 'none'}` },
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

    console.log(`[CHECKOUT SESSION] Discount code check:`, {
      discountCodeProvided: !!discountCode,
      discountCode: discountCode,
      planType,
    });

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
        // Check if user has already used this code with a completed payment/subscription
        const existingUsage = await prisma.discountCodeUsage.findFirst({
          where: {
            discountCodeId: validation.discount.id,
            userId: user.id,
          },
          include: {
            discountCode: {
              select: {
                maxUsesPerUser: true,
              },
            },
          },
        });

        if (existingUsage) {
          // Check if there's an active subscription or completed payment associated with this usage
          if (existingUsage.subscriptionId) {
            const subscription = await prisma.subscription.findUnique({
              where: { id: existingUsage.subscriptionId },
              select: { status: true },
            });
            
            // If subscription is active, user has already used the code successfully
            if (subscription?.status === "active" || subscription?.status === "trialing") {
              return NextResponse.json(
                { error: "You have already used this discount code" },
                { status: 400 }
              );
            }
            // If subscription is incomplete/cancelled, allow reuse
            console.log(`[CHECKOUT SESSION] Previous discount usage found but subscription is ${subscription?.status}, allowing reuse`);
          } else if (existingUsage.paymentId) {
            // Check if payment was successful
            // For now, if there's a paymentId but no subscription, assume it's a one-time payment that completed
            // Allow reuse only if maxUsesPerUser > 1
            const maxUsesPerUser = existingUsage.discountCode?.maxUsesPerUser || 1;
            if (maxUsesPerUser <= 1) {
              return NextResponse.json(
                { error: "You have already used this discount code" },
                { status: 400 }
              );
            }
            console.log(`[CHECKOUT SESSION] Previous discount usage found but maxUsesPerUser=${maxUsesPerUser}, allowing reuse`);
          } else {
            // No subscription or payment ID - this might be an incomplete usage
            // Check maxUsesPerUser
            const maxUsesPerUser = existingUsage.discountCode?.maxUsesPerUser || 1;
            if (maxUsesPerUser <= 1) {
              // Check if user has an active subscription (they might have used the code successfully)
              const userSubscription = await prisma.subscription.findUnique({
                where: { userId: user.id },
                select: { status: true },
              });
              
              if (userSubscription?.status === "active" || userSubscription?.status === "trialing") {
                return NextResponse.json(
                  { error: "You have already used this discount code" },
                  { status: 400 }
                );
              }
              // No active subscription, allow reuse
              console.log(`[CHECKOUT SESSION] Previous discount usage found but no active subscription, allowing reuse`);
            } else {
              console.log(`[CHECKOUT SESSION] Previous discount usage found but maxUsesPerUser=${maxUsesPerUser}, allowing reuse`);
            }
          }
        }

        // Get discount code details to determine duration
        const codeDetails = await prisma.discountCode.findUnique({
          where: { id: validation.discount.id },
          select: { earlyAdopterTier: true },
        });

        // Determine duration: "forever" for founding members (lifetime discount), "once" for others
        const duration = codeDetails?.earlyAdopterTier === "FOUNDING_MEMBER" ? "forever" : "once";

        // Create Stripe coupon for percentage discounts
        if (validation.discount.type === "PERCENTAGE" && validation.discount.percentageOff) {
          const coupon = await stripe.coupons.create({
            percent_off: validation.discount.percentageOff,
            name: `Discount: ${discountCode}`,
            duration: duration,
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
            duration: duration,
            metadata: {
              discountCodeId: validation.discount.id,
              userId: user.id,
            },
          });
          discountCouponId = coupon.id;
        }

        discountAmount = validation.discount.amountOff;
        discountCodeId = validation.discount.id;
        
        console.log(`[CHECKOUT SESSION] ✅ Discount code validated:`, {
          discountCodeId,
          discountCouponId,
          discountAmount,
          percentageOff: validation.discount.percentageOff,
        });
      } else {
        console.log(`[CHECKOUT SESSION] ❌ Discount code validation failed:`, validation.error);
        return NextResponse.json(
          { error: validation.error || "Invalid discount code" },
          { status: 400 }
        );
      }
    } else {
      console.log(`[CHECKOUT SESSION] ⚠️ No discount code provided`);
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

    console.log(`[CHECKOUT SESSION] Created session ${checkoutSession.id}`, {
      hasDiscountCoupon: !!discountCouponId,
      discountCouponId,
      discountCodeId,
      metadata: checkoutSession.metadata,
      metadataKeys: checkoutSession.metadata ? Object.keys(checkoutSession.metadata) : [],
      sessionDataMetadata: sessionData.metadata,
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

