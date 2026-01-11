import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { assessExam, getNextAttemptNumber, type UserAnswer } from "@/lib/exam-assessment";
import { analyzeExamAttempt } from "@/lib/exam-analysis";
import { mapAnswerToOriginal } from "@/lib/exam-option-shuffle";
import { updateConceptProgress, extractConceptPerformance } from "@/lib/concept-progress";
import { rateLimiters } from "@/lib/rate-limit";

/**
 * Submit Exam Attempt
 * 
 * This endpoint handles deterministic exam assessment:
 * - Compares user answers with correctOptionId
 * - Computes score server-side
 * - Determines pass/fail deterministically
 * - Creates immutable ExamAttempt record
 * - Updates UserCategoryProgress / UserLevelProgress
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  let examId: string | undefined;
  let body: any;
  
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: Limit exam submission requests
    const identifier = user.id || request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await rateLimiters.examGeneration.limit(identifier);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: "Too many requests", 
          message: "Please wait before submitting another exam.",
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          }
        }
      );
    }

    const resolvedParams = await params;
    examId = resolvedParams.examId;
    body = await request.json();
    const { answers, timeSpent } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Missing required field: answers" },
        { status: 400 }
      );
    }

    // Get exam with questions
    const exam = await (prisma as any).exam.findUnique({
      where: { id: examId },
      include: {
        category: true,
        challenge: true,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    // Parse questions from JSON
    const questions = exam.questions as any;
    if (!questions || !Array.isArray(questions.questions)) {
      return NextResponse.json(
        { error: "Exam questions not found" },
        { status: 400 }
      );
    }

    // Parse generation config
    const config = exam.generationConfig as any;
    const challenge = exam.challenge;
    const isBoss = challenge?.isBoss || false;
    
    const assessmentConfig = {
      questionCount: config.questionCount || questions.questions.length,
      passMark: config.passMark || (isBoss ? 75 : 70), // Boss exams have higher pass mark
      scoringMethod: config.scoringMethod || "binary",
      isBoss,
      bossWeighting: config.bossWeighting || { multiConcept: 1.2 },
    };

    // Get attemptId from request body (should be provided by client)
    const { attemptId } = body;
    if (!attemptId || attemptId === 'undefined' || attemptId === undefined) {
      console.error("Invalid attemptId in request:", { attemptId, bodyKeys: Object.keys(body) });
      return NextResponse.json(
        { error: "Missing or invalid attemptId. Please start the exam again." },
        { status: 400 }
      );
    }

    // Get existing attempt to update (should be IN_PROGRESS)
    const existingAttempt = await (prisma as any).examAttempt.findUnique({
      where: {
        id: attemptId,
      },
    });
    
    if (!existingAttempt) {
      return NextResponse.json(
        { error: "Exam attempt not found" },
        { status: 404 }
      );
    }
    
    // Get option mappings from attempt (if options were shuffled)
    // IMPORTANT: optionMappings are stored in answers.optionMappings when exam starts
    // Handle both formats: { optionMappings: [...] } (new) or [] (old/backward compatibility)
    const attemptData = existingAttempt.answers as any;
    let optionMappings: any[] = [];
    
    if (Array.isArray(attemptData)) {
      // Old format: answers is an array (no shuffling was applied)
      optionMappings = [];
      console.log(`[Exam Submit] No option mappings found (old format - answers is array)`);
    } else if (attemptData && typeof attemptData === 'object' && attemptData.optionMappings) {
      // New format: answers is an object with optionMappings
      optionMappings = attemptData.optionMappings;
      console.log(`[Exam Submit] Found ${optionMappings.length} option mappings`);
    } else {
      console.log(`[Exam Submit] No option mappings found (answers format: ${typeof attemptData})`);
    }
    
    // Map shuffled answers back to original option IDs
    const mappedAnswers = answers.map((answer: any) => {
      const mapping = optionMappings.find((m: any) => m.questionId === answer.questionId);
      if (mapping && mapping.reverseMapping) {
        // Map the shuffled option ID back to original
        const originalOptionId = mapAnswerToOriginal(answer.selectedOptionId, mapping.reverseMapping);
        console.log(`[Exam Submit] Q${answer.questionId}: "${answer.selectedOptionId}" (shuffled) → "${originalOptionId}" (original)`);
        return {
          ...answer,
          selectedOptionId: originalOptionId,
        };
      } else {
        console.log(`[Exam Submit] Q${answer.questionId}: No mapping found, using "${answer.selectedOptionId}" as-is (not shuffled)`);
      }
      // If no mapping found, assume options weren't shuffled (backward compatibility)
      return answer;
    });
    
    // Assess exam deterministically (using mapped answers)
    const assessmentResult = assessExam(
      questions.questions,
      mappedAnswers as UserAnswer[],
      assessmentConfig
    );

    // Extract concept performance for tracking (before updating attempt)
    const conceptPerformances = extractConceptPerformance(
      questions.questions,
      mappedAnswers
    );
    const failedConceptIds = conceptPerformances
      .filter((cp) => !cp.correct)
      .map((cp) => cp.conceptId);

    // Verify attempt belongs to user
    if (existingAttempt.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Verify attempt is for this exam
    if (existingAttempt.examId !== examId) {
      return NextResponse.json(
        { error: "Attempt does not match exam" },
        { status: 400 }
      );
    }

    if (existingAttempt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Attempt already evaluated" },
        { status: 400 }
      );
    }

    // Update ExamAttempt record (immutable after EVALUATED)
    // IMPORTANT: Preserve optionMappings when storing answers
    // Store answers in a format that preserves optionMappings for future reference
    const examAttempt = await (prisma as any).examAttempt.update({
      where: { id: existingAttempt.id },
      data: {
        status: "EVALUATED",
        submittedAt: new Date(),
        evaluatedAt: new Date(),
        score: assessmentResult.percentage,
        pass: assessmentResult.pass,
        answers: optionMappings.length > 0 
          ? {
              // New format: preserve optionMappings and store user answers
              optionMappings: optionMappings,
              userAnswers: answers,
            }
          : answers, // Old format: just store answers array (backward compatibility)
        feedback: {
          correctCount: assessmentResult.correctCount,
          totalQuestions: assessmentResult.totalQuestions,
          percentage: assessmentResult.percentage,
          weakConceptIds: assessmentResult.weakConceptIds,
          answerFeedback: assessmentResult.answerFeedback,
          failedConceptIds, // Add failed concept IDs for remediation
        },
      },
    });

    // Update progress based on exam type
    const isFirstAttempt = existingAttempt.attemptNumber === 1;
    
    if (exam.type === "CATEGORY" && exam.categoryId) {
      await updateCategoryProgress(
        user.id,
        exam.categoryId,
        assessmentResult.percentage,
        assessmentResult.pass,
        isFirstAttempt
      );
    } else if (exam.type === "LEVEL" && exam.levelNumber) {
      await updateLevelProgress(
        user.id,
        exam.levelNumber,
        assessmentResult.percentage,
        assessmentResult.pass,
        isFirstAttempt
      );
    }

    // Update concept-level progress (Phase 2 feature)
    try {
      if (conceptPerformances.length > 0) {
        await updateConceptProgress(user.id, conceptPerformances);
      }
    } catch (conceptProgressError) {
      // Log but don't fail the request if concept progress tracking fails
      console.error("Concept progress tracking failed (non-critical):", conceptProgressError);
    }

    // Create remediation session if exam failed (Phase 2 feature)
    if (!assessmentResult.pass && failedConceptIds.length > 0) {
      try {
        const { createRemediationSession } = await import("@/lib/remediation");
        await createRemediationSession(
          user.id,
          examId,
          examAttempt.id,
          failedConceptIds
        );
      } catch (remediationError) {
        // Log but don't fail the request if remediation creation fails
        console.error("Remediation session creation failed (non-critical):", remediationError);
      }
    }

    // Determine next unlocks
    const nextUnlocks: { levels?: number[]; categories?: string[] } = {};
    
    if (assessmentResult.pass) {
      if (exam.type === "LEVEL" && exam.levelNumber) {
        // Unlock next level if passed
        if (exam.levelNumber < 40) {
          nextUnlocks.levels = [exam.levelNumber + 1];
        }
      } else if (exam.type === "CATEGORY" && exam.categoryId) {
        nextUnlocks.categories = [exam.categoryId];
      }
    }

    // Generate ChatGPT analysis (optional - don't fail if it errors)
    let chatGPTAnalysis = null;
    try {
      if (process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY) {
        chatGPTAnalysis = await analyzeExamAttempt({
          questions: questions.questions,
          userAnswers: answers as UserAnswer[],
          score: assessmentResult.correctCount,
          percentage: assessmentResult.percentage,
          pass: assessmentResult.pass,
          examType: exam.type,
          levelNumber: exam.levelNumber || undefined,
          categoryId: exam.categoryId || undefined,
        });
        
        // Update examAttempt with ChatGPT analysis
        await (prisma as any).examAttempt.update({
          where: { id: examAttempt.id },
          data: {
            feedback: {
              ...examAttempt.feedback,
              chatGPTAnalysis,
            },
          },
        });
      }
    } catch (analysisError: any) {
      // Log but don't fail the request if ChatGPT analysis fails
      console.error("ChatGPT analysis failed (non-critical):", analysisError);
    }

    // Transform answerFeedback to answerResults format expected by ExamResults component
    // Map option IDs to option text for display
    const answerResults = assessmentResult.answerFeedback.map((feedback) => {
      const question = questions.questions.find((q: any) => q.id === feedback.questionId);
      const selectedOption = question?.options?.find((opt: any) => opt.id === feedback.selectedOptionId);
      const correctOption = question?.options?.find((opt: any) => opt.id === feedback.correctOptionId);
      
      return {
        questionId: feedback.questionId,
        selectedAnswer: selectedOption?.text || feedback.selectedOptionId || "Not answered",
        correctAnswer: correctOption?.text || feedback.correctOptionId || "Unknown",
        isCorrect: feedback.isCorrect,
        rationale: feedback.rationale || "",
      };
    });

    return NextResponse.json({
      attempt: {
        id: examAttempt.id,
        challengeId: exam.challenge?.id || exam.levelNumber?.toString() || "",
        score: assessmentResult.correctCount,
        percentage: assessmentResult.percentage,
        timeSpent: timeSpent || 0,
        passed: assessmentResult.pass,
        isFirstAttempt: existingAttempt.attemptNumber === 1,
      },
      results: {
        pass: assessmentResult.pass,
        passed: assessmentResult.pass, // Alias for compatibility
        scorePercent: assessmentResult.percentage,
        percentage: assessmentResult.percentage, // Alias for compatibility
        correctCount: assessmentResult.correctCount,
        totalQuestions: assessmentResult.totalQuestions,
        weakConceptIds: assessmentResult.weakConceptIds,
        nextUnlocks,
        answerResults, // Transform answerFeedback to answerResults
        chatGPTAnalysis, // Include analysis if available
      },
    });
  } catch (error: any) {
    console.error("Error submitting exam:", error);
    console.error("Error stack:", error.stack);
    console.error("Request details:", {
      examId: examId || "unknown",
      hasBody: !!body,
      errorMessage: error.message,
    });
    return NextResponse.json(
      { 
        error: "Failed to submit exam", 
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Update UserCategoryProgress
 * 
 * Rules:
 * - bestScore stores the highest score across all attempts
 * - passedAt is set on the first successful attempt only
 * - Failed later attempts do not revoke a pass
 */
