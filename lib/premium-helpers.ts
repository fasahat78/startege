/**
 * Premium Feature Helpers
 */

import { prisma } from "./db";

/**
 * Check if user has premium subscription
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });
  
  return user?.subscriptionTier === "premium";
}

/**
 * Check if user has completed profile
 */
export async function hasCompletedProfile(userId: string): Promise<boolean> {
  // @ts-ignore - Prisma types not fully recognized by TypeScript yet
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { onboardingStatus: true },
  });
  
  return profile?.onboardingStatus === "COMPLETED";
}

/**
 * Check if user can access Startegizer
 * Requires: Premium subscription + Complete profile
 */
export async function canAccessStartegizer(userId: string): Promise<boolean> {
  const [isPremium, profileComplete] = await Promise.all([
    isPremiumUser(userId),
    hasCompletedProfile(userId),
  ]);
  
  return isPremium && profileComplete;
}

/**
 * Check if user can access level exams
 * Free: Levels 1-10
 * Premium: Levels 11-40
 */
export function canAccessLevelExam(
  subscriptionTier: string,
  level: number
): boolean {
  if (level <= 10) {
    return true; // Free for all users
  }
  
  return subscriptionTier === "premium"; // Premium required for levels 11-40
}

