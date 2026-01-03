import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import PricingClient from "@/components/pricing/PricingClient";
import CreditBalance from "@/components/dashboard/CreditBalance";
import SubscriptionRefresh from "@/components/dashboard/SubscriptionRefresh";

export default async function PricingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/pricing");
  }

  // Check if user is already premium and which plan they have
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { 
      subscriptionTier: true,
      subscription: {
        select: {
          planType: true,
          status: true,
        },
      },
    },
  });

  const isPremium = dbUser?.subscriptionTier === "premium";
  // Handle both "year"/"month" (from Stripe) and "annual"/"monthly" (our normalized value)
  const rawPlanType = dbUser?.subscription?.planType || null;
  // Normalize: "year" → "annual", "month" → "monthly"
  const currentPlanType = rawPlanType === "year" ? "annual" 
    : rawPlanType === "month" ? "monthly" 
    : rawPlanType;
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log("[PRICING PAGE] User subscription status:", {
      isPremium,
      rawPlanType,
      currentPlanType,
      subscriptionStatus: dbUser?.subscription?.status,
    });
  }

  return (
    <div className="min-h-screen bg-muted">
      <SubscriptionRefresh />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Credit Balance - Show for Premium Users */}
        {isPremium && (
          <div className="mb-8 max-w-2xl mx-auto">
            <CreditBalance userId={user.id} subscriptionTier={isPremium ? "premium" : "free"} />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-muted-foreground">
            Unlock the full AI Governance learning experience
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Subscription Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-card rounded-lg shadow-card p-8 border-2 border-border">
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                Free
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-card-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-muted-foreground text-sm">360 Concept Cards</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-muted-foreground text-sm">Basic Dashboard</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-muted-foreground text-sm">Levels 1-10 Exams</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-muted-foreground text-sm">Progress Tracking</span>
                </li>
              </ul>
              <Link
                href="/dashboard"
                className="block w-full text-center px-6 py-3 border-2 border-border rounded-lg font-semibold hover:bg-muted transition"
              >
                {isPremium ? "View Dashboard" : "Current Plan"}
              </Link>
            </div>

            {/* Monthly Premium */}
            <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-brand-teal/10 rounded-lg shadow-card p-8 border-2 border-primary relative">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                POPULAR
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                Premium Monthly
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-card-foreground">$19</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-foreground text-sm">Everything in Free</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-foreground text-sm">All Mastery Exams (1-40)</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-foreground text-sm">AIGP Prep Exams</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-foreground text-sm">Startegizer AI Assistant</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-foreground text-sm">1,000 Credits/month</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-foreground text-sm">Advanced Analytics</span>
                </li>
              </ul>
              <PricingClient isPremium={isPremium} planType="monthly" currentPlanType={currentPlanType} />
            </div>

            {/* Annual Premium */}
            <div className={`rounded-lg shadow-card p-8 border-2 relative ${
              currentPlanType === "annual" 
                ? "bg-gradient-to-br from-accent/10 via-brand-teal/10 to-primary/10 border-accent" 
                : "bg-card border-border"
            }`}>
              {currentPlanType !== "annual" && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                  BEST VALUE
                </div>
              )}
              {currentPlanType === "annual" && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                  CURRENT PLAN
                </div>
              )}
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                Premium Annual
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-card-foreground">$199</span>
                <span className="text-muted-foreground">/year</span>
                <p className="text-sm text-status-success font-semibold mt-1">Save $29 (12% off)</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-foreground text-sm">Everything in Monthly</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-foreground text-sm">1,250 Credits/month (15,000/year)</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-status-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-foreground text-sm">Priority Support</span>
                </li>
              </ul>
              <PricingClient isPremium={isPremium} planType="annual" currentPlanType={currentPlanType} />
            </div>
          </div>
        </div>

        {/* AI Credit Bundles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Need More AI Credits?
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Purchase additional AI credits for Startegizer and exam generation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Small Credits */}
            <div className="bg-card rounded-lg shadow-card p-6 border-2 border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-2">
                Small Credits
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-card-foreground">$5</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Perfect for occasional use
              </p>
              <PricingClient isPremium={isPremium} planType="credits-small" currentPlanType={currentPlanType} />
            </div>

            {/* Standard Credits */}
            <div className="bg-card rounded-lg shadow-card p-6 border-2 border-accent relative">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-semibold">
                POPULAR
              </div>
              <h3 className="text-lg font-bold text-card-foreground mb-2">
                Standard Credits
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-card-foreground">$10</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Great for regular users
              </p>
              <PricingClient isPremium={isPremium} planType="credits-standard" currentPlanType={currentPlanType} />
            </div>

            {/* Large Credits */}
            <div className="bg-card rounded-lg shadow-card p-6 border-2 border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-2">
                Large Credits
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-card-foreground">$25</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Best value for power users
              </p>
              <PricingClient isPremium={isPremium} planType="credits-large" currentPlanType={currentPlanType} />
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-accent hover:text-accent/80 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