async function updateCategoryProgress(
  userId: string,
  categoryId: string,
  score: number,
  passed: boolean,
  isFirstAttempt: boolean
) {
  const existing = await (prisma as any).userCategoryProgress.findUnique({
    where: {
      userId_categoryId: {
        userId,
        categoryId,
      },
    },
  });

  if (existing) {
    // Update existing progress
    const newBestScore = Math.max(existing.bestScore || 0, score);
    const newStatus = passed ? "PASSED" : existing.status === "PASSED" ? "PASSED" : "AVAILABLE";
    const newPassedAt = passed && !existing.passedAt ? new Date() : existing.passedAt;

    await (prisma as any).userCategoryProgress.update({
      where: {
        userId_categoryId: {
          userId,
          categoryId,
        },
      },
      data: {
        status: newStatus,
        bestScore: newBestScore,
        passedAt: newPassedAt,
      },
    });
  } else {
    // Create new progress record
    await (prisma as any).userCategoryProgress.create({
      data: {
        userId,
        categoryId,
        status: passed ? "PASSED" : "AVAILABLE",
        bestScore: score,
        passedAt: passed ? new Date() : null,
      },
    });
  }
}

/**
 * Update UserLevelProgress
 * 
 * Rules:
 * - bestScore stores the highest score across all attempts
 * - passedAt is set on the first successful attempt only
 * - Failed later attempts do not revoke a pass
 * - attemptsCount increments on every attempt
 */
