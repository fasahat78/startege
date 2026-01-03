"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ChallengesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Challenges page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card shadow-card rounded-lg p-6">
        <h2 className="text-2xl font-bold text-card-foreground mb-4">
          Error loading challenges
        </h2>
        <p className="text-muted-foreground mb-4">
          {error.message || "Failed to load challenges page"}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="flex-1 bg-muted text-card-foreground py-2 px-4 rounded-md hover:bg-muted/80 transition-colors text-center border border-border"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

