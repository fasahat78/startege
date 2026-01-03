/**
 * Level 40 Boss Exam Helper Functions
 * 
 * Functions to get concept scope and category mappings for Level 40
 */

import { prisma } from "./db";

/**
 * Get all concepts from Levels 1-39 for Level 40 Boss Exam
 */
export async function getLevel40BossConceptScope() {
  // Get all challenges from levels 1-39
  const challenges = await (prisma as any).challenge.findMany({
    where: {
      levelNumber: {
        gte: 1,
        lte: 39,
      },
    },
    select: {
      concepts: true,
    },
  });

  // Collect all unique concept IDs
  const allConceptIds = new Set<string>();
  challenges.forEach((challenge: any) => {
    if (Array.isArray(challenge.concepts)) {
      challenge.concepts.forEach((conceptId: string) => {
        allConceptIds.add(conceptId);
      });
    }
  });

  // Fetch all concept cards
  const concepts = await (prisma as any).conceptCard.findMany({
    where: {
      id: { in: Array.from(allConceptIds) },
    },
    select: {
      id: true,
      name: true,
      concept: true,
      categoryId: true,
    },
  });

  return concepts;
}

/**
 * Get category ID to name mapping for all categories
 */
export async function getLevel40BossCategoryMap(): Promise<Record<string, string>> {
  const categories = await (prisma as any).category.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const categoryMap: Record<string, string> = {};
  categories.forEach((cat: any) => {
    categoryMap[cat.id] = cat.name;
  });

  return categoryMap;
}

/**
 * Get all required category IDs for Level 40
 * (All categories across the platform)
 */
export async function getLevel40BossRequiredCategoryIds(): Promise<string[]> {
  const categories = await (prisma as any).category.findMany({
    select: {
      id: true,
    },
  });

  return categories.map((cat: any) => cat.id);
}

