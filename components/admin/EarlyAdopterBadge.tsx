import { EarlyAdopterTier } from "@prisma/client";

interface EarlyAdopterBadgeProps {
  tier: EarlyAdopterTier | null | undefined;
  className?: string;
}

const tierConfig = {
  FOUNDING_MEMBER: {
    label: "Founding Member",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "👑",
  },
  EARLY_ADOPTER: {
    label: "Early Adopter",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "⭐",
  },
  LAUNCH_USER: {
    label: "Early Adopter",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "✨",
  },
};

export default function EarlyAdopterBadge({ tier, className = "" }: EarlyAdopterBadgeProps) {
  if (!tier) return null;

  const config = tierConfig[tier];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color} ${className}`}
      title={config.label}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

