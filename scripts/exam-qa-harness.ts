/**
 * Exam QA Harness
 * 
 * Automated testing for exam generation across Levels 1-9 and Categories.
 * 
 * Tests:
 * - Level exams (10 questions each)
 * - Category exams (10 questions each)
 * - 3 generations per target for stability/diversity check
 * - Validates structure, canonical IDs, scope
 * 
 * Output: Pass/fail report with common failure reasons and sample payloads
 */

import { prisma } from "../lib/db";
import { generateExamQuestions } from "../lib/chatgpt";
import { EXAM_BASE_PROMPT, composeCategoryExamPrompt } from "../lib/exam-prompts";
import { buildLevelExamPlan } from "../lib/exam-planning";
import { generateCoverageFirstLevelExamPrompt } from "../lib/level-exam-prompt";
import { validateLevelExam, validateCategoryExam } from "../lib/exam-validation";

interface QATestResult {
  target: string;
  targetType: "level" | "category";
  generation: number;
  passed: boolean;
  errors: string[];
  warnings: string[];
  questionCount: number;
  sampleQuestion?: any;
}

interface QAReport {
  summary: {
    totalTargets: number;
    totalGenerations: number;
    passed: number;
    failed: number;
    passRate: number;
  };
  results: QATestResult[];
  commonFailures: Record<string, number>;
  samplePayloads: Record<string, any>;
}

