import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { applyDiscountCode } from "@/lib/discount-codes";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[WEBHOOK] Processing checkout.session.completed for session ${session.id}`);
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType || "monthly";
  const purchaseType = session.metadata?.purchaseType;
  const discountCodeId = session.metadata?.discountCodeId;

  console.log(`[WEBHOOK] Session metadata:`, { 
    userId, 
    planType, 
    purchaseType, 
    discountCodeId,
    allMetadata: session.metadata 
  });
  
  console.log(`[WEBHOOK] Session amounts:`, {
    amount_total: session.amount_total,
    amount_subtotal: session.amount_subtotal,
    total_details: session.total_details,
    discounts: session.total_details?.amount_discount,
  });

  // Record discount code usage if applicable
  if (discountCodeId && userId && session.amount_total) {
    try {
      const amountTotal = session.amount_total;
      const amountSubtotal = session.amount_subtotal || amountTotal;
      const amountSaved = amountSubtotal - amountTotal;

      console.log(`[WEBHOOK] Discount calculation:`, {
        amountTotal,
        amountSubtotal,
        amountSaved,
        discountFromStripe: session.total_details?.amount_discount,
      });

      // Use Stripe's discount amount if available, otherwise calculate
      const finalAmountSaved = session.total_details?.amount_discount || amountSaved;

      if (finalAmountSaved > 0) {
        // Get subscription ID if this is a subscription
        const subscriptionId = session.subscription as string | undefined;

        await applyDiscountCode(
          discountCodeId,
          userId,
          subscriptionId,
          session.payment_intent as string | undefined,
          finalAmountSaved
        );

        console.log(`[WEBHOOK] ✅ Recorded discount code usage: ${discountCodeId}, saved: $${(finalAmountSaved / 100).toFixed(2)}`);
      } else {
        console.log(`[WEBHOOK] ⚠️ No discount amount detected (saved: ${finalAmountSaved})`);
      }
    } catch (error: any) {
      console.error(`[WEBHOOK] ❌ Error recording discount code usage:`, error);
      console.error(`[WEBHOOK] Error stack:`, error.stack);
      // Don't fail the webhook if discount tracking fails
    }
  } else {
    if (!discountCodeId) {
      console.log(`[WEBHOOK] ⚠️ No discountCodeId in session metadata`);
    }
    if (!userId) {
      console.log(`[WEBHOOK] ⚠️ No userId in session metadata`);
    }
    if (!session.amount_total) {
      console.log(`[WEBHOOK] ⚠️ No amount_total in session`);
    }
  }

  if (!userId) {
    console.error("[WEBHOOK] No userId in checkout session metadata");
    return;
  }

  // Handle credit purchase (one-time payment)
  if (purchaseType === "credit_topup") {
    const purchasePrice = parseInt(session.metadata?.purchasePrice || "0");
    const apiUsageCredits = parseInt(session.metadata?.apiUsageCredits || "0");

    console.log(`[WEBHOOK] Processing credit purchase for user ${userId}:`, {
      purchasePrice,
      apiUsageCredits,
      paymentIntent: session.payment_intent,
    });

    if (purchasePrice > 0 && apiUsageCredits > 0) {
      const { addPurchasedCreditsWithAmount } = await import("@/lib/ai-credits");
      const paymentIntentId = session.payment_intent as string;

      try {
        // Use the apiUsageCredits from metadata (includes bundle bonuses)
        // instead of recalculating with calculateApiUsageCredits (which only does 50%)
        await addPurchasedCreditsWithAmount(
          userId,
          purchasePrice,
          apiUsageCredits, // Use the bonus credits from metadata
          paymentIntentId || session.id
        );
        console.log(`[WEBHOOK] ✅ Added ${apiUsageCredits} credits to user ${userId} (includes bundle bonus)`);
      } catch (error: any) {
        console.error(`[WEBHOOK] ❌ Error adding credits:`, error);
        console.error(`[WEBHOOK] Error details:`, error.message, error.stack);
        // Don't throw - log but don't fail the webhook
      }
    } else {
      console.error(`[WEBHOOK] ⚠️ Invalid purchase price or credits: ${purchasePrice}, ${apiUsageCredits}`);
    }
    return; // Exit early for credit purchases
  }

  // Handle subscription creation
  // Update user subscription tier
  console.log(`[WEBHOOK] Updating user ${userId} to premium tier`);
  try {
    // Get user with Firebase UID for custom claims
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: { firebaseUid: true },
    });

    await (prisma as any).user.update({
      where: { id: userId },
      data: { subscriptionTier: "premium" },
    });
    console.log(`[WEBHOOK] ✅ Successfully updated user ${userId} to premium`);

    // Set Firebase custom claims for subscription tier
    if (user?.firebaseUid) {
      try {
        const { setCustomClaims } = await import("@/lib/firebase-server");
        await setCustomClaims(user.firebaseUid, {
          subscriptionTier: "premium",
          planType: planType || "monthly",
        });
        console.log(`[WEBHOOK] ✅ Set Firebase custom claims for user ${userId}`);
      } catch (claimsError: any) {
        console.error(`[WEBHOOK] ⚠️ Failed to set custom claims (non-critical):`, claimsError.message);
        // Don't fail the webhook if custom claims fail
      }
    }
  } catch (error: any) {
    console.error(`[WEBHOOK] ❌ Error updating user subscription tier:`, error);
    throw error; // Re-throw to fail the webhook
  }

  // Update or create subscription record
  const subscriptionData: any = {
    userId,
    stripeCustomerId: session.customer as string,
    status: "active",
    planType,
  };

  if (session.subscription) {
    subscriptionData.stripeSubscriptionId = session.subscription as string;
  }

  if (session.mode === "subscription" && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as Stripe.Subscription;
    // Extract period timestamps using type assertion to avoid Prisma Subscription type conflict
    const periodStartTimestamp = (subscription as any).current_period_start as number;
    const periodEndTimestamp = (subscription as any).current_period_end as number;
    subscriptionData.currentPeriodStart = new Date(periodStartTimestamp * 1000);
    subscriptionData.currentPeriodEnd = new Date(periodEndTimestamp * 1000);
  }

  // Normalize planType: "year" → "annual" for consistency
  if (subscriptionData.planType === "year") {
    subscriptionData.planType = "annual";
  }

  const dbSubscription = await (prisma as any).subscription.upsert({
    where: { userId },
    update: subscriptionData,
    create: subscriptionData,
  });

  // Allocate monthly credits for new premium user
  // If user already has credits (switching plans), use updatePlanType to preserve them
  if (session.mode === "subscription") {
    const { allocateMonthlyCredits, updatePlanType } = await import("@/lib/ai-credits");
    try {
      // Check if user already has credits (plan switch scenario)
      const existingCredits = await (prisma as any).aICredit.findUnique({
        where: { userId },
      });
      
      if (existingCredits) {
        // User already has credits - preserve them and add new allowance
        await updatePlanType(userId, dbSubscription.id, true);
        console.log(`✅ Updated plan type and preserved credits for user ${userId}`);
      } else {
        // New subscription - allocate fresh credits
        await allocateMonthlyCredits(userId, dbSubscription.id);
        console.log(`✅ Allocated monthly credits for user ${userId}`);
      }
    } catch (error: any) {
      console.error(`❌ Error allocating credits:`, error);
      console.error(`❌ Error details:`, error.message, error.code, error.stack);
      // Don't fail the webhook if credit allocation fails, but log detailed error
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.error(`❌ CRITICAL: AICredit table doesn't exist! Run scripts/create-aicredit-tables.sql in Cloud SQL Studio.`);
      }
    }
  }

  // Record payment
  if (session.payment_intent) {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );

    await (prisma as any).payment.create({
      data: {
        userId,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status === "succeeded" ? "succeeded" : "pending",
        planType,
      },
    });
  }

  console.log(`✅ Checkout completed for user ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const dbSubscription = await (prisma as any).subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true, planType: true },
  });

  if (!dbSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  const status = subscription.status;
  const isActive = status === "active" || status === "trialing";

  // Map Stripe interval to planType (Stripe uses "year" for annual subscriptions)
  const stripeInterval = subscription.items.data[0]?.price.recurring?.interval || "month";
  const newPlanType = stripeInterval === "year" ? "annual" : stripeInterval === "month" ? "monthly" : "monthly";
  
  // Prevent downgrade from annual to monthly
  if (dbSubscription.planType === "annual" && newPlanType === "monthly") {
    console.error(`⚠️ Downgrade attempt blocked: User ${dbSubscription.userId} tried to downgrade from annual to monthly`);
    // Log the attempt but don't update - Stripe portal should prevent this, but this is a safety check
    // In production, you might want to send an alert or notification
    return; // Don't process the downgrade
  }
  
  // Update subscription record
  await (prisma as any).subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      status,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
      planType: newPlanType,
    },
  });

  // Update user subscription tier
  const user = await (prisma as any).user.findUnique({
    where: { id: dbSubscription.userId },
    select: { firebaseUid: true },
  });

  await (prisma as any).user.update({
    where: { id: dbSubscription.userId },
    data: {
      subscriptionTier: isActive ? "premium" : "free",
    },
  });

  // Set Firebase custom claims
  if (user?.firebaseUid) {
    try {
      const { setCustomClaims } = await import("@/lib/firebase-server");
      await setCustomClaims(user.firebaseUid, {
        subscriptionTier: isActive ? "premium" : "free",
        planType: isActive ? newPlanType : null,
      });
      console.log(`[WEBHOOK] ✅ Updated Firebase custom claims for user ${dbSubscription.userId}`);
    } catch (claimsError: any) {
      console.error(`[WEBHOOK] ⚠️ Failed to update custom claims (non-critical):`, claimsError.message);
      // Don't fail the webhook if custom claims fail
    }
  }

  // If plan changed and subscription is active, update plan type and preserve credits
  // Normalize old planType for comparison (handle "year" → "annual", "month" → "monthly")
  const oldPlanTypeNormalized = dbSubscription.planType === "year" ? "annual" 
    : dbSubscription.planType === "month" ? "monthly" 
    : dbSubscription.planType;
  
  if (isActive && oldPlanTypeNormalized !== newPlanType) {
    console.log(`[WEBHOOK] Plan type changed: ${oldPlanTypeNormalized} → ${newPlanType}, preserving credits...`);
    const { updatePlanType } = await import("@/lib/ai-credits");
    const updatedSubscription = await (prisma as any).subscription.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });
    
    if (updatedSubscription) {
      try {
        // Preserve remaining credits when plan changes mid-cycle
        const creditResult = await updatePlanType(dbSubscription.userId, updatedSubscription.id, true);
        console.log(`[WEBHOOK] ✅ Updated plan type and preserved credits: ${newPlanType}`);
        console.log(`[WEBHOOK] Credit balance after update: ${creditResult.currentBalance}`);
      } catch (error: any) {
        console.error(`[WEBHOOK] ❌ Error updating plan type:`, error);
        console.error(`[WEBHOOK] Error details:`, error.message, error.stack);
      }
    } else {
      console.error(`[WEBHOOK] ⚠️ Could not find subscription record to update credits`);
    }
  } else if (isActive) {
    console.log(`[WEBHOOK] Plan type unchanged (${oldPlanTypeNormalized}), skipping credit update`);
  }

  console.log(`✅ Subscription updated for user ${dbSubscription.userId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const dbSubscription = await (prisma as any).subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });

  if (!dbSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Update subscription status
  await (prisma as any).subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      status: "canceled",
    },
  });

  // Get user with Firebase UID
  const user = await (prisma as any).user.findUnique({
    where: { id: dbSubscription.userId },
    select: { firebaseUid: true },
  });

  // Downgrade user to free tier
  await (prisma as any).user.update({
    where: { id: dbSubscription.userId },
    data: {
      subscriptionTier: "free",
    },
  });

  // Remove premium custom claims
  if (user?.firebaseUid) {
    try {
      const { setCustomClaims } = await import("@/lib/firebase-server");
      await setCustomClaims(user.firebaseUid, {
        subscriptionTier: "free",
        planType: null,
      });
      console.log(`[WEBHOOK] ✅ Removed premium custom claims for user ${dbSubscription.userId}`);
    } catch (claimsError: any) {
      console.error(`[WEBHOOK] ⚠️ Failed to update custom claims (non-critical):`, claimsError.message);
    }
  }

  console.log(`✅ Subscription canceled for user ${dbSubscription.userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const dbSubscription = await (prisma as any).subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });

  if (!dbSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Record payment
  const invoiceData = invoice as any;
  if (invoiceData.payment_intent) {
    await (prisma as any).payment.create({
      data: {
        userId: dbSubscription.userId,
        stripePaymentId: invoiceData.payment_intent as string,
        amount: invoiceData.amount_paid,
        currency: invoiceData.currency,
        status: "succeeded",
        planType: invoiceData.subscription
          ? "subscription"
          : invoiceData.lines.data[0]?.price?.metadata?.planType || null,
      },
    });
  }

  console.log(`✅ Payment succeeded for user ${dbSubscription.userId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const dbSubscription = await (prisma as any).subscription.findUnique({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });

  if (!dbSubscription) {
    console.error(`No subscription found for customer ${customerId}`);
    return;
  }

  // Record failed payment
  const invoiceDataFailed = invoice as any;
  if (invoiceDataFailed.payment_intent) {
    await (prisma as any).payment.create({
      data: {
        userId: dbSubscription.userId,
        stripePaymentId: invoiceDataFailed.payment_intent as string,
        amount: invoiceDataFailed.amount_due,
        currency: invoiceDataFailed.currency,
        status: "failed",
        planType: invoiceDataFailed.subscription
          ? "subscription"
          : invoiceDataFailed.lines.data[0]?.price?.metadata?.planType || null,
      },
    });
  }

  console.log(`⚠️ Payment failed for user ${dbSubscription.userId}`);
}

