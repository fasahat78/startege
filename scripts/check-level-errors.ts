import { prisma } from "../lib/db";
import { generateExamQuestions } from "../lib/chatgpt";
import { buildLevelExamPlan } from "../lib/exam-planning";
import { generateCoverageFirstLevelExamPrompt } from "../lib/level-exam-prompt";
import { validateLevelExam } from "../lib/exam-validation";

async function checkLevel(levelNumber: number) {
  const challenge = await (prisma as any).challenge.findUnique({
    where: { levelNumber },
  });

  if (!challenge) {
    console.log(`Level ${levelNumber}: Challenge not found`);
    return;
  }

  const conceptIds = (challenge.concepts || []) as string[];
  console.log(`Level ${levelNumber}: ${conceptIds.length} concept IDs assigned`);

  const concepts = await (prisma as any).conceptCard.findMany({
    where: { id: { in: conceptIds } },
    select: { id: true, name: true, concept: true, categoryId: true },
  });

  console.log(`  Found ${concepts.length} ConceptCard records`);

  if (concepts.length === 0) {
    console.log(`  ❌ No concepts found - this is the issue!`);
    return;
  }

  const questionPlan = buildLevelExamPlan(concepts, concepts.length);
  
  const categoryCoverage = await (prisma as any).levelCategoryCoverage.findMany({
    where: { levelNumber },
    include: { category: { select: { id: true, name: true } } },
  });

  const categoryIdMap: Record<string, string> = {};
  categoryCoverage.forEach((cv: any) => {
    if (cv.category) categoryIdMap[cv.category.id] = cv.category.name;
  });

  const systemPrompt = generateCoverageFirstLevelExamPrompt({
    levelNumber,
    levelTitle: challenge.title,
    superLevelGroup: challenge.superLevelGroup || "FOUNDATION",
    concepts: concepts.map((c: any) => ({
      id: c.id,
      name: c.name,
      concept: c.concept,
      categoryId: c.categoryId,
    })),
    questionPlan,
    categoryIdMap: Object.keys(categoryIdMap).length > 0 ? categoryIdMap : undefined,
    requiredCategoryIds: Object.keys(categoryIdMap).length > 0 ? Object.keys(categoryIdMap) : undefined,
  });

  const exam = await generateExamQuestions({
    systemPrompt,
    questionCount: concepts.length,
    difficulty: "beginner",
    allowedConceptIds: concepts.map((c: any) => c.id),
    categoryIdMap: Object.keys(categoryIdMap).length > 0 ? categoryIdMap : undefined,
    requiredCategoryIds: Object.keys(categoryIdMap).length > 0 ? Object.keys(categoryIdMap) : undefined,
  });

  console.log(`  Generated ${exam.questions.length} questions (expected ${concepts.length})`);

  const validation = validateLevelExam(
    exam.questions as any,
    concepts.map((c: any) => ({ id: c.id, name: c.name, concept: c.concept }))
  );

  if (validation.errors.length > 0) {
    console.log(`  ❌ Errors (${validation.errors.length}):`);
    validation.errors.slice(0, 3).forEach((e, i) => console.log(`    ${i + 1}. ${e}`));
  } else {
    console.log(`  ✅ No errors`);
  }

  if (validation.warnings.length > 0) {
    console.log(`  ⚠️  Warnings (${validation.warnings.length}):`);
    validation.warnings.slice(0, 2).forEach((w, i) => console.log(`    ${i + 1}. ${w}`));
  }
}

async function main() {
  console.log("Checking Levels 1-3 for errors...\n");
  for (let i = 1; i <= 3; i++) {
    await checkLevel(i);
    console.log("");
  }
  await prisma.$disconnect();
}

main();

