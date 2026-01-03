"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface PrimaryFeatureCardProps {
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
}

export default function PrimaryFeatureCard({
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
}: PrimaryFeatureCardProps) {
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
        <span className="px-3 py-1 text-xs font-semibold bg-status-success/20 text-status-success rounded-full">
          ✅ FREE
        </span>
      );
    }
    
    const isFreemium = isFree && isPremium;
    
    if (isFreemium) {
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-accent/10 text-accent rounded-full border border-accent/20">
          🎯 FREEMIUM
        </span>
      );
    }
    
    if (isPremium && !isUnlocked) {
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-brand-teal/10 text-brand-teal rounded-full border border-brand-teal/20">
          🔒 PREMIUM
        </span>
      );
    }
    
    if (isPremium && isUnlocked) {
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-brand-teal/10 text-brand-teal rounded-full border border-brand-teal/20">
          ✅ PREMIUM
        </span>
      );
    }
    
    return null;
  };

  const getProfileBadge = () => {
    if (requiresProfile && !profileComplete) {
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-status-error/20 text-status-error rounded-full mt-2">
          ⚠️ Profile Incomplete
        </span>
      );
    }
    
    if (requiresProfile && profileComplete) {
      return (
        <span className="px-3 py-1 text-xs font-semibold bg-status-success/20 text-status-success rounded-full mt-2">
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
      className={`bg-gradient-to-br from-card via-card to-muted/30 rounded-xl shadow-lg p-8 border-2 transition-all duration-200 flex flex-col h-full ${
        isUnlocked
          ? "border-accent hover:shadow-xl hover:scale-[1.02] cursor-pointer"
          : isClickable
          ? "border-border opacity-90 hover:shadow-lg hover:scale-[1.01] cursor-pointer"
          : "border-border opacity-90"
      }`}
      onClick={isClickable ? handleClick : undefined}
    >
      {/* Icon */}
      <div className="mb-6 flex items-start justify-between">
        <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-brand-teal/20 rounded-xl p-4">
          {icon}
        </div>
        {getStatusBadge()}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-card-foreground mb-3">
        {title}
      </h3>

      {/* Profile Badge */}
      {getProfileBadge()}

      {/* Description */}
      <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      {ctaHref ? (
        <Link
          href={ctaHref}
          className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isUnlocked
              ? "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-md hover:shadow-lg"
              : "bg-gradient-to-r from-primary/80 to-accent/80 text-white hover:opacity-90 shadow-md hover:shadow-lg"
          }`}
        >
          {ctaText}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isUnlocked
              ? "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-md hover:shadow-lg"
              : "bg-gradient-to-r from-primary/80 to-accent/80 text-white hover:opacity-90 shadow-md hover:shadow-lg"
          }`}
        >
          {ctaText}
        </button>
      )}
    </div>
  );
}

