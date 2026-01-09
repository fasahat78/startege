import { prisma } from "@/lib/db";
import { calculateApiUsageCredits } from "@/lib/gemini-pricing";
import type { CreditTransactionType } from "@prisma/client";

/**
 * AI Credits Service
 * Manages credit allocation, usage tracking, and deductions
 */

const MONTHLY_ALLOWANCE = 1000; // $10.00 in cents (50% = $5 API usage) - for monthly subscribers
const ANNUAL_MONTHLY_ALLOWANCE = 1250; // 1,250 credits/month for annual subscribers (15,000/year)

/**
 * Get monthly credit allowance based on subscription plan type
 */
async function getMonthlyAllowance(userId: string, subscriptionId?: string): Promise<number> {
  if (subscriptionId) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: { planType: true },
    });
    
    // Handle both "year" (from Stripe) and "annual" (normalized)
    const planType = subscription?.planType;
    if (planType === "annual" || planType === "year") {
      return ANNUAL_MONTHLY_ALLOWANCE;
    }
  }
  
  // Default to monthly allowance
  return MONTHLY_ALLOWANCE;
}

/**
 * Update plan type and allowance when switching plans mid-cycle
 * Used when user changes plan (e.g., monthly → annual)
 * 
 * Strategy:
 * - Preserve remaining monthly credits
 * - Add the full new plan's monthly allowance
 * - This gives users immediate benefit of upgrading
 * 
 * Example:
 * - Day 15: 500 credits remaining (monthly plan, 1,000/month)
 * - Switch to annual (1,250/month)
 * - Result: 500 (preserved) + 1,250 (new allowance) = 1,750 credits
 */
export async function updatePlanType(
  userId: string,
  subscriptionId: string,
  preserveCredits: boolean = true
): Promise<any> {
  const newMonthlyAllowance = await getMonthlyAllowance(userId, subscriptionId);
  
  const existing = await prisma.aICredit.findUnique({
    where: { userId },
  });

  if (!existing) {
    // No credit record exists, create new one with full allowance
    return await allocateMonthlyCredits(userId, subscriptionId);
  }

  if (preserveCredits) {
    // Calculate remaining monthly credits (excluding purchased credits)
    const purchasedCredits = existing.purchasedCredits || 0;
    const totalCurrentBalance = existing.currentBalance || 0;
    
    // Remaining monthly credits = total balance - purchased credits
    const remainingMonthlyCredits = Math.max(0, totalCurrentBalance - purchasedCredits);
    
    // New balance = remaining monthly credits + purchased credits + new monthly allowance
    const newBalance = remainingMonthlyCredits + purchasedCredits + newMonthlyAllowance;
    
    console.log(`[AI-CREDITS] updatePlanType - Preserving credits:`, {
      userId,
      purchasedCredits,
      remainingMonthlyCredits,
      oldBalance: totalCurrentBalance,
      newMonthlyAllowance,
      newBalance,
    });
    
    return await prisma.aICredit.update({
      where: { userId },
      data: {
        monthlyAllowance: newMonthlyAllowance, // Update allowance for future resets
        currentBalance: newBalance, // Add new allowance to existing balance
        subscriptionId,
      },
    });
  } else {
    // Reset credits immediately (not recommended for mid-cycle changes)
    return await allocateMonthlyCredits(userId, subscriptionId);
  }
}

/**
 * Allocate monthly credits to a user
 * Called on subscription creation and monthly reset
 * Annual subscribers get 1,250 credits/month, monthly subscribers get 1,000 credits/month
 */
export async function allocateMonthlyCredits(
  userId: string,
  subscriptionId?: string
): Promise<any> {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Get monthly allowance based on plan type
  const monthlyAllowance = await getMonthlyAllowance(userId, subscriptionId);

  // Check if credit record exists
  const existing = await prisma.aICredit.findUnique({
    where: { userId },
  });

  if (existing) {
    // Reset monthly credits, but preserve purchased credits (they never expire)
    const purchasedCredits = existing.purchasedCredits || 0;

    return await prisma.aICredit.update({
      where: { userId },
      data: {
        monthlyAllowance, // Update allowance in case plan changed
        currentBalance: monthlyAllowance + purchasedCredits,
        purchasedCredits: purchasedCredits, // Keep purchased credits (never expire)
        billingCycleStart: now,
        billingCycleEnd: nextMonth,
        creditsUsedThisCycle: 0,
        subscriptionId: subscriptionId || existing.subscriptionId,
      },
    });
  }

  // Create new credit record
  return await prisma.aICredit.create({
    data: {
      userId,
      subscriptionId,
      monthlyAllowance,
      currentBalance: monthlyAllowance,
      billingCycleStart: now,
      billingCycleEnd: nextMonth,
      creditsUsedThisCycle: 0,
    },
  });
}

/**
 * Check current credit balance
 * Automatically resets if billing cycle has ended
 * Also updates allowance if plan type changed
 */
