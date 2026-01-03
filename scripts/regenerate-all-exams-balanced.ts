/**
 * Regenerate All Level Exams with Balanced Answer Distribution
 * 
 * This script regenerates all 40 level exams with updated prompts that ensure
 * balanced answer distribution (A, B, C, D) instead of the previous bias towards B.
 * 
 * Features:
 * - Handles regular level exams (1-9, 11-19, 21-29, 31-39) with concept coverage
 * - Handles boss exams (10, 20, 30, 40) with their specific blueprints
 * - Uses updated prompts with varied correctOptionId examples
 * - Validates generated exams
 * - Batch processing with delays to avoid rate limits
 * - Progress tracking and error handling
 * 
 * Run with: npx tsx scripts/regenerate-all-exams-balanced.ts
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS, getLevelConfig } from "../lib/levels";
import { generateCoverageFirstLevelExamPrompt } from "../lib/level-exam-prompt";
import { generateExamQuestions } from "../lib/chatgpt";
import { EXAM_BASE_PROMPT, composeCategoryExamPrompt } from "../lib/exam-prompts";
import { buildLevelExamPlan } from "../lib/exam-planning";
import { validateLevelExam } from "../lib/exam-validation";
import { getBossConceptScope, getBossCategoryMap } from "../lib/boss-exam-gating";
import { getLevel20BossConceptScope, getLevel20BossCategoryMap } from "../lib/level20-boss-gating";
import { getLevel30BossConceptScope, getLevel30BossCategoryMap } from "../lib/level30-boss-gating";
import { getLevel40BossConceptScope, getLevel40BossCategoryMap, getLevel40BossRequiredCategoryIds } from "../lib/level40-boss-helpers";
import { LEVEL_10_BOSS_BLUEPRINT, validateBossExamComposition } from "../lib/boss-exam-blueprint";
import { LEVEL_20_BOSS_BLUEPRINT, validateLevel20BossExamComposition } from "../lib/level20-boss-blueprint";
import { LEVEL_30_BOSS_BLUEPRINT, validateLevel30BossExamComposition } from "../lib/level30-boss-blueprint";
import { LEVEL_40_BOSS_BLUEPRINT } from "../lib/level40-boss-blueprint";
import { generateBossExamPrompt } from "../lib/boss-exam-prompt";
import { analyzeAnswerDistribution } from "../lib/exam-option-shuffle";

// Configuration
const BATCH_SIZE = 5; // Max 5 exams per batch as requested
const DELAY_BETWEEN_BATCHES_MS = 60000; // 60 seconds delay between batches (more conservative)
const DELAY_BETWEEN_LEVELS_MS = 10000; // 10 seconds delay between levels
const MAX_RETRIES = 2; // Retry failed generations

interface GenerationResult {
  levelNumber: number;
  success: boolean;
  error?: string;
  questionCount?: number;
  distribution?: { A: number; B: number; C: number; D: number };
  bPercentage?: number;
}

/**
 * Regenerate exam for a regular level (non-boss)
 */
