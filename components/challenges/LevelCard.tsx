"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface LevelCardProps {
  config: {
    level: number;
    title: string;
    questionCount: number;
    timeLimit: number;
  };
  challenge: { id: string; levelNumber?: number; level?: number; isBoss?: boolean } | undefined;
  status: string;
  progress: { bestScore: number | null; passedAt: Date | null } | undefined;
}

export default function LevelCard({
  config,
  challenge,
  status,
  progress,
}: LevelCardProps) {
  const isLocked = status === "locked" || status === "locked_premium";
  const isPremiumLocked = status === "locked_premium";
  const isProgressionLocked = status === "locked"; // Locked due to progression (previous level not completed)
  const isCompleted = status === "completed";
  const isAvailable = status === "available";

  if (isLocked) {
    return (
      <div
        className={`block bg-card rounded-lg shadow-card p-6 border-2 border-border transition ${
          isPremiumLocked ? "opacity-75" : "opacity-60 cursor-not-allowed"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Level</div>
            <div className="text-2xl font-bold text-card-foreground">{config.level}</div>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-status-disabled"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        
        {isPremiumLocked && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-semibold text-status-warning mb-2">🔒 PREMIUM</div>
            <Link
              href="/pricing"
              className="block w-full text-center px-3 py-2 bg-gradient-to-r from-primary/80 to-accent/80 text-white rounded text-sm font-semibold hover:opacity-90 transition"
              onClick={(e) => e.stopPropagation()}
            >
              Upgrade
            </Link>
          </div>
        )}

        {isProgressionLocked && !isPremiumLocked && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              🔒 Complete Level {config.level - 1} to unlock
            </div>
          </div>
        )}

      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-card-foreground text-sm">{config.title}</h3>
        {challenge?.isBoss && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-accent/20 text-accent border border-accent/30">
            BOSS
          </span>
        )}
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {config.questionCount} questions
        </div>
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {config.timeLimit} min
        </div>
      </div>

      {progress && progress.bestScore !== null && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">Best Score</div>
          <div className="text-sm font-semibold text-card-foreground">
            {Math.round(progress.bestScore)}%
          </div>
        </div>
      )}
      </div>
    );
  }

  return (
    <Link
      href={`/challenges/${config.level}`}
      className={`block bg-card rounded-lg shadow-card p-6 border-2 transition ${
        isCompleted
          ? "border-status-success hover:border-status-success/80"
          : isAvailable
          ? "border-accent/30 hover:border-accent/50"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Level</div>
          <div className="text-2xl font-bold text-card-foreground">{config.level}</div>
        </div>
        {isCompleted && (
          <div className="w-8 h-8 bg-status-success/10 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-status-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-card-foreground text-sm">{config.title}</h3>
        {challenge?.isBoss && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-accent/20 text-accent border border-accent/30">
            BOSS
          </span>
        )}
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {config.questionCount} questions
        </div>
        <div className="flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {config.timeLimit} min
        </div>
      </div>

      {progress && progress.bestScore !== null && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground">Best Score</div>
          <div className="text-sm font-semibold text-card-foreground">
            {Math.round(progress.bestScore)}%
          </div>
        </div>
      )}
    </Link>
  );
}

