import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";
import { fillLevelExamPrompt } from "../lib/exam-prompts";

/**
 * Seed Challenges (Levels)
 * 
 * Creates 40 challenges from LEVEL_CONFIGS with:
 * - superLevelGroup mapping
 * - isBoss flag for levels 10, 20, 30, 40
 * - examSystemPrompt placeholder
 */

function getSuperLevelGroup(level: number): "FOUNDATION" | "BUILDING" | "ADVANCED" | "MASTERY" {
  if (level <= 10) return "FOUNDATION";
  if (level <= 20) return "BUILDING";
  if (level <= 30) return "ADVANCED";
  return "MASTERY";
}

function isBossLevel(level: number): boolean {
  return level === 10 || level === 20 || level === 30 || level === 40;
}

/**
 * Generate level exam prompt using the template
 * 
 * Note: Concepts array will be empty initially and populated by import script.
 * The prompt will be updated when concepts are assigned to the level.
 */
function generateLevelExamPrompt(
  level: number,
  title: string,
  superLevelGroup: "FOUNDATION" | "BUILDING" | "ADVANCED" | "MASTERY",
  isBoss: boolean,
  concepts: string[] = []
): string {
  return fillLevelExamPrompt({
    levelNumber: level,
    levelTitle: title,
    superLevelGroup,
    isBoss,
    concepts: concepts.length > 0 ? concepts : [`Concepts will be assigned to Level ${level}`],
  });
}

async function main() {
  console.log("🌱 Seeding Challenges (Levels)...");

  let created = 0;
  let updated = 0;

  for (const config of LEVEL_CONFIGS) {
    const superLevelGroup = getSuperLevelGroup(config.level);
    const boss = isBossLevel(config.level);
    
    // Generate exam prompt using template
    const examPrompt = generateLevelExamPrompt(
      config.level,
      config.title,
      superLevelGroup,
      boss,
      [] // Concepts will be populated by import script
    );

    const existing = await (prisma as any).challenge.findUnique({
      where: { levelNumber: config.level },
    });

    if (existing) {
      await (prisma as any).challenge.update({
        where: { levelNumber: config.level },
        data: {
          title: config.title,
          description: config.description,
          superLevelGroup,
          isBoss: boss,
          examSystemPrompt: examPrompt,
          questionCount: config.questionCount,
          timeLimit: config.timeLimit,
          passingScore: config.passingScore,
          level: config.level, // Legacy field - always equals levelNumber
        },
      });
      updated++;
      console.log(`  🔄 Updated Level ${config.level}: ${config.title} ${boss ? "👑 BOSS" : ""}`);
    } else {
      await (prisma as any).challenge.create({
        data: {
          levelNumber: config.level,
          level: config.level, // Legacy field
          title: config.title,
          description: config.description,
          superLevelGroup,
          isBoss: boss,
          examSystemPrompt: examPrompt,
          questionCount: config.questionCount,
          timeLimit: config.timeLimit,
          passingScore: config.passingScore,
          concepts: [], // Will be populated by import script
          isActive: true,
        },
      });
      created++;
      console.log(`  ✅ Created Level ${config.level}: ${config.title} ${boss ? "👑 BOSS" : ""}`);
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   - Created: ${created}`);
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Boss levels: 10, 20, 30, 40`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding challenges:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

