import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import OnboardingCompleteClient from "@/components/onboarding/OnboardingCompleteClient";
import { getOnboardingStatus, getPersonaDisplayName } from "@/lib/onboarding-helpers";
import { PersonaType } from "@prisma/client";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OnboardingCompletePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/onboarding/complete");
  }

  // Check onboarding status
  const onboardingStatus = await getOnboardingStatus(user.id);
  
  if (!onboardingStatus || onboardingStatus === "NOT_STARTED") {
    redirect("/onboarding/persona");
  }

  if (onboardingStatus !== "COMPLETED") {
    // Redirect to appropriate step
    if (onboardingStatus === "PERSONA_SELECTED") {
      redirect("/onboarding/knowledge");
    } else if (onboardingStatus === "KNOWLEDGE_ASSESSED") {
      redirect("/onboarding/interests");
    } else if (onboardingStatus === "INTERESTS_SELECTED") {
      redirect("/onboarding/goals");
    }
  }

  // Get user profile
  // @ts-ignore - Prisma types not fully recognized by TypeScript yet
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: {
      interests: true,
      goals: true,
    },
  });

  if (!profile) {
    redirect("/onboarding/persona");
  }

  return (
    <OnboardingCompleteClient
      profile={{
        personaType: profile.personaType,
        customPersona: profile.customPersona,
        knowledgeLevel: profile.knowledgeLevel,
        interests: profile.interests.map((i) => i.interest),
        goals: profile.goals.map((g) => g.goal),
      }}
    />
  );
}