async function testLevelExam(levelNumber: number, generation: number): Promise<QATestResult> {
  const result: QATestResult = {
    target: `Level ${levelNumber}`,
    targetType: "level",
    generation,
    passed: false,
    errors: [],
    warnings: [],
    questionCount: 0,
  };

  // Instrumentation: Print diagnostic info for Level 1 Generation 1
  const isDiagnosticRun = levelNumber === 1 && generation === 1;
  
  if (isDiagnosticRun) {
    console.log("\n" + "=".repeat(60));
    console.log("🔍 DIAGNOSTIC INSTRUMENTATION - Level 1 Generation 1");
    console.log("=".repeat(60));
    try {
      const scriptPath = path.join(process.cwd(), "scripts", "exam-qa-harness.ts");
      const scriptStats = fs.statSync(scriptPath);
      console.log(`Script: ${scriptPath}`);
      console.log(`Last Modified: ${scriptStats.mtime.toISOString()}`);
    } catch (e) {
      console.log(`Script: scripts/exam-qa-harness.ts`);
    }
    console.log(`Timestamp: ${new Date().toISOString()}`);
  }

  try {
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
      result.errors.push(`Challenge not found for Level ${levelNumber}`);
      return result;
    }

    // Get concepts for this level
    const conceptIds = (challenge.concepts || []) as string[];
    if (conceptIds.length === 0) {
      result.errors.push(`No concepts assigned to Level ${levelNumber}`);
      return result;
    }

    // Get ConceptCard records by ID (concepts are stored as ConceptCard IDs)
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

    if (isDiagnosticRun) {
      console.log(`\n📋 Concept Scope:`);
      console.log(`   Count: ${concepts.length} concepts`);
      console.log(`   First 3 Concept IDs:`);
      concepts.slice(0, 3).forEach((c: any, i: number) => {
        const isCuid = c.id.startsWith("cmj") && c.id.length > 20;
        console.log(`     ${i + 1}. ${c.id} ${isCuid ? "✅ (CUID)" : "❌ (NOT CUID)"} - ${c.name || c.concept}`);
      });
      console.log(`   All Concept IDs are CUIDs: ${concepts.every((c: any) => c.id.startsWith("cmj") && c.id.length > 20) ? "✅ YES" : "❌ NO"}`);
    }

    if (concepts.length === 0) {
      result.errors.push(`No ConceptCard records found for Level ${levelNumber} concepts (conceptIds: ${conceptIds.slice(0, 3).join(", ")}...)`);
      result.warnings.push(`Level ${levelNumber} may not have concepts imported yet. Skipping validation.`);
      result.passed = false;
      return result;
    }

    // Build allowed concept IDs set - use actual ConceptCard IDs
    const allowedConceptIds = new Set(
      concepts.map((c: any) => c.id).filter(Boolean)
    );

    // Get categories for this level
    const categoryCoverage = await (prisma as any).levelCategoryCoverage.findMany({
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

    const categoryIdMap: Record<string, string> = {};
    const requiredCategoryIds: string[] = [];
    
    categoryCoverage.forEach((coverage: any) => {
      if (coverage.category) {
        categoryIdMap[coverage.category.id] = coverage.category.name;
        requiredCategoryIds.push(coverage.category.id);
      }
    });

    // Use coverage-first level exam prompt with deterministic planning
    const questionPlan = buildLevelExamPlan(concepts, 10);
    
    const systemPrompt = generateCoverageFirstLevelExamPrompt({
      levelNumber: challenge.levelNumber!,
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

    // Generate exam
    const generatedExam = await generateExamQuestions({
      systemPrompt,
      questionCount: 10,
      difficulty: challenge.superLevelGroup === "FOUNDATION" ? "beginner" : "intermediate",
      allowedConceptIds: Array.from(allowedConceptIds) as string[],
      categoryIdMap: Object.keys(categoryIdMap).length > 0 ? categoryIdMap : undefined,
      requiredCategoryIds: requiredCategoryIds.length > 0 ? requiredCategoryIds : undefined,
    });

    if (isDiagnosticRun && generatedExam.questions.length > 0) {
      const firstQuestion = generatedExam.questions[0] as any;
      console.log(`\n📋 First Generated Question (Redacted):`);
      console.log(`   ID: ${firstQuestion.id}`);
      console.log(`   Stem: ${firstQuestion.stem?.substring(0, 100)}...`);
      console.log(`   conceptIds: ${JSON.stringify(firstQuestion.conceptIds || [])} ${Array.isArray(firstQuestion.conceptIds) && firstQuestion.conceptIds.length > 0 ? "✅" : "❌ MISSING"}`);
      console.log(`   categoryIds: ${JSON.stringify(firstQuestion.categoryIds || [])} ${Array.isArray(firstQuestion.categoryIds) && firstQuestion.categoryIds.length > 0 ? "✅" : "❌ MISSING"}`);
      console.log(`   categoryId (legacy): ${firstQuestion.categoryId || "N/A"}`);
      console.log(`   difficultyTag: ${firstQuestion.difficultyTag || "❌ MISSING"}`);
      console.log(`   correctOptionId: [REDACTED]`);
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
    }

    // Validate structure
    if (!generatedExam.questions || !Array.isArray(generatedExam.questions)) {
      result.errors.push("Invalid response format: missing questions array");
      return result;
    }

    result.questionCount = generatedExam.questions.length;

    // Use exam-type-aware validation for Level Exams
    const validation = validateLevelExam(
      generatedExam.questions as any,
      concepts.map((c: any) => ({
        id: c.id,
        name: c.name,
        concept: c.concept,
      }))
    );

    if (isDiagnosticRun) {
      console.log(`\n📋 Validation Results:`);
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
      console.log("\n" + "=".repeat(60));
    }

    result.errors.push(...validation.errors);
    result.warnings.push(...validation.warnings);

    // Store sample question (first question, redacted)
    if (generatedExam.questions.length > 0) {
      const sample = generatedExam.questions[0] as any;
      result.sampleQuestion = {
        id: sample.id,
        stem: sample.stem,
        options: sample.options,
        conceptIds: sample.conceptIds || [],
        categoryIds: sample.categoryIds || [sample.categoryId].filter(Boolean),
        difficultyTag: sample.difficultyTag,
        // correctOptionId and rationale excluded
      };
    }

    result.passed = result.errors.length === 0;
  } catch (error: any) {
    result.errors.push(`Generation failed: ${error.message}`);
  }

  return result;
}

async function testCategoryExam(categoryId: string, generation: number): Promise<QATestResult> {
  const result: QATestResult = {
    target: `Category ${categoryId}`,
    targetType: "category",
    generation,
    passed: false,
    errors: [],
    warnings: [],
    questionCount: 0,
  };

  try {
    // Get category
    const category = await (prisma as any).category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        examSystemPrompt: true,
        domain: {
          select: {
            name: true,
          },
        },
        concepts: {
          select: {
            id: true,
            name: true,
            concept: true,
          },
        },
      },
    });

    if (!category) {
      result.errors.push(`Category not found: ${categoryId}`);
      return result;
    }

    result.target = category.name;

    // Get concepts for this category
    const concepts = (category.concepts || []) as any[];
    if (concepts.length === 0) {
      result.errors.push(`No concepts assigned to category ${category.name}`);
      return result;
    }

    // Build allowed concept IDs set
    const allowedConceptIds = new Set(
      concepts.map((c: any) => c.name || c.concept || c.id).filter(Boolean)
    );

    // Compose prompt
    const conceptNames = concepts.map((c: any) => c.name || c.concept);
    const systemPrompt = composeCategoryExamPrompt(
      category.examSystemPrompt || "Generate exam questions for this category.",
      conceptNames,
      "intermediate",
      10
    );

    // Generate exam
    const generatedExam = await generateExamQuestions({
      systemPrompt,
      questionCount: 10,
      difficulty: "intermediate",
      allowedConceptIds: Array.from(allowedConceptIds),
      categoryIdMap: { [category.id]: category.name },
      requiredCategoryIds: [category.id],
    });

    // Validate structure
    if (!generatedExam.questions || !Array.isArray(generatedExam.questions)) {
      result.errors.push("Invalid response format: missing questions array");
      return result;
    }

    result.questionCount = generatedExam.questions.length;

    // Use exam-type-aware validation for Category Exams
    const validation = validateCategoryExam(
      generatedExam.questions as any,
      allowedConceptIds,
      category.id
    );

    result.errors.push(...validation.errors);
    result.warnings.push(...validation.warnings);

    // Store sample question (first question, redacted)
    if (generatedExam.questions.length > 0) {
      const sample = generatedExam.questions[0] as any;
      result.sampleQuestion = {
        id: sample.id,
        stem: sample.stem,
        options: sample.options,
        conceptIds: sample.conceptIds || [],
        categoryIds: sample.categoryIds || [sample.categoryId].filter(Boolean),
        difficultyTag: sample.difficultyTag,
        // correctOptionId and rationale excluded
      };
    }

    result.passed = result.errors.length === 0;
  } catch (error: any) {
    result.errors.push(`Generation failed: ${error.message}`);
  }

  return result;
}

