import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";

interface AnswerSubmission {
  questionId: string;
  selectedAnswer: string;
  timeSpent: number; // seconds
}

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
    const body = await request.json();
    const { attemptId, answers, totalTimeSpent } = body;

    if (!attemptId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify attempt belongs to user
    const attempt = await prisma.challengeAttempt.findUnique({
      where: { id: attemptId },
      include: {
        challenge: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (attempt.completedAt) {
      return NextResponse.json(
        { error: "Attempt already completed" },
        { status: 400 }
      );
    }

    // Get all questions for this challenge
    const questions = await prisma.challengeQuestion.findMany({
      where: { challengeId: attempt.challengeId },
      orderBy: { order: "asc" },
    });

    // Grade answers
    let correctCount = 0;
    const answerResults: Array<{
      questionId: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      rationale: string;
    }> = [];

    for (const answer of answers as AnswerSubmission[]) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctCount++;

      // Save answer
      await prisma.challengeAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: question.id,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          timeSpent: answer.timeSpent || 0,
        },
      });

      answerResults.push({
        questionId: question.id,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        rationale: question.rationale,
      });
    }

    // Calculate score
    const totalQuestions = questions.length;
    const percentage = (correctCount / totalQuestions) * 100;
    const passed = percentage >= attempt.challenge.passingScore;

    // Update attempt
    const updatedAttempt = await prisma.challengeAttempt.update({
      where: { id: attempt.id },
      data: {
        score: correctCount,
        percentage,
        timeSpent: totalTimeSpent || 0,
        passed,
        completedAt: new Date(),
      },
    });

    // Update user level progress
    const levelProgress = await prisma.userLevelProgress.upsert({
      where: {
        userId_levelNumber: {
          userId: user.id,
          levelNumber: attempt.challenge.levelNumber || attempt.challenge.level,
        },
      },
      create: {
        userId: user.id,
        levelNumber: attempt.challenge.levelNumber || attempt.challenge.level,
        unlockedAt: new Date(),
        passedAt: passed ? new Date() : undefined,
        bestScore: percentage,
        attemptsCount: 1,
        status: passed ? "PASSED" : "IN_PROGRESS",
      },
      update: {
        attemptsCount: {
          increment: 1,
        },
        bestScore: passed
          ? Math.max(
              (await prisma.userLevelProgress.findUnique({
                where: {
                  userId_levelNumber: {
                    userId: user.id,
                    levelNumber: attempt.challenge.levelNumber || attempt.challenge.level,
                  },
                },
              }))?.bestScore || 0,
              percentage
            )
          : undefined,
        passedAt: passed ? new Date() : undefined,
        status: passed ? "PASSED" : "IN_PROGRESS",
      },
    });

    // If passed, unlock next level
    const currentLevel = attempt.challenge.levelNumber || attempt.challenge.level;
    if (passed && currentLevel < 40) {
      const nextLevel = currentLevel + 1;
      await prisma.userLevelProgress.upsert({
        where: {
          userId_levelNumber: {
            userId: user.id,
            levelNumber: nextLevel,
          },
        },
        create: {
          userId: user.id,
          levelNumber: nextLevel,
          unlockedAt: new Date(),
          status: "LOCKED",
        },
        update: {}, // Don't update if already exists
      });
    }

    // Award points if passed
    if (passed) {
      const levelConfig = await import("@/lib/levels").then(
        (m) => m.getLevelConfig(attempt.challenge.levelNumber || attempt.challenge.level)
      );
      const basePoints = levelConfig?.basePoints || 50;

      // Calculate bonuses
      let bonusPoints = 0;
      if (percentage >= 90) {
        bonusPoints += 25; // Performance bonus
      }
      if (attempt.isFirstAttempt) {
        bonusPoints += 20; // First try bonus
      }

      const totalPoints = basePoints + bonusPoints;

      // Update user points
      await prisma.userPoints.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalPoints,
          pointsHistory: [
            {
              points: totalPoints,
              reason: `Level ${attempt.challenge.levelNumber || attempt.challenge.level} completion`,
              timestamp: new Date().toISOString(),
            },
          ],
        },
        update: {
          totalPoints: {
            increment: totalPoints,
          },
          pointsHistory: {
            push: {
              points: totalPoints,
              reason: `Level ${attempt.challenge.levelNumber || attempt.challenge.level} completion`,
              timestamp: new Date().toISOString(),
            },
          },
        },
      });
    }

    return NextResponse.json({
      attempt: updatedAttempt,
      results: {
        correctCount,
        totalQuestions,
        percentage: Math.round(percentage * 100) / 100,
        passed,
        answerResults,
      },
    });
  } catch (error) {
    console.error("Error submitting challenge:", error);
    return NextResponse.json(
      { error: "Failed to submit challenge" },
      { status: 500 }
    );
  }
}

