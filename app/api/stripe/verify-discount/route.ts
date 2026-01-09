import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { applyDiscountCode } from "@/lib/discount-codes";

export const dynamic = 'force-dynamic';

/**
 * Verify and record discount code usage from a Stripe checkout session
 * This is a fallback for when webhooks don't fire (e.g., local development)
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['total_details.breakdown', 'line_items'],
    });

    console.log(`[VERIFY DISCOUNT] Session retrieved:`, {
      sessionId,
      status: session.status,
      metadata: session.metadata,
      userId: session.metadata?.userId,
      currentUserId: user.id,
      amountTotal: session.amount_total,
      amountSubtotal: session.amount_subtotal,
      totalDetails: session.total_details,
    });

    // Verify this session belongs to the current user
    if (session.metadata?.userId !== user.id) {
      console.log(`[VERIFY DISCOUNT] ❌ Session userId mismatch:`, {
        sessionUserId: session.metadata?.userId,
        currentUserId: user.id,
      });
      return NextResponse.json(
        { error: "Session does not belong to current user" },
        { status: 403 }
      );
    }

    // Check if session is completed
    if (session.status !== 'complete') {
      console.log(`[VERIFY DISCOUNT] ⚠️ Session not complete:`, session.status);
      return NextResponse.json(
        { error: "Checkout session is not complete" },
        { status: 400 }
      );
    }

    const discountCodeId = session.metadata?.discountCodeId;
    
    console.log(`[VERIFY DISCOUNT] Discount code check:`, {
      discountCodeId,
      allMetadataKeys: session.metadata ? Object.keys(session.metadata) : [],
      metadata: session.metadata,
    });
    
    if (!discountCodeId) {
      console.log(`[VERIFY DISCOUNT] ⚠️ No discountCodeId in session metadata`);
      return NextResponse.json({
        success: true,
        message: "No discount code found in session",
        discountApplied: false,
        debug: {
          metadata: session.metadata,
          metadataKeys: session.metadata ? Object.keys(session.metadata) : [],
        },
      });
    }

    // Check if discount code usage was already recorded
    const existingUsage = await prisma.discountCodeUsage.findFirst({
      where: {
        discountCodeId,
        userId: user.id,
        paymentId: session.payment_intent as string | undefined,
      },
    });

    if (existingUsage) {
      return NextResponse.json({
        success: true,
        message: "Discount code usage already recorded",
        discountApplied: true,
        amountSaved: existingUsage.amountSaved,
      });
    }

    // Calculate discount amount
    const amountTotal = session.amount_total || 0;
    const amountSubtotal = session.amount_subtotal || amountTotal;
    const amountSaved = amountSubtotal - amountTotal;

    // Also check Stripe's discount breakdown if available
    const stripeDiscountAmount = session.total_details?.amount_discount || 0;
    const finalAmountSaved = stripeDiscountAmount > 0 ? stripeDiscountAmount : amountSaved;

    if (finalAmountSaved > 0) {
      // Record discount code usage
      await applyDiscountCode(
        discountCodeId,
        user.id,
        session.subscription as string | undefined,
        session.payment_intent as string | undefined,
        finalAmountSaved
      );

      console.log(`[VERIFY DISCOUNT] ✅ Recorded discount code usage: ${discountCodeId}, saved: $${(finalAmountSaved / 100).toFixed(2)}`);

      return NextResponse.json({
        success: true,
        message: "Discount code usage recorded",
        discountApplied: true,
        amountSaved: finalAmountSaved,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "No discount amount detected",
        discountApplied: false,
      });
    }
  } catch (error: any) {
    console.error("[VERIFY DISCOUNT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify discount code usage" },
      { status: 500 }
    );
  }
}

