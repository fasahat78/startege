"use client";

import { useRouter } from "next/navigation";
import FeatureBlock from "./FeatureBlock";
import PrimaryFeatureCard from "./PrimaryFeatureCard";

interface FeatureBlocksProps {
  subscriptionTier: string;
  profileComplete: boolean;
}

export default function FeatureBlocks({
  subscriptionTier,
  profileComplete,
}: FeatureBlocksProps) {
  const router = useRouter();
  const isPremium = subscriptionTier === "premium";

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  const handleCompleteProfile = () => {
    router.push("/onboarding/persona");
  };

  // Separate free and premium features for better organization
  const freeFeatures = [
    <FeatureBlock
      key="concepts"
      title="Concept Cards"
      description="Browse and learn from 360 AI governance concept cards organized by domain and difficulty level."
      icon={
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      }
      isFree={true}
      isPremium={false}
      isUnlocked={true}
      ctaText="View All Concepts →"
      ctaHref="/concepts"
    />,
    <FeatureBlock
      key="challenges"
      title="Mastery Exams"
      description="Take comprehensive mastery exams (Levels 1-40) including boss level exams. Levels 1-10 are free, Levels 11-40 require premium."
      icon={
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      isFree={true}
      isPremium={true}
      isUnlocked={true}
      ctaText={isPremium ? "View All Levels →" : "View Free Levels →"}
      ctaHref="/challenges"
    />,
  ];

  const premiumFeatures = [
    <FeatureBlock
      key="startegizer"
      title="Startegizer"
      description="Your AI Governance Expert Assistant. Get personalized guidance, detailed explanations, and scenario-based learning with our premium AI tutor powered by Gemini."
      icon={
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      }
      isFree={false}
      isPremium={true}
      isUnlocked={isPremium && profileComplete}
      requiresProfile={true}
      profileComplete={profileComplete}
      ctaText={
        !isPremium
          ? "Upgrade to Premium →"
          : !profileComplete
          ? "Complete Profile →"
          : "Open Startegizer →"
      }
      ctaHref={isPremium && profileComplete ? "/startegizer" : undefined}
      ctaAction={
        !isPremium
          ? handleUpgrade
          : !profileComplete
          ? handleCompleteProfile
          : undefined
      }
    />,
    <FeatureBlock
      key="aigp-exams"
      title="AIGP Prep Exams"
      description="Full-length practice exams aligned with the AIGP certification blueprint. 3 comprehensive exams with 100 questions each, covering all domains and difficulty levels."
      icon={
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      isFree={false}
      isPremium={true}
      isUnlocked={isPremium}
      ctaText={isPremium ? "View Exams →" : "Upgrade to Premium →"}
      ctaHref={isPremium ? "/aigp-exams" : undefined}
      ctaAction={isPremium ? undefined : handleUpgrade}
    />,
    <FeatureBlock
      key="market-scan"
      title="Market Scan"
      description="Real-time regulatory intelligence and AI governance updates. Daily automated scanning of verified sources including EU Commission, ICO, FTC, NIST, and leading tech publications. Stay ahead of regulatory changes and compliance requirements."
      icon={
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      isFree={false}
      isPremium={true}
      isUnlocked={isPremium}
      ctaText={isPremium ? "Browse Market Scan →" : "Upgrade to Premium →"}
      ctaHref={isPremium ? "/market-scan" : undefined}
      ctaAction={isPremium ? undefined : handleUpgrade}
    />,
    <FeatureBlock
      key="analytics"
      title="Advanced Analytics"
      description="Detailed learning analytics, performance insights, and personalized learning path recommendations."
      icon={
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
      isFree={false}
      isPremium={true}
      isUnlocked={isPremium}
      ctaText={isPremium ? "View Analytics →" : "Upgrade to Premium →"}
      ctaHref={isPremium ? "/dashboard/analytics" : undefined}
      ctaAction={isPremium ? undefined : handleUpgrade}
      badge="Coming Soon"
    />,
  ];

  // Combine all features for premium users: 6 cards total
  // Row 1: Startegizer, AIGP Prep Exams, Market Scan
  // Row 2: Advanced Analytics, Concept Cards, Mastery Exams
  const allFeatures = isPremium 
    ? [
        premiumFeatures[0], // Startegizer
        premiumFeatures[1], // AIGP Prep Exams
        premiumFeatures[2], // Market Scan
        premiumFeatures[3], // Advanced Analytics
        freeFeatures[0],     // Concept Cards
        freeFeatures[1],    // Mastery Exams
      ]
    : [
        ...freeFeatures,    // Concept Cards, Mastery Exams
        ...premiumFeatures, // All premium features
      ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Features
      </h2>
      
      {/* Free Features First - Show prominently for free users */}
      {!isPremium && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Available Now</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {freeFeatures}
          </div>
        </div>
      )}

      {/* Premium Features for Free Users */}
      {!isPremium && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Premium Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {premiumFeatures}
          </div>
        </div>
      )}

      {/* All Features for Premium Users - 2 rows of 3 cards each */}
      {isPremium && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {allFeatures}
        </div>
      )}
    </div>
  );
}

