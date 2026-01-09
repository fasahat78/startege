import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import KnowledgeAssessmentClient from "@/components/onboarding/KnowledgeAssessmentClient";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function KnowledgeAssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/onboarding/knowledge");
  }

  // Check onboarding status
  // @ts-ignore - Prisma types not fully recognized by TypeScript yet
  const statusProfile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { onboardingStatus: true },
  });

  const onboardingStatus = statusProfile?.onboardingStatus || null;
  
  if (!onboardingStatus || onboardingStatus === "NOT_STARTED") {
    redirect("/onboarding/persona");
  }

  // Allow editing if edit=true query param is present, otherwise redirect if completed
  if (onboardingStatus === "COMPLETED" && params.edit !== "true") {
    redirect("/dashboard");
  }

  // Get user's persona
  // @ts-ignore - Prisma types not fully recognized by TypeScript yet
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { personaType: true },
  });

  if (!profile?.personaType) {
    redirect("/onboarding/persona");
  }

  // Get scenarios for this persona
  // @ts-ignore - Prisma types not fully recognized by TypeScript yet
  const scenarios = await prisma.onboardingScenario.findMany({
      where: { personaType: profile.personaType as any },
    orderBy: { questionOrder: "asc" },
  });

  if (scenarios.length === 0) {
    // No scenarios for this persona, skip to interests
    redirect("/onboarding/interests");
  }

  return <KnowledgeAssessmentClient scenarios={scenarios} />;
}
