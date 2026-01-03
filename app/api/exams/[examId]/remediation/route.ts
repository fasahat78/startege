/**
 * Remediation API Endpoints
 * 
 * Handles remediation sessions for failed exam attempts
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import {
  createRemediationSession,
  getRemediationConcepts,
  getActiveRemediationSessions,
  completeRemediationSession,
  checkRemediationEligibility,
} from "@/lib/remediation";
import { prisma } from "@/lib/db";

/**
 * GET /api/exams/[examId]/remediation
 * Get remediation session for a failed attempt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get("attemptId");

    if (attemptId) {
      // Get specific remediation session
      const session = await (prisma as any).remediationSession.findFirst({
        where: {
          userId: user.id,
          examId,
          attemptId,
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
      });

      if (!session) {
        return NextResponse.json(
          { error: "Remediation session not found" },
          { status: 404 }
        );
      }

      // Get concept cards for weak concepts
      const concepts = await getRemediationConcepts(session.weakConceptIds);

      return NextResponse.json({
        success: true,
        session,
        concepts,
      });
    } else {
      // Get all active remediation sessions for this exam
      const sessions = await getActiveRemediationSessions(user.id);
      const examSessions = sessions.filter(
        (s: any) => s.examId === examId
      );

      return NextResponse.json({
        success: true,
        sessions: examSessions,
      });
    }
  } catch (error) {
    console.error("Error fetching remediation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exams/[examId]/remediation
 * Create remediation session for a failed attempt
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;
    const body = await request.json();
    const { attemptId, weakConceptIds } = body;

    if (!attemptId || !weakConceptIds || !Array.isArray(weakConceptIds)) {
      return NextResponse.json(
        { error: "Missing required fields: attemptId, weakConceptIds" },
        { status: 400 }
      );
    }

    // Verify attempt belongs to user and failed
    const attempt = await (prisma as any).examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== user.id || attempt.examId !== examId) {
      return NextResponse.json(
        { error: "Invalid attempt" },
        { status: 400 }
      );
    }

    if (attempt.pass) {
      return NextResponse.json(
        { error: "Cannot create remediation for passed attempt" },
        { status: 400 }
      );
    }

    // Create remediation session
    const session = await createRemediationSession(
      user.id,
      examId,
      attemptId,
      weakConceptIds
    );

    // Get concept cards
    const concepts = await getRemediationConcepts(weakConceptIds);

    return NextResponse.json({
      success: true,
      session,
      concepts,
    });
  } catch (error) {
    console.error("Error creating remediation session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/exams/[examId]/remediation
 * Update remediation session (e.g., mark as completed)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;
    const body = await request.json();
    const { sessionId, status } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const session = await (prisma as any).remediationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== user.id || session.examId !== examId) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 400 }
      );
    }

    if (status === "COMPLETED") {
      await completeRemediationSession(sessionId);
    }

    const updated = await (prisma as any).remediationSession.findUnique({
      where: { id: sessionId },
    });

    return NextResponse.json({
      success: true,
      session: updated,
    });
  } catch (error) {
    console.error("Error updating remediation session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

