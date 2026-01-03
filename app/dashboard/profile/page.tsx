import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { getPersonaDisplayName, getPersonaDescription } from "@/lib/onboarding-helpers";
import { OnboardingStatus, PersonaType, KnowledgeLevel } from "@prisma/client";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/dashboard/profile");
  }

  // Get user data with profile
  const [dbUser, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        email: true,
        name: true,
        image: true,
        createdAt: true,
        subscriptionTier: true,
      },
    }),
    prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: {
        interests: true,
        goals: true,
      },
    }),
  ]);

  if (!dbUser) {
    redirect("/auth/signin-firebase?redirect=/dashboard/profile");
  }

  const displayName = dbUser.name || dbUser.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(dbUser.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getOnboardingStatusBadge = (status: OnboardingStatus | null) => {
    if (!status || status === "NOT_STARTED") {
      return (
        <span className="px-3 py-1 bg-status-error/10 text-status-error text-xs font-semibold rounded-full">
          Not Started
        </span>
      );
    }
    if (status === "COMPLETED") {
      return (
        <span className="px-3 py-1 bg-status-success/10 text-status-success text-xs font-semibold rounded-full">
          Completed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-status-warning/10 text-status-warning text-xs font-semibold rounded-full">
        In Progress
      </span>
    );
  };

  const getKnowledgeLevelDisplay = (level: KnowledgeLevel | null) => {
    if (!level || level === "NOT_ASSESSED") return "Not Assessed";
    return level.charAt(0) + level.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your profile and learning preferences</p>
        </div>

        {/* Profile Information */}
        <div className="bg-card rounded-lg shadow-card p-6 border border-border mb-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Profile Information</h2>
          
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-semibold">
                {initials}
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                  <p className="text-card-foreground font-medium">{displayName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-card-foreground">{dbUser.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-card-foreground">{memberSince}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription</label>
                  <p className="text-card-foreground capitalize">{dbUser.subscriptionTier}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Status */}
        <div className="bg-card rounded-lg shadow-card p-6 border border-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-card-foreground">Onboarding Status</h2>
            {getOnboardingStatusBadge(profile?.onboardingStatus || null)}
          </div>

          {profile?.onboardingStatus === "COMPLETED" ? (
            <div className="space-y-4">
              {/* Persona */}
              {profile.personaType && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Persona
                  </label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium text-card-foreground">
                      {getPersonaDisplayName(profile.personaType)}
                    </p>
                    {profile.personaType !== PersonaType.OTHER && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {getPersonaDescription(profile.personaType)}
                      </p>
                    )}
                    {profile.customPersona && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.customPersona}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Knowledge Level */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Knowledge Level
                </label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-card-foreground">
                    {getKnowledgeLevelDisplay(profile.knowledgeLevel)}
                  </p>
                </div>
              </div>

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest.id}
                        className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full"
                      >
                        {interest.interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {profile.goals && profile.goals.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Goals
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.goals.map((goal) => (
                      <span
                        key={goal.id}
                        className="px-3 py-1 bg-brand-teal/10 text-brand-teal text-sm rounded-full"
                      >
                        {goal.goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Link
                  href="/onboarding/persona"
                  className="text-sm text-accent hover:text-accent/80 font-medium"
                >
                  Edit Profile →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Complete your profile to unlock personalized learning paths and Startegizer customization.
              </p>
              <Link
                href="/onboarding/persona"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Complete Profile
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-lg shadow-card p-6 border border-border">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
            >
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <div>
                <p className="font-medium text-card-foreground">Subscription & Billing</p>
                <p className="text-sm text-muted-foreground">Manage your subscription</p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted transition"
            >
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-medium text-card-foreground">Settings</p>
                <p className="text-sm text-muted-foreground">Account and preferences</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

