/**
 * Set up Level 40 Boss Challenge
 * 
 * This script creates the Level 40 challenge record with boss configuration
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";

async function main() {
  console.log("🚀 Setting up Level 40: AI Governance Master (Final Boss)\n");

  const levelNumber = 40;
  const levelConfig = LEVEL_CONFIGS.find((c) => c.level === levelNumber);

  if (!levelConfig) {
    throw new Error(`Level ${levelNumber} config not found`);
  }

  // Create or update Challenge
  console.log(`📝 Creating/updating Challenge for Level ${levelNumber}...`);
  const challenge = await (prisma as any).challenge.upsert({
    where: { levelNumber },
    update: {
      title: levelConfig.title,
      description: levelConfig.description,
      questionCount: levelConfig.questionCount,
      timeLimit: levelConfig.timeLimit,
      passingScore: levelConfig.passingScore,
      superLevelGroup: "MASTERY",
      isBoss: true, // Level 40 is a boss level
      concepts: [], // Boss levels don't have direct concepts - they pull from multiple levels
      examSystemPrompt: `Generate the FINAL BOSS EXAM for Level ${levelNumber}: ${levelConfig.title}. This exam evaluates whether a learner can be trusted with the highest level of AI governance responsibility.`,
    },
    create: {
      levelNumber,
      level: levelNumber, // Legacy field
      title: levelConfig.title,
      description: levelConfig.description,
      questionCount: levelConfig.questionCount,
      timeLimit: levelConfig.timeLimit,
      passingScore: levelConfig.passingScore,
      superLevelGroup: "MASTERY",
      isBoss: true, // Level 40 is a boss level
      concepts: [], // Boss levels don't have direct concepts - they pull from multiple levels
      examSystemPrompt: `Generate the FINAL BOSS EXAM for Level ${levelNumber}: ${levelConfig.title}. This exam evaluates whether a learner can be trusted with the highest level of AI governance responsibility.`,
    },
  });

  console.log(`✅ Challenge created/updated: ${challenge.title}`);
  console.log(`   - Level: ${challenge.levelNumber}`);
  console.log(`   - Is Boss: ${challenge.isBoss}`);
  console.log(`   - Questions: ${challenge.questionCount}`);
  console.log(`   - Time Limit: ${challenge.timeLimit} minutes`);
  console.log(`   - Passing Score: ${challenge.passingScore}%`);
  console.log(`   - Super Level: ${challenge.superLevelGroup}`);
  console.log("\n✨ Level 40 Boss setup complete!");
  console.log("\n📋 Note: Level 40 is the FINAL BOSS EXAM");
  console.log("   - Requires ALL levels 1-39 completed");
  console.log("   - Requires ALL category exams passed");
  console.log("   - 72-hour cooldown on failure");
  console.log("   - Runtime generation only (never pre-generated)");
  console.log("   - 85% passing score required");
}

main()
  .then(() => {
    console.log("\n🎉 Level 40 Boss setup successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error setting up Level 40 Boss:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

