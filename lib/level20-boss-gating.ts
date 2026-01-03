/**
 * Level 20 Boss Exam Gating Logic
 * 
 * Implements eligibility checks for Level 20 Boss Exam (Intermediate Mastery)
 */

import { prisma } from "@/lib/db";
import { LEVEL_20_BOSS_BLUEPRINT } from "./level20-boss-blueprint";

export interface Level20BossEligibilityResult {
  eligible: boolean;
  reasons: string[];
  missingCategories?: string[];
  missingLevels?: number[];
  cooldownActive?: boolean;
  nextEligibleAt?: Date;
}

/**
 * Check if user is eligible to start Level 20 Boss Exam
 */
export async function checkLevel20BossEligibility(
  userId: string
): Promise<Level20BossEligibilityResult> {
  const reasons: string[] = [];
  const missingCategories: string[] = [];
  const missingLevels: number[] = [];

  // 1. Check Levels 11-19 are all passed
  const requiredLevels = Array.from({ length: 9 }, (_, i) => i + 11); // [11, 12, ..., 19]
  
  const levelProgress = await (prisma as any).userLevelProgress.findMany({
    where: {
      userId,
      levelNumber: {
        in: requiredLevels,
      },
    },
    select: {
      levelNumber: true,
      passedAt: true,
    },
  });

  const passedLevels = new Set(
    levelProgress
      .filter((lp: any) => lp.passedAt !== null)
      .map((lp: any) => lp.levelNumber)
  );

  requiredLevels.forEach((levelNum) => {
    if (!passedLevels.has(levelNum)) {
      missingLevels.push(levelNum);
    }
  });

  if (missingLevels.length > 0) {
    reasons.push(
      `The following levels must be completed: ${missingLevels.join(", ")}`
    );
  }

  // 2. Check all required category exams are passed
  const requiredCategories = LEVEL_20_BOSS_BLUEPRINT.eligibility.categoriesToCheck;
  
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
  const level20Attempts = await (prisma as any).examAttempt.findMany({
    where: {
      userId,
      exam: {
        type: "LEVEL",
        levelNumber: 20,
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
  const consecutiveFailures = level20Attempts
    .filter((a: any) => a.pass === false)
    .slice(0, 3); // Check last 3 attempts

  if (consecutiveFailures.length > 0) {
    const lastFailure = consecutiveFailures[0];
    const cooldownMinutes =
      consecutiveFailures.length === 1
        ? LEVEL_20_BOSS_BLUEPRINT.cooldown.consecutiveFailures.fail1
        : consecutiveFailures.length === 2
        ? LEVEL_20_BOSS_BLUEPRINT.cooldown.consecutiveFailures.fail2
        : LEVEL_20_BOSS_BLUEPRINT.cooldown.consecutiveFailures.fail3Plus;

    const cooldownEnd = new Date(
      new Date(lastFailure.submittedAt).getTime() + cooldownMinutes * 60 * 1000
    );

    if (new Date() < cooldownEnd) {
      const hoursRemaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / (1000 * 60 * 60));
      reasons.push(
        `Cooldown active. You can retry in ${hoursRemaining} hour(s) (until ${cooldownEnd.toISOString()})`
      );
      return {
        eligible: false,
        reasons,
        missingCategories: missingCategories.length > 0 ? missingCategories : undefined,
        missingLevels: missingLevels.length > 0 ? missingLevels : undefined,
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
    missingLevels: missingLevels.length > 0 ? missingLevels : undefined,
  };
}

/**
 * Get all concepts for Level 20 Boss scope (Levels 11-19)
 */
export async function getLevel20BossConceptScope() {
  // Get all challenges for levels 11-19
  const challenges = await (prisma as any).challenge.findMany({
    where: {
      levelNumber: {
        gte: 11,
        lte: 19,
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

  // Fetch ConceptCard records by ID
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
 * Build category map for Level 20 boss exam generation
 */
export async function getLevel20BossCategoryMap() {
  const concepts = await getLevel20BossConceptScope();
  
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

