"use client";

import Link from "next/link";

interface OnboardingPromptProps {
  onboardingStatus: string | null;
}

export default function OnboardingPrompt({ onboardingStatus }: OnboardingPromptProps) {
  if (onboardingStatus === "COMPLETED") {
    return null;
  }

  const getMessage = () => {
    if (!onboardingStatus || onboardingStatus === "NOT_STARTED") {
      return {
        title: "Complete Your Profile",
        description: "Set up your profile to unlock personalized learning and Startegizer AI assistant",
        cta: "Start Onboarding",
      };
    }
    return {
      title: "Finish Your Profile",
      description: "Complete your profile to unlock full Startegizer personalization",
      cta: "Continue Onboarding",
    };
  };

  const message = getMessage();

  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-brand-teal/10 rounded-lg p-6 mb-6 border border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {message.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3">
            {message.description}
          </p>
          <Link
            href="/onboarding/persona"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
          >
            {message.cta} →
          </Link>
        </div>
        <button className="text-muted-foreground hover:text-foreground ml-4">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

