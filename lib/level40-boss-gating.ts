/**
 * Level 40 Boss Exam Eligibility Checks
 * 
 * Absolute gate: No shortcuts, overrides, or partial access.
 * A learner may attempt Level 40 only if ALL conditions are met.
 */

import { prisma } from "./db";
import { LEVEL_40_BOSS_BLUEPRINT } from "./level40-boss-blueprint";

export interface Level40EligibilityResult {
  eligible: boolean;
  reasons: string[];
  nextEligibleAt?: Date;
}

/**
 * Check if a user is eligible to attempt Level 40 Boss Exam
 */
export async function checkLevel40BossEligibility(
  userId: string
): Promise<Level40EligibilityResult> {
  const reasons: string[] = [];
  let nextEligibleAt: Date | undefined;

  // 1. Check if all levels 1-39 are passed
  const requiredLevels = Array.from({ length: 39 }, (_, i) => i + 1);
  const userProgress = await (prisma as any).userLevelProgress.findMany({
    where: {
      userId,
      levelNumber: { in: requiredLevels },
    },
  });

  const passedLevels = userProgress
    .filter((p: any) => p.passedAt !== null)
    .map((p: any) => p.levelNumber);

  const missingLevels = requiredLevels.filter(
    (level) => !passedLevels.includes(level)
  );

  if (missingLevels.length > 0) {
    reasons.push(
      `Missing ${missingLevels.length} required level(s): ${missingLevels.slice(0, 5).join(", ")}${missingLevels.length > 5 ? "..." : ""}`
    );
  }

  // 2. Check if Level 39 is specifically passed
  const level39Progress = userProgress.find((p: any) => p.levelNumber === 39);
  if (!level39Progress || !level39Progress.passedAt) {
    reasons.push("Level 39 must be passed");
  }

  // 3. Check if all category exams are passed
  // Get all categories that have been introduced or practiced
  const allCategories = await (prisma as any).category.findMany({
    select: { id: true, name: true },
  });

  const categoryIds = allCategories.map((c: any) => c.id);

  // Check category exam attempts
  const categoryExamAttempts = await (prisma as any).examAttempt.findMany({
    where: {
      userId,
      exam: {
        type: "CATEGORY",
        categoryId: { in: categoryIds },
      },
      pass: true,
    },
    include: {
      exam: {
        select: { categoryId: true },
      },
    },
  });

  const passedCategoryIds = new Set(
    categoryExamAttempts.map((a: any) => a.exam.categoryId)
  );

  const missingCategories = allCategories.filter(
    (c: any) => !passedCategoryIds.has(c.id)
  );

  if (missingCategories.length > 0) {
    reasons.push(
      `Missing ${missingCategories.length} required category exam(s): ${missingCategories.slice(0, 5).map((c: any) => c.name).join(", ")}${missingCategories.length > 5 ? "..." : ""}`
    );
  }

  // 4. Check cooldown from prior Level 40 attempts
  const level40Attempts = await (prisma as any).examAttempt.findMany({
    where: {
      userId,
      exam: {
        type: "LEVEL",
        challenge: {
          levelNumber: 40,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: 1,
  });

  if (level40Attempts.length > 0) {
    const lastAttempt = level40Attempts[0];
    
    // If the last attempt failed, check cooldown
    if (!lastAttempt.pass && lastAttempt.submittedAt) {
      const submittedAt = new Date(lastAttempt.submittedAt);
      const cooldownMs = LEVEL_40_BOSS_BLUEPRINT.eligibility.cooldownHours * 60 * 60 * 1000;
      const nextEligible = new Date(submittedAt.getTime() + cooldownMs);
      
      if (new Date() < nextEligible) {
        reasons.push(
          `Cooldown active. Next eligible: ${nextEligible.toISOString()}`
        );
        nextEligibleAt = nextEligible;
      }
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    nextEligibleAt,
  };
}

