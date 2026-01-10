import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { LEVEL_CONFIGS } from "@/lib/levels";
import OnboardingPrompt from "@/components/onboarding/OnboardingPrompt";
import FeatureBlocks from "@/components/dashboard/FeatureBlocks";
import SubscriptionRefresh from "@/components/dashboard/SubscriptionRefresh";
import CreditBalance from "@/components/dashboard/CreditBalance";
import Tooltip from "@/components/ui/Tooltip";
import EarlyAdopterBadge from "@/components/admin/EarlyAdopterBadge";
// PARKED: Referral system - hidden until premium requirement is clarified
// import ReferralCode from "@/components/dashboard/ReferralCode";

// Mark as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/dashboard");
  }

  // Check onboarding status for dashboard personalization
  // @ts-ignore - Prisma types not fully recognized by TypeScript yet
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { onboardingStatus: true },
  });

  // Get comprehensive user stats
  const [
    userData,
    userPoints,
    userStreak,
    progressCount,
    badgesCount,
    levelProgress,
    recentBadges,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        currentLevel: true, 
        maxUnlockedLevel: true, 
        totalChallengesCompleted: true,
        subscriptionTier: true,
        isEarlyAdopter: true,
        earlyAdopterTier: true,
        referralCode: true,
        referralCount: true,
      },
    }),
    prisma.userPoints.findUnique({
      where: { userId: user.id },
    }),
    prisma.userStreak.findUnique({
      where: { userId: user.id },
    }),
    prisma.userProgress.count({
      where: {
        userId: user.id,
        status: "completed",
      },
    }),
    prisma.userBadge.count({
      where: { userId: user.id },
    }),
    prisma.userLevelProgress.findMany({
      where: { userId: user.id },
      select: { levelNumber: true, status: true, bestScore: true, passedAt: true },
      orderBy: { levelNumber: "asc" },
    }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
      take: 3,
    }),
  ]);

  const totalPoints = userPoints?.totalPoints || 0;
  const currentStreak = userStreak?.currentStreak || 0;
  const longestStreak = userStreak?.longestStreak || 0;
  const cardsCompleted = progressCount || 0;
  const currentLevel = userData?.currentLevel || 1;
  const maxUnlockedLevel = userData?.maxUnlockedLevel || 1;
  const challengesCompleted = userData?.totalChallengesCompleted || 0;

  // Get subscription tier
  const subscriptionTier = userData?.subscriptionTier || user.subscriptionTier || "free";

  // Get level status map for next available level
  const levelStatusMap = new Map(
    levelProgress.map((lp) => [lp.levelNumber, lp.status])
  );

  // Get next available level
  const nextAvailableLevel = levelProgress.find(
    (lp) => lp.status === "AVAILABLE"
  )?.levelNumber || maxUnlockedLevel;

  // Show success message if upgraded
  const showUpgradeSuccess = params?.upgraded === "true";

  return (
    <div className="min-h-screen bg-muted">
      <Suspense fallback={null}>
        <SubscriptionRefresh />
      </Suspense>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upgrade Success Message */}
        {showUpgradeSuccess && (
          <div className="mb-6 bg-status-success/10 border border-status-success/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-status-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-status-success font-medium">
                🎉 Welcome to Premium! Your subscription is now active. The page will refresh automatically to show all premium features.
              </p>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-brand-teal/10 rounded-xl p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Welcome back, {user.name || user.email?.split("@")[0]}! 👋
                  </h1>
                  {userData?.isEarlyAdopter && userData?.earlyAdopterTier && (
                    <EarlyAdopterBadge tier={userData.earlyAdopterTier as any} />
                  )}
                </div>
                <p className="text-muted-foreground">
                  Continue your journey to AI Governance mastery
                </p>
                {/* PARKED: Referral system - hidden until premium requirement is clarified
                {userData?.referralCode && (
                  <ReferralCode
                    referralCode={userData.referralCode}
                    referralCount={userData.referralCount || 0}
                  />
                )}
                */}
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Prompt */}
        <OnboardingPrompt onboardingStatus={profile?.onboardingStatus || null} />

        {/* Credit Balance - Only for Premium Users */}
        {subscriptionTier === "premium" && (
          <div className="mb-8">
            <CreditBalance userId={user.id} subscriptionTier={subscriptionTier} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg shadow-card p-6 border border-border hover:shadow-float transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Points
                </p>
                <p className="text-3xl font-bold text-card-foreground">{totalPoints.toLocaleString()}</p>
              </div>
              <Tooltip
                content="Points earned from completing concept cards, passing exams, and achieving milestones."
                position="left"
              >
                <div className="bg-status-warning/10 rounded-lg p-3 cursor-help">
                  <svg className="h-6 w-6 text-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </Tooltip>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card p-6 border border-border hover:shadow-float transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Current Streak
                </p>
                <p className="text-3xl font-bold text-card-foreground">{currentStreak}</p>
                <p className="text-xs text-muted-foreground mt-1">Best: {longestStreak} days</p>
              </div>
              <Tooltip
                content={`Current streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''}. Best: ${longestStreak} day${longestStreak !== 1 ? 's' : ''}. Complete cards or exams daily to maintain it.`}
                position="left"
              >
                <div className="bg-status-success/10 rounded-lg p-3 cursor-help">
                  <svg className="h-6 w-6 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </Tooltip>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card p-6 border border-border hover:shadow-float transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Concepts Mastered
                </p>
                <p className="text-3xl font-bold text-card-foreground">{cardsCompleted}</p>
                <p className="text-xs text-muted-foreground mt-1">of 360</p>
              </div>
              <Tooltip
                content={`${cardsCompleted} of 360 concept cards mastered. Interactive learning modules covering AI governance topics.`}
                position="left"
              >
                <div className="bg-accent/10 rounded-lg p-3 cursor-help">
                  <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </Tooltip>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-card p-6 border border-border hover:shadow-float transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Badges Earned
                </p>
                <p className="text-3xl font-bold text-card-foreground">{badgesCount}</p>
              </div>
              <Tooltip
                content={`${badgesCount} badge${badgesCount !== 1 ? 's' : ''} earned. Achievements unlocked by reaching milestones and demonstrating mastery.`}
                position="left"
              >
                <div className="bg-brand-teal/10 rounded-lg p-3 cursor-help">
                  <svg className="h-6 w-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Feature Blocks */}
        <FeatureBlocks 
          subscriptionTier={subscriptionTier}
          profileComplete={profile?.onboardingStatus === "COMPLETED"}
        />

        {/* Recent Achievements & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          {recentBadges.length > 0 && (
            <div className="bg-card rounded-lg shadow-card p-6 border border-border">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Recent Achievements
              </h2>
              <div className="space-y-3">
                {recentBadges.map((userBadge) => (
                  <div
                    key={userBadge.id}
                    className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="bg-brand-teal/10 rounded-lg p-2">
                      <svg className="h-6 w-6 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground">{userBadge.badge.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/badges"
                className="mt-4 inline-block text-sm text-accent hover:text-accent/80 font-medium"
              >
                View All Badges →
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-card rounded-lg shadow-card p-6 border border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Continue Learning
            </h2>
            <div className="space-y-3">
              <Link
                href={`/challenges/${nextAvailableLevel}`}
                className="flex items-center gap-4 p-4 bg-accent/10 border border-accent/20 rounded-lg hover:bg-accent/20 transition"
              >
                <div className="bg-accent rounded-lg p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">Start Level {nextAvailableLevel}</p>
                  <p className="text-sm text-muted-foreground">
                    {LEVEL_CONFIGS.find((l) => l.level === nextAvailableLevel)?.title}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
