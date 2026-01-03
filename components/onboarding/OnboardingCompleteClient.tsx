"use client";

import { useRouter } from "next/navigation";
import { PersonaType, KnowledgeLevel } from "@prisma/client";
import { getPersonaDisplayName } from "@/lib/onboarding-helpers";

interface Profile {
  personaType: PersonaType | null;
  customPersona: string | null;
  knowledgeLevel: KnowledgeLevel;
  interests: string[];
  goals: string[];
}

interface OnboardingCompleteClientProps {
  profile: Profile;
}

export default function OnboardingCompleteClient({ profile }: OnboardingCompleteClientProps) {
  const router = useRouter();

  const personaName = profile.personaType
    ? getPersonaDisplayName(profile.personaType)
    : profile.customPersona || "Not specified";

  const knowledgeLevelDisplay: Record<KnowledgeLevel, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    NOT_ASSESSED: "Not Assessed",
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Profile Complete! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Your personalized learning experience is ready
          </p>
        </div>

        {/* Profile Summary */}
        <div className="bg-card rounded-lg shadow-card p-8 mb-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Your Profile Summary
          </h2>

          <div className="space-y-6">
            {/* Persona */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Role
              </h3>
              <p className="text-foreground text-lg">{personaName}</p>
            </div>

            {/* Knowledge Level */}
            {profile.knowledgeLevel !== "NOT_ASSESSED" && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Knowledge Level
                </h3>
                <p className="text-foreground text-lg">
                  {knowledgeLevelDisplay[profile.knowledgeLevel]}
                </p>
              </div>
            )}

            {/* Interests */}
            {profile.interests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Interests ({profile.interests.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Goals */}
            {profile.goals.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Goals ({profile.goals.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.goals.map((goal) => (
                    <span
                      key={goal}
                      className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Startegizer Info */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-brand-teal/10 rounded-lg p-6 mb-8 border border-primary/20">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            🚀 Startegizer is Ready!
          </h3>
          <p className="text-muted-foreground mb-4">
            Your AI Governance Expert Assistant is now personalized based on your profile.
            {profile.knowledgeLevel === "NOT_ASSESSED" && (
              <span className="block mt-2 text-sm">
                ⚠️ Complete your knowledge assessment to unlock full Startegizer personalization.
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            Startegizer uses your role, knowledge level, interests, and goals to provide
            tailored guidance and access to relevant prompt libraries.
          </p>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              console.log("[ONBOARDING COMPLETE] Redirecting to dashboard");
              window.location.href = "/dashboard";
            }}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition text-lg"
          >
            Start Learning →
          </button>
        </div>

        {/* Edit Profile Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            You can edit your profile anytime from your dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

