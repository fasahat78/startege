/**
 * Diagnostic script for Level 2 Generation 1
 * Prints exact error, scope, question shape, and prompt parity
 */

import { prisma } from "../lib/db";
import { generateExamQuestions } from "../lib/chatgpt";
import { buildLevelExamPlan } from "../lib/exam-planning";
import { generateCoverageFirstLevelExamPrompt } from "../lib/level-exam-prompt";
import { validateLevelExam } from "../lib/exam-validation";
import * as fs from "fs";
import * as path from "path";

async function diagnose() {
  console.log("=".repeat(60));
  console.log("🔍 DIAGNOSTIC INSTRUMENTATION - Level 2 Generation 1");
  console.log("=".repeat(60));
  
  // Script info
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "diagnose-level2-gen1.ts");
    const scriptStats = fs.statSync(scriptPath);
    console.log(`Script: ${scriptPath}`);
    console.log(`Last Modified: ${scriptStats.mtime.toISOString()}`);
  } catch (e) {
    console.log(`Script: scripts/diagnose-level2-gen1.ts`);
  }
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const levelNumber = 2;
  
  // Get challenge
  const challenge = await (prisma as any).challenge.findUnique({
    where: { levelNumber },
    select: {
      id: true,
      levelNumber: true,
      title: true,
      concepts: true,
      examSystemPrompt: true,
      superLevelGroup: true,
      isBoss: true,
    },
  });

  if (!challenge) {
    console.error("❌ Challenge not found");
    return;
  }

  const conceptIds = (challenge.concepts || []) as string[];
  console.log(`📋 Challenge.concepts: ${conceptIds.length} IDs`);
  console.log(`   First 3: ${conceptIds.slice(0, 3).join(", ")}\n`);

  // Get ConceptCard records
  const concepts = await (prisma as any).conceptCard.findMany({
    where: { id: { in: conceptIds } },
    select: { id: true, name: true, concept: true, categoryId: true },
  });

  console.log(`📋 Concept Scope:`);
  console.log(`   Count: ${concepts.length} concepts`);
  console.log(`   First 3 Concept IDs:`);
  concepts.slice(0, 3).forEach((c: any, i: number) => {
    const isCuid = c.id.startsWith("cmj") && c.id.length > 20;
    console.log(`     ${i + 1}. ${c.id} ${isCuid ? "✅ (CUID)" : "❌ (NOT CUID)"} - ${c.name || c.concept}`);
  });
  console.log(`   All Concept IDs are CUIDs: ${concepts.every((c: any) => c.id.startsWith("cmj") && c.id.length > 20) ? "✅ YES" : "❌ NO"}\n`);

  if (concepts.length === 0) {
    console.error("❌ No concepts found!");
    await prisma.$disconnect();
    return;
  }

  // Get categories
  const categoryCoverage = await (prisma as any).levelCategoryCoverage.findMany({
    where: { levelNumber },
    include: { category: { select: { id: true, name: true } } },
  });

  const categoryIdMap: Record<string, string> = {};
  const requiredCategoryIds: string[] = [];
  categoryCoverage.forEach((coverage: any) => {
    if (coverage.category) {
      categoryIdMap[coverage.category.id] = coverage.category.name;
      requiredCategoryIds.push(coverage.category.id);
    }
  });

  // Build prompt
  const questionPlan = buildLevelExamPlan(concepts, 10);
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
    levelSystemPrompt: challenge.examSystemPrompt,
    categoryIdMap: Object.keys(categoryIdMap).length > 0 ? categoryIdMap : undefined,
    requiredCategoryIds: requiredCategoryIds.length > 0 ? requiredCategoryIds : undefined,
  });

  console.log(`📋 Prompt Parity Check:`);
  console.log(`   Includes concept ID mapping: ${systemPrompt.includes("CONCEPT ID MAPPING") ? "✅ YES" : "❌ NO"}`);
  console.log(`   Includes categoryIdMap block: ${systemPrompt.includes("CATEGORY ID MAPPING") ? "✅ YES" : "❌ NO"}`);
  console.log(`   Includes single-concept instruction: ${systemPrompt.includes("exactly one concept") || systemPrompt.includes("EXACTLY ONE concept") ? "✅ YES" : "❌ NO"}`);
  console.log(`   Exam type: LEVEL`);
  console.log(`   Validator: validateLevelExam\n`);

  // Generate exam
  console.log(`📋 Generating exam...`);
  const generatedExam = await generateExamQuestions({
    systemPrompt,
    questionCount: 10,
    difficulty: "beginner",
    allowedConceptIds: concepts.map((c: any) => c.id),
    categoryIdMap: Object.keys(categoryIdMap).length > 0 ? categoryIdMap : undefined,
    requiredCategoryIds: requiredCategoryIds.length > 0 ? requiredCategoryIds : undefined,
  });

  console.log(`   Generated: ${generatedExam.questions.length} questions`);
  console.log(`   Expected: ${concepts.length} questions\n`);

  // First question
  if (generatedExam.questions.length > 0) {
    const firstQuestion = generatedExam.questions[0] as any;
    console.log(`📋 First Generated Question (Redacted):`);
    console.log(`   ID: ${firstQuestion.id}`);
    console.log(`   Stem: ${firstQuestion.stem?.substring(0, 100)}...`);
    console.log(`   conceptIds: ${JSON.stringify(firstQuestion.conceptIds || [])} ${Array.isArray(firstQuestion.conceptIds) && firstQuestion.conceptIds.length > 0 ? "✅" : "❌ MISSING"}`);
    console.log(`   categoryIds: ${JSON.stringify(firstQuestion.categoryIds || [])} ${Array.isArray(firstQuestion.categoryIds) && firstQuestion.categoryIds.length > 0 ? "✅" : "❌ MISSING"}`);
    console.log(`   categoryId (legacy): ${firstQuestion.categoryId || "N/A"}`);
    console.log(`   difficultyTag: ${firstQuestion.difficultyTag || "❌ MISSING"}`);
    console.log(`   Full question JSON:`);
    console.log(JSON.stringify({
      id: firstQuestion.id,
      stem: firstQuestion.stem,
      conceptIds: firstQuestion.conceptIds,
      categoryIds: firstQuestion.categoryIds,
      categoryId: firstQuestion.categoryId,
      difficultyTag: firstQuestion.difficultyTag,
      options: firstQuestion.options?.map((o: any) => ({ id: o.id, text: o.text?.substring(0, 50) + "..." })),
    }, null, 2));
    console.log("");
  }

  // Validate
  const validation = validateLevelExam(
    generatedExam.questions as any,
    concepts.map((c: any) => ({ id: c.id, name: c.name, concept: c.concept }))
  );

  console.log(`📋 Validation Results:`);
  console.log(`   Validator: validateLevelExam`);
  console.log(`   Exam Type: LEVEL`);
  console.log(`   Is Valid: ${validation.isValid ? "✅ YES" : "❌ NO"}`);
  console.log(`   Error Count: ${validation.errors.length}`);
  console.log(`   Warning Count: ${validation.warnings.length}`);
  
  if (validation.errors.length > 0) {
    console.log(`\n   ❌ ERRORS:`);
    validation.errors.forEach((e, i) => {
      console.log(`     ${i + 1}. ${e}`);
    });
  }
  
  if (validation.warnings.length > 0) {
    console.log(`\n   ⚠️  WARNINGS:`);
    validation.warnings.forEach((w, i) => {
      console.log(`     ${i + 1}. ${w}`);
    });
  }

  // Check concept coverage
  const usedConcepts = new Set<string>();
  generatedExam.questions.forEach((q: any) => {
    if (q.conceptIds && Array.isArray(q.conceptIds)) {
      q.conceptIds.forEach((cid: string) => usedConcepts.add(cid));
    }
  });

  console.log(`\n📋 Concept Coverage Analysis:`);
  console.log(`   Questions generated: ${generatedExam.questions.length}`);
  console.log(`   Concepts in scope: ${concepts.length}`);
  console.log(`   Concepts used: ${usedConcepts.size}`);
  concepts.forEach((c: any) => {
    const used = usedConcepts.has(c.id);
    const count = Array.from(usedConcepts).filter(id => id === c.id).length;
    console.log(`   ${used ? "✅" : "❌"} ${c.name || c.concept}: ${used ? `used ${count}x` : "NOT USED"}`);
  });

  console.log("\n" + "=".repeat(60));
  await prisma.$disconnect();
}

diagnose();