async function runQAHarness() {
  console.log("🧪 Exam QA Harness - Testing Levels 1-9 and Categories\n");
  console.log("=" .repeat(60));

  const report: QAReport = {
    summary: {
      totalTargets: 0,
      totalGenerations: 0,
      passed: 0,
      failed: 0,
      passRate: 0,
    },
    results: [],
    commonFailures: {},
    samplePayloads: {},
  };

  try {
    // Test Levels 1-9
    console.log("\n📋 Testing Level Exams (Levels 1-9)...");
    for (let level = 1; level <= 9; level++) {
      console.log(`\n  Level ${level}:`);
      for (let gen = 1; gen <= 3; gen++) {
        process.stdout.write(`    Generation ${gen}... `);
        const result = await testLevelExam(level, gen);
        report.results.push(result);
        report.summary.totalGenerations++;
        
        if (result.passed) {
          report.summary.passed++;
          console.log("✅ PASSED");
        } else {
          report.summary.failed++;
          console.log(`❌ FAILED (${result.errors.length} errors)`);
          
          // Track common failures
          result.errors.forEach((error) => {
            const key = error.split(":")[0]; // First part of error message
            report.commonFailures[key] = (report.commonFailures[key] || 0) + 1;
          });
        }
        
        // Store sample payload for first generation
        if (gen === 1 && result.sampleQuestion) {
          report.samplePayloads[`Level ${level}`] = result.sampleQuestion;
        }
      }
    }

    // Test Categories introduced in Levels 1-9
    console.log("\n📋 Testing Category Exams...");
    
    // Get categories introduced in Levels 1-9
    const categoryCoverage = await (prisma as any).levelCategoryCoverage.findMany({
      where: {
        levelNumber: {
          gte: 1,
          lte: 9,
        },
        coverageType: "INTRODUCED",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ["categoryId"],
    });

    const uniqueCategories = new Map<string, any>();
    categoryCoverage.forEach((coverage: any) => {
      if (coverage.category && !uniqueCategories.has(coverage.category.id)) {
        uniqueCategories.set(coverage.category.id, coverage.category);
      }
    });

    console.log(`  Found ${uniqueCategories.size} categories to test\n`);

    for (const [categoryId, category] of uniqueCategories) {
      console.log(`  ${category.name}:`);
      const previousErrors: string[] = [];
      let consecutiveSameErrors = 0;
      
      for (let gen = 1; gen <= 3; gen++) {
        process.stdout.write(`    Generation ${gen}... `);
        const result = await testCategoryExam(categoryId, gen);
        report.results.push(result);
        report.summary.totalGenerations++;
        
        if (result.passed) {
          report.summary.passed++;
          console.log("✅ PASSED");
          consecutiveSameErrors = 0; // Reset on success
        } else {
          report.summary.failed++;
          const errorSummary = result.errors.map((e) => e.split(":")[0]).join("|");
          console.log(`❌ FAILED (${result.errors.length} errors)`);
          
          // Detect constraint conflicts (same errors repeating)
          if (gen > 1 && errorSummary === previousErrors.join("|")) {
            consecutiveSameErrors++;
            if (consecutiveSameErrors >= 2) {
              console.log(`    ⚠️  Constraint conflict detected — stopping regeneration for ${category.name}`);
              console.log(`    Failed rule: ${result.errors[0]}`);
              break; // Stop regenerating if same error persists
            }
          }
          previousErrors.length = 0;
          previousErrors.push(...result.errors.map((e) => e.split(":")[0]));
          
          // Track common failures
          result.errors.forEach((error) => {
            const key = error.split(":")[0];
            report.commonFailures[key] = (report.commonFailures[key] || 0) + 1;
          });
        }
        
        // Store sample payload for first generation
        if (gen === 1 && result.sampleQuestion) {
          report.samplePayloads[category.name] = result.sampleQuestion;
        }
      }
    }

    // Calculate summary
    report.summary.totalTargets = 9 + uniqueCategories.size;
    report.summary.passRate = report.summary.totalGenerations > 0
      ? (report.summary.passed / report.summary.totalGenerations) * 100
      : 0;

    // Output report
    console.log("\n" + "=" .repeat(60));
    console.log("📊 QA REPORT SUMMARY");
    console.log("=" .repeat(60));
    console.log(`Total Targets: ${report.summary.totalTargets}`);
    console.log(`Total Generations: ${report.summary.totalGenerations}`);
    console.log(`Passed: ${report.summary.passed} (${report.summary.passRate.toFixed(1)}%)`);
    console.log(`Failed: ${report.summary.failed}`);

    if (Object.keys(report.commonFailures).length > 0) {
      console.log("\n🔍 Common Failure Reasons:");
      const sortedFailures = Object.entries(report.commonFailures)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      sortedFailures.forEach(([reason, count]) => {
        console.log(`  ${reason}: ${count} occurrences`);
      });
    }

    console.log("\n📝 Sample Payloads (First Generation, Redacted):");
    console.log(JSON.stringify(report.samplePayloads, null, 2));

    // Write report to file
    const fs = require("fs");
    const reportPath = "EXAM_QA_REPORT.json";
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Full report saved to: ${reportPath}`);

  } catch (error: any) {
    console.error("\n❌ QA Harness failed:", error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runQAHarness();

