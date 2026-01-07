import { prisma } from "@/lib/db";
import { DiscountCodeType, DiscountCodeStatus } from "@prisma/client";

export interface DiscountCodeValidationResult {
  valid: boolean;
  discount?: {
    id: string;
    code: string;
    type: DiscountCodeType;
    value: number;
    amountOff: number; // Calculated amount off in cents
    percentageOff?: number; // If percentage type
  };
  error?: string;
}

/**
 * Validate a discount code
 */
export async function validateDiscountCode(
  code: string,
  planType: "monthly" | "annual",
  amount: number // Amount in cents
): Promise<DiscountCodeValidationResult> {
  const discountCode = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!discountCode) {
    return { valid: false, error: "Invalid discount code" };
  }

  // Check status
  if (discountCode.status !== DiscountCodeStatus.ACTIVE) {
    return { valid: false, error: "Discount code is not active" };
  }

  // Check validity dates
  const now = new Date();
  if (discountCode.validFrom > now) {
    return { valid: false, error: "Discount code is not yet valid" };
  }

  if (discountCode.validUntil && discountCode.validUntil < now) {
    return { valid: false, error: "Discount code has expired" };
  }

  // Check usage limits
  if (discountCode.maxUses && discountCode.currentUses >= discountCode.maxUses) {
    return { valid: false, error: "Discount code has reached maximum uses" };
  }

  // Check if applicable to plan type
  if (
    discountCode.applicableToPlanTypes.length > 0 &&
    !discountCode.applicableToPlanTypes.includes(planType) &&
    !discountCode.applicableToPlanTypes.includes("both")
  ) {
    return { valid: false, error: `Discount code is not applicable to ${planType} plans` };
  }

  // Check minimum amount (for fixed amount discounts)
  if (discountCode.type === DiscountCodeType.FIXED_AMOUNT && discountCode.minAmount && amount < discountCode.minAmount) {
    return {
      valid: false,
      error: `Minimum purchase amount of $${(discountCode.minAmount / 100).toFixed(2)} required`,
    };
  }

  // Calculate discount amount
  let amountOff = 0;
  let percentageOff: number | undefined;

  if (discountCode.type === DiscountCodeType.PERCENTAGE) {
    percentageOff = discountCode.value;
    amountOff = Math.round((amount * discountCode.value) / 100);
  } else if (discountCode.type === DiscountCodeType.FIXED_AMOUNT) {
    amountOff = Math.round(discountCode.value);
  }

  // Don't allow discount to exceed the amount
  if (amountOff > amount) {
    amountOff = amount;
  }

  return {
    valid: true,
    discount: {
      id: discountCode.id,
      code: discountCode.code,
      type: discountCode.type,
      value: discountCode.value,
      amountOff,
      percentageOff,
    },
  };
}

/**
 * Apply a discount code (record usage)
 */
export async function applyDiscountCode(
  codeId: string,
  userId: string,
  subscriptionId?: string,
  paymentId?: string,
  amountSaved: number
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Record usage
    await tx.discountCodeUsage.create({
      data: {
        discountCodeId: codeId,
        userId,
        subscriptionId,
        paymentId,
        amountSaved,
      },
    });

    // Increment usage count
    await tx.discountCode.update({
      where: { id: codeId },
      data: {
        currentUses: {
          increment: 1,
        },
        // Update status if max uses reached
        ...(await tx.discountCode.findUnique({ where: { id: codeId } }).then((dc) => {
          if (dc && dc.maxUses && dc.currentUses + 1 >= dc.maxUses) {
            return { status: DiscountCodeStatus.USED_UP };
          }
          return {};
        })),
      },
    });
  });
}

/**
 * Check if user has already used a discount code
 */
export async function hasUserUsedDiscountCode(codeId: string, userId: string): Promise<boolean> {
  const usage = await prisma.discountCodeUsage.findFirst({
    where: {
      discountCodeId: codeId,
      userId,
    },
  });

  return !!usage;
}

/**
 * Generate a unique referral code for a user
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, referralCode: true },
  });

  if (user?.referralCode) {
    return user.referralCode;
  }

  // Generate code from user's name/email
  const base = user?.name?.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) ||
    user?.email?.split("@")[0].toUpperCase().slice(0, 6) ||
    userId.slice(0, 6).toUpperCase();
  
  let code = base;
  let counter = 1;

  // Ensure uniqueness
  while (await prisma.user.findUnique({ where: { referralCode: code } })) {
    code = `${base}${counter}`;
    counter++;
  }

  // Update user with referral code
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code;
}

