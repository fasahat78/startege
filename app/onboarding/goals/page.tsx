import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import GoalsSelectionClient from "@/components/onboarding/GoalsSelectionClient";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GOAL_OPTIONS = [
  "AIGP Certification Preparation",
  "Career Advancement",
  "Current Role Enhancement",
  "Academic Research",
  "Organizational Implementation",
  "Personal Knowledge",
  "Compliance Requirements",
  "Consulting Practice",
  "Product Development",
  "Teaching & Training",
];

export default async function GoalsSelectionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/onboarding/goals");
  }

  // Check onboarding status
  // @ts-ignore - Prisma types not fully recognized by TypeScript yet
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    select: { onboardingStatus: true },
  });

  const onboardingStatus = profile?.onboardingStatus || null;
  
  if (!onboardingStatus || onboardingStatus === "NOT_STARTED") {
    redirect("/onboarding/persona");
  }

  if (onboardingStatus === "COMPLETED") {
    redirect("/dashboard");
  }

  return <GoalsSelectionClient goals={GOAL_OPTIONS} />;
}
