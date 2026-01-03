/**
 * Pre-generate All Level Exams Script (Batch Processing)
 * 
 * This script pre-generates and stores exams for all levels (1-40) in batches
 * to avoid ChatGPT API timeouts and rate limits.
 * 
 * Features:
 * - Batch processing (configurable batch size)
 * - Delays between batches
 * - Resumable (skips already-generated exams)
 * - Progress tracking
 * - Error handling (continues on failure)
 * 
 * Run with: npx tsx scripts/pre-generate-all-levels.ts
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS, getLevelConfig } from "../lib/levels";
import { generateCoverageFirstLevelExamPrompt } from "../lib/level-exam-prompt";
import { generateExamQuestions } from "../lib/chatgpt";
import { EXAM_BASE_PROMPT } from "../lib/exam-prompts";

// Configuration
const BATCH_SIZE = 5; // Number of levels to process per batch
const DELAY_BETWEEN_BATCHES_MS = 30000; // 30 seconds delay between batches
const DELAY_BETWEEN_LEVELS_MS = 5000; // 5 seconds delay between levels in a batch

interface GenerationResult {
  levelNumber: number;
  success: boolean;
  error?: string;
  questionCount?: number;
}

/**
 * Pre-generate exam for a single level
 */
async function preGenerateLevelExam(levelNumber: number): Promise<GenerationResult> {
  console.log(`\n📝 Pre-generating Level ${levelNumber}...`);

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

    // Skip boss levels (they're handled by pre-generate-boss-exams.ts)
    if (challenge.isBoss) {
      console.log(`  ⏭️  Skipping boss level (use pre-generate-boss-exams.ts)`);
      return {
        levelNumber,
        success: true,
        questionCount: 0,
      };
    }

    // Get or create Exam record
    let exam = await (prisma as any).exam.findFirst({
      where: {
        type: "LEVEL",
        levelNumber,
      },
    });

    const levelConfig = getLevelConfig(levelNumber);

    if (!exam) {
      exam = await (prisma as any).exam.create({
        data: {
          type: "LEVEL",
          levelNumber,
          status: "DRAFT",
          systemPromptSnapshot: challenge.examSystemPrompt || "Generate exam questions for this level.",
          generationConfig: {
            questionCount: levelConfig?.questionCount || challenge.questionCount || 10,
            difficulty: "beginner", // Default difficulty
            passMark: levelConfig?.passingScore || challenge.passingScore || 70,
            timeLimitSec: (levelConfig?.timeLimit || challenge.timeLimit || 20) * 60,
            isBoss: false,
          },
          questions: { questions: [] },
        },
      });
    }

    // Check if already generated
    const existingQuestions = exam.questions as any;
    if (existingQuestions?.questions && existingQuestions.questions.length > 0) {
      console.log(`  ✅ Already pre-generated (${existingQuestions.questions.length} questions)`);
      return {
        levelNumber,
        success: true,
        questionCount: existingQuestions.questions.length,
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

    const levelCategoryIdMap: Record<string, string> = {};
    const levelRequiredCategoryIds: string[] = [];

    levelCategoryCoverage.forEach((coverage: any) => {
      if (coverage.category) {
        levelCategoryIdMap[coverage.category.id] = coverage.category.name;
        levelRequiredCategoryIds.push(coverage.category.id);
      }
    });

    // Generate system prompt
    let systemPrompt: string;
    const questionCount = levelConfig?.questionCount || challenge.questionCount || 10;

    if (levelNumber <= 9) {
      // Levels 1-9: Use coverage-first approach
      const { buildLevelExamPlan } = await import("../lib/exam-planning");
      const questionPlan = buildLevelExamPlan(conceptCards, questionCount);

      systemPrompt = generateCoverageFirstLevelExamPrompt({
        levelNumber,
        levelTitle: challenge.title,
        superLevelGroup: challenge.superLevelGroup || "FOUNDATION",
        concepts: conceptCards.map((c: any) => ({
          id: c.id,
          name: c.name,
          concept: c.concept,
          categoryId: c.categoryId,
        })),
        questionPlan,
        levelSystemPrompt: challenge.examSystemPrompt,
        categoryIdMap: Object.keys(levelCategoryIdMap).length > 0 ? levelCategoryIdMap : undefined,
        requiredCategoryIds: levelRequiredCategoryIds.length > 0 ? levelRequiredCategoryIds : undefined,
      });
    } else {
      // Levels 10-39 (non-boss): Use standard approach with category information
      const concepts = conceptCards.map((c: any) => c.name || c.concept);
      const conceptsList = concepts.map((c: string, i: number) => `${i + 1}. ${c}`).join("\n");
      const levelPrompt = challenge.examSystemPrompt || "";

      // Build concept ID mapping for validation
      const conceptIdMapping = conceptCards
        .map((c: any) => {
          const name = c.name || c.concept || "Unknown";
          return `  "${c.id}": "${name}"`;
        })
        .join(",\n");

      // Build category ID mapping if categories exist
      let categorySection = "";
      if (Object.keys(levelCategoryIdMap).length > 0) {
        const categoryIdMapping = Object.entries(levelCategoryIdMap)
          .map(([id, name]) => `  "${id}": "${name}"`)
          .join(",\n");

        categorySection = `

---

## CATEGORY COVERAGE

This level covers the following governance categories:

${Object.values(levelCategoryIdMap).map((name, i) => `${i + 1}. ${name}`).join("\n")}

### Category ID Mapping (for validation)

\`\`\`json
{
${categoryIdMapping}
}
\`\`\`

When generating questions, ensure proper category coverage across INTRODUCED and PRACTICED categories.
`;
      }

      systemPrompt = EXAM_BASE_PROMPT + `

---

## LEVEL-SPECIFIC INSTRUCTIONS

` + levelPrompt + `

---

## CONCEPTS IN SCOPE

The following concepts are available for this exam. You may ONLY test these concepts:

` + conceptsList + `

### Concept ID Mapping (for validation)

\`\`\`json
{
${conceptIdMapping}
}
\`\`\`

${categorySection}

---

Generate exactly ${questionCount} exam questions for Level ${levelNumber}: ${challenge.title}.

**Important:**
- Use ONLY the provided ConceptCard IDs for conceptIds
- Use ONLY canonical category database IDs for categoryIds
- Ensure questions cover the concepts and categories listed above
`;
    }

    // Generate exam
    console.log(`  🔄 Generating ${questionCount} questions...`);
    console.log(`  📚 Concepts: ${conceptCards.length}, Categories: ${Object.keys(levelCategoryIdMap).length}`);
    
    const generatedExam = await generateExamQuestions({
      systemPrompt,
      questionCount,
      difficulty: "beginner",
      isBoss: false,
      allowedConceptIds: conceptCards.map((c: any) => c.id),
      categoryIdMap: Object.keys(levelCategoryIdMap).length > 0 ? levelCategoryIdMap : undefined,
      requiredCategoryIds: levelRequiredCategoryIds.length > 0 ? levelRequiredCategoryIds : undefined,
    });

    // Store in database
    await (prisma as any).exam.update({
      where: { id: exam.id },
      data: {
        questions: generatedExam,
        systemPromptSnapshot: systemPrompt,
        status: "PUBLISHED",
        generationConfig: {
          ...exam.generationConfig,
          questionCount,
          difficulty: "beginner",
          passMark: levelConfig?.passingScore || challenge.passingScore || 70,
          generatedAt: new Date().toISOString(),
          preGenerated: true,
        },
      },
    });

    console.log(`  ✅ Level ${levelNumber} pre-generated successfully! (${generatedExam.questions.length} questions)`);
    return {
      levelNumber,
      success: true,
      questionCount: generatedExam.questions.length,
    };
  } catch (error: any) {
    console.error(`  ❌ Error generating Level ${levelNumber}:`, error.message);
    return {
      levelNumber,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Process levels in batches
 */
async function processBatches() {
  const allLevels = Array.from({ length: 40 }, (_, i) => i + 1);
  const results: GenerationResult[] = [];
  const batches: number[][] = [];

  // Create batches
  for (let i = 0; i < allLevels.length; i += BATCH_SIZE) {
    batches.push(allLevels.slice(i, i + BATCH_SIZE));
  }

  console.log(`🚀 Starting batch pre-generation...`);
  console.log(`📊 Total levels: ${allLevels.length}`);
  console.log(`📦 Batch size: ${BATCH_SIZE}`);
  console.log(`⏱️  Delay between batches: ${DELAY_BETWEEN_BATCHES_MS / 1000}s`);
  console.log(`⏱️  Delay between levels: ${DELAY_BETWEEN_LEVELS_MS / 1000}s`);
  console.log(`📋 Total batches: ${batches.length}\n`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📦 Processing Batch ${batchIndex + 1}/${batches.length} (Levels ${batch[0]}-${batch[batch.length - 1]})`);
    console.log(`${"=".repeat(60)}`);

    // Process levels in batch
    for (let levelIndex = 0; levelIndex < batch.length; levelIndex++) {
      const levelNumber = batch[levelIndex];
      const result = await preGenerateLevelExam(levelNumber);
      results.push(result);

      // Delay between levels (except for last level in batch)
      if (levelIndex < batch.length - 1) {
        console.log(`  ⏳ Waiting ${DELAY_BETWEEN_LEVELS_MS / 1000}s before next level...`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_LEVELS_MS));
      }
    }

    // Delay between batches (except for last batch)
    if (batchIndex < batches.length - 1) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 PRE-GENERATION SUMMARY`);
  console.log(`${"=".repeat(60)}`);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const skipped = results.filter((r) => r.success && r.questionCount === 0);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`⏭️  Skipped (boss levels): ${skipped.length}`);

  if (failed.length > 0) {
    console.log(`\n❌ Failed levels:`);
    failed.forEach((r) => {
      console.log(`   - Level ${r.levelNumber}: ${r.error}`);
    });
  }

  const totalQuestions = successful
    .filter((r) => r.questionCount && r.questionCount > 0)
    .reduce((sum, r) => sum + (r.questionCount || 0), 0);

  console.log(`\n📝 Total questions generated: ${totalQuestions}`);
  console.log(`\n✨ Batch pre-generation complete!`);
}

async function main() {
  try {
    await processBatches();
  } catch (error: any) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

