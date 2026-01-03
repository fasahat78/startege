"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface LevelCardProps {
  level: number;
  displayStatus: string;
  isBoss: boolean;
  subscriptionTier: string;
}

export default function LevelCard({
  level,
  displayStatus,
  isBoss,
  subscriptionTier,
}: LevelCardProps) {
  const router = useRouter();
  const isLocked = displayStatus === "LOCKED" || displayStatus === "LOCKED_PREMIUM";
  const isPremiumLocked = displayStatus === "LOCKED_PREMIUM";

  const handleClick = (e: React.MouseEvent) => {
    if (isPremiumLocked) {
      e.preventDefault();
      router.push("/pricing");
    }
  };

  return (
    <Link
      href={isPremiumLocked ? "/pricing" : `/challenges/${level}`}
      className={`relative group ${
        isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      onClick={handleClick}
    >
      <div
        className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all ${
          displayStatus === "PASSED"
            ? "bg-status-success/20 border-status-success text-status-success"
            : displayStatus === "AVAILABLE"
            ? "bg-accent/10 border-accent text-accent hover:bg-accent/20"
            : isPremiumLocked
            ? "bg-muted border-brand-teal/30 text-muted-foreground"
            : "bg-muted border-border text-muted-foreground"
        } ${isBoss ? "ring-2 ring-yellow-400/50" : ""}`}
      >
        {isBoss ? "👑" : level}
      </div>
      {displayStatus === "PASSED" && (
        <div className="absolute -top-1 -right-1 bg-status-success rounded-full p-1">
          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      {isPremiumLocked && (
        <div className="absolute -top-1 -right-1 bg-brand-teal rounded-full p-0.5">
          <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </Link>
  );
}

