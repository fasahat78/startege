import { redirect } from "next/navigation";
import { PersonaType } from "@prisma/client";
import PersonaSelectionClient from "@/components/onboarding/PersonaSelectionClient";
import { getOnboardingStatus, getPersonaDisplayName, getPersonaDescription } from "@/lib/onboarding-helpers";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PersonaSelectionPage() {
  console.log("[ONBOARDING PERSONA PAGE] ===== Page loading =====");
  const user = await getCurrentUser();
  console.log("[ONBOARDING PERSONA PAGE] User:", user ? user.email : "null");

  if (!user) {
    console.log("[ONBOARDING PERSONA PAGE] ⚠️ No user - redirecting to signin");
    redirect("/auth/signin-firebase?redirect=/onboarding/persona");
  }

  // Check if onboarding is already completed
  const onboardingStatus = await getOnboardingStatus(user.id);
  
  if (onboardingStatus === "COMPLETED") {
    redirect("/dashboard");
  }

  // Get all personas
  const personas = Object.values(PersonaType).map((type) => ({
    type,
    name: getPersonaDisplayName(type),
    description: getPersonaDescription(type),
  }));

  return <PersonaSelectionClient personas={personas} />;
}
