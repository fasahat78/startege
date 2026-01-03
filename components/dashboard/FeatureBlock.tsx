"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface FeatureBlockProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isFree: boolean;
  isPremium: boolean;
  isUnlocked: boolean;
  requiresProfile?: boolean;
  profileComplete?: boolean;
  ctaText: string;
  ctaHref?: string;
  ctaAction?: () => void;
  badge?: string;
}

export default function FeatureBlock({
  title,
  description,
  icon,
  isFree,
  isPremium,
  isUnlocked,
  requiresProfile = false,
  profileComplete = false,
  ctaText,
  ctaHref,
  ctaAction,
  badge,
}: FeatureBlockProps) {
  const router = useRouter();

  const handleClick = () => {
    if (ctaAction) {
      ctaAction();
    } else if (ctaHref) {
      router.push(ctaHref);
    }
  };

  const getStatusBadge = () => {
    if (isFree) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-status-success/20 text-status-success rounded-full">
          ✅ FREE
        </span>
      );
    }
    
    // Check if this is freemium (both free and premium)
    const isFreemium = isFree && isPremium;
    
    if (isFreemium) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-accent/10 text-accent rounded-full border border-accent/20">
          🎯 FREEMIUM
        </span>
      );
    }
    
    if (isPremium && !isUnlocked) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-brand-teal/10 text-brand-teal rounded-full border border-brand-teal/20">
          🔒 PREMIUM
        </span>
      );
    }
    
    if (isPremium && isUnlocked) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-brand-teal/10 text-brand-teal rounded-full border border-brand-teal/20">
          ✅ PREMIUM
        </span>
      );
    }
    
    return null;
  };

  const getProfileBadge = () => {
    if (requiresProfile && !profileComplete) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-status-error/20 text-status-error rounded-full mt-1">
          ⚠️ Profile Incomplete
        </span>
      );
    }
    
    if (requiresProfile && profileComplete) {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-status-success/20 text-status-success rounded-full mt-1">
          ✅ Profile Complete
        </span>
      );
    }
    
    return null;
  };

  // Always clickable if there's an action or href - even when locked, should go to pricing
  const isClickable = ctaHref || ctaAction;

  return (
    <div
      className={`bg-card rounded-lg shadow-card p-6 border-2 transition-all duration-200 flex flex-col h-full ${
        isUnlocked
          ? "border-accent hover:shadow-lg hover:scale-105 cursor-pointer"
          : isClickable
          ? "border-border opacity-90 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
          : "border-border opacity-90"
      }`}
      onClick={isClickable ? handleClick : undefined}
    >
      {/* Icon */}
      <div className="mb-4 flex items-start justify-between">
        <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-brand-teal/10 rounded-lg p-3">
          {icon}
        </div>
        {badge && (
          <span className="px-2 py-1 text-xs font-semibold bg-accent/20 text-accent rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-card-foreground mb-2">
        {title}
      </h3>

      {/* Status Badges */}
      <div className="flex flex-col gap-1 mb-3">
        {getStatusBadge()}
        {getProfileBadge()}
      </div>

      {/* Description - flex-grow to push button down */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
        {description}
      </p>

      {/* CTA Button - consistent styling and alignment */}
      {ctaHref ? (
        <Link
          href={ctaHref}
          className={`block w-full text-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            isUnlocked
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
              : "bg-gradient-to-r from-primary/80 to-accent/80 text-white hover:opacity-90 shadow-md hover:shadow-lg"
          }`}
        >
          {ctaText}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            isUnlocked
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
              : "bg-gradient-to-r from-primary/80 to-accent/80 text-white hover:opacity-90 shadow-md hover:shadow-lg"
          }`}
        >
          {ctaText}
        </button>
      )}
    </div>
  );
}

