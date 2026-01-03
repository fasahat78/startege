import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";

async function createLevels() {
  console.log("🎮 Creating 40 levels...");

  for (const config of LEVEL_CONFIGS) {
    await prisma.challenge.upsert({
      where: { levelNumber: config.level },
      update: {
        title: config.title,
        description: config.description,
        questionCount: config.questionCount,
        timeLimit: config.timeLimit,
        passingScore: config.passingScore,
        concepts: [], // Will be populated later with concept assignment
      },
      create: {
        levelNumber: config.level,
        level: config.level, // Legacy field
        title: config.title,
        description: config.description,
        questionCount: config.questionCount,
        timeLimit: config.timeLimit,
        passingScore: config.passingScore,
        concepts: [],
      },
    });
    console.log(`  ✅ Level ${config.level}: ${config.title}`);
  }

  console.log(`\n✨ Created ${LEVEL_CONFIGS.length} levels successfully!`);
}

createLevels()
  .then(() => {
    console.log("🎉 Level creation complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error creating levels:", error);
    process.exit(1);
  });

