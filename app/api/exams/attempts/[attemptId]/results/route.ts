import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Get Exam Attempt Results
 * 
 * This endpoint retrieves exam attempt results from the database.
 * Used when viewing past attempts that aren't in sessionStorage.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = await params;

    // Get exam attempt with exam and challenge info
    const attempt = await (prisma as any).examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            challenge: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    // Verify attempt belongs to user
    if (attempt.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Only return evaluated attempts
    if (attempt.status !== "EVALUATED") {
      return NextResponse.json(
        { error: "Attempt not yet evaluated" },
        { status: 400 }
      );
    }

    // Get exam questions to reconstruct answerResults
    const exam = attempt.exam;
    const questions = exam.questions as any;
    const answersData = attempt.answers as any;
    const feedback = attempt.feedback as any;

    if (!questions || !questions.questions) {
      return NextResponse.json(
        { error: "Invalid attempt data: questions not found" },
        { status: 400 }
      );
    }

    // Handle both answer formats:
    // - Old format: answers is an array
    // - New format: answers is an object with { optionMappings, userAnswers }
    let answers: any[] = [];
    if (Array.isArray(answersData)) {
      answers = answersData;
    } else if (answersData && typeof answersData === 'object' && answersData.userAnswers) {
      answers = answersData.userAnswers;
    } else if (!answersData) {
      return NextResponse.json(
        { error: "Invalid attempt data: answers not found" },
        { status: 400 }
      );
    }

    // Transform answerFeedback to answerResults format
    const answerResults = (feedback?.answerFeedback || []).map((fb: any) => {
      const question = questions.questions.find((q: any) => q.id === fb.questionId);
      const selectedOption = question?.options?.find((opt: any) => opt.id === fb.selectedOptionId);
      const correctOption = question?.options?.find((opt: any) => opt.id === fb.correctOptionId);
      
      return {
        questionId: fb.questionId,
        selectedAnswer: selectedOption?.text || fb.selectedOptionId || "Not answered",
        correctAnswer: correctOption?.text || fb.correctOptionId || "Unknown",
        isCorrect: fb.isCorrect,
        rationale: fb.rationale || "",
      };
    });

    // Calculate time spent
    const timeSpent = attempt.submittedAt && attempt.startedAt
      ? Math.floor((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000)
      : 0;

    // Get challenge metadata
    const challenge = exam.challenge;
    const challengeData = challenge ? {
      id: challenge.id,
      level: challenge.levelNumber || exam.levelNumber || 0,
      title: challenge.title || `Level ${exam.levelNumber}`,
    } : {
      id: exam.id,
      level: exam.levelNumber || 0,
      title: `Level ${exam.levelNumber}`,
    };

    const results = {
      attempt: {
        id: attempt.id,
        challengeId: challengeData.id,
        score: feedback?.correctCount || 0,
        percentage: attempt.score || 0,
        timeSpent,
        passed: attempt.pass || false,
        isFirstAttempt: attempt.attemptNumber === 1,
      },
      results: {
        pass: attempt.pass || false,
        passed: attempt.pass || false,
        scorePercent: attempt.score || 0,
        percentage: attempt.score || 0,
        correctCount: feedback?.correctCount || 0,
        totalQuestions: feedback?.totalQuestions || questions.questions.length,
        weakConceptIds: feedback?.weakConceptIds || [],
        answerResults,
        chatGPTAnalysis: feedback?.chatGPTAnalysis || null,
      },
    };

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error fetching attempt results:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempt results", details: error.message },
      { status: 500 }
    );
  }
}

