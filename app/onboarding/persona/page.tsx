import { redirect } from "next/navigation";
import { PersonaType } from "@prisma/client";
import PersonaSelectionClient from "@/components/onboarding/PersonaSelectionClient";
import { getOnboardingStatus, getPersonaDisplayName, getPersonaDescription } from "@/lib/onboarding-helpers";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PersonaSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  console.log("[ONBOARDING PERSONA PAGE] ===== Page loading =====");
  try {
    const params = await searchParams;
    const user = await getCurrentUser();
    console.log("[ONBOARDING PERSONA PAGE] User:", user ? user.email : "null");

    if (!user) {
      console.log("[ONBOARDING PERSONA PAGE] ⚠️ No user - redirecting to signin");
      redirect("/auth/signin-firebase?redirect=/onboarding/persona");
    }

    // Check if onboarding is already completed
    let onboardingStatus;
    try {
      onboardingStatus = await getOnboardingStatus(user.id);
      console.log("[ONBOARDING PERSONA PAGE] Onboarding status:", onboardingStatus);
    } catch (dbError: any) {
      console.error("[ONBOARDING PERSONA PAGE] ❌ Error getting onboarding status:", dbError.message);
      console.error("[ONBOARDING PERSONA PAGE] Error stack:", dbError.stack);
      // If database query fails, allow user to continue (they might not have a profile yet)
      onboardingStatus = null;
    }
    
    // Allow editing if edit=true query param is present, otherwise redirect if completed
    if (onboardingStatus === "COMPLETED" && params.edit !== "true") {
      redirect("/dashboard");
    }

    // Get all personas
    const personas = Object.values(PersonaType).map((type) => ({
      type,
      name: getPersonaDisplayName(type),
      description: getPersonaDescription(type),
    }));

    return <PersonaSelectionClient personas={personas} />;
  } catch (error: any) {
    console.error("[ONBOARDING PERSONA PAGE] ❌ Fatal error:", error.message);
    console.error("[ONBOARDING PERSONA PAGE] Error stack:", error.stack);
    // Re-throw to show error page (better than silent failure)
    throw error;
  }
}
