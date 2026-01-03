import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    console.log("[ANALYTICS_API] Fetching analytics data...");
    const user = await getCurrentUser();

    if (!user) {
      console.log("[ANALYTICS_API] No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[ANALYTICS_API] User found:", user.id, user.email);

    // Check premium status - allow free users for now (can be changed later)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true },
    });

    console.log("[ANALYTICS_API] User subscription tier:", dbUser?.subscriptionTier);

    // Temporarily allow all users (remove this check or make it optional)
    // if (dbUser?.subscriptionTier !== "premium") {
    //   return NextResponse.json(
    //     { error: "Premium subscription required" },
    //     { status: 403 }
    //   );
    // }

    // Get comprehensive analytics data
    const [
      userPoints,
      userStreak,
      conceptProgress,
      challengeAttempts,
      levelProgress,
      categoryProgress,
      aigpAttempts,
      recentActivity,
    ] = await Promise.all([
      // Points
      prisma.userPoints.findUnique({
        where: { userId: user.id },
      }),

      // Streak
      prisma.userStreak.findUnique({
        where: { userId: user.id },
      }),

      // Concept progress by domain and difficulty
      prisma.userProgress.findMany({
        where: {
          userId: user.id,
          status: "completed",
        },
        include: {
          conceptCard: {
            select: {
              domain: true,
              difficulty: true,
              estimatedReadTime: true,
            },
          },
        },
      }),

      // Challenge attempts
      prisma.challengeAttempt.findMany({
        where: { userId: user.id },
        select: {
          score: true,
          percentage: true,
          timeSpent: true,
          passed: true,
          completedAt: true,
          challenge: {
            select: {
              levelNumber: true,
            },
          },
        },
        orderBy: { completedAt: "desc" },
      }),

      // Level progress
      prisma.userLevelProgress.findMany({
        where: { userId: user.id },
        select: {
          levelNumber: true,
          status: true,
          bestScore: true,
          passedAt: true,
        },
      }),

      // Category progress
      prisma.userCategoryProgress.findMany({
        where: { userId: user.id },
        include: {
          category: {
            select: {
              name: true,
              domain: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      // AIGP exam attempts
      prisma.aIGPExamAttempt.findMany({
        where: { userId: user.id },
        select: {
          score: true, // score is already a percentage (0-100)
          startedAt: true,
          submittedAt: true,
          timeLimitSec: true,
          exam: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      }),

      // Recent activity (last 30 days)
      prisma.userProgress.findMany({
        where: {
          userId: user.id,
          completedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          completedAt: true,
          timeSpent: true,
        },
        orderBy: { completedAt: "desc" },
      }),
    ]);

    // Calculate overview metrics
    const totalStudyTime = conceptProgress.reduce(
      (sum, p) => sum + (p.timeSpent || 0),
      0
    ) + challengeAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) +
    aigpAttempts.reduce((sum, a) => {
      if (a.startedAt && a.submittedAt) {
        const timeSpent = Math.floor((a.submittedAt.getTime() - a.startedAt.getTime()) / 1000);
        return sum + timeSpent;
      }
      return sum;
    }, 0);

    const conceptsMastered = conceptProgress.length;
    const examsCompleted = challengeAttempts.length + aigpAttempts.length;
    const currentStreak = userStreak?.currentStreak || 0;

    // Calculate domain coverage
    const domainStats = conceptProgress.reduce((acc, p) => {
      const domain = p.conceptCard.domain || "Unknown";
      if (!acc[domain]) {
        acc[domain] = { completed: 0, totalTime: 0 };
      }
      acc[domain].completed++;
      acc[domain].totalTime += p.timeSpent || 0;
      return acc;
    }, {} as Record<string, { completed: number; totalTime: number }>);

    // Calculate difficulty progression
    const difficultyStats = conceptProgress.reduce((acc, p) => {
      const difficulty = p.conceptCard.difficulty || "unknown";
      if (!acc[difficulty]) {
        acc[difficulty] = 0;
      }
      acc[difficulty]++;
      return acc;
    }, {} as Record<string, number>);

    // Calculate learning progress over time (last 30 days)
    const dailyProgress = recentActivity.reduce((acc, activity) => {
      if (!activity.completedAt) return acc;
      const date = activity.completedAt.toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { concepts: 0, timeSpent: 0 };
      }
      acc[date].concepts++;
      acc[date].timeSpent += activity.timeSpent || 0;
      return acc;
    }, {} as Record<string, { concepts: number; timeSpent: number }>);

    // Format daily progress for chart
    const dailyProgressArray = Object.entries(dailyProgress)
      .map(([date, data]) => ({
        date,
        concepts: data.concepts,
        timeSpent: Math.round(data.timeSpent / 60), // Convert to minutes
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate average scores
    const challengeScores = challengeAttempts
      .filter((a) => a.passed)
      .map((a) => a.percentage);
    const aigpScores = aigpAttempts.map((a) => a.score || 0); // score is already a percentage
    const allScores = [...challengeScores, ...aigpScores];
    const averageScore =
      allScores.length > 0
        ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
        : 0;

    // Find strongest and weakest domains
    const domainArray = Object.entries(domainStats).map(([domain, stats]) => ({
      domain,
      completed: stats.completed,
      totalTime: stats.totalTime,
    }));
    const strongestDomain = domainArray.sort(
      (a, b) => b.completed - a.completed
    )[0];
    const weakestDomain = domainArray.sort(
      (a, b) => a.completed - b.completed
    )[0];

    // Calculate exam performance trends
    const examPerformance = [
      ...challengeAttempts.map((a) => ({
        date: a.completedAt.toISOString().split("T")[0],
        score: a.percentage,
        type: "Level Exam",
      })),
      ...aigpAttempts.map((a) => ({
        date: a.submittedAt?.toISOString().split("T")[0] || "",
        score: a.score || 0, // score is already a percentage
        type: "AIGP Exam",
      })),
    ]
      .filter((e) => e.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10); // Last 10 exams

    return NextResponse.json({
      overview: {
        totalStudyTime: Math.round(totalStudyTime / 60), // minutes
        conceptsMastered,
        examsCompleted,
        currentStreak,
        averageScore: Math.round(averageScore * 10) / 10,
        totalPoints: userPoints?.totalPoints || 0,
      },
      domainCoverage: domainArray,
      difficultyProgression: Object.entries(difficultyStats).map(
        ([difficulty, count]) => ({
          difficulty,
          count,
        })
      ),
      learningProgress: dailyProgressArray,
      examPerformance,
      insights: {
        strongestDomain: strongestDomain?.domain || "N/A",
        weakestDomain: weakestDomain?.domain || "N/A",
        totalLevelsPassed: levelProgress.filter((lp) => lp.status === "PASSED")
          .length,
        totalCategoriesCovered: categoryProgress.length,
      },
    });
  } catch (error: any) {
    console.error("[ANALYTICS_API_ERROR] Full error:", error);
    console.error("[ANALYTICS_API_ERROR] Error name:", error?.name);
    console.error("[ANALYTICS_API_ERROR] Error message:", error?.message);
    console.error("[ANALYTICS_API_ERROR] Error code:", error?.code);
    console.error("[ANALYTICS_API_ERROR] Error stack:", error?.stack);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics data", 
        details: error.message,
        code: error?.code 
      },
      { status: 500 }
    );
  }
}

