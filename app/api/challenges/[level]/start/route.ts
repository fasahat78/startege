import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { getLevelConfig } from "@/lib/levels";
import { checkBossEligibility } from "@/lib/boss-exam-gating";
import { checkLevel20BossEligibility } from "@/lib/level20-boss-gating";
import { checkLevel30BossEligibility } from "@/lib/level30-boss-gating";
import { checkLevel40BossEligibility } from "@/lib/level40-boss-gating";

/**
 * Start Challenge (Legacy Route - Redirects to Exam System)
 * 
 * This route finds or creates an Exam record for the level,
 * then redirects to the new exam start API.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { level } = await params;
    const levelNumber = parseInt(level);

    if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 40) {
      return NextResponse.json(
        { error: "Invalid level number" },
        { status: 400 }
      );
    }

    // Get challenge for this level
    const challenge = await (prisma as any).challenge.findUnique({
      where: { levelNumber },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this level
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // TEMPORARY: Boss exam eligibility checks disabled for development/testing
    // TODO: Re-enable boss exam eligibility checks before production
    // 
    // if (challenge.isBoss) {
    //   if (levelNumber === 10) {
    //     const eligibility = await checkBossEligibility(session.user.id);
    //     if (!eligibility.eligible) {
    //       return NextResponse.json(
    //         {
    //           error: "BOSS_EXAM_NOT_ELIGIBLE",
    //           reasons: eligibility.reasons,
    //           missingCategories: eligibility.missingCategories,
    //         },
    //         { status: 403 }
    //       );
    //     }
    //   } else if (levelNumber === 20) {
    //     const eligibility = await checkLevel20BossEligibility(session.user.id);
    //     if (!eligibility.eligible) {
    //       return NextResponse.json(
    //         {
    //           error: "BOSS_EXAM_NOT_ELIGIBLE",
    //           reasons: eligibility.reasons,
    //           missingCategories: eligibility.missingCategories,
    //           missingLevels: eligibility.missingLevels,
    //           cooldownActive: eligibility.cooldownActive,
    //           nextEligibleAt: eligibility.nextEligibleAt?.toISOString(),
    //         },
    //         { status: 403 }
    //       );
    //     }
    //   } else if (levelNumber === 30) {
    //     const eligibility = await checkLevel30BossEligibility(session.user.id);
    //     if (!eligibility.eligible) {
    //       return NextResponse.json(
    //         {
    //           error: "BOSS_EXAM_NOT_ELIGIBLE",
    //           reasons: eligibility.reasons,
    //           missingCategories: eligibility.missingCategories,
    //           missingLevels: eligibility.missingLevels,
    //           cooldownActive: eligibility.cooldownActive,
    //           nextEligibleAt: eligibility.nextEligibleAt?.toISOString(),
    //         },
    //         { status: 403 }
    //       );
    //     }
    //   }
    // }

    // TEMPORARY: All levels unlocked for development
    // Removed premium check, previous level completion check, and boss exam eligibility checks

    // Find or create Exam record for this level
    let exam = await (prisma as any).exam.findFirst({
      where: {
        type: "LEVEL",
        levelNumber,
      },
    });

    if (!exam) {
      // Create Exam record if it doesn't exist
      const levelConfig = getLevelConfig(levelNumber);
      exam = await (prisma as any).exam.create({
        data: {
          type: "LEVEL",
          levelNumber,
          status: "DRAFT",
          systemPromptSnapshot: challenge.examSystemPrompt || "Generate exam questions for this level.",
          generationConfig: {
            questionCount: levelConfig?.questionCount || challenge.questionCount || 10,
            difficulty: levelNumber <= 10 ? "beginner" : levelNumber <= 20 ? "intermediate" : levelNumber <= 30 ? "advanced" : "expert",
            passMark: levelConfig?.passingScore || challenge.passingScore || 70,
            timeLimitSec: (levelConfig?.timeLimit || challenge.timeLimit || 20) * 60,
            isBoss: challenge.isBoss || false,
          },
          questions: { questions: [] }, // Empty initially, will be generated on first start
        },
      });
    }

    // Return examId so client can call exam start API
    return NextResponse.json({
      examId: exam.id,
      redirect: `/api/exams/${exam.id}/start`,
    });
  } catch (error: any) {
    console.error("Error starting challenge:", error);
    return NextResponse.json(
      { error: "Failed to start challenge", details: error.message },
      { status: 500 }
    );
  }
}