export async function checkCreditBalance(userId: string): Promise<number> {
  const credit = await prisma.aICredit.findUnique({
    where: { userId },
  });

  if (!credit) {
    console.warn(`[AI-CREDITS] No credit account found for user ${userId}`);
    return 0;
  }
  
  console.log(`[AI-CREDITS] Balance check for user ${userId}:`, {
    currentBalance: credit.currentBalance,
    monthlyAllowance: credit.monthlyAllowance,
    purchasedCredits: credit.purchasedCredits,
    billingCycleEnd: credit.billingCycleEnd,
  });

  // Check if reset needed
  if (new Date() >= credit.billingCycleEnd) {
    const updated = await allocateMonthlyCredits(userId, credit.subscriptionId || undefined);
    return updated.currentBalance;
  }

  // Ensure monthlyAllowance is up-to-date (in case plan changed)
  if (credit.subscriptionId) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: credit.subscriptionId },
      select: { planType: true },
    });
    
    // Handle both "year" (from Stripe) and "annual" (normalized)
    const planType = subscription?.planType;
    const expectedAllowance = (planType === "annual" || planType === "year")
      ? ANNUAL_MONTHLY_ALLOWANCE 
      : MONTHLY_ALLOWANCE;
    
    if (credit.monthlyAllowance !== expectedAllowance) {
      // Update allowance without resetting credits (will apply on next reset)
      await prisma.aICredit.update({
        where: { userId },
        data: { monthlyAllowance: expectedAllowance },
      });
    }
  }

  return credit.currentBalance;
}

/**
 * Deduct credits for API usage
 * Automatically uses monthly credits first, then purchased credits
 * 
 * Fixed cost model: 10 credits per API call (Startegizer premium AI tutor)
 * - Monthly allowance: 1000 credits = 100 API calls
 * - Additional credits: $5 = 250 credits = 25 API calls
 * 
 * @param userId User ID
 * @param creditsToDeduct Number of credits to deduct (default: 10 per API call)
 * @returns Result with success status and remaining balance
 */
export async function deductCredits(
  userId: string,
  creditsToDeduct: number
): Promise<{ success: boolean; remainingBalance: number; error?: string }> {
  // Get credit account (this also handles billing cycle reset if needed)
  const creditAccount = await prisma.aICredit.findUnique({
    where: { userId },
  });

  if (!creditAccount) {
    return {
      success: false,
      remainingBalance: 0,
      error: "No credit account found",
    };
  }

  // Check if billing cycle reset is needed
  let credit = creditAccount;
  if (new Date() >= creditAccount.billingCycleEnd) {
    credit = await allocateMonthlyCredits(userId, creditAccount.subscriptionId || undefined);
  }

  // Fixed cost: creditsToDeduct credits per API call (typically 10 for Startegizer)
  const requiredCredits = creditsToDeduct;

  if (credit.currentBalance < requiredCredits) {
    return {
      success: false,
      remainingBalance: credit.currentBalance,
      error: "Insufficient credits",
    };
  }

  // Deduct credits (implicitly uses monthly credits first, then purchased)
  const balanceBefore = credit.currentBalance;
  const balanceAfter = balanceBefore - requiredCredits;

  const updated = await prisma.aICredit.update({
    where: { userId },
    data: {
      currentBalance: balanceAfter,
      creditsUsedThisCycle: credit.creditsUsedThisCycle + requiredCredits,
    },
  });

  // Record transaction
  await prisma.creditTransaction.create({
    data: {
      creditId: credit.id,
      userId,
      amount: requiredCredits,
      type: "USAGE",
      description: `API usage: ${requiredCredits} credits per call`,
      balanceBefore,
      balanceAfter,
    },
  });

  console.log(`[AI-CREDITS] Deducted ${requiredCredits} credits from user ${userId}`, {
    creditsToDeduct,
    requiredCredits,
    balanceBefore,
    balanceAfter,
  });

  return {
    success: true,
    remainingBalance: updated.currentBalance,
  };
}

/**
 * Add purchased credits (one-time top-up)
 * Purchased credits never expire and persist across billing cycles
 */
/**
 * Add purchased credits with a specific amount (used when bundle bonuses apply)
 * This version uses the exact credits amount from metadata instead of recalculating
 */