async function updateLevelProgress(
  userId: string,
  levelNumber: number,
  score: number,
  passed: boolean,
  isFirstAttempt: boolean
) {
    const existing = await (prisma as any).userLevelProgress.findUnique({
      where: {
        userId_levelNumber: {
          userId,
          levelNumber,
        },
      },
    });

  if (existing) {
    // Update existing progress
    const newBestScore = Math.max(existing.bestScore || 0, score);
    const newStatus = passed ? "PASSED" : existing.status === "PASSED" ? "PASSED" : "AVAILABLE";
    const newPassedAt = passed && !existing.passedAt ? new Date() : existing.passedAt;

    await (prisma as any).userLevelProgress.update({
      where: {
        userId_levelNumber: {
          userId,
          levelNumber,
        },
      },
      data: {
        status: newStatus,
        bestScore: newBestScore,
        passedAt: newPassedAt,
        attemptsCount: {
          increment: 1,
        },
      },
    });
  } else {
    // Create new progress record
    await (prisma as any).userLevelProgress.create({
      data: {
        userId,
        levelNumber,
        status: passed ? "PASSED" : "AVAILABLE",
        bestScore: score,
        passedAt: passed ? new Date() : null,
        attemptsCount: 1,
        unlockedAt: new Date(),
      },
    });
  }

  // If passed and not boss level, unlock next level
  if (passed && levelNumber < 40) {
    const nextLevel = levelNumber + 1;
    await (prisma as any).userLevelProgress.upsert({
      where: {
        userId_levelNumber: {
          userId,
          levelNumber: nextLevel,
        },
      },
      create: {
        userId,
        levelNumber: nextLevel,
        status: "AVAILABLE",
        unlockedAt: new Date(),
        attemptsCount: 0,
      },
      update: {
        // Don't update if already exists
      },
    });
  }
}