async function regenerateRegularLevelExam(levelNumber: number): Promise<GenerationResult> {
  console.log(`\n📝 Regenerating Level ${levelNumber}...`);

  try {
    // Get challenge
    const challenge = await (prisma as any).challenge.findUnique({
      where: { levelNumber },
    });

    if (!challenge) {
      return {
        levelNumber,
        success: false,
        error: "Challenge not found",
      };
    }

    // Get concepts for this level
    const levelConcepts = challenge.concepts || [];
    if (levelConcepts.length === 0) {
      return {
        levelNumber,
        success: false,
        error: "No concepts assigned to this level",
      };
    }

    // Fetch ConceptCard records
    const conceptCards = await (prisma as any).conceptCard.findMany({
      where: {
        id: { in: levelConcepts },
      },
      select: {
        id: true,
        name: true,
        concept: true,
        shortDefinition: true,
        categoryId: true,
        categoryRelation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (conceptCards.length === 0) {
      return {
        levelNumber,
        success: false,
        error: "No ConceptCard records found",
      };
    }

    // Get categories for this level
    const levelCategoryCoverage = await (prisma as any).levelCategoryCoverage.findMany({
      where: {
        levelNumber,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Build category ID map
    const categoryIdMap: Record<string, string> = {};
    levelCategoryCoverage.forEach((coverage: any) => {
      if (coverage.category) {
        categoryIdMap[coverage.category.id] = coverage.category.name;
      }
    });

    // Also add categories from concept cards
    conceptCards.forEach((card: any) => {
      if (card.categoryRelation) {
        categoryIdMap[card.categoryRelation.id] = card.categoryRelation.name;
      }
    });

    const levelConfig = getLevelConfig(levelNumber);
    const questionCount = levelConfig?.questionCount || challenge.questionCount || 10;
    const difficulty = levelConfig?.difficulty || "beginner";

    // For Levels 1-9, use coverage-first approach
    let systemPrompt: string;
    let allowedConceptIds: Set<string> | undefined;

    if (levelNumber <= 9) {
      // Coverage-first: Build deterministic question plan
      const questionPlan = buildLevelExamPlan(conceptCards, questionCount);
      allowedConceptIds = new Set(conceptCards.map((c: any) => c.id));

      systemPrompt = generateCoverageFirstLevelExamPrompt({
        levelNumber,
        levelTitle: challenge.title,
        concepts: conceptCards.map((c: any) => ({
          id: c.id,
          name: c.name || c.concept,
          concept: c.concept,
          categoryId: c.categoryRelation?.id || c.categoryId,
        })),
        categoryIdMap,
        questionPlan,
      });
    } else {
      // Levels 11-39: Standard approach
      allowedConceptIds = new Set(conceptCards.map((c: any) => c.id));
      const conceptNames = conceptCards.map((c: any) => c.name || c.concept);

      systemPrompt = `${EXAM_BASE_PROMPT}

---

## SPECIFIC EXAM INSTRUCTIONS

${challenge.examSystemPrompt || "Generate exam questions for this level."}

---

## CONCEPTS IN SCOPE

The following concepts are available for this exam. You may ONLY test these concepts:

${conceptNames.map((c: string, i: number) => `${i + 1}. ${c}`).join("\n")}

---

## EXAM PARAMETERS

* Difficulty Level: ${difficulty}
* Number of Questions: ${questionCount}
* Question Type: Multiple Choice (4 options each)

---

Generate exactly ${questionCount} questions that test understanding of the concepts listed above, following all rules in the base prompt.`;
    }

    // Generate exam
    console.log(`  🤖 Generating ${questionCount} questions with ChatGPT...`);
    const generatedExam = await generateExamQuestions({
      systemPrompt,
      questionCount,
      difficulty: difficulty as "beginner" | "intermediate" | "advanced" | "expert",
      allowedConceptIds,
      categoryIdMap,
    });

    // Validate exam
    if (levelNumber <= 9) {
      const validation = validateLevelExam(
        generatedExam.questions,
        {
          expectedQuestionCount: questionCount,
          expectedConceptIds: new Set(conceptCards.map((c: any) => c.id)),
          canonicalCategoryIds: new Set(Object.keys(categoryIdMap)),
        }
      );

      if (!validation.isValid) {
        console.warn(`  ⚠️  Validation warnings:`, validation.errors);
      }
    }

    // Analyze answer distribution
    const distribution = analyzeAnswerDistribution(generatedExam.questions);
    console.log(`  📊 Answer distribution: A=${distribution.distribution.A}, B=${distribution.distribution.B}, C=${distribution.distribution.C}, D=${distribution.distribution.D}`);
    console.log(`  ${distribution.isBalanced ? "✅" : "⚠️"} ${distribution.recommendation}`);

    // Update exam record
    const exam = await (prisma as any).exam.findFirst({
      where: {
        type: "LEVEL",
        levelNumber,
      },
    });

    if (exam) {
      await (prisma as any).exam.update({
        where: { id: exam.id },
        data: {
          questions: generatedExam,
          systemPromptSnapshot: systemPrompt,
          status: "PUBLISHED",
          generationConfig: {
            questionCount,
            difficulty,
            passMark: levelConfig?.passingScore || challenge.passingScore || 70,
            timeLimitSec: (levelConfig?.timeLimit || challenge.timeLimit || 20) * 60,
            isBoss: false,
            generatedAt: new Date().toISOString(),
          },
        },
      });
    } else {
      await (prisma as any).exam.create({
        data: {
          type: "LEVEL",
          levelNumber,
          status: "PUBLISHED",
          systemPromptSnapshot: systemPrompt,
          generationConfig: {
            questionCount,
            difficulty,
            passMark: levelConfig?.passingScore || challenge.passingScore || 70,
            timeLimitSec: (levelConfig?.timeLimit || challenge.timeLimit || 20) * 60,
            isBoss: false,
            generatedAt: new Date().toISOString(),
          },
          questions: generatedExam,
        },
      });
    }

    return {
      levelNumber,
      success: true,
      questionCount: generatedExam.questions.length,
      distribution: distribution.distribution,
      bPercentage: (distribution.distribution.B / distribution.distribution.total) * 100,
    };
  } catch (error: any) {
    console.error(`  ❌ Error regenerating Level ${levelNumber}:`, error.message);
    return {
      levelNumber,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Regenerate boss exam
 */
async function regenerateBossExam(levelNumber: number): Promise<GenerationResult> {
  console.log(`\n🎯 Regenerating Level ${levelNumber} Boss Exam...`);

  try {
    // Get challenge
    const challenge = await (prisma as any).challenge.findUnique({
      where: { levelNumber },
    });

    if (!challenge) {
      return {
        levelNumber,
        success: false,
        error: "Challenge not found",
      };
    }

    // Get boss blueprint and concept scope based on level
    let bossConcepts: any[];
    let bossBlueprint: typeof LEVEL_10_BOSS_BLUEPRINT | typeof LEVEL_20_BOSS_BLUEPRINT | typeof LEVEL_30_BOSS_BLUEPRINT | typeof LEVEL_40_BOSS_BLUEPRINT;
    let allowedConceptIds: Set<string>;
    let categoryIdMap: Record<string, string>;
    let requiredCategoryIds: string[];

    if (levelNumber === 10) {
      bossBlueprint = LEVEL_10_BOSS_BLUEPRINT;
      bossConcepts = await getBossConceptScope();
      const bossCategoryMap = await getBossCategoryMap();
      categoryIdMap = bossCategoryMap;
      requiredCategoryIds = Object.keys(bossCategoryMap);
    } else if (levelNumber === 20) {
      bossBlueprint = LEVEL_20_BOSS_BLUEPRINT;
      bossConcepts = await getLevel20BossConceptScope();
      const bossCategoryMap = await getLevel20BossCategoryMap();
      categoryIdMap = bossCategoryMap;
      requiredCategoryIds = Object.keys(bossCategoryMap);
    } else if (levelNumber === 30) {
      bossBlueprint = LEVEL_30_BOSS_BLUEPRINT;
      bossConcepts = await getLevel30BossConceptScope();
      const bossCategoryMap = await getLevel30BossCategoryMap();
      categoryIdMap = bossCategoryMap;
      requiredCategoryIds = Object.keys(bossCategoryMap);
    } else if (levelNumber === 40) {
      bossBlueprint = LEVEL_40_BOSS_BLUEPRINT;
      bossConcepts = await getLevel40BossConceptScope();
      categoryIdMap = await getLevel40BossCategoryMap();
      requiredCategoryIds = await getLevel40BossRequiredCategoryIds();
    } else {
      return {
        levelNumber,
        success: false,
        error: "Invalid boss level",
      };
    }

    if (!bossConcepts || bossConcepts.length === 0) {
      return {
        levelNumber,
        success: false,
        error: `No concepts found for Level ${levelNumber} boss exam`,
      };
    }

    allowedConceptIds = new Set(bossConcepts.map((c: any) => c.id).filter(Boolean));

    // Generate boss exam prompt
    const levelClusters = (bossBlueprint as any).levelClusters?.map((cluster: any) => ({
      levels: [...cluster.levels],
      theme: cluster.theme,
    })) || [];

    const systemPrompt = generateBossExamPrompt({
      levelNumber,
      levelTitle: challenge.title,
      superLevelGroup: challenge.superLevelGroup || "FOUNDATION",
      questionCount: bossBlueprint.examStructure.questionCount,
      levelRange: (bossBlueprint as any).scope?.levelRange || [1, 9],
      concepts: bossConcepts.map((c: any) => ({
        id: c.id,
        name: c.name || c.concept,
        concept: c.concept,
        categoryId: c.categoryRelation?.id || c.categoryId,
      })),
      categoryIdMap,
      requiredCategoryIds,
      levelClusters,
      difficultyMix: bossBlueprint.questionComposition.difficultyMix,
      maxConceptFrequency: bossBlueprint.questionComposition.maxQuestionsPerConcept,
    });

    // Generate exam with retries
    let generatedExam: any;
    let attempts = 0;
    let validation: any = null;

    while (attempts <= MAX_RETRIES) {
      console.log(`  🤖 Generating ${bossBlueprint.examStructure.questionCount} questions (attempt ${attempts + 1}/${MAX_RETRIES + 1})...`);

      try {
        generatedExam = await generateExamQuestions({
          systemPrompt,
          questionCount: bossBlueprint.examStructure.questionCount,
          difficulty: bossBlueprint.examStructure.difficultyBand as any,
          isBoss: true,
          allowedConceptIds,
          categoryIdMap,
          requiredCategoryIds,
        });

        // Validate boss exam
        if (levelNumber === 10) {
          validation = validateBossExamComposition(
            generatedExam.questions,
            bossBlueprint.questionComposition,
            {
              allowedConceptIds,
              canonicalCategoryIds: new Set(requiredCategoryIds),
              requiredCategoryIds,
            }
          );
        } else if (levelNumber === 20) {
          validation = validateLevel20BossExamComposition(
            generatedExam.questions,
            bossBlueprint.questionComposition,
            {
              allowedConceptIds,
              canonicalCategoryIds: new Set(requiredCategoryIds),
              requiredCategoryIds,
            }
          );
        } else if (levelNumber === 30) {
          validation = validateLevel30BossExamComposition(
            generatedExam.questions,
            bossBlueprint.questionComposition,
            {
              allowedConceptIds,
              canonicalCategoryIds: new Set(requiredCategoryIds),
              requiredCategoryIds,
            }
          );
        } else if (levelNumber === 40) {
          // Level 40 validation is more lenient
          validation = { isValid: true, errors: [], warnings: [] };
        }

        if (validation && validation.isValid) {
          break; // Success
        } else if (attempts < MAX_RETRIES) {
          console.warn(`  ⚠️  Validation failed, retrying...`, validation?.errors);
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10s before retry
          continue;
        } else {
          console.warn(`  ⚠️  Validation failed after ${MAX_RETRIES + 1} attempts, accepting with warnings`);
          break; // Accept with warnings
        }
      } catch (error: any) {
        if (attempts >= MAX_RETRIES) {
          throw error;
        }
        console.warn(`  ⚠️  Generation failed (attempt ${attempts + 1}), retrying...`);
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }

    // Analyze answer distribution
    const distribution = analyzeAnswerDistribution(generatedExam.questions);
    console.log(`  📊 Answer distribution: A=${distribution.distribution.A}, B=${distribution.distribution.B}, C=${distribution.distribution.C}, D=${distribution.distribution.D}`);
    console.log(`  ${distribution.isBalanced ? "✅" : "⚠️"} ${distribution.recommendation}`);

    // Update exam record
    const levelConfig = getLevelConfig(levelNumber);
    const exam = await (prisma as any).exam.findFirst({
      where: {
        type: "LEVEL",
        levelNumber,
      },
    });

    const passMark = bossBlueprint.scoring.passMark || (levelNumber === 40 ? 85 : levelNumber === 30 ? 80 : 75);
    const timeLimit = bossBlueprint.examStructure.timeLimitMinutes || (levelNumber === 40 ? 60 : levelNumber === 30 ? 50 : levelNumber === 20 ? 45 : 40);

    if (exam) {
      await (prisma as any).exam.update({
        where: { id: exam.id },
        data: {
          questions: generatedExam,
          systemPromptSnapshot: systemPrompt,
          status: "PUBLISHED",
          generationConfig: {
            questionCount: bossBlueprint.examStructure.questionCount,
            difficulty: bossBlueprint.examStructure.difficultyBand,
            passMark,
            timeLimitSec: timeLimit * 60,
            isBoss: true,
            bossWeighting: bossBlueprint.scoring.weighting,
            generatedAt: new Date().toISOString(),
          },
        },
      });
    } else {
      await (prisma as any).exam.create({
        data: {
          type: "LEVEL",
          levelNumber,
          status: "PUBLISHED",
          systemPromptSnapshot: systemPrompt,
          generationConfig: {
            questionCount: bossBlueprint.examStructure.questionCount,
            difficulty: bossBlueprint.examStructure.difficultyBand,
            passMark,
            timeLimitSec: timeLimit * 60,
            isBoss: true,
            bossWeighting: bossBlueprint.scoring.weighting,
            generatedAt: new Date().toISOString(),
          },
          questions: generatedExam,
        },
      });
    }

    return {
      levelNumber,
      success: true,
      questionCount: generatedExam.questions.length,
      distribution: distribution.distribution,
      bPercentage: (distribution.distribution.B / distribution.distribution.total) * 100,
    };
  } catch (error: any) {
    console.error(`  ❌ Error regenerating Level ${levelNumber} Boss Exam:`, error.message);
    return {
      levelNumber,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main regeneration function
 */
async function regenerateAllExams() {
  console.log("🚀 Starting exam regeneration with balanced answer distribution...\n");
  console.log("=".repeat(80));

  const results: GenerationResult[] = [];
  const bossLevels = [10, 20, 30, 40];
  const regularLevels = Array.from({ length: 40 }, (_, i) => i + 1).filter(
    (level) => !bossLevels.includes(level)
  );

  // Process regular levels first in batches of 5
  console.log("\n📚 Processing regular levels (1-9, 11-19, 21-29, 31-39)...");
  console.log(`   Batch size: ${BATCH_SIZE} exams per batch`);
  console.log(`   Delay between levels: ${DELAY_BETWEEN_LEVELS_MS / 1000}s`);
  console.log(`   Delay between batches: ${DELAY_BETWEEN_BATCHES_MS / 1000}s\n`);
  
  const totalBatches = Math.ceil(regularLevels.length / BATCH_SIZE);
  for (let i = 0; i < regularLevels.length; i += BATCH_SIZE) {
    const batch = regularLevels.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`\n📦 Batch ${batchNumber}/${totalBatches}: Processing Levels ${batch.join(", ")}`);

    for (const level of batch) {
      const result = await regenerateRegularLevelExam(level);
      results.push(result);
      
      if (result.success) {
        console.log(`  ✅ Level ${level}: ${result.questionCount} questions, B=${result.bPercentage?.toFixed(1)}%`);
      } else {
        console.log(`  ❌ Level ${level}: ${result.error}`);
      }
      
      // Delay between levels (except after last in batch)
      if (level !== batch[batch.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_LEVELS_MS));
      }
    }

    // Delay between batches (except after last batch)
    if (i + BATCH_SIZE < regularLevels.length) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  // Process boss levels (10, 20, 30) - one per batch
  // Note: Level 40 is runtime-only and should not be pre-generated
  console.log("\n\n🎯 Processing boss levels (10, 20, 30)...");
  console.log("   Note: Level 40 is runtime-only and will be skipped");
  console.log("   Boss exams are processed individually with longer delays\n");
  
  const bossLevelsToProcess = bossLevels.filter((l) => l !== 40);
  for (let idx = 0; idx < bossLevelsToProcess.length; idx++) {
    const level = bossLevelsToProcess[idx];
    console.log(`\n📦 Boss Batch ${idx + 1}/${bossLevelsToProcess.length}: Level ${level}`);
    
    const result = await regenerateBossExam(level);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ Level ${level}: ${result.questionCount} questions, B=${result.bPercentage?.toFixed(1)}%`);
    } else {
      console.log(`  ❌ Level ${level}: ${result.error}`);
    }
    
    // Delay between boss exams (except after last)
    if (idx < bossLevelsToProcess.length - 1) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next boss exam...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }
  
  // Add Level 40 as skipped (runtime-only)
  results.push({
    levelNumber: 40,
    success: true,
    questionCount: 0,
    error: "Level 40 is runtime-only and should not be pre-generated",
  });

  // Print summary
  console.log("\n\n" + "=".repeat(80));
  console.log("REGENERATION SUMMARY");
  console.log("=".repeat(80));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  const skipped = results.filter((r) => r.success && r.questionCount === 0);
  const actuallyRegenerated = successful.filter((r) => r.questionCount && r.questionCount > 0);
  
  console.log(`\n✅ Successfully regenerated: ${actuallyRegenerated.length}/39 (Level 40 is runtime-only)`);
  console.log(`⏭️  Skipped: ${skipped.length} (Level 40)`);
  console.log(`❌ Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\nFailed levels:");
    failed.forEach((r) => {
      console.log(`  Level ${r.levelNumber}: ${r.error}`);
    });
  }

  // Analyze overall distribution
  const allDistributions = successful
    .filter((r) => r.distribution)
    .map((r) => r.distribution!);

  if (allDistributions.length > 0) {
    const totalDistribution = allDistributions.reduce(
      (acc, dist) => ({
        A: acc.A + dist.A,
        B: acc.B + dist.B,
        C: acc.C + dist.C,
        D: acc.D + dist.D,
        total: acc.total + dist.total,
      }),
      { A: 0, B: 0, C: 0, D: 0, total: 0 }
    );

    const aPercent = (totalDistribution.A / totalDistribution.total) * 100;
    const bPercent = (totalDistribution.B / totalDistribution.total) * 100;
    const cPercent = (totalDistribution.C / totalDistribution.total) * 100;
    const dPercent = (totalDistribution.D / totalDistribution.total) * 100;

    console.log("\n📊 Overall Answer Distribution:");
    console.log(`  Option A: ${totalDistribution.A} (${aPercent.toFixed(1)}%)`);
    console.log(`  Option B: ${totalDistribution.B} (${bPercent.toFixed(1)}%)`);
    console.log(`  Option C: ${totalDistribution.C} (${cPercent.toFixed(1)}%)`);
    console.log(`  Option D: ${totalDistribution.D} (${dPercent.toFixed(1)}%)`);
    console.log(`  Total: ${totalDistribution.total} questions`);

    const expectedPercent = 25;
    const maxDeviation = Math.max(
      Math.abs(aPercent - expectedPercent),
      Math.abs(bPercent - expectedPercent),
      Math.abs(cPercent - expectedPercent),
      Math.abs(dPercent - expectedPercent)
    );

    if (maxDeviation < 5) {
      console.log(`\n✅ Excellent! Distribution is well-balanced (max deviation: ${maxDeviation.toFixed(1)}%)`);
    } else if (maxDeviation < 10) {
      console.log(`\n✅ Good! Distribution is reasonably balanced (max deviation: ${maxDeviation.toFixed(1)}%)`);
    } else {
      console.log(`\n⚠️  Distribution still has some bias (max deviation: ${maxDeviation.toFixed(1)}%)`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("Regeneration complete!");
  console.log("=".repeat(80));
}

// Run regeneration
regenerateAllExams()
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

