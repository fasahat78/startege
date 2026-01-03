/**
 * Concept-Level Progress Tracking
 * 
 * Tracks user performance at the concept level based on exam attempts.
 * Enables targeted remediation and weak area identification.
 */

import { prisma } from "./db";

interface ConceptPerformance {
  conceptId: string;
  correct: boolean;
}

/**
 * Update concept progress based on exam performance
 */
export async function updateConceptProgress(
  userId: string,
  conceptPerformances: ConceptPerformance[]
): Promise<void> {
  if (conceptPerformances.length === 0) return;

  const now = new Date();

  for (const perf of conceptPerformances) {
    // Get or create user progress record
    const existingProgress = await (prisma as any).userProgress.findUnique({
      where: {
        userId_conceptCardId: {
          userId,
          conceptCardId: perf.conceptId,
        },
      },
    });

    if (existingProgress) {
      // Update existing progress
      const newTimesSeen = existingProgress.timesSeen + 1;
      const newTimesCorrect = perf.correct
        ? existingProgress.timesCorrect + 1
        : existingProgress.timesCorrect;
      const newTimesIncorrect = perf.correct
        ? existingProgress.timesIncorrect
        : existingProgress.timesIncorrect + 1;

      // Calculate mastery score (0-1 scale)
      const masteryScore =
        newTimesSeen > 0 ? newTimesCorrect / newTimesSeen : 0;

      // Determine if weak area (less than 60% correct and seen at least 3 times)
      const isWeakArea =
        newTimesSeen >= 3 && masteryScore < 0.6;

      await (prisma as any).userProgress.update({
        where: {
          userId_conceptCardId: {
            userId,
            conceptCardId: perf.conceptId,
          },
        },
        data: {
          timesSeen: newTimesSeen,
          timesCorrect: newTimesCorrect,
          timesIncorrect: newTimesIncorrect,
          masteryScore,
          lastSeen: now,
          lastCorrect: perf.correct ? now : existingProgress.lastCorrect,
          lastIncorrect: perf.correct
            ? existingProgress.lastIncorrect
            : now,
          isWeakArea,
          flaggedAt: isWeakArea && !existingProgress.isWeakArea ? now : existingProgress.flaggedAt,
        },
      });
    } else {
      // Create new progress record
      const masteryScore = perf.correct ? 1.0 : 0.0;

      await (prisma as any).userProgress.create({
        data: {
          userId,
          conceptCardId: perf.conceptId,
          timesSeen: 1,
          timesCorrect: perf.correct ? 1 : 0,
          timesIncorrect: perf.correct ? 0 : 1,
          masteryScore,
          lastSeen: now,
          lastCorrect: perf.correct ? now : null,
          lastIncorrect: perf.correct ? null : now,
          isWeakArea: false, // Need at least 3 attempts to flag as weak
          status: "in_progress",
        },
      });
    }
  }
}

/**
 * Get user's weak areas (concepts with low mastery)
 */
export async function getWeakAreas(
  userId: string,
  limit: number = 10
): Promise<Array<{
  conceptId: string;
  conceptName: string;
  masteryScore: number;
  timesSeen: number;
  timesCorrect: number;
  timesIncorrect: number;
}>> {
  const weakAreas = await (prisma as any).userProgress.findMany({
    where: {
      userId,
      isWeakArea: true,
    },
    include: {
      conceptCard: {
        select: {
          id: true,
          concept: true,
          name: true,
          definition: true,
        },
      },
    },
    orderBy: [
      { masteryScore: "asc" }, // Lowest mastery first
      { timesSeen: "desc" }, // Most seen first
    ],
    take: limit,
  });

  return weakAreas.map((progress: any) => ({
    conceptId: progress.conceptCardId,
    conceptName: progress.conceptCard.name || progress.conceptCard.concept,
    masteryScore: progress.masteryScore || 0,
    timesSeen: progress.timesSeen || 0,
    timesCorrect: progress.timesCorrect || 0,
    timesIncorrect: progress.timesIncorrect || 0,
  }));
}

/**
 * Get concept progress for a specific concept
 */
export async function getConceptProgress(
  userId: string,
  conceptId: string
): Promise<{
  conceptId: string;
  masteryScore: number;
  timesSeen: number;
  timesCorrect: number;
  timesIncorrect: number;
  isWeakArea: boolean;
  lastSeen: Date | null;
} | null> {
  const progress = await (prisma as any).userProgress.findUnique({
    where: {
      userId_conceptCardId: {
        userId,
        conceptCardId: conceptId,
      },
    },
  });

  if (!progress) {
    return null;
  }

  return {
    conceptId: progress.conceptCardId,
    masteryScore: progress.masteryScore || 0,
    timesSeen: progress.timesSeen || 0,
    timesCorrect: progress.timesCorrect || 0,
    timesIncorrect: progress.timesIncorrect || 0,
    isWeakArea: progress.isWeakArea || false,
    lastSeen: progress.lastSeen,
  };
}

/**
 * Get all concept progress for a user
 */
export async function getAllConceptProgress(userId: string): Promise<
  Array<{
    conceptId: string;
    masteryScore: number;
    timesSeen: number;
    timesCorrect: number;
    timesIncorrect: number;
    isWeakArea: boolean;
  }>
> {
  const progress = await (prisma as any).userProgress.findMany({
    where: {
      userId,
      timesSeen: {
        gt: 0, // Only concepts that have been seen in exams
      },
    },
    select: {
      conceptCardId: true,
      masteryScore: true,
      timesSeen: true,
      timesCorrect: true,
      timesIncorrect: true,
      isWeakArea: true,
    },
    orderBy: {
      masteryScore: "asc", // Lowest mastery first
    },
  });

  return progress.map((p: any) => ({
    conceptId: p.conceptCardId,
    masteryScore: p.masteryScore || 0,
    timesSeen: p.timesSeen || 0,
    timesCorrect: p.timesCorrect || 0,
    timesIncorrect: p.timesIncorrect || 0,
    isWeakArea: p.isWeakArea || false,
  }));
}

/**
 * Extract concept performance from exam questions and answers
 */
export function extractConceptPerformance(
  questions: Array<{
    id: string;
    conceptIds?: string[];
    correctOptionId: string;
  }>,
  userAnswers: Array<{
    questionId: string;
    selectedOptionId: string;
  }>
): ConceptPerformance[] {
  const conceptPerformanceMap = new Map<string, boolean>();

  for (const question of questions) {
    if (!question.conceptIds || question.conceptIds.length === 0) {
      continue;
    }

    const userAnswer = userAnswers.find(
      (a) => a.questionId === question.id
    );
    const isCorrect =
      userAnswer?.selectedOptionId === question.correctOptionId;

    // Track performance for each concept in the question
    for (const conceptId of question.conceptIds) {
      // If concept already seen, use AND logic (all must be correct)
      // This is conservative - if user got question wrong, mark all concepts as incorrect
      const existing = conceptPerformanceMap.get(conceptId);
      if (existing === undefined) {
        conceptPerformanceMap.set(conceptId, isCorrect);
      } else {
        // If already marked incorrect, keep it incorrect
        // If already marked correct but this answer is wrong, mark as incorrect
        conceptPerformanceMap.set(conceptId, existing && isCorrect);
      }
    }
  }

  return Array.from(conceptPerformanceMap.entries()).map(
    ([conceptId, correct]) => ({
      conceptId,
      correct,
    })
  );
}

