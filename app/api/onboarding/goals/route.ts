import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { OnboardingStatus } from "@prisma/client";

const VALID_GOALS = [
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
    const { goals } = body; // Array of goal strings

    if (!Array.isArray(goals)) {
      return NextResponse.json(
        { error: "Goals must be an array" },
        { status: 400 }
      );
    }

    // Validate goals
    const invalidGoals = goals.filter(
      (goal) => !VALID_GOALS.includes(goal)
    );

    if (invalidGoals.length > 0) {
      return NextResponse.json(
        { error: `Invalid goals: ${invalidGoals.join(", ")}` },
        { status: 400 }
      );
    }

    // Get user profile first
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
          onboardingStatus: OnboardingStatus.GOALS_SELECTED,
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

    // Delete existing goals (using profile.id)
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    await prisma.userGoal.deleteMany({
      where: { userId: profileId },
    });

    // Create new goals (using profile.id)
    if (goals.length > 0) {
      // @ts-ignore - Prisma types not fully recognized by TypeScript yet
      await prisma.userGoal.createMany({
        data: goals.map((goal) => ({
          userId: profileId,
          goal,
        })),
      });
    }

    // Update profile status to completed
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    profile = await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        onboardingStatus: OnboardingStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      profile,
      goals,
      nextStep: "complete",
    });
  } catch (error) {
    console.error("Goals selection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


