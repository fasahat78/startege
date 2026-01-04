"use client";

import Link from "next/link";

interface Milestone {
  type: "concepts" | "streak" | "points" | "levels";
  title: string;
  description: string;
  current: number;
  target: number;
  remaining: number;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
}

const typeIcons: Record<string, string> = {
  concepts: "📚",
  streak: "🔥",
  points: "⭐",
  levels: "🎯",
};

const typeColors: Record<string, string> = {
  concepts: "bg-status-success/10 border-status-success/20 text-status-success",
  streak: "bg-status-warning/10 border-status-warning/20 text-status-warning",
  points: "bg-accent/10 border-accent/20 text-accent",
  levels: "bg-primary/10 border-primary/20 text-primary",
};

export default function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  if (milestones.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          Milestones
        </h3>
        <p className="text-muted-foreground">
          No active milestones. Keep learning to unlock new goals!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">
        Active Milestones
      </h3>
      
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const progress = (milestone.current / milestone.target) * 100;
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                typeColors[milestone.type] || typeColors.concepts
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">{typeIcons[milestone.type]}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground mb-1">
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    {milestone.current} / {milestone.target}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-current h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {milestone.remaining > 0 ? (
                  <>
                    <span className="font-semibold text-card-foreground">
                      {milestone.remaining}
                    </span>{" "}
                    {milestone.type === "concepts"
                      ? "more concepts"
                      : milestone.type === "streak"
                      ? "more days"
                      : milestone.type === "points"
                      ? "more points"
                      : "more levels"}{" "}
                    to go
                  </>
                ) : (
                  "Milestone achieved! 🎉"
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

