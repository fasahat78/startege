/**
 * Get Billing History
 * Fetches invoices and payment history from Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({
        invoices: [],
        charges: [],
        message: 'No Stripe customer found',
      });
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 50,
      expand: ['data.payment_intent'],
    });

    // Fetch payment intents/charges for credit purchases
    const charges = await stripe.charges.list({
      customer: subscription.stripeCustomerId,
      limit: 50,
    });

    // Format invoices
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: invoice.status,
      description: invoice.description || invoice.lines.data[0]?.description || 'Subscription',
      date: new Date(invoice.created * 1000).toISOString(),
      invoicePdf: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
    }));

    // Format charges (for credit purchases)
    // Note: Filter out charges that are part of invoices (subscriptions) if needed
    const formattedCharges = charges.data
      .map(charge => ({
        id: charge.id,
        amount: charge.amount / 100, // Convert from cents
        currency: charge.currency.toUpperCase(),
        status: charge.status,
        description: charge.description || 'Credit Purchase',
        date: new Date(charge.created * 1000).toISOString(),
        receiptUrl: charge.receipt_url,
        paymentMethod: charge.payment_method_details?.type || 'card',
        refundedAmount: charge.amount_refunded ? charge.amount_refunded / 100 : 0,
      }));

    // Get refunded payments from database
    const refundedPayments = await prisma.payment.findMany({
      where: {
        userId: user.id,
        refundedAmount: { gt: 0 },
      },
      orderBy: {
        refundedAt: 'desc',
      },
      take: 50,
    });

    // Format refunded payments
    const formattedRefunds = refundedPayments.map(payment => ({
      id: `refund-${payment.id}`,
      type: 'refund' as const,
      amount: payment.amount / 100,
      refundedAmount: payment.refundedAmount / 100,
      currency: payment.currency.toUpperCase(),
      status: payment.status,
      description: `Refund: ${payment.planType || 'Payment'}`,
      date: payment.refundedAt?.toISOString() || payment.createdAt.toISOString(),
      refundReason: payment.refundReason,
      stripePaymentId: payment.stripePaymentId,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      charges: formattedCharges,
      refunds: formattedRefunds,
    });

  } catch (error: any) {
    console.error('[BILLING_HISTORY] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing history', details: error.message },
      { status: 500 }
    );
  }
}

