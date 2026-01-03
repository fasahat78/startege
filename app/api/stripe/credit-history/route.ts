/**
 * Get Credit Purchase History
 * Fetches credit purchases from database (tracked via webhooks)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get credit purchase transactions from database
    const creditPurchases = await prisma.creditTransaction.findMany({
      where: {
        userId: user.id,
        type: 'PURCHASE', // Only purchase transactions
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
        stripePaymentId: true, // Link to Stripe payment
        balanceAfter: true, // Balance after purchase
      },
    });

    // Format transactions
    const formattedPurchases = creditPurchases.map(transaction => ({
      id: transaction.id,
      credits: transaction.amount, // Amount is already in credits (not cents)
      description: transaction.description || 'Credit Purchase',
      date: transaction.createdAt.toISOString(),
      stripePaymentId: transaction.stripePaymentId || null,
      balanceAfter: transaction.balanceAfter,
    }));

    return NextResponse.json({
      purchases: formattedPurchases,
      totalPurchases: formattedPurchases.length,
    });

  } catch (error: any) {
    console.error('[CREDIT_HISTORY] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit history', details: error.message },
      { status: 500 }
    );
  }
}

