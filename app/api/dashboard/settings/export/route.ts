import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all user data
    const [
      dbUser,
      profile,
      points,
      streak,
      badges,
      progress,
      challengeAttempts,
      levelProgress,
      aigpAttempts,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          email: true,
          name: true,
          createdAt: true,
          subscriptionTier: true,
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId: user.id },
        include: {
          interests: true,
          goals: true,
        },
      }),
      prisma.userPoints.findUnique({
        where: { userId: user.id },
      }),
      prisma.userStreak.findUnique({
        where: { userId: user.id },
      }),
      prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true },
      }),
      prisma.userProgress.findMany({
        where: { userId: user.id },
      }),
      prisma.challengeAttempt.findMany({
        where: { userId: user.id },
      }),
      prisma.userLevelProgress.findMany({
        where: { userId: user.id },
      }),
      prisma.aIGPExamAttempt.findMany({
        where: { userId: user.id },
      }),
    ]);

    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        email: dbUser?.email,
        name: dbUser?.name,
        accountCreated: dbUser?.createdAt,
        subscriptionTier: dbUser?.subscriptionTier,
      },
      profile: profile
        ? {
            personaType: profile.personaType,
            knowledgeLevel: profile.knowledgeLevel,
            interests: profile.interests.map((i) => i.interest),
            goals: profile.goals.map((g) => g.goal),
          }
        : null,
      gamification: {
        points: points?.totalPoints || 0,
        streak: {
          current: streak?.currentStreak || 0,
          longest: streak?.longestStreak || 0,
        },
        badges: badges.map((ub) => ({
          name: ub.badge.name,
          earnedAt: ub.earnedAt,
        })),
      },
      progress: {
        conceptsCompleted: progress.filter((p) => p.status === "completed")
          .length,
        levelProgress: levelProgress.map((lp) => ({
          level: lp.levelNumber,
          status: lp.status,
          bestScore: lp.bestScore,
          passedAt: lp.passedAt,
        })),
        challengeAttempts: challengeAttempts.length,
        aigpExamAttempts: aigpAttempts.length,
      },
    };

    // Return as JSON
    return NextResponse.json(exportData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="startege-data-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error("[DATA_EXPORT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to export data", details: error.message },
      { status: 500 }
    );
  }
}

