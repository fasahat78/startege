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
      userBadges,
      allBadges,
      dbUser,
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

      // User badges
      prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      }),

      // All badges
      prisma.badge.findMany({
        orderBy: [{ badgeType: "asc" }, { rarity: "asc" }, { name: "asc" }],
      }),

      // User data
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          currentLevel: true,
          maxUnlockedLevel: true,
          totalChallengesCompleted: true,
          createdAt: true,
        },
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

    // ===== GAMIFICATION DATA =====
    
    // Badge progress calculation
    const earnedBadgeNames = new Set(userBadges.map((ub) => ub.badge.name));
    const totalPoints = userPoints?.totalPoints || 0;
    // currentStreak is already defined above (line 191)
    const conceptsCompleted = conceptsMastered;

    // Define badge requirements
    const badgeRequirements = [
      { name: "First Steps", requirement: 1, type: "concepts", current: conceptsCompleted },
      { name: "Getting Started", requirement: 10, type: "concepts", current: conceptsCompleted },
      { name: "Dedicated Learner", requirement: 25, type: "concepts", current: conceptsCompleted },
      { name: "Knowledge Seeker", requirement: 50, type: "concepts", current: conceptsCompleted },
      { name: "Domain Master", requirement: 100, type: "concepts", current: conceptsCompleted },
      { name: "AI Governance Expert", requirement: 200, type: "concepts", current: conceptsCompleted },
      { name: "Perfect Week", requirement: 7, type: "streak", current: currentStreak },
      { name: "Consistency Champion", requirement: 30, type: "streak", current: currentStreak },
      { name: "Point Collector", requirement: 500, type: "points", current: totalPoints },
      { name: "Point Master", requirement: 1000, type: "points", current: totalPoints },
      { name: "Point Legend", requirement: 5000, type: "points", current: totalPoints },
    ];

    // Find next badge to unlock
    const nextBadge = badgeRequirements
      .filter((b) => !earnedBadgeNames.has(b.name))
      .sort((a, b) => a.requirement - b.requirement)[0];

    // Calculate badge progress
    let badgeProgress = null;
    if (nextBadge) {
      const progress = Math.min((nextBadge.current / nextBadge.requirement) * 100, 100);
      const remaining = Math.max(nextBadge.requirement - nextBadge.current, 0);
      badgeProgress = {
        badgeName: nextBadge.name,
        current: nextBadge.current,
        requirement: nextBadge.requirement,
        progress: Math.round(progress),
        remaining,
        type: nextBadge.type,
      };
    }

    // Recent achievements (last 5 badges)
    const recentAchievements = userBadges.slice(0, 5).map((ub) => ({
      name: ub.badge.name,
      description: ub.badge.description,
      rarity: ub.badge.rarity,
      earnedAt: ub.earnedAt.toISOString(),
    }));

    // Level progression
    const currentLevel = dbUser?.currentLevel || 1;
    const maxUnlockedLevel = dbUser?.maxUnlockedLevel || 1;
    const levelsPassed = levelProgress.filter((lp) => lp.status === "PASSED").length;
    const nextLevel = maxUnlockedLevel + 1;
    const isNextLevelBoss = [10, 20, 30, 40].includes(nextLevel);

    // Get level statuses
    const levelStatuses = [];
    for (let level = 1; level <= Math.min(maxUnlockedLevel + 5, 40); level++) {
      const progress = levelProgress.find((lp) => lp.levelNumber === level);
      const status = progress?.status || (level <= maxUnlockedLevel ? "UNLOCKED" : "LOCKED");
      levelStatuses.push({
        levelNumber: level,
        status,
        isBoss: [10, 20, 30, 40].includes(level),
        bestScore: progress?.bestScore || null,
      });
    }

    // Milestones
    const milestones = [];
    
    // Concept milestones
    const conceptMilestones = [10, 25, 50, 100, 200];
    const nextConceptMilestone = conceptMilestones.find((m) => m > conceptsCompleted);
    if (nextConceptMilestone) {
      milestones.push({
        type: "concepts",
        title: `Complete ${nextConceptMilestone} concepts`,
        description: `Unlock "${badgeRequirements.find((b) => b.requirement === nextConceptMilestone && b.type === "concepts")?.name || "Achievement"}" badge`,
        current: conceptsCompleted,
        target: nextConceptMilestone,
        remaining: nextConceptMilestone - conceptsCompleted,
      });
    }

    // Streak milestones
    const streakMilestones = [7, 30];
    const nextStreakMilestone = streakMilestones.find((m) => m > currentStreak);
    if (nextStreakMilestone) {
      milestones.push({
        type: "streak",
        title: `Maintain ${nextStreakMilestone}-day streak`,
        description: `Unlock "${badgeRequirements.find((b) => b.requirement === nextStreakMilestone && b.type === "streak")?.name || "Achievement"}" badge`,
        current: currentStreak,
        target: nextStreakMilestone,
        remaining: nextStreakMilestone - currentStreak,
      });
    }

    // Points milestones
    const pointsMilestones = [500, 1000, 5000];
    const nextPointsMilestone = pointsMilestones.find((m) => m > totalPoints);
    if (nextPointsMilestone) {
      milestones.push({
        type: "points",
        title: `Earn ${nextPointsMilestone} points`,
        description: `Unlock "${badgeRequirements.find((b) => b.requirement === nextPointsMilestone && b.type === "points")?.name || "Achievement"}" badge`,
        current: totalPoints,
        target: nextPointsMilestone,
        remaining: nextPointsMilestone - totalPoints,
      });
    }

    // Level milestones
    const levelMilestones = [5, 10, 20, 30, 40];
    const nextLevelMilestone = levelMilestones.find((m) => m > levelsPassed);
    if (nextLevelMilestone) {
      milestones.push({
        type: "levels",
        title: `Pass ${nextLevelMilestone} levels`,
        description: nextLevelMilestone === 10 ? "Unlock boss level 10" : `Reach level ${nextLevelMilestone}`,
        current: levelsPassed,
        target: nextLevelMilestone,
        remaining: nextLevelMilestone - levelsPassed,
      });
    }

    // Sort milestones by remaining (closest first)
    milestones.sort((a, b) => a.remaining - b.remaining);

    // Quick wins & daily goals
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivity = recentActivity.filter(
      (a) => a.completedAt && new Date(a.completedAt) >= today
    ).length;

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    const thisWeekActivity = recentActivity.filter(
      (a) => a.completedAt && new Date(a.completedAt) >= thisWeekStart
    ).length;

    const quickWins = [];
    
    // Today's goal
    if (currentStreak > 0 && todayActivity === 0) {
      quickWins.push({
        type: "maintain_streak",
        title: "Maintain your streak",
        description: `Complete 1 concept card today to keep your ${currentStreak}-day streak`,
        action: "Browse Concepts",
        actionUrl: "/concepts",
        priority: "high",
      });
    } else if (currentStreak === 0) {
      quickWins.push({
        type: "start_streak",
        title: "Start your learning streak",
        description: "Complete 1 concept card today to begin your streak",
        action: "Browse Concepts",
        actionUrl: "/concepts",
        priority: "high",
      });
    }

    // Perfect Week goal
    if (currentStreak >= 1 && currentStreak < 7 && thisWeekActivity < 7) {
      const daysRemaining = 7 - currentStreak;
      quickWins.push({
        type: "perfect_week",
        title: "Perfect Week badge",
        description: `Complete ${daysRemaining} more day${daysRemaining > 1 ? "s" : ""} to unlock Perfect Week badge`,
        action: "Continue Learning",
        actionUrl: "/concepts",
        priority: "medium",
      });
    }

    // Next level goal
    if (nextLevel <= 40) {
      quickWins.push({
        type: "next_level",
        title: `Unlock Level ${nextLevel}${isNextLevelBoss ? " (Boss)" : ""}`,
        description: isNextLevelBoss
          ? "Complete the previous level to unlock this boss level"
          : `Pass Level ${nextLevel - 1} to unlock Level ${nextLevel}`,
        action: "View Challenges",
        actionUrl: "/challenges",
        priority: "medium",
      });
    }

    // Next badge goal
    if (badgeProgress && badgeProgress.remaining <= 5) {
      quickWins.push({
        type: "next_badge",
        title: `Unlock "${badgeProgress.badgeName}" badge`,
        description: `Complete ${badgeProgress.remaining} more ${badgeProgress.type === "concepts" ? "concept" : badgeProgress.type === "streak" ? "day" : "point"}${badgeProgress.remaining > 1 ? "s" : ""}`,
        action: badgeProgress.type === "concepts" ? "Browse Concepts" : "Continue Learning",
        actionUrl: badgeProgress.type === "concepts" ? "/concepts" : "/dashboard",
        priority: "high",
      });
    }

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
      // Gamification data
      gamification: {
        badgeProgress,
        recentAchievements,
        levelProgression: {
          currentLevel,
          maxUnlockedLevel,
          nextLevel,
          isNextLevelBoss,
          levelsPassed,
          levelStatuses,
        },
        milestones: milestones.slice(0, 5), // Top 5 closest milestones
        quickWins: quickWins.slice(0, 4), // Top 4 quick wins
        streak: {
          current: currentStreak,
          longest: userStreak?.longestStreak || 0,
          daysToPerfectWeek: currentStreak < 7 ? 7 - currentStreak : 0,
          daysToConsistencyChampion: currentStreak < 30 ? 30 - currentStreak : 0,
        },
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

