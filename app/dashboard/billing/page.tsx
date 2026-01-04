import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import CreditBalance from "@/components/dashboard/CreditBalance";
import BillingClient from "@/components/dashboard/BillingClient";
import BillingHistory from "@/components/dashboard/BillingHistory";
import PaymentMethods from "@/components/dashboard/PaymentMethods";
import CreditPurchaseHistory from "@/components/dashboard/CreditPurchaseHistory";

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/dashboard/billing");
  }

  // Get user subscription and credit data
  const [dbUser, subscription, creditAccount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionTier: true,
      },
    }),
    prisma.subscription.findUnique({
      where: { userId: user.id },
      select: {
        planType: true,
        status: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      },
    }),
    prisma.aICredit.findUnique({
      where: { userId: user.id },
      select: {
        currentBalance: true,
        monthlyAllowance: true,
        billingCycleEnd: true,
      },
    }),
  ]);

  if (!dbUser) {
    redirect("/auth/signin-firebase?redirect=/dashboard/billing");
  }

  const isPremium = dbUser.subscriptionTier === "premium";
  const planType = subscription?.planType === "year" ? "annual" : subscription?.planType === "month" ? "monthly" : subscription?.planType || null;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Subscription & Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information</p>
        </div>

        {/* Credit Balance - Premium Only */}
        {isPremium && (
          <div className="mb-6">
            <CreditBalance userId={user.id} subscriptionTier={dbUser.subscriptionTier} />
          </div>
        )}

        {/* Current Subscription */}
        <div className="bg-card rounded-lg shadow-card p-6 border border-border mb-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Current Subscription</h2>
          
          {isPremium && subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-card-foreground capitalize">
                    {planType === "annual" ? "Annual" : planType === "monthly" ? "Monthly" : planType || "Premium"} Plan
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.status === "active" ? "Active" : subscription.status === "canceled" ? "Canceled" : subscription.status}
                  </p>
                </div>
                {subscription.status === "active" && (
                  <span className="px-3 py-1 bg-status-success/10 text-status-success text-xs font-semibold rounded-full">
                    Active
                  </span>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <span className="px-3 py-1 bg-status-warning/10 text-status-warning text-xs font-semibold rounded-full">
                    Cancels at period end
                  </span>
                )}
              </div>

              {subscription.currentPeriodEnd && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    {subscription.cancelAtPeriodEnd ? "Access until" : "Next billing date"}
                  </label>
                  <p className="text-card-foreground">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              <BillingClient 
                hasSubscription={!!subscription}
                stripeCustomerId={subscription.stripeCustomerId}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You're currently on the free plan. Upgrade to premium to unlock all features.
              </p>
              <Link
                href="/pricing"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Upgrade to Premium
              </Link>
            </div>
          )}
        </div>

        {/* Billing History */}
        {isPremium && subscription && (
          <div className="bg-card rounded-lg shadow-card p-6 border border-border mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-card-foreground">Billing History</h2>
              <BillingClient 
                hasSubscription={true}
                stripeCustomerId={subscription.stripeCustomerId}
                showHistory={true}
              />
            </div>
            <BillingHistory />
          </div>
        )}

        {/* Payment Methods */}
        {isPremium && subscription && (
          <div className="bg-card rounded-lg shadow-card p-6 border border-border mb-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Payment Methods</h2>
            <PaymentMethods />
          </div>
        )}

        {/* Credit Purchase History */}
        {isPremium && (
          <div className="bg-card rounded-lg shadow-card p-6 border border-border mb-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">Credit Purchase History</h2>
            <CreditPurchaseHistory />
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-card rounded-lg shadow-card p-6 border border-border">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isPremium && (
              <Link
                href="/pricing"
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
              >
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <p className="font-medium text-card-foreground">Upgrade to Premium</p>
                  <p className="text-sm text-muted-foreground">View pricing plans</p>
                </div>
              </Link>
            )}

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
            >
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="font-medium text-card-foreground">Profile</p>
                <p className="text-sm text-muted-foreground">View your profile</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

