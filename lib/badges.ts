import { prisma } from "./db";

export async function checkAndAwardBadges(userId: string) {
  const [userPoints, userStreak, completedCount, userBadges] =
    await Promise.all([
      prisma.userPoints.findUnique({ where: { userId } }),
      prisma.userStreak.findUnique({ where: { userId } }),
      prisma.userProgress.count({
        where: { userId, status: "completed" },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true },
      }),
    ]);

  const earnedBadgeNames = new Set(userBadges.map((ub) => ub.badge.name));
  const badgesToAward: string[] = [];

  const totalPoints = userPoints?.totalPoints || 0;
  const currentStreak = userStreak?.currentStreak || 0;

  // Check learning badges
  if (completedCount >= 1 && !earnedBadgeNames.has("First Steps")) {
    badgesToAward.push("First Steps");
  }
  if (completedCount >= 10 && !earnedBadgeNames.has("Getting Started")) {
    badgesToAward.push("Getting Started");
  }
  if (completedCount >= 25 && !earnedBadgeNames.has("Dedicated Learner")) {
    badgesToAward.push("Dedicated Learner");
  }
  if (completedCount >= 50 && !earnedBadgeNames.has("Knowledge Seeker")) {
    badgesToAward.push("Knowledge Seeker");
  }
  if (completedCount >= 100 && !earnedBadgeNames.has("Domain Master")) {
    badgesToAward.push("Domain Master");
  }
  if (completedCount >= 200 && !earnedBadgeNames.has("AI Governance Expert")) {
    badgesToAward.push("AI Governance Expert");
  }

  // Check streak badges
  if (currentStreak >= 7 && !earnedBadgeNames.has("Perfect Week")) {
    badgesToAward.push("Perfect Week");
  }
  if (currentStreak >= 30 && !earnedBadgeNames.has("Consistency Champion")) {
    badgesToAward.push("Consistency Champion");
  }

  // Check points badges
  if (totalPoints >= 500 && !earnedBadgeNames.has("Point Collector")) {
    badgesToAward.push("Point Collector");
  }
  if (totalPoints >= 1000 && !earnedBadgeNames.has("Point Master")) {
    badgesToAward.push("Point Master");
  }
  if (totalPoints >= 5000 && !earnedBadgeNames.has("Point Legend")) {
    badgesToAward.push("Point Legend");
  }

  // Award badges
  for (const badgeName of badgesToAward) {
    const badge = await prisma.badge.findUnique({
      where: { name: badgeName },
    });

    if (badge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      });
    }
  }

  return badgesToAward;
}