export async function addPurchasedCreditsWithAmount(
  userId: string,
  purchasePriceInCents: number,
  apiUsageCredits: number, // Exact credits amount (includes bonuses)
  stripePaymentId: string
): Promise<{ success: boolean; apiUsageCredits: number }> {
  // Get or create credit account
  let credit = await prisma.aICredit.findUnique({
    where: { userId },
  });

  if (!credit) {
    // Create credit account if it doesn't exist
    credit = await allocateMonthlyCredits(userId);
  }

  if (!credit) {
    throw new Error(`Failed to allocate credits for user ${userId}`);
  }

  const balanceBefore = credit.currentBalance;
  const balanceAfter = balanceBefore + apiUsageCredits;
  const purchasedCreditsBefore = credit.purchasedCredits || 0;
  const purchasedCreditsAfter = purchasedCreditsBefore + apiUsageCredits;

  // Update credit account
  await prisma.aICredit.update({
    where: { userId },
    data: {
      currentBalance: balanceAfter,
      purchasedCredits: purchasedCreditsAfter,
    },
  });

  // Record transaction
  await prisma.creditTransaction.create({
    data: {
      creditId: credit.id,
      userId,
      type: "PURCHASE",
      amount: apiUsageCredits,
      description: `Purchased ${apiUsageCredits} credits for $${(purchasePriceInCents / 100).toFixed(2)}`,
      balanceBefore,
      balanceAfter,
      // Store payment info in description since metadata field doesn't exist in schema
    },
  });

  console.log(`[AI-CREDITS] Added ${apiUsageCredits} purchased credits to user ${userId}`, {
    balanceBefore,
    balanceAfter,
    purchasedCreditsBefore,
    purchasedCreditsAfter,
  });

  return {
    success: true,
    apiUsageCredits,
  };
}

export async function addPurchasedCredits(
  userId: string,
  purchasePriceInCents: number,
  stripePaymentId: string
): Promise<{ success: boolean; apiUsageCredits: number }> {
  const apiUsageCredits = calculateApiUsageCredits(purchasePriceInCents);

  // Get or create credit account
  let credit = await prisma.aICredit.findUnique({
    where: { userId },
  });

  if (!credit) {
    // Create credit account if it doesn't exist
    credit = await allocateMonthlyCredits(userId);
  }

  if (!credit) {
    throw new Error(`Failed to allocate credits for user ${userId}`);
  }

  const balanceBefore = credit.currentBalance;
  const balanceAfter = balanceBefore + apiUsageCredits;
  const purchasedCreditsBefore = credit.purchasedCredits || 0;
  const purchasedCreditsAfter = purchasedCreditsBefore + apiUsageCredits;

  // Update credit account
  await prisma.aICredit.update({
    where: { userId },
    data: {
      currentBalance: balanceAfter,
      purchasedCredits: purchasedCreditsAfter,
    },
  });

  // Record transaction
  await prisma.creditTransaction.create({
    data: {
      creditId: credit.id,
      userId,
      amount: apiUsageCredits,
      type: "PURCHASE",
      description: `Purchased ${apiUsageCredits} credits`,
      stripePaymentId,
      expiresAt: null, // Purchased credits never expire
      balanceBefore,
      balanceAfter,
    },
  });

  return {
    success: true,
    apiUsageCredits,
  };
}

/**
 * Check if user has sufficient credits
 */
export async function hasSufficientCredits(
  userId: string,
  requiredAmount: number
): Promise<boolean> {
  const balance = await checkCreditBalance(userId);
  return balance >= requiredAmount;
}

/**
 * Get credit account details
 */
export async function getCreditAccount(userId: string) {
  const credit = await prisma.aICredit.findUnique({
    where: { userId },
    include: {
      creditTransactions: {
        orderBy: { createdAt: "desc" },
        take: 10, // Last 10 transactions
      },
    },
  });

  if (!credit) {
    return null;
  }

  // Check if reset needed
  if (new Date() >= credit.billingCycleEnd) {
    const updated = await allocateMonthlyCredits(userId, credit.subscriptionId || undefined);
    return {
      ...updated,
      creditTransactions: credit.creditTransactions,
    };
  }

  // Ensure monthlyAllowance is up-to-date (in case plan changed)
  if (credit.subscriptionId) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: credit.subscriptionId },
      select: { planType: true },
    });
    
    // Handle both "year" (from Stripe) and "annual" (normalized)
    const planType = subscription?.planType;
    const expectedAllowance = (planType === "annual" || planType === "year")
      ? ANNUAL_MONTHLY_ALLOWANCE 
      : MONTHLY_ALLOWANCE;
    
    if (credit.monthlyAllowance !== expectedAllowance) {
      // Update allowance without resetting credits (will apply on next reset)
      const updated = await prisma.aICredit.update({
        where: { userId },
        data: { monthlyAllowance: expectedAllowance },
      });
      return {
        ...updated,
        creditTransactions: credit.creditTransactions,
      };
    }
  }

  return credit;
}

/**
 * Reset monthly credits for all users whose billing cycle has ended
 * This should be run as a scheduled job (daily or hourly)
 */
export async function resetMonthlyCreditsJob() {
  const now = new Date();
  
  const creditsToReset = await prisma.aICredit.findMany({
    where: {
      billingCycleEnd: {
        lte: now,
      },
    },
    // @ts-ignore - subscription relation may not exist in schema
    include: {
      subscription: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

  const results = await Promise.allSettled(
    creditsToReset.map((credit) =>
      allocateMonthlyCredits(
        // @ts-ignore - subscription relation may not exist
        (credit as any).subscription?.userId || credit.userId,
        credit.subscriptionId || undefined
      )
    )
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return {
    total: creditsToReset.length,
    successful,
    failed,
  };
}
