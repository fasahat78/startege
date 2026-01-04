import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function BadgesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/dashboard/badges");
  }

  const [userBadges, allBadges] = await Promise.all([
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.badge.findMany({
      orderBy: [{ rarity: "asc" }, { name: "asc" }],
    }),
  ]);

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  const rarityColors: Record<string, string> = {
    common: "bg-muted border-border text-muted-foreground",
    uncommon: "bg-status-success/10 border-status-success/20 text-status-success",
    rare: "bg-accent/10 border-accent/20 text-accent",
    epic: "bg-brand-teal/10 border-brand-teal/20 text-brand-teal",
    legendary: "bg-status-warning/10 border-status-warning/20 text-status-warning",
  };

  const earnedCount = userBadges.length;
  const totalCount = allBadges.length;
  const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Badges</h1>
          <p className="text-muted-foreground">
            Track your achievements and milestones
          </p>
        </div>

        {/* Progress Summary */}
        <div className="bg-card rounded-lg shadow-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-card-foreground">
              Collection Progress
            </h2>
            <span className="text-lg font-semibold text-card-foreground">
              {earnedCount} / {totalCount}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-4">
            <div
              className="bg-accent h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const userBadge = userBadges.find((ub) => ub.badgeId === badge.id);

            return (
              <div
                key={badge.id}
                className={`bg-card rounded-lg shadow-card p-6 border-2 ${
                  isEarned
                    ? rarityColors[badge.rarity] || "bg-muted border-border"
                    : "border-border opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground mb-1">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {badge.description}
                    </p>
                  </div>
                  {isEarned && (
                    <div className="flex-shrink-0">
                      <svg
                        className="h-6 w-6 text-status-success"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      rarityColors[badge.rarity] || "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {badge.rarity}
                  </span>
                  {isEarned && userBadge && (
                    <span className="text-xs text-muted-foreground">
                      Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

