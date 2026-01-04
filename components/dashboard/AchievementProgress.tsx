"use client";

import Link from "next/link";

interface BadgeProgress {
  badgeName: string;
  current: number;
  requirement: number;
  progress: number;
  remaining: number;
  type: "concepts" | "streak" | "points";
}

interface RecentAchievement {
  name: string;
  description: string;
  rarity: string;
  earnedAt: string;
}

interface AchievementProgressProps {
  badgeProgress: BadgeProgress | null;
  recentAchievements: RecentAchievement[];
}

const rarityColors: Record<string, string> = {
  common: "bg-muted border-border text-muted-foreground",
  uncommon: "bg-status-success/10 border-status-success/20 text-status-success",
  rare: "bg-accent/10 border-accent/20 text-accent",
  epic: "bg-brand-teal/10 border-brand-teal/20 text-brand-teal",
  legendary: "bg-status-warning/10 border-status-warning/20 text-status-warning",
};

const typeLabels: Record<string, string> = {
  concepts: "concepts",
  streak: "days",
  points: "points",
};

export default function AchievementProgress({
  badgeProgress,
  recentAchievements,
}: AchievementProgressProps) {
  return (
    <div className="space-y-6">
      {/* Next Badge Progress */}
      {badgeProgress ? (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Next Achievement
            </h3>
            <Link
              href="/dashboard/badges"
              className="text-sm text-accent hover:text-accent/80 font-medium"
            >
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-card-foreground">
                  {badgeProgress.badgeName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {badgeProgress.current} / {badgeProgress.requirement} {typeLabels[badgeProgress.type]}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${badgeProgress.progress}%` }}
                />
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">
                {badgeProgress.remaining > 0 ? (
                  <>
                    Complete <span className="font-semibold text-card-foreground">{badgeProgress.remaining}</span> more{" "}
                    {badgeProgress.type === "concepts"
                      ? "concept"
                      : badgeProgress.type === "streak"
                      ? "day"
                      : "point"}
                    {badgeProgress.remaining > 1 ? "s" : ""} to unlock this badge
                  </>
                ) : (
                  "You've completed the requirements! Check your badges page."
                )}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Next Achievement
          </h3>
          <p className="text-muted-foreground">
            All available badges have been earned! 🎉
          </p>
        </div>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Recent Achievements
            </h3>
            <Link
              href="/dashboard/badges"
              className="text-sm text-accent hover:text-accent/80 font-medium"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.name}
                className={`p-4 rounded-lg border ${
                  rarityColors[achievement.rarity] || rarityColors.common
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-card-foreground mb-1">
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <div className="ml-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">🏅</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

