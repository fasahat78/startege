"use client";

import Link from "next/link";

interface LevelStatus {
  levelNumber: number;
  status: "PASSED" | "UNLOCKED" | "LOCKED";
  isBoss: boolean;
  bestScore: number | null;
}

interface LevelProgressionProps {
  currentLevel: number;
  maxUnlockedLevel: number;
  nextLevel: number;
  isNextLevelBoss: boolean;
  levelsPassed: number;
  levelStatuses: LevelStatus[];
}

export default function LevelProgression({
  currentLevel,
  maxUnlockedLevel,
  nextLevel,
  isNextLevelBoss,
  levelsPassed,
  levelStatuses,
}: LevelProgressionProps) {
  const getStatusIcon = (status: string, isBoss: boolean) => {
    if (status === "PASSED") {
      return isBoss ? "👑" : "✅";
    }
    if (status === "UNLOCKED") {
      return isBoss ? "🔥" : "🔓";
    }
    return "🔒";
  };

  const getStatusColor = (status: string) => {
    if (status === "PASSED") {
      return "bg-status-success/10 border-status-success/20 text-status-success";
    }
    if (status === "UNLOCKED") {
      return "bg-primary/10 border-primary/20 text-primary";
    }
    return "bg-muted border-border text-muted-foreground opacity-50";
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground mb-1">
            Level Progression
          </h3>
          <p className="text-sm text-muted-foreground">
            {levelsPassed} of 40 levels completed
          </p>
        </div>
        <Link
          href="/challenges"
          className="text-sm text-accent hover:text-accent/80 font-medium"
        >
          View Challenges →
        </Link>
      </div>

      {/* Current Level Display */}
      <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Level</p>
            <p className="text-3xl font-bold text-card-foreground">
              Level {currentLevel}
              {[10, 20, 30, 40].includes(currentLevel) && (
                <span className="ml-2 text-lg">👑</span>
              )}
            </p>
          </div>
          {nextLevel <= 40 && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Next Level</p>
              <p className="text-2xl font-bold text-card-foreground">
                Level {nextLevel}
                {isNextLevelBoss && (
                  <span className="ml-2 text-base">🔥</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Level Grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {levelStatuses.map((level) => (
          <Link
            key={level.levelNumber}
            href={
              level.status === "LOCKED"
                ? "#"
                : `/challenges/${level.levelNumber}`
            }
            className={`
              relative p-3 rounded-lg border text-center transition-all
              ${getStatusColor(level.status)}
              ${level.status === "LOCKED" ? "cursor-not-allowed" : "cursor-pointer hover:scale-105"}
            `}
            title={
              level.status === "PASSED"
                ? `Level ${level.levelNumber} - Passed${level.bestScore ? ` (${level.bestScore}%)` : ""}`
                : level.status === "UNLOCKED"
                ? `Level ${level.levelNumber} - Available`
                : `Level ${level.levelNumber} - Locked`
            }
          >
            <div className="text-xl mb-1">
              {getStatusIcon(level.status, level.isBoss)}
            </div>
            <div className="text-xs font-semibold">
              {level.levelNumber}
            </div>
            {level.isBoss && (
              <div className="absolute -top-1 -right-1 text-xs">👑</div>
            )}
          </Link>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>✅</span>
          <span>Passed</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🔓</span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🔒</span>
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-1">
          <span>👑</span>
          <span>Boss Level</span>
        </div>
      </div>
    </div>
  );
}

