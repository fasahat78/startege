/**
 * Setup Level 20 Boss Exam
 * 
 * This script:
 * 1. Updates the Challenge record to mark Level 20 as a boss level
 * 2. Configures boss exam parameters
 * 3. Sets up LevelCategoryCoverage
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";
import { LEVEL_20_BOSS_BLUEPRINT } from "../lib/level20-boss-blueprint";

async function setupLevel20Boss() {
  console.log("🎮 Setting up Level 20 Boss Exam - Intermediate Mastery...\n");

  // Step 1: Find or create Challenge record
  const levelConfig = LEVEL_CONFIGS.find((c) => c.level === 20);
  if (!levelConfig) {
    throw new Error("Level 20 config not found in LEVEL_CONFIGS");
  }

  console.log("📋 Level 20 Boss Config:");
  console.log(`   Title: ${levelConfig.title}`);
  console.log(`   Description: ${levelConfig.description}`);
  console.log(`   Questions: ${LEVEL_20_BOSS_BLUEPRINT.examStructure.questionCount}`);
  console.log(`   Time Limit: ${LEVEL_20_BOSS_BLUEPRINT.examStructure.timeLimitMinutes} min`);
  console.log(`   Passing Score: ${LEVEL_20_BOSS_BLUEPRINT.scoring.passMark}%\n`);

  let challenge = await (prisma as any).challenge.findFirst({
    where: { levelNumber: 20 },
  });

  if (!challenge) {
    console.log("⚠️  Challenge record not found, creating...");
    challenge = await (prisma as any).challenge.create({
      data: {
        levelNumber: 20,
        level: 20,
        title: levelConfig.title,
        description: levelConfig.description,
        questionCount: LEVEL_20_BOSS_BLUEPRINT.examStructure.questionCount,
        timeLimit: LEVEL_20_BOSS_BLUEPRINT.examStructure.timeLimitMinutes,
        passingScore: LEVEL_20_BOSS_BLUEPRINT.scoring.passMark,
        superLevelGroup: "BUILDING",
        isBoss: true,
        concepts: [], // Boss exams use all concepts from Levels 11-19
      },
    });
    console.log("✅ Created Challenge record\n");
  } else {
    console.log("✅ Found existing Challenge record\n");
  }

  // Step 2: Update Challenge with boss configuration
  console.log("💾 Updating Challenge record with boss configuration...");
  await (prisma as any).challenge.update({
    where: { id: challenge.id },
    data: {
      title: levelConfig.title,
      description: levelConfig.description,
      questionCount: LEVEL_20_BOSS_BLUEPRINT.examStructure.questionCount,
      timeLimit: LEVEL_20_BOSS_BLUEPRINT.examStructure.timeLimitMinutes,
      passingScore: LEVEL_20_BOSS_BLUEPRINT.scoring.passMark,
      superLevelGroup: "BUILDING",
      isBoss: true,
    },
  });

  console.log("✅ Updated Level 20 as Boss Exam\n");

  // Step 3: Get all concepts from Levels 11-19 for scope
  console.log("📊 Collecting concepts from Levels 11-19...");
  const buildingChallenges = await (prisma as any).challenge.findMany({
    where: {
      levelNumber: {
        gte: 11,
        lte: 19,
      },
    },
    select: {
      levelNumber: true,
      concepts: true,
    },
  });

  const allConceptIds = new Set<string>();
  buildingChallenges.forEach((c: any) => {
    if (c.concepts && Array.isArray(c.concepts)) {
      c.concepts.forEach((conceptId: string) => allConceptIds.add(conceptId));
    }
  });

  console.log(`   Found ${allConceptIds.size} unique concepts across Levels 11-19\n`);

  // Step 4: Set up LevelCategoryCoverage (all categories from Levels 11-19)
  console.log("📊 Setting up LevelCategoryCoverage...");

  // Get all categories introduced in Levels 11-19
  const categoryCoverage = await (prisma as any).levelCategoryCoverage.findMany({
    where: {
      levelNumber: {
        gte: 11,
        lte: 19,
      },
      coverageType: "INTRODUCED",
    },
    include: {
      category: {
        include: {
          domain: true,
        },
      },
    },
  });

  const introducedCategories = new Map<string, any>();
  categoryCoverage.forEach((cov: any) => {
    const key = `${cov.category.domain.name}_${cov.category.name}`;
    if (!introducedCategories.has(key)) {
      introducedCategories.set(key, cov.category);
    }
  });

  console.log(`   Found ${introducedCategories.size} categories introduced in Levels 11-19`);

  // All categories from Levels 11-19 should be ASSESSED in Level 20 Boss
  const categories = await (prisma as any).category.findMany({
    include: { domain: true },
  });

  let assessedCount = 0;
  for (const coverage of LEVEL_20_BOSS_BLUEPRINT.requiredCategories) {
    // Find category by name (may need to match across domains)
    const category = categories.find(
      (c: any) => c.name === coverage
    );

    if (category) {
      await (prisma as any).levelCategoryCoverage.upsert({
        where: {
          levelNumber_categoryId_coverageType: {
            levelNumber: 20,
            categoryId: category.id,
            coverageType: "ASSESSED",
          },
        },
        update: { weight: 1.0 },
        create: {
          levelNumber: 20,
          categoryId: category.id,
          coverageType: "ASSESSED",
          weight: 1.0,
        },
      });
      assessedCount++;
      console.log(`   ✅ ASSESSED: ${category.name} (${category.domain.name})`);
    } else {
      console.log(`   ⚠️  Category not found: ${coverage}`);
    }
  }

  console.log(`\n✅ Configured ${assessedCount} categories for assessment\n`);

  // Step 5: Verify
  const updated = await (prisma as any).challenge.findUnique({
    where: { id: challenge.id },
  });

  console.log("📋 Level 20 Boss Summary:");
  console.log(`   Challenge ID: ${updated.id}`);
  console.log(`   Level Number: ${updated.levelNumber}`);
  console.log(`   Title: ${updated.title}`);
  console.log(`   Is Boss: ${updated.isBoss}`);
  console.log(`   Question Count: ${updated.questionCount}`);
  console.log(`   Time Limit: ${updated.timeLimit} minutes`);
  console.log(`   Passing Score: ${updated.passingScore}%`);
  console.log(`   Concepts in Scope: ${allConceptIds.size} (from Levels 11-19)`);
  console.log(`   Categories Assessed: ${assessedCount}`);

  console.log("\n✨ Level 20 Boss setup complete!");
  console.log("\n📝 Boss Exam Requirements:");
  console.log(`   - Requires Levels 11-19 to be completed`);
  console.log(`   - Requires all category exams from Levels 11-19 to be passed`);
  console.log(`   - 20 questions, 45 minutes, 75% passing score`);
  console.log(`   - Multi-concept questions: ≥70%`);
  console.log(`   - Cross-category questions: ≥70%`);
  console.log(`   - Difficulty mix: Apply ~30%, Analyse ~40%, Judgement ~30%`);
}

setupLevel20Boss()
  .then(() => {
    console.log("\n🎉 Success!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

