import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { checkCreditBalance, getCreditAccount } from "@/lib/ai-credits";

/**
 * GET /api/user/credits
 * Get current credit balance for the authenticated user
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await checkCreditBalance(user.id);
    const account = await getCreditAccount(user.id);

    return NextResponse.json({
      balance,
      account: account
        ? {
            monthlyAllowance: account.monthlyAllowance,
            purchasedCredits: account.purchasedCredits,
            creditsUsedThisCycle: account.creditsUsedThisCycle,
            billingCycleEnd: account.billingCycleEnd,
          }
        : null,
    });
  } catch (error: any) {
    console.error("[CREDITS_API_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

