import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { OnboardingStatus } from "@prisma/client";

const VALID_INTERESTS = [
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

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { interests } = body; // Array of interest strings

    if (!Array.isArray(interests)) {
      return NextResponse.json(
        { error: "Interests must be an array" },
        { status: 400 }
      );
    }

    // Validate interests
    const invalidInterests = interests.filter(
      (interest) => !VALID_INTERESTS.includes(interest)
    );

    if (invalidInterests.length > 0) {
      return NextResponse.json(
        { error: `Invalid interests: ${invalidInterests.join(", ")}` },
        { status: 400 }
      );
    }

    // Get or create user profile first
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      // @ts-ignore - Prisma types not fully recognized by TypeScript yet
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          onboardingStatus: OnboardingStatus.INTERESTS_SELECTED,
        },
      });
    }

    // Ensure profile exists (TypeScript narrowing)
    if (!profile) {
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    const profileId = profile.id; // Store id to avoid null check issues

    // Delete existing interests (using profile.id, not user.id)
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    await prisma.userInterest.deleteMany({
      where: { userId: profileId },
    });

    // Create new interests (using profile.id)
    if (interests.length > 0) {
      // @ts-ignore - Prisma types not fully recognized by TypeScript yet
      await prisma.userInterest.createMany({
        data: interests.map((interest) => ({
          userId: profileId,
          interest,
        })),
      });
    }

    // Update profile status
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    profile = await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        onboardingStatus: OnboardingStatus.INTERESTS_SELECTED,
      },
    });

    return NextResponse.json({
      success: true,
      profile,
      interests,
      nextStep: "goals",
    });
  } catch (error) {
    console.error("Interests selection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

