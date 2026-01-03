/**
 * Pre-generate Boss Exams Script
 * 
 * This script pre-generates and stores boss exams (Level 10, 20, 30, 40) in the database.
 * This improves performance by avoiding slow ChatGPT API calls during exam start.
 * 
 * Run with: npx tsx scripts/pre-generate-boss-exams.ts
 */

import { prisma } from "../lib/db";
import { getBossConceptScope } from "../lib/boss-exam-gating";
import { getLevel20BossConceptScope } from "../lib/level20-boss-gating";
import { getLevel30BossConceptScope } from "../lib/level30-boss-gating";
import { getLevel40BossConceptScope, getLevel40BossCategoryMap, getLevel40BossRequiredCategoryIds } from "../lib/level40-boss-helpers";
import { LEVEL_10_BOSS_BLUEPRINT } from "../lib/boss-exam-blueprint";
import { LEVEL_20_BOSS_BLUEPRINT } from "../lib/level20-boss-blueprint";
import { LEVEL_30_BOSS_BLUEPRINT } from "../lib/level30-boss-blueprint";
import { LEVEL_40_BOSS_BLUEPRINT } from "../lib/level40-boss-blueprint";
import { generateBossExamPrompt } from "../lib/boss-exam-prompt";
import { generateExamQuestions } from "../lib/chatgpt";
import { validateBossExamComposition } from "../lib/boss-exam-blueprint";
import { validateLevel20BossExamComposition } from "../lib/level20-boss-blueprint";
import { validateLevel30BossExamComposition } from "../lib/level30-boss-blueprint";

