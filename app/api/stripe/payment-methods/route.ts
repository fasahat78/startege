/**
 * Get Payment Methods
 * Fetches saved payment methods from Stripe
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
        paymentMethods: [],
        defaultPaymentMethod: null,
      });
    }

    // Fetch payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: subscription.stripeCustomerId,
      type: 'card',
    });

    // Get customer to find default payment method
    const customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
    const defaultPaymentMethodId = typeof customer !== 'deleted' && customer.invoice_settings?.default_payment_method
      ? customer.invoice_settings.default_payment_method
      : null;

    // Format payment methods
    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: pm.card ? {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
      } : null,
      isDefault: pm.id === defaultPaymentMethodId,
    }));

    return NextResponse.json({
      paymentMethods: formattedMethods,
      defaultPaymentMethod: defaultPaymentMethodId,
    });

  } catch (error: any) {
    console.error('[PAYMENT_METHODS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods', details: error.message },
      { status: 500 }
    );
  }
}

