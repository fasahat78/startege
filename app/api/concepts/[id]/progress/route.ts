import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { checkAndAwardBadges } from "@/lib/badges";
import { getConceptProgress } from "@/lib/concept-progress";

/**
 * GET /api/concepts/[id]/progress
 * Get progress for a specific concept
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const progress = await getConceptProgress(user.id, id);

    if (!progress) {
      return NextResponse.json({
        success: true,
        progress: null,
        message: "No progress tracked for this concept yet",
      });
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Error fetching concept progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/concepts/[id]/progress
 * Update progress for a specific concept
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["not_started", "in_progress", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if concept card exists
    const conceptCard = await prisma.conceptCard.findUnique({
      where: { id },
    });

    if (!conceptCard) {
      return NextResponse.json(
        { error: "Concept card not found" },
        { status: 404 }
      );
    }

    // Update or create progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_conceptCardId: {
          userId: user.id,
          conceptCardId: id,
        },
      },
      update: {
        status,
        completedAt: status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        conceptCardId: id,
        status,
        completedAt: status === "completed" ? new Date() : null,
      },
    });

    // Award points if completed
    if (status === "completed") {
      const pointsToAward = getPointsForDifficulty(conceptCard.difficulty);

      await prisma.userPoints.upsert({
        where: { userId: user.id },
        update: {
          totalPoints: { increment: pointsToAward },
          pointsEarnedToday: { increment: pointsToAward },
        },
        create: {
          userId: user.id,
          totalPoints: pointsToAward,
          pointsEarnedToday: pointsToAward,
        },
      });

      // Update streak
      await updateStreak(user.id);

      // Check and award badges
      const newBadges = await checkAndAwardBadges(user.id);
      
      return NextResponse.json({
        success: true,
        progress,
        badgesAwarded: newBadges,
      });
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getPointsForDifficulty(difficulty: string): number {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return 10;
    case "intermediate":
      return 25;
    case "advanced":
      return 50;
    default:
      return 10;
  }
}

async function updateStreak(userId: string) {
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  if (!streak) {
    await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date(),
      },
    });
    return;
  }

  const today = new Date();
  const lastActivity = new Date(streak.lastActivityDate);
  const daysDiff = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = streak.currentStreak;
  let newLongestStreak = streak.longestStreak;

  if (daysDiff === 0) {
    // Already updated today, no change
    return;
  } else if (daysDiff === 1) {
    // Consecutive day
    newStreak = streak.currentStreak + 1;
    newLongestStreak = Math.max(newStreak, streak.longestStreak);
  } else {
    // Streak broken, start over
    newStreak = 1;
  }

  await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: today,
    },
  });
}

