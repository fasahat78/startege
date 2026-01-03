/**
 * Boss Exam Gating Logic
 * 
 * Implements eligibility checks for Level 10 Boss Exam
 */

import { prisma } from "@/lib/db";
import { LEVEL_10_BOSS_BLUEPRINT } from "./boss-exam-blueprint";

export interface BossEligibilityResult {
  eligible: boolean;
  reasons: string[];
  missingCategories?: string[];
  level9Status?: string;
  cooldownActive?: boolean;
  nextEligibleAt?: Date;
}

/**
 * Check if user is eligible to start Level 10 Boss Exam
 */
export async function checkBossEligibility(
  userId: string
): Promise<BossEligibilityResult> {
  const reasons: string[] = [];
  const missingCategories: string[] = [];

  // 1. Check Level 9 is passed
  const level9Progress = await (prisma as any).userLevelProgress.findUnique({
    where: {
      userId_levelNumber: {
        userId,
        levelNumber: 9,
      },
    },
  });

  if (!level9Progress || level9Progress.status !== "PASSED") {
    reasons.push("Level 9 must be passed");
    return {
      eligible: false,
      reasons,
      level9Status: level9Progress?.status || "NOT_STARTED",
    };
  }

  // 2. Check all required category exams are passed
  const requiredCategories = LEVEL_10_BOSS_BLUEPRINT.eligibility.categoriesToCheck;
  
  // Get all categories by name
  const categories = await (prisma as any).category.findMany({
    where: {
      name: {
        in: requiredCategories,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Get user's category progress
  const categoryProgress = await (prisma as any).userCategoryProgress.findMany({
    where: {
      userId,
      categoryId: {
        in: categories.map((c: any) => c.id),
      },
    },
    select: {
      categoryId: true,
      status: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  // Check which categories are not passed
  const passedCategoryIds = new Set(
    categoryProgress
      .filter((cp: any) => cp.status === "PASSED")
      .map((cp: any) => cp.categoryId)
  );

  categories.forEach((cat: any) => {
    if (!passedCategoryIds.has(cat.id)) {
      missingCategories.push(cat.name);
    }
  });

  if (missingCategories.length > 0) {
    reasons.push(
      `The following category exams must be passed: ${missingCategories.join(", ")}`
    );
  }

  // 3. Check cooldown
  const level10Attempts = await (prisma as any).examAttempt.findMany({
    where: {
      userId,
      exam: {
        type: "LEVEL",
        levelNumber: 10,
      },
      submittedAt: {
        not: null,
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
    select: {
      pass: true,
      submittedAt: true,
    },
  });

  // Get consecutive failures
  const consecutiveFailures = level10Attempts
    .filter((a: any) => a.pass === false)
    .slice(0, 3); // Check last 3 attempts

  if (consecutiveFailures.length > 0) {
    const lastFailure = consecutiveFailures[0];
    const cooldownMinutes =
      consecutiveFailures.length === 1
        ? LEVEL_10_BOSS_BLUEPRINT.cooldown.consecutiveFailures.fail1
        : consecutiveFailures.length === 2
        ? LEVEL_10_BOSS_BLUEPRINT.cooldown.consecutiveFailures.fail2
        : LEVEL_10_BOSS_BLUEPRINT.cooldown.consecutiveFailures.fail3Plus;

    const cooldownEnd = new Date(
      new Date(lastFailure.submittedAt).getTime() + cooldownMinutes * 60 * 1000
    );

    if (new Date() < cooldownEnd) {
      reasons.push(`Cooldown active until ${cooldownEnd.toISOString()}`);
      return {
        eligible: false,
        reasons,
        cooldownActive: true,
        nextEligibleAt: cooldownEnd,
      };
    }
  }

  // All checks passed
  if (reasons.length === 0) {
    return {
      eligible: true,
      reasons: [],
    };
  }

  return {
    eligible: false,
    reasons,
    missingCategories: missingCategories.length > 0 ? missingCategories : undefined,
  };
}

/**
 * Get all concepts for Level 10 Boss scope (Levels 1-9)
 */
export async function getBossConceptScope() {
  // Get all challenges for levels 1-9
  const challenges = await (prisma as any).challenge.findMany({
    where: {
      levelNumber: {
        gte: 1,
        lte: 9,
      },
    },
    select: {
      concepts: true,
    },
  });

  // Collect all unique concept IDs (ConceptCard IDs)
  const conceptIds = new Set<string>();
  challenges.forEach((challenge: any) => {
    if (challenge.concepts && Array.isArray(challenge.concepts)) {
      challenge.concepts.forEach((c: string) => conceptIds.add(c));
    }
  });

  if (conceptIds.size === 0) {
    return [];
  }

  // Fetch ConceptCard records by ID (concepts are stored as ConceptCard IDs)
  const concepts = await (prisma as any).conceptCard.findMany({
    where: {
      id: {
        in: Array.from(conceptIds),
      },
    },
    select: {
      id: true,
      name: true,
      concept: true,
      categoryId: true,
      categoryRelation: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return concepts;
}

/**
 * Build category map for boss exam generation
 */
export async function getBossCategoryMap() {
  const concepts = await getBossConceptScope();
  
  const categoryMap: Record<string, string[]> = {};
  
  concepts.forEach((concept: any) => {
    const categoryId = concept.categoryRelation?.id;
    if (categoryId) {
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = [];
      }
      categoryMap[categoryId].push(concept.name || concept.concept);
    }
  });

  return categoryMap;
}

