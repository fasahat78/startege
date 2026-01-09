import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { OnboardingStatus } from "@prisma/client";
import { calculateKnowledgeLevel } from "@/lib/onboarding-helpers";

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
    const { answers } = body; // Array of { scenarioId, selectedAnswer }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Answers array is required" },
        { status: 400 }
      );
    }

    // Get user's profile to check persona
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { personaType: true, id: true },
    });

    if (!userProfile?.personaType) {
      return NextResponse.json(
        { error: "Please select a persona first" },
        { status: 400 }
      );
    }

    // Get scenarios for this persona
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    const scenarios = await prisma.onboardingScenario.findMany({
      where: { personaType: userProfile.personaType as any },
    });

    // Process answers and calculate knowledge level
    let correctCount = 0;
    const answerRecords = [];

    for (const answer of answers) {
      const scenario = scenarios.find((s: any) => s.id === answer.scenarioId);
      if (!scenario) continue;

      const isCorrect = answer.selectedAnswer === scenario.correctAnswer;
      if (isCorrect) correctCount++;

      // Store answer (using profile.id, not user.id)
      answerRecords.push({
        userId: userProfile.id,
        scenarioId: answer.scenarioId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
      });
    }

    // Calculate knowledge level
    const knowledgeLevel = calculateKnowledgeLevel(correctCount, answers.length);

    // Save answers
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    await prisma.onboardingScenarioAnswer.createMany({
      data: answerRecords,
      skipDuplicates: true,
    });

    // Update profile
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: user.id },
      data: {
        knowledgeLevel,
        onboardingStatus: OnboardingStatus.KNOWLEDGE_ASSESSED,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      knowledgeLevel,
      correctAnswers: correctCount,
      totalQuestions: answers.length,
      nextStep: "interests",
    });
  } catch (error) {
    console.error("Knowledge assessment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
