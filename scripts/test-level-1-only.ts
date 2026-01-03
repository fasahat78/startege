/**
 * Test Level 1 Exam Generation Only
 * 
 * Tests the coverage-first approach with deterministic planning
 * to verify the logic works before scaling to all levels.
 */

import { prisma } from "../lib/db";
import { generateExamQuestions } from "../lib/chatgpt";
import { buildLevelExamPlan } from "../lib/exam-planning";
import { generateCoverageFirstLevelExamPrompt } from "../lib/level-exam-prompt";
import { validateLevelExam } from "../lib/exam-validation";

async function testLevel1() {
  console.log("🧪 Testing Level 1 Exam Generation (Coverage-First)\n");
  console.log("=" .repeat(60));

  try {
    // Get Level 1 challenge
    const challenge = await (prisma as any).challenge.findUnique({
      where: { levelNumber: 1 },
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
      console.error("❌ Level 1 Challenge not found");
      return;
    }

    console.log(`✅ Found Level 1: ${challenge.title}`);
    console.log(`   Concepts assigned: ${challenge.concepts?.length || 0}`);

    // Get ConceptCard records by ID
    const conceptIds = (challenge.concepts || []) as string[];
    if (conceptIds.length === 0) {
      console.error("❌ No concepts assigned to Level 1");
      return;
    }

    const concepts = await (prisma as any).conceptCard.findMany({
      where: {
        id: {
          in: conceptIds,
        },
      },
      select: {
        id: true,
        name: true,
        concept: true,
        categoryId: true,
        categoryRelation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`✅ Found ${concepts.length} ConceptCard records`);
    concepts.forEach((c: any, i: number) => {
      console.log(`   ${i + 1}. ${c.name || c.concept} (ID: ${c.id})`);
    });

    // Build deterministic question plan
    const questionCount = concepts.length; // 1 question per concept
    const questionPlan = buildLevelExamPlan(concepts, questionCount);
    
    console.log(`\n📋 Question Plan (${questionPlan.length} questions):`);
    questionPlan.forEach((p, i) => {
      const concept = concepts.find((c: any) => c.id === p.primaryConceptId);
      const name = concept?.name || concept?.concept || p.primaryConceptId;
      console.log(`   Q${i + 1}: ${name} (${p.primaryConceptId})`);
    });

    // Get categories for this level
    const categoryCoverage = await (prisma as any).levelCategoryCoverage.findMany({
      where: {
        levelNumber: 1,
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

    const categoryIdMap: Record<string, string> = {};
    const requiredCategoryIds: string[] = [];
    
    categoryCoverage.forEach((coverage: any) => {
      if (coverage.category) {
        categoryIdMap[coverage.category.id] = coverage.category.name;
        requiredCategoryIds.push(coverage.category.id);
      }
    });

    console.log(`\n📋 Categories (${requiredCategoryIds.length}):`);
    requiredCategoryIds.forEach((catId) => {
      console.log(`   - ${categoryIdMap[catId]} (${catId})`);
    });

    // Generate coverage-first prompt
    const systemPrompt = generateCoverageFirstLevelExamPrompt({
      levelNumber: challenge.levelNumber!,
      levelTitle: challenge.title,
      superLevelGroup: challenge.superLevelGroup || "FOUNDATION",
      concepts: concepts.map((c: any) => ({
        id: c.id,
        name: c.name,
        concept: c.concept,
      })),
      questionPlan,
      levelSystemPrompt: challenge.examSystemPrompt,
    });

    console.log(`\n📋 Generating exam with ChatGPT...`);
    console.log(`   Question count: ${questionCount}`);
    console.log(`   Expected: 1 question per concept (${concepts.length} concepts)`);

    // Generate exam
    const generatedExam = await generateExamQuestions({
      systemPrompt,
      questionCount,
      difficulty: "beginner",
      allowedConceptIds: concepts.map((c: any) => c.id),
      categoryIdMap: Object.keys(categoryIdMap).length > 0 ? categoryIdMap : undefined,
      requiredCategoryIds: requiredCategoryIds.length > 0 ? requiredCategoryIds : undefined,
    });

    console.log(`✅ Generated ${generatedExam.questions.length} questions`);

    // Validate using exam-type-aware validation
    console.log(`\n📋 Validating exam...`);
    const validation = validateLevelExam(
      generatedExam.questions as any,
      concepts.map((c: any) => ({
        id: c.id,
        name: c.name,
        concept: c.concept,
      }))
    );

    console.log("\n📊 VALIDATION RESULTS:");
    console.log("=" .repeat(60));
    console.log(`Valid: ${validation.isValid ? "✅ YES" : "❌ NO"}`);
    console.log(`Errors: ${validation.errors.length}`);
    console.log(`Warnings: ${validation.warnings.length}`);

    if (validation.errors.length > 0) {
      console.log("\n❌ ERRORS:");
      validation.errors.forEach((e, i) => {
        console.log(`   ${i + 1}. ${e}`);
      });
    }

    if (validation.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      validation.warnings.forEach((w, i) => {
        console.log(`   ${i + 1}. ${w}`);
      });
    }

    // Check question structure
    console.log("\n📋 Question Structure Analysis:");
    const conceptUsage = new Map<string, number>();
    const multiConceptQuestions: string[] = [];
    
    generatedExam.questions.forEach((q: any) => {
      if (q.conceptIds && Array.isArray(q.conceptIds)) {
        if (q.conceptIds.length > 1) {
          multiConceptQuestions.push(q.id);
        }
        q.conceptIds.forEach((cid: string) => {
          conceptUsage.set(cid, (conceptUsage.get(cid) || 0) + 1);
        });
      }
    });

    console.log(`   Single-concept questions: ${generatedExam.questions.length - multiConceptQuestions.length}/${generatedExam.questions.length}`);
    if (multiConceptQuestions.length > 0) {
      console.log(`   ⚠️  Multi-concept questions found: ${multiConceptQuestions.join(", ")}`);
    }

    console.log(`\n   Concept Coverage:`);
    concepts.forEach((c: any) => {
      const count = conceptUsage.get(c.id) || 0;
      const status = count === 1 ? "✅" : count === 0 ? "❌ MISSING" : `⚠️  ${count}x`;
      console.log(`   ${status} ${c.name || c.concept}: ${count} question(s)`);
    });

    // Sample questions (redacted)
    console.log("\n📝 Sample Questions (First 3, Redacted):");
    generatedExam.questions.slice(0, 3).forEach((q: any, i: number) => {
      console.log(`\n   Q${i + 1} (${q.id}):`);
      console.log(`   Stem: ${q.stem.substring(0, 100)}...`);
      console.log(`   ConceptIds: ${q.conceptIds?.join(", ") || "MISSING"}`);
      console.log(`   CategoryIds: ${q.categoryIds?.join(", ") || q.categoryId || "MISSING"}`);
      console.log(`   DifficultyTag: ${q.difficultyTag || "MISSING"}`);
    });

    // Summary
    console.log("\n" + "=" .repeat(60));
    console.log("📊 TEST SUMMARY");
    console.log("=" .repeat(60));
    console.log(`Level: 1`);
    console.log(`Concepts: ${concepts.length}`);
    console.log(`Questions Generated: ${generatedExam.questions.length}`);
    console.log(`Validation: ${validation.isValid ? "✅ PASSED" : "❌ FAILED"}`);
    console.log(`All Concepts Covered: ${Array.from(conceptUsage.keys()).length === concepts.length ? "✅ YES" : "❌ NO"}`);
    console.log(`Single-Concept Only: ${multiConceptQuestions.length === 0 ? "✅ YES" : "❌ NO"}`);

    if (validation.isValid && multiConceptQuestions.length === 0 && Array.from(conceptUsage.keys()).length === concepts.length) {
      console.log("\n✅ Level 1 test PASSED! Logic is working correctly.");
      console.log("   Ready to scale to all levels.");
    } else {
      console.log("\n⚠️  Level 1 test needs adjustment.");
      console.log("   Review errors above before scaling.");
    }

  } catch (error: any) {
    console.error("\n❌ Test failed:", error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLevel1();

