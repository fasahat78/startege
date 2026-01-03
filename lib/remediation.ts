/**
 * Remediation System
 * 
 * Provides targeted remediation for failed exam attempts by:
 * 1. Identifying weak concepts from failed questions
 * 2. Showing concept cards for weak concepts
 * 3. Generating targeted retry questions
 * 4. Allowing retake after remediation
 */

import { prisma } from "./db";
import { getWeakAreas } from "./concept-progress";

export interface RemediationSession {
  id: string;
  userId: string;
  examId: string;
  attemptId: string;
  weakConceptIds: string[];
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Create a remediation session for a failed exam attempt
 */
export async function createRemediationSession(
  userId: string,
  examId: string,
  attemptId: string,
  weakConceptIds: string[]
): Promise<RemediationSession> {
  // Check if session already exists
  const existing = await (prisma as any).remediationSession.findFirst({
    where: {
      userId,
      examId,
      attemptId,
    },
  });

  if (existing) {
    return existing;
  }

  const session = await (prisma as any).remediationSession.create({
    data: {
      userId,
      examId,
      attemptId,
      weakConceptIds,
      status: "PENDING",
    },
  });

  return session;
}

/**
 * Get concept cards for weak concepts
 */
export async function getRemediationConcepts(conceptIds: string[]) {
  const concepts = await (prisma as any).conceptCard.findMany({
    where: {
      id: {
        in: conceptIds,
      },
    },
    select: {
      id: true,
      concept: true,
      name: true,
      definition: true,
      examples: true,
      difficulty: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return concepts;
}

/**
 * Get active remediation sessions for a user
 */
export async function getActiveRemediationSessions(userId: string) {
  const sessions = await (prisma as any).remediationSession.findMany({
    where: {
      userId,
      status: {
        in: ["PENDING", "IN_PROGRESS"],
      },
    },
    include: {
      exam: {
        select: {
          id: true,
          levelNumber: true,
          challenge: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return sessions;
}

/**
 * Mark remediation session as completed
 */
export async function completeRemediationSession(sessionId: string) {
  const session = await (prisma as any).remediationSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  return session;
}

/**
 * Generate targeted retry questions for weak concepts
 * This would integrate with your exam generation system
 */
export async function generateRemediationQuestions(
  conceptIds: string[],
  questionCount: number = 5
): Promise<any[]> {
  // This is a placeholder - you would integrate with your exam generation
  // For now, return concept IDs that need questions generated
  // In production, this would call your exam generation API
  
  // TODO: Integrate with exam generation system
  // For now, return concept metadata
  const concepts = await (prisma as any).conceptCard.findMany({
    where: {
      id: {
        in: conceptIds,
      },
    },
    select: {
      id: true,
      concept: true,
      name: true,
    },
  });

  return concepts.map((c: any) => ({
    conceptId: c.id,
    conceptName: c.name || c.concept,
    // Questions would be generated here
  }));
}

/**
 * Check if user is eligible for exam retake after remediation
 */
export async function checkRemediationEligibility(
  userId: string,
  examId: string
): Promise<boolean> {
  // Check if user has completed remediation for this exam
  const completedSession = await (prisma as any).remediationSession.findFirst({
    where: {
      userId,
      examId,
      status: "COMPLETED",
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  return !!completedSession;
}

