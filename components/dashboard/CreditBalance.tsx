import { checkCreditBalance } from "@/lib/ai-credits";
import { prisma } from "@/lib/db";
import Link from "next/link";

interface CreditBalanceProps {
  userId: string;
  subscriptionTier: string;
}

/**
 * Display AI Credit Balance
 * Shows current balance and allows purchasing more credits
 */
export default async function CreditBalance({ userId, subscriptionTier }: CreditBalanceProps) {
  // Only show for premium users
  if (subscriptionTier !== "premium") {
    return null;
  }

  // Get credit account details
  const creditAccount = await prisma.aICredit.findUnique({
    where: { userId },
    select: {
      currentBalance: true,
      monthlyAllowance: true,
      billingCycleEnd: true,
      purchasedCredits: true,
    },
  });

  // If no credit account exists yet, show placeholder
  if (!creditAccount) {
    return (
      <div className="bg-card rounded-lg shadow-card p-6 border-2 border-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1">
              AI Credits
            </h3>
            <p className="text-sm text-muted-foreground">
              For Startegizer & Exam Generation
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-card-foreground">
              0
            </span>
            <span className="text-muted-foreground text-sm">
              / 1,000 credits monthly
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Credits will be allocated automatically when your subscription is activated.
          </p>
        </div>
      </div>
    );
  }

  // Get credit balance (this will auto-reset if needed)
  const creditBalance = await checkCreditBalance(userId);
  
  // Display credits as simple numbers (stored value in cents = credit number)
  const creditBalanceDisplay = creditBalance.toLocaleString();
  const monthlyAllowance = creditAccount.monthlyAllowance || 1000;
  const monthlyAllowanceDisplay = monthlyAllowance.toLocaleString();
  
  // Calculate days until reset
  const daysUntilReset = creditAccount.billingCycleEnd
    ? Math.ceil((creditAccount.billingCycleEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Determine status color
  const isLow = creditBalance < monthlyAllowance * 0.2; // Less than 20% remaining
  const isEmpty = creditBalance === 0;

  return (
    <div className="bg-card rounded-lg shadow-card p-6 border-2 border-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-1">
            AI Credits
          </h3>
          <p className="text-sm text-muted-foreground">
            For Startegizer & Exam Generation
          </p>
        </div>
        {isEmpty && (
          <span className="px-2 py-1 bg-status-error/10 text-status-error text-xs font-semibold rounded">
            Empty
          </span>
        )}
        {isLow && !isEmpty && (
          <span className="px-2 py-1 bg-status-warning/10 text-status-warning text-xs font-semibold rounded">
            Low
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-4xl font-bold ${
            isEmpty ? "text-status-error" : isLow ? "text-status-warning" : "text-card-foreground"
          }`}>
            {creditBalanceDisplay}
          </span>
          <span className="text-muted-foreground text-sm">
            credits
          </span>
        </div>
        
        {/* Show breakdown if balance exceeds monthly allowance (plan switch scenario) */}
        {creditBalance > monthlyAllowance && (
          <p className="text-xs text-muted-foreground mb-2">
            {monthlyAllowanceDisplay} monthly allowance + {creditBalance - monthlyAllowance} remaining
          </p>
        )}
        
        {/* Progress bar - cap at 100% if balance exceeds allowance */}
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isEmpty
                ? "bg-status-error"
                : isLow
                ? "bg-status-warning"
                : "bg-status-success"
            }`}
            style={{
              width: `${Math.min((creditBalance / monthlyAllowance) * 100, 100)}%`,
            }}
          />
        </div>
        
        <p className="text-xs text-muted-foreground">
          {monthlyAllowanceDisplay} credits/month allowance
        </p>

        {daysUntilReset !== null && daysUntilReset > 0 && (
          <p className="text-xs text-muted-foreground">
            Resets in {daysUntilReset} {daysUntilReset === 1 ? "day" : "days"}
          </p>
        )}
      </div>

      {isEmpty && (
        <Link
          href="/pricing"
          className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition text-sm"
        >
          Buy More Credits
        </Link>
      )}
      
      {isLow && !isEmpty && (
        <Link
          href="/pricing"
          className="block w-full text-center px-4 py-2 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/10 transition text-sm"
        >
          Top Up Credits
        </Link>
      )}
    </div>
  );
}

