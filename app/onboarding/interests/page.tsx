import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import InterestsSelectionClient from "@/components/onboarding/InterestsSelectionClient";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const INTEREST_OPTIONS = [
  "Regulatory Compliance",
  "Ethical AI & Fairness",
  "Technical Implementation",
  "Risk Management",
  "Strategic Planning",
  "Legal & Regulatory Analysis",
  "Data Privacy & Protection",
  "Governance Frameworks",
  "Product Development",
  "Research & Academia",
];

export default async function InterestsSelectionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/onboarding/interests");
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

  return <InterestsSelectionClient interests={INTEREST_OPTIONS} />;
}
