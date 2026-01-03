"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "@/components/ui/Toast";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

interface AnalyticsData {
  overview: {
    totalStudyTime: number;
    conceptsMastered: number;
    examsCompleted: number;
    currentStreak: number;
    averageScore: number;
    totalPoints: number;
  };
  domainCoverage: Array<{
    domain: string;
    completed: number;
    totalTime: number;
  }>;
  difficultyProgression: Array<{
    difficulty: string;
    count: number;
  }>;
  learningProgress: Array<{
    date: string;
    concepts: number;
    timeSpent: number;
  }>;
  examPerformance: Array<{
    date: string;
    score: number;
    type: string;
  }>;
  insights: {
    strongestDomain: string;
    weakestDomain: string;
    totalLevelsPassed: number;
    totalCategoriesCovered: number;
  };
}

const COLORS = {
  primary: "#3b82f6",
  accent: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: COLORS.success,
  intermediate: COLORS.primary,
  advanced: COLORS.accent,
  expert: COLORS.warning,
};

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        console.log("[ANALYTICS_CLIENT] Fetching analytics...");
        const response = await fetch("/api/dashboard/analytics", {
          credentials: "include", // Include cookies for authentication
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Study Time</p>
          <p className="text-2xl font-bold text-card-foreground">
            {data.overview.totalStudyTime}
          </p>
          <p className="text-xs text-muted-foreground">minutes</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Concepts</p>
          <p className="text-2xl font-bold text-card-foreground">
            {data.overview.conceptsMastered}
          </p>
          <p className="text-xs text-muted-foreground">mastered</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Exams</p>
          <p className="text-2xl font-bold text-card-foreground">
            {data.overview.examsCompleted}
          </p>
          <p className="text-xs text-muted-foreground">completed</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Streak</p>
          <p className="text-2xl font-bold text-card-foreground">
            {data.overview.currentStreak}
          </p>
          <p className="text-xs text-muted-foreground">days</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
          <p className="text-2xl font-bold text-card-foreground">
            {data.overview.averageScore.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">across exams</p>
        </div>
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground mb-1">Points</p>
          <p className="text-2xl font-bold text-card-foreground">
            {data.overview.totalPoints.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress Over Time */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Learning Progress (Last 30 Days)
          </h3>
          {data.learningProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.learningProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString();
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="concepts"
                  stroke={COLORS.primary}
                  name="Concepts Completed"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="timeSpent"
                  stroke={COLORS.accent}
                  name="Time Spent (min)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No activity in the last 30 days
            </div>
          )}
        </div>

        {/* Domain Coverage */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Domain Coverage
          </h3>
          {data.domainCoverage.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.domainCoverage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill={COLORS.primary} name="Concepts Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No domain data available
            </div>
          )}
        </div>

        {/* Difficulty Progression */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Difficulty Progression
          </h3>
          {data.difficultyProgression.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.difficultyProgression}
                  dataKey="count"
                  nameKey="difficulty"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ difficulty, count }) =>
                    `${difficulty}: ${count}`
                  }
                >
                  {data.difficultyProgression.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        DIFFICULTY_COLORS[entry.difficulty] || COLORS.primary
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No difficulty data available
            </div>
          )}
        </div>

        {/* Exam Performance */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Exam Performance Trend
          </h3>
          {data.examPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.examPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString();
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={COLORS.success}
                  name="Score (%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No exam data available
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-status-success/10 rounded-lg border border-status-success/20">
            <p className="text-sm font-medium text-status-success mb-1">
              Strongest Domain
            </p>
            <p className="text-xl font-bold text-card-foreground">
              {data.insights.strongestDomain}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You've mastered the most concepts in this domain
            </p>
          </div>
          <div className="p-4 bg-status-warning/10 rounded-lg border border-status-warning/20">
            <p className="text-sm font-medium text-status-warning mb-1">
              Area for Improvement
            </p>
            <p className="text-xl font-bold text-card-foreground">
              {data.insights.weakestDomain}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Focus more on concepts in this domain
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Levels Passed
            </p>
            <p className="text-xl font-bold text-card-foreground">
              {data.insights.totalLevelsPassed}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total levels completed
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Categories Covered
            </p>
            <p className="text-xl font-bold text-card-foreground">
              {data.insights.totalCategoriesCovered}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Different categories explored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

