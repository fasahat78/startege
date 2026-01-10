import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

/**
 * GET /api/admin/refunds
 * List all refunded payments
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {
      refundedAmount: { gt: 0 },
    };

    if (userId) {
      where.userId = userId;
    }

    const payments = await (prisma as any).payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        refundedAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ payments });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error fetching refunds:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/refunds
 * Process a refund for a payment
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { paymentId, amount, reason } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    // Get the payment record
    const payment = await (prisma as any).payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check if already fully refunded
    if (payment.refundedAmount >= payment.amount) {
      return NextResponse.json(
        { error: "Payment is already fully refunded" },
        { status: 400 }
      );
    }

    // Calculate refund amount (if not specified, refund remaining amount)
    const remainingAmount = payment.amount - payment.refundedAmount;
    const refundAmount = amount ? Math.min(amount, remainingAmount) : remainingAmount;

    if (refundAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid refund amount" },
        { status: 400 }
      );
    }

    // Process refund via Stripe
    let refund: Stripe.Refund;
    try {
      refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentId,
        amount: refundAmount,
        reason: reason || "requested_by_customer",
        metadata: {
          refunded_by_admin: "true",
          admin_reason: reason || "",
        },
      });
    } catch (stripeError: any) {
      console.error("Stripe refund error:", stripeError);
      return NextResponse.json(
        { error: `Stripe refund failed: ${stripeError.message}` },
        { status: 500 }
      );
    }

    // Update payment record
    const newRefundedAmount = payment.refundedAmount + refundAmount;
    const isFullyRefunded = newRefundedAmount >= payment.amount;

    await (prisma as any).payment.update({
      where: { id: paymentId },
      data: {
        refundedAmount: newRefundedAmount,
        refundedAt: new Date(),
        refundReason: reason || null,
        status: isFullyRefunded ? "refunded" : "partially_refunded",
      },
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        fullyRefunded: isFullyRefunded,
      },
      payment: {
        id: payment.id,
        refundedAmount: newRefundedAmount,
        status: isFullyRefunded ? "refunded" : "partially_refunded",
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}