async function preGenerateBossExam(levelNumber: number) {
  console.log(`\n🎯 Pre-generating Level ${levelNumber} Boss Exam...`);

  // Get challenge
  const challenge = await (prisma as any).challenge.findUnique({
    where: { levelNumber },
  });

  if (!challenge) {
    console.error(`❌ Challenge not found for Level ${levelNumber}`);
    return;
  }

  // Get or create Exam record
  let exam = await (prisma as any).exam.findFirst({
    where: {
      type: "LEVEL",
      levelNumber,
    },
  });

  if (!exam) {
    const levelConfig = (await import("../lib/levels")).getLevelConfig(levelNumber);
    exam = await (prisma as any).exam.create({
      data: {
        type: "LEVEL",
        levelNumber,
        status: "DRAFT",
        systemPromptSnapshot: challenge.examSystemPrompt || "Generate exam questions for this level.",
        generationConfig: {
          questionCount: levelConfig?.questionCount || challenge.questionCount || 10,
          difficulty: levelNumber === 10 ? "intermediate-advanced" : levelNumber === 30 ? "expert" : "advanced",
          passMark: levelConfig?.passingScore || challenge.passingScore || 70,
          timeLimitSec: (levelConfig?.timeLimit || challenge.timeLimit || (levelNumber === 40 ? 60 : 20)) * 60,
          isBoss: true,
        },
        questions: { questions: [] },
      },
    });
  }

  // Check if already generated
  const existingQuestions = exam.questions as any;
  if (existingQuestions?.questions && existingQuestions.questions.length > 0) {
    console.log(`✅ Level ${levelNumber} Boss Exam already pre-generated (${existingQuestions.questions.length} questions)`);
    return;
  }

  // Get concept scope and categories based on level
  let bossConcepts: any[];
  let bossBlueprint: typeof LEVEL_10_BOSS_BLUEPRINT | typeof LEVEL_20_BOSS_BLUEPRINT | typeof LEVEL_30_BOSS_BLUEPRINT | typeof LEVEL_40_BOSS_BLUEPRINT;
  let allowedConceptIds: Set<string>;
  let categoryIdMap: Record<string, string>;
  let requiredCategoryIds: string[];

  if (levelNumber === 10) {
    bossBlueprint = LEVEL_10_BOSS_BLUEPRINT;
    bossConcepts = await getBossConceptScope();
    const requiredCategories = LEVEL_10_BOSS_BLUEPRINT.requiredCategories;
    const categories = await (prisma as any).category.findMany({
      where: { name: { in: requiredCategories } },
      select: { id: true, name: true },
    });
    categoryIdMap = {};
    categories.forEach((cat: any) => {
      categoryIdMap[cat.id] = cat.name;
    });
    requiredCategoryIds = categories.map((cat: any) => cat.id);
  } else if (levelNumber === 20) {
    bossBlueprint = LEVEL_20_BOSS_BLUEPRINT;
    bossConcepts = await getLevel20BossConceptScope();
    const requiredCategories = LEVEL_20_BOSS_BLUEPRINT.requiredCategories;
    const categories = await (prisma as any).category.findMany({
      where: { name: { in: requiredCategories } },
      select: { id: true, name: true },
    });
    categoryIdMap = {};
    categories.forEach((cat: any) => {
      categoryIdMap[cat.id] = cat.name;
    });
    requiredCategoryIds = categories.map((cat: any) => cat.id);
  } else if (levelNumber === 30) {
    bossBlueprint = LEVEL_30_BOSS_BLUEPRINT;
    bossConcepts = await getLevel30BossConceptScope();
    const requiredCategories = LEVEL_30_BOSS_BLUEPRINT.requiredCategories;
    const categories = await (prisma as any).category.findMany({
      where: { name: { in: requiredCategories } },
      select: { id: true, name: true },
    });
    categoryIdMap = {};
    categories.forEach((cat: any) => {
      categoryIdMap[cat.id] = cat.name;
    });
    requiredCategoryIds = categories.map((cat: any) => cat.id);
  } else if (levelNumber === 40) {
    bossBlueprint = LEVEL_40_BOSS_BLUEPRINT;
    bossConcepts = await getLevel40BossConceptScope();
    categoryIdMap = await getLevel40BossCategoryMap();
    requiredCategoryIds = await getLevel40BossRequiredCategoryIds();
  } else {
    console.error(`❌ Invalid boss level: ${levelNumber}`);
    return;
  }

  allowedConceptIds = new Set(bossConcepts.map((c: any) => c.id).filter(Boolean));

  // Generate prompt
  let levelClusters: Array<{ levels: number[]; theme: string }>;
  let levelRange: [number, number];
  let difficultyMix: { apply: number; analyse: number; judgement: number };
  let maxConceptFrequency: number;

  if (levelNumber === 40) {
    // Level 40 uses all levels 1-39
    levelClusters = [
      { levels: [1, 2, 3, 4, 5, 6, 7, 8, 9], theme: "Foundation" },
      { levels: [10], theme: "Foundation Mastery (Boss)" },
      { levels: [11, 12, 13, 14, 15, 16, 17, 18, 19], theme: "Intermediate" },
      { levels: [20], theme: "Intermediate Mastery (Boss)" },
      { levels: [21, 22, 23, 24, 25, 26, 27, 28, 29], theme: "Advanced" },
      { levels: [30], theme: "Advanced Mastery (Boss)" },
      { levels: [31, 32, 33, 34, 35, 36, 37, 38, 39], theme: "Mastery" },
    ];
    levelRange = [1, 39];
    difficultyMix = LEVEL_40_BOSS_BLUEPRINT.difficultyMix;
    maxConceptFrequency = LEVEL_40_BOSS_BLUEPRINT.coverageRequirements.conceptScope.maxFrequencyPerConcept;
  } else {
    levelClusters = bossBlueprint.levelClusters.map((cluster: any) => ({
      levels: [...cluster.levels],
      theme: cluster.theme,
    }));
    levelRange = bossBlueprint.scope.levelRange as [number, number];
    difficultyMix = bossBlueprint.questionComposition.difficultyMix;
    maxConceptFrequency = bossBlueprint.questionComposition.maxQuestionsPerConcept;
  }

  const systemPrompt = generateBossExamPrompt({
    levelNumber,
    levelTitle: challenge.title,
    superLevelGroup: challenge.superLevelGroup || (levelNumber === 10 ? "FOUNDATION" : levelNumber === 20 ? "BUILDING" : levelNumber === 30 ? "ADVANCED" : "MASTERY"),
    questionCount: bossBlueprint.examStructure.questionCount,
    levelRange,
    concepts: bossConcepts.map((c: any) => ({
      id: c.id,
      name: c.name || c.concept,
      concept: c.concept,
      categoryId: c.categoryRelation?.id || c.categoryId,
    })),
    categoryIdMap,
    requiredCategoryIds,
    levelClusters,
    difficultyMix,
    maxConceptFrequency,
  });

  // Generate exam with retry logic
  let generatedExam;
  let attempts = 0;
  const maxRetries = 3;

  while (attempts <= maxRetries) {
    try {
      console.log(`  Generating exam (attempt ${attempts + 1}/${maxRetries + 1})...`);
      
      generatedExam = await generateExamQuestions({
        systemPrompt,
        questionCount: bossBlueprint.examStructure.questionCount,
        difficulty: levelNumber === 10 ? "intermediate-advanced" : levelNumber === 30 || levelNumber === 40 ? "expert" : "advanced",
        isBoss: true,
        minMultiConceptRatio: levelNumber === 40 ? undefined : bossBlueprint.questionComposition?.minMultiConceptRatio,
        minMultiConceptCount: levelNumber === 40 ? LEVEL_40_BOSS_BLUEPRINT.questionRequirements.minConceptsPerQuestion : bossBlueprint.questionComposition?.minMultiConceptCount,
        minCrossCategoryRatio: levelNumber === 40 ? undefined : bossBlueprint.questionComposition?.minCrossCategoryRatio,
        minCrossCategoryCount: levelNumber === 40 ? LEVEL_40_BOSS_BLUEPRINT.questionRequirements.minDomainsPerQuestion : bossBlueprint.questionComposition?.minCrossCategoryCount,
        allowedConceptIds: Array.from(allowedConceptIds),
        categoryIdMap,
        requiredCategoryIds,
      });

      // Validate (skip for Level 40 for now)
      let validation;
      if (levelNumber === 10) {
        validation = validateBossExamComposition(
          generatedExam.questions as any,
          LEVEL_10_BOSS_BLUEPRINT.questionComposition,
          {
            allowedConceptIds,
            canonicalCategoryIds: new Set(requiredCategoryIds),
            requiredCategoryIds,
          }
        );
      } else if (levelNumber === 20) {
        validation = validateLevel20BossExamComposition(
          generatedExam.questions as any,
          LEVEL_20_BOSS_BLUEPRINT.questionComposition,
          {
            allowedConceptIds,
            canonicalCategoryIds: new Set(requiredCategoryIds),
            requiredCategoryIds,
          }
        );
      } else if (levelNumber === 30) {
        validation = validateLevel30BossExamComposition(
          generatedExam.questions as any,
          LEVEL_30_BOSS_BLUEPRINT.questionComposition,
          {
            allowedConceptIds,
            canonicalCategoryIds: new Set(requiredCategoryIds),
            requiredCategoryIds,
          }
        );
      } else if (levelNumber === 40) {
        // Level 40: Skip validation for now
        validation = { isValid: true, errors: [], warnings: [] };
      }

      if (validation && !validation.isValid) {
        if (attempts < maxRetries) {
          console.warn(`  ⚠️  Validation failed, retrying... (${validation.errors.length} errors)`);
          attempts++;
          continue;
        } else {
          console.warn(`  ⚠️  Validation has warnings but accepting exam:`, validation.warnings);
          break; // Accept with warnings
        }
      }

      break; // Success
    } catch (error: any) {
      if (attempts >= maxRetries) {
        throw error;
      }
      console.warn(`  ⚠️  Generation failed, retrying... (${error.message})`);
      attempts++;
    }
  }

  // Store in database
  await (prisma as any).exam.update({
    where: { id: exam.id },
    data: {
      questions: generatedExam,
      systemPromptSnapshot: systemPrompt,
      status: "PUBLISHED",
      generationConfig: {
        ...exam.generationConfig,
        questionCount: bossBlueprint.examStructure.questionCount,
        difficulty: levelNumber === 10 ? "intermediate-advanced" : levelNumber === 30 || levelNumber === 40 ? "expert" : "advanced",
        passMark: levelNumber === 40 ? LEVEL_40_BOSS_BLUEPRINT.scoring.passingScore : bossBlueprint.scoring.passMark,
        isBoss: true,
        bossWeighting: levelNumber === 20
          ? { multiConcept: LEVEL_20_BOSS_BLUEPRINT.scoring.weighting.multiConcept, judgement: LEVEL_20_BOSS_BLUEPRINT.scoring.weighting.judgement }
          : levelNumber === 30
          ? { multiConcept: LEVEL_30_BOSS_BLUEPRINT.scoring.weighting.multiConcept, judgement: LEVEL_30_BOSS_BLUEPRINT.scoring.weighting.judgement, multiDomain: LEVEL_30_BOSS_BLUEPRINT.scoring.weighting.multiDomain }
          : levelNumber === 40
          ? { judgement: LEVEL_40_BOSS_BLUEPRINT.scoring.multipliers.judgementTag, fourPlusDomains: LEVEL_40_BOSS_BLUEPRINT.scoring.multipliers.fourPlusDomains, longHorizonConsequence: LEVEL_40_BOSS_BLUEPRINT.scoring.multipliers.longHorizonConsequence }
          : { multiConcept: 1.2 },
        generatedAt: new Date().toISOString(),
        preGenerated: true,
      },
    },
  });

  console.log(`✅ Level ${levelNumber} Boss Exam pre-generated successfully! (${generatedExam.questions.length} questions)`);
}

async function main() {
  console.log("🚀 Starting Boss Exam Pre-generation...\n");

  try {
    await preGenerateBossExam(10);
    await preGenerateBossExam(20);
    await preGenerateBossExam(30);
    await preGenerateBossExam(40);

    console.log("\n✨ All boss exams pre-generated successfully!");
  } catch (error: any) {
    console.error("\n❌ Error pre-generating boss exams:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

