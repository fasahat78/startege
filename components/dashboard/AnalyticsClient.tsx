"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import AchievementProgress from "./AchievementProgress";
import LevelProgression from "./LevelProgression";
import MilestoneTracker from "./MilestoneTracker";
import QuickWins from "./QuickWins";

interface GamificationData {
  badgeProgress: {
    badgeName: string;
    current: number;
    requirement: number;
    progress: number;
    remaining: number;
    type: "concepts" | "streak" | "points";
  } | null;
  recentAchievements: Array<{
    name: string;
    description: string;
    rarity: string;
    earnedAt: string;
  }>;
  levelProgression: {
    currentLevel: number;
    maxUnlockedLevel: number;
    nextLevel: number;
    isNextLevelBoss: boolean;
    levelsPassed: number;
    levelStatuses: Array<{
      levelNumber: number;
      status: "PASSED" | "UNLOCKED" | "LOCKED";
      isBoss: boolean;
      bestScore: number | null;
    }>;
  };
  milestones: Array<{
    type: "concepts" | "streak" | "points" | "levels";
    title: string;
    description: string;
    current: number;
    target: number;
    remaining: number;
  }>;
  quickWins: Array<{
    type: string;
    title: string;
    description: string;
    action: string;
    actionUrl: string;
    priority: "high" | "medium" | "low";
  }>;
  streak: {
    current: number;
    longest: number;
    daysToPerfectWeek: number;
    daysToConsistencyChampion: number;
  };
}

interface AnalyticsData {
  overview: {
    totalStudyTime: number;
    conceptsMastered: number;
    examsCompleted: number;
    currentStreak: number;
    averageScore: number;
    totalPoints: number;
  };
  gamification: GamificationData;
}

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        console.log("[ANALYTICS_CLIENT] Fetching analytics...");
        const response = await fetch("/api/dashboard/analytics", {
          credentials: "include",
        });
        
        console.log("[ANALYTICS_CLIENT] Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("[ANALYTICS_CLIENT] Error data:", errorData);
          
          if (response.status === 403) {
            const errorMsg = "Premium subscription required";
            setError(errorMsg);
            toast(errorMsg, "warning");
          } else if (response.status === 401) {
            const errorMsg = "Please sign in to view analytics";
            setError(errorMsg);
            toast(errorMsg, "error");
          } else {
            const errorMsg = errorData.details || `Failed to load analytics (${response.status})`;
            setError(errorMsg);
            toast(errorMsg, "error");
          }
          return;
        }
        
        const analyticsData = await response.json();
        console.log("[ANALYTICS_CLIENT] Analytics data received:", analyticsData);
        setData(analyticsData);
      } catch (err: any) {
        console.error("[ANALYTICS_CLIENT] Error fetching analytics:", err);
        const errorMsg = err.message || "Failed to load analytics";
        setError(errorMsg);
        toast(errorMsg, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-6 text-center">
        <p className="text-status-error">{error}</p>
      </div>
    );
  }

  if (!data || !data.gamification) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const { overview, gamification } = data;

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Study Time</p>
          <p className="text-2xl font-bold text-card-foreground">
            {overview.totalStudyTime}
          </p>
          <p className="text-xs text-muted-foreground">minutes</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Concepts</p>
          <p className="text-2xl font-bold text-card-foreground">
            {overview.conceptsMastered}
          </p>
          <p className="text-xs text-muted-foreground">mastered</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Exams</p>
          <p className="text-2xl font-bold text-card-foreground">
            {overview.examsCompleted}
          </p>
          <p className="text-xs text-muted-foreground">completed</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Streak</p>
          <p className="text-2xl font-bold text-card-foreground">
            {overview.currentStreak}
          </p>
          <p className="text-xs text-muted-foreground">days</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
          <p className="text-2xl font-bold text-card-foreground">
            {overview.averageScore.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">across exams</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Points</p>
          <p className="text-2xl font-bold text-card-foreground">
            {overview.totalPoints.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
      </div>

      {/* Achievement Progress Dashboard */}
      <AchievementProgress
        badgeProgress={gamification.badgeProgress}
        recentAchievements={gamification.recentAchievements}
      />

      {/* Level Progression Map */}
      <LevelProgression
        currentLevel={gamification.levelProgression.currentLevel}
        maxUnlockedLevel={gamification.levelProgression.maxUnlockedLevel}
        nextLevel={gamification.levelProgression.nextLevel}
        isNextLevelBoss={gamification.levelProgression.isNextLevelBoss}
        levelsPassed={gamification.levelProgression.levelsPassed}
        levelStatuses={gamification.levelProgression.levelStatuses}
      />

      {/* Milestone Tracker */}
      <MilestoneTracker milestones={gamification.milestones} />

      {/* Quick Wins & Daily Goals */}
      <QuickWins quickWins={gamification.quickWins} />
    </div>
  );
}
