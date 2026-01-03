import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { getLevelConfig, LEVEL_CONFIGS } from "@/lib/levels";
import LevelCard from "@/components/challenges/LevelCard";

async function getUserLevelProgress(userId: string) {
  const progress = await (prisma as any).userLevelProgress.findMany({
    where: { userId },
  });

  const progressMap = new Map<number, (typeof progress)[0]>();
  progress.forEach((p: any) => {
    progressMap.set(p.levelNumber, p);
  });

  return progressMap;
}

export default async function ChallengesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/challenges");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionTier: true },
  });

  if (!dbUser) {
    redirect("/auth/signin-firebase?redirect=/challenges");
  }

  const userProgress = await getUserLevelProgress(user.id);
  const isPremium = dbUser.subscriptionTier === "premium";

  // Calculate progress from actual level progress data
  const passedLevels = Array.from(userProgress.values()).filter((p: any) => p.passedAt).length;
  const totalLevels = 40;
  const levelsProgress = (passedLevels / totalLevels) * 100;

  // Get all challenges
  const challenges = await (prisma as any).challenge.findMany({
    orderBy: { levelNumber: "asc" },
  });

  const getLevelStatus = (level: number) => {
    const progress = userProgress.get(level);
    const config = getLevelConfig(level);

    // Safety check: if config doesn't exist, return locked
    if (!config) {
      return "locked";
    }

    // Level 1 is always available
    if (level === 1) {
      if (progress?.passedAt) {
        return "completed";
      }
      return "available";
    }

    // Premium gating: Levels 11-40 require premium
    if (level > 10 && !isPremium) {
      return "locked_premium";
    }

    // Incremental progression: Check if previous level is completed
    const previousLevel = level - 1;
    const previousProgress = userProgress.get(previousLevel);
    
    // If previous level is not completed, this level is locked
    if (!previousProgress?.passedAt) {
      return "locked";
    }

    // Check if current level is completed
    if (progress?.passedAt) {
      return "completed";
    }

    // Previous level is completed, so this level is available
    return "available";
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mastery Exams</h1>
          <p className="mt-2 text-muted-foreground">
            Complete challenges to progress through levels and unlock new content
          </p>
        </div>

        {/* Level Pathway Progress Bar */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-brand-teal/10 rounded-xl p-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Level Pathway Progress</span>
              <span className="text-muted-foreground">{levelsProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-accent to-brand-teal transition-all duration-500 ease-out rounded-full"
                style={{ width: `${levelsProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{passedLevels} levels completed</span>
              <span>{totalLevels} total levels</span>
            </div>
          </div>
        </div>

        {/* Level Groups */}
        <div className="space-y-8">
          {/* Foundation Levels (1-10) */}
          <div>
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Foundation Levels (1-10) - Free
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {LEVEL_CONFIGS.filter((c: any) => c.level <= 10).map((config: any) => {
                const challenge = challenges.find((c: any) => c.levelNumber === config.level);
                const status = getLevelStatus(config.level);
                const progress = userProgress.get(config.level);

                return (
                  <LevelCard
                    key={config.level}
                    config={config}
                    challenge={challenge}
                    status={status}
                    progress={progress}
                  />
                );
              })}
            </div>
          </div>

          {/* Building Levels (11-20) */}
          <div>
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Building Levels (11-20) - Premium
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {LEVEL_CONFIGS.filter((c: any) => c.level > 10 && c.level <= 20).map(
                (config: any) => {
                  const challenge = challenges.find((c: any) => c.levelNumber === config.level);
                  const status = getLevelStatus(config.level);
                  const progress = userProgress.get(config.level);

                  return (
                    <LevelCard
                      key={config.level}
                      config={config}
                      challenge={challenge}
                      status={status}
                      progress={progress}
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* Advanced Levels (21-30) */}
          <div>
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Advanced Levels (21-30) - Premium
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {LEVEL_CONFIGS.filter((c: any) => c.level > 20 && c.level <= 30).map(
                (config: any) => {
                  const challenge = challenges.find((c: any) => c.levelNumber === config.level);
                  const status = getLevelStatus(config.level);
                  const progress = userProgress.get(config.level);

                  return (
                    <LevelCard
                      key={config.level}
                      config={config}
                      challenge={challenge}
                      status={status}
                      progress={progress}
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* Mastery Levels (31-40) */}
          <div>
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Mastery Levels (31-40) - Premium
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {LEVEL_CONFIGS.filter((c: any) => c.level > 30).map((config: any) => {
                const challenge = challenges.find((c: any) => c.levelNumber === config.level);
                const status = getLevelStatus(config.level);
                const progress = userProgress.get(config.level);

                return (
                  <LevelCard
                    key={config.level}
                    config={config}
                    challenge={challenge}
                    status={status}
                    progress={progress}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


