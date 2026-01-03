import { prisma } from "../lib/db";
import { generateExamQuestions } from "../lib/chatgpt";
import { buildLevelExamPlan } from "../lib/exam-planning";
import { generateCoverageFirstLevelExamPrompt } from "../lib/level-exam-prompt";
import { validateLevelExam } from "../lib/exam-validation";

async function diagnose() {
  const levelNumber = 2;
  
  const challenge = await (prisma as any).challenge.findUnique({
    where: { levelNumber },
  });

  const conceptIds = (challenge.concepts || []) as string[];
  const concepts = await (prisma as any).conceptCard.findMany({
    where: { id: { in: conceptIds } },
    select: { id: true, name: true, concept: true, categoryId: true },
  });

  console.log(`Level ${levelNumber}: ${concepts.length} concepts`);
  
  const questionCount = concepts.length;
  const questionPlan = buildLevelExamPlan(concepts, questionCount);
  
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
    questionCount,
    difficulty: "beginner",
    allowedConceptIds: concepts.map((c: any) => c.id),
    categoryIdMap: Object.keys(categoryIdMap).length > 0 ? categoryIdMap : undefined,
    requiredCategoryIds: Object.keys(categoryIdMap).length > 0 ? Object.keys(categoryIdMap) : undefined,
  });

  console.log(`\nGenerated: ${exam.questions.length} questions`);
  console.log(`Expected: ${questionCount} questions`);
  
  const validation = validateLevelExam(
    exam.questions as any,
    concepts.map((c: any) => ({ id: c.id, name: c.name, concept: c.concept }))
  );

  console.log(`\nValidation Errors (${validation.errors.length}):`);
  validation.errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  
  console.log(`\nValidation Warnings (${validation.warnings.length}):`);
  validation.warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));

  await prisma.$disconnect();
}

diagnose();

