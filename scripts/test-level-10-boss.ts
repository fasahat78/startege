/**
 * Level 10 Boss Exam Generation Test
 * 
 * Tests the complete Level 10 Boss exam flow:
 * 1. Verify Levels 1-9 concepts exist
 * 2. Create test user and mark prerequisites
 * 3. Start Level 10 boss attempt
 * 4. Validate generated exam
 * 5. Test submission and scoring
 */

import { prisma } from "../lib/db";
import { checkBossEligibility, getBossConceptScope, getBossCategoryMap } from "../lib/boss-exam-gating";
import { LEVEL_10_BOSS_BLUEPRINT, validateBossExamComposition } from "../lib/boss-exam-blueprint";
import { generateExamQuestions } from "../lib/chatgpt";
import { generateExamQuestions } from "../lib/chatgpt";
import { EXAM_BASE_PROMPT } from "../lib/exam-prompts";
import { assessExam } from "../lib/exam-assessment";

async function testLevel10Boss() {
  console.log("🧪 Testing Level 10 Boss Exam Generation\n");
  console.log("=" .repeat(60));

  try {
    // Step 1: Verify Levels 1-9 concepts exist
    console.log("\n📋 Step 1: Verifying Levels 1-9 concepts...");
    const challenges = await (prisma as any).challenge.findMany({
      where: {
        levelNumber: {
          gte: 1,
          lte: 9,
        },
      },
      select: {
        levelNumber: true,
        concepts: true,
      },
      orderBy: {
        levelNumber: "asc",
      },
    });

    const totalConcepts = challenges.reduce((sum: number, c: any) => {
      return sum + (c.concepts?.length || 0);
    }, 0);

    console.log(`✅ Found ${challenges.length} levels with ${totalConcepts} total concept assignments`);
    
    challenges.forEach((c: any) => {
      console.log(`   Level ${c.levelNumber}: ${c.concepts?.length || 0} concepts`);
    });

    // Step 2: Get boss concept scope
    console.log("\n📋 Step 2: Getting boss concept scope...");
    const bossConcepts = await getBossConceptScope();
    console.log(`✅ Found ${bossConcepts.length} unique concepts for boss exam scope`);

    // Step 3: Get required categories
    console.log("\n📋 Step 3: Checking required categories...");
    const requiredCategories = LEVEL_10_BOSS_BLUEPRINT.eligibility.categoriesToCheck;
    const categories = await (prisma as any).category.findMany({
      where: {
        name: {
          in: requiredCategories,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log(`✅ Found ${categories.length}/${requiredCategories.length} required categories`);
    categories.forEach((cat: any) => {
      console.log(`   - ${cat.name}`);
    });

    // Step 4: Create test user
    console.log("\n📋 Step 4: Creating test user...");
    const testEmail = `test-boss-${Date.now()}@test.com`;
    const testUser = await (prisma as any).user.upsert({
      where: { email: testEmail },
      update: {},
      create: {
        email: testEmail,
        password: "hashed_password_placeholder",
        name: "Boss Test User",
      },
    });
    console.log(`✅ Created test user: ${testUser.id} (${testEmail})`);

    // Step 5: Mark Level 9 as PASSED
    console.log("\n📋 Step 5: Marking Level 9 as PASSED...");
    const level9Progress = await (prisma as any).userLevelProgress.upsert({
      where: {
        userId_levelNumber: {
          userId: testUser.id,
          levelNumber: 9,
        },
      },
      update: {
        status: "PASSED",
        passedAt: new Date(),
        bestScore: 85.0,
      },
      create: {
        userId: testUser.id,
        levelNumber: 9,
        status: "PASSED",
        passedAt: new Date(),
        bestScore: 85.0,
        unlockedAt: new Date(),
        attemptsCount: 1,
      },
    });
    console.log(`✅ Level 9 marked as PASSED`);

    // Step 6: Mark all required category exams as PASSED
    console.log("\n📋 Step 6: Marking category exams as PASSED...");
    for (const category of categories) {
      await (prisma as any).userCategoryProgress.upsert({
        where: {
          userId_categoryId: {
            userId: testUser.id,
            categoryId: category.id,
          },
        },
        update: {
          status: "PASSED",
          passedAt: new Date(),
          bestScore: 80.0,
        },
        create: {
          userId: testUser.id,
          categoryId: category.id,
          status: "PASSED",
          passedAt: new Date(),
          bestScore: 80.0,
        },
      });
      console.log(`   ✅ ${category.name}`);
    }

    // Step 7: Check boss eligibility
    console.log("\n📋 Step 7: Checking boss eligibility...");
    const eligibility = await checkBossEligibility(testUser.id);
    if (!eligibility.eligible) {
      console.error("❌ Boss eligibility check failed:");
      eligibility.reasons.forEach((r) => console.error(`   - ${r}`));
      return;
    }
    console.log("✅ Boss eligibility confirmed");

    // Step 8: Get Level 10 Challenge
    console.log("\n📋 Step 8: Getting Level 10 Challenge...");
    const level10Challenge = await (prisma as any).challenge.findUnique({
      where: {
        levelNumber: 10,
      },
    });

    if (!level10Challenge) {
      console.error("❌ Level 10 Challenge not found");
      return;
    }

    // Step 9: Create or get Level 10 Exam
    console.log("\n📋 Step 9: Creating Level 10 Exam...");
    let level10Exam = await (prisma as any).exam.findFirst({
      where: {
        type: "LEVEL",
        levelNumber: 10,
      },
    });

    if (!level10Exam) {
      level10Exam = await (prisma as any).exam.create({
        data: {
          type: "LEVEL",
          status: "DRAFT",
          levelNumber: 10,
          systemPromptSnapshot: "Placeholder - will be generated",
          generationConfig: {
            questionCount: LEVEL_10_BOSS_BLUEPRINT.examStructure.questionCount,
            difficulty: "intermediate-advanced",
            passMark: LEVEL_10_BOSS_BLUEPRINT.scoring.passMark,
            isBoss: true,
            bossWeighting: LEVEL_10_BOSS_BLUEPRINT.scoring.weighting,
          },
          questions: {},
        },
      });
      console.log(`✅ Created Level 10 Exam: ${level10Exam.id}`);
    } else {
      console.log(`✅ Found existing Level 10 Exam: ${level10Exam.id}`);
    }

    // Step 10: Generate boss exam with Gap A & B fixes
    console.log("\n📋 Step 10: Generating boss exam with enhanced validation...");
    
    if (bossConcepts.length === 0) {
      console.error("❌ Cannot generate boss exam: No concepts found for Levels 1-9");
      console.error("   Please import concepts for Levels 1-9 first.");
      return;
    }
    
    // Gap A: Build allowed concept IDs set (Levels 1-9 only) - use actual ConceptCard IDs
    const allowedConceptIds = new Set(
      bossConcepts.map((c: any) => c.id).filter(Boolean)
    );
    console.log(`   ✅ Allowed concept scope: ${allowedConceptIds.size} concepts (Levels 1-9 only)`);
    console.log(`   Sample IDs: ${Array.from(allowedConceptIds).slice(0, 3).join(", ")}`);
    
    // Gap B: Get canonical category IDs
    const bossRequiredCategories = LEVEL_10_BOSS_BLUEPRINT.requiredCategories;
    const categoryRecords = await (prisma as any).category.findMany({
      where: {
        name: {
          in: bossRequiredCategories,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });
    
    const categoryIdMap: Record<string, string> = {};
    const requiredCategoryIds: string[] = [];
    categoryRecords.forEach((cat: any) => {
      categoryIdMap[cat.id] = cat.name;
      requiredCategoryIds.push(cat.id);
    });
    console.log(`   ✅ Canonical category IDs: ${requiredCategoryIds.length} categories`);
    
    // Build prompt with actual ConceptCard IDs
    const conceptsList = bossConcepts.map((c: any, i: number) => {
      const name = c.name || c.concept || `Concept ${i + 1}`;
      const id = c.id;
      return `${i + 1}. ${name} (ID: ${id})`;
    }).join("\n");
    
    // Build concept ID mapping for ChatGPT
    const conceptIdMapping = bossConcepts.map((c: any) => {
      const name = c.name || c.concept || "Unknown";
      return `"${c.id}": "${name}"`;
    }).join(",\n");
    
    const levelPrompt = level10Challenge.examSystemPrompt || "";
    
    const systemPrompt = EXAM_BASE_PROMPT + `

---

## BOSS EXAM INSTRUCTIONS

This is a BOSS EXAM for Level 10 (Foundation Mastery).

**Level Number:** 10
**Super Level Group:** FOUNDATION
**Is Boss Level:** true

---

## LEVEL-SPECIFIC INSTRUCTIONS

` + levelPrompt + `

---

## CONCEPTS IN SCOPE (ALL FOUNDATION CONCEPTS)

The following concepts from Levels 1-9 are available for this exam. You may ONLY test these concepts:

` + conceptsList + `

---

## CRITICAL: CONCEPT ID MAPPING (MANDATORY)

You MUST use these exact conceptIds (ConceptCard database IDs) in your questions. DO NOT invent conceptIds like "L5-C01" or "L10-C10".

Use ONLY these conceptIds:
{
` + conceptIdMapping + `
}

Every question's conceptIds array MUST contain only IDs from the mapping above.

---

## BOSS EXAM REQUIREMENTS (MANDATORY)

* Multi-concept questions: ≥40% (≥8 questions) must involve 2-3 concepts
* Cross-category questions: ≥20% (≥4 questions) must span 2+ categories
* Scenario-based questions: ≥70% (≥14 questions) must be scenario-based
* Framed from: enterprise governance, risk owner, accountable executive, governance committee context
* No pure definition recall
* No single concept should appear in more than 3 questions

---

## EXAM PARAMETERS

* Difficulty Level: intermediate-advanced
* Number of Questions: ` + LEVEL_10_BOSS_BLUEPRINT.examStructure.questionCount + `
* Question Type: Multiple Choice (4 options each)
* Pass Mark: ` + LEVEL_10_BOSS_BLUEPRINT.scoring.passMark + `%

---

Generate exactly ` + LEVEL_10_BOSS_BLUEPRINT.examStructure.questionCount + ` questions that test integrated understanding across all Foundation concepts, following all rules in the base prompt, level-specific instructions, and boss exam requirements.

**CRITICAL:** 
- Every question MUST include conceptIds (2+ for multi-concept questions) - use ONLY the ConceptCard IDs from the mapping above (e.g., "cmj4621ir00010an4f0j6i7p0"), NOT format like "L5-C01"
- Every question MUST include categoryIds (2+ for cross-category questions) - use ONLY the canonical category IDs provided
- Every question MUST include difficultyTag (judgement or apply for scenarios)
- Ensure comprehensive coverage across all categories listed above
- DO NOT invent conceptIds - use ONLY the IDs from the concept mapping above`;

    // Generate with retry logic (max 2 retries)
    let generatedExam;
    let validation;
    let attempts = 0;
    const maxRetries = 2;
    
    while (attempts <= maxRetries) {
      console.log(`   Attempt ${attempts + 1}/${maxRetries + 1}...`);
      
      generatedExam = await generateExamQuestions({
        systemPrompt,
        questionCount: LEVEL_10_BOSS_BLUEPRINT.examStructure.questionCount,
        difficulty: "intermediate-advanced",
        isBoss: true,
        minMultiConceptRatio: LEVEL_10_BOSS_BLUEPRINT.questionComposition.minMultiConceptRatio,
        minMultiConceptCount: LEVEL_10_BOSS_BLUEPRINT.questionComposition.minMultiConceptCount,
        minCrossCategoryRatio: LEVEL_10_BOSS_BLUEPRINT.questionComposition.minCrossCategoryRatio,
        minCrossCategoryCount: LEVEL_10_BOSS_BLUEPRINT.questionComposition.minCrossCategoryCount,
        allowedConceptIds: Array.from(allowedConceptIds),
        categoryIdMap,
        requiredCategoryIds,
      });
      
      // Validate with enhanced checks
      validation = validateBossExamComposition(
        generatedExam.questions as any,
        LEVEL_10_BOSS_BLUEPRINT.questionComposition,
        {
          allowedConceptIds,
          canonicalCategoryIds: new Set(requiredCategoryIds),
          requiredCategoryIds,
        }
      );
      
      if (validation.isValid) {
        console.log(`   ✅ Validation passed on attempt ${attempts + 1}`);
        break;
      } else {
        console.log(`   ⚠️  Validation failed: ${validation.errors.length} errors`);
        if (attempts < maxRetries) {
          attempts++;
          console.log(`   Retrying...`);
          continue;
        } else {
          console.error(`   ❌ Validation failed after ${maxRetries + 1} attempts`);
          console.error("   Errors:", validation.errors);
          return;
        }
      }
    }

    console.log(`✅ Generated ${generatedExam.questions.length} questions`);

    // Step 11: Validation results
    console.log("\n📋 Step 11: Validation results...");

    console.log("\n📊 VALIDATION REPORT:");
    console.log("=" .repeat(60));
    console.log(`Total Questions: ${validation.stats.totalQuestions}`);
    console.log(`Multi-concept Questions: ${validation.stats.multiConceptCount} (required: ≥${LEVEL_10_BOSS_BLUEPRINT.questionComposition.minMultiConceptCount})`);
    console.log(`Cross-category Questions: ${validation.stats.crossCategoryCount} (required: ≥${LEVEL_10_BOSS_BLUEPRINT.questionComposition.minCrossCategoryCount})`);
    console.log(`Scenario-based Questions: ${validation.stats.scenarioCount} (required: ≥${LEVEL_10_BOSS_BLUEPRINT.questionComposition.minScenarioCount})`);
    console.log(`Categories Covered: ${validation.stats.categoriesPresent.size} (required: ${LEVEL_10_BOSS_BLUEPRINT.requiredCategories.length})`);
    
    // Gap A & B checks
    console.log(`\n🔍 Gap A & B Validation:`);
    console.log(`   allConceptIdsInScope: ${validation.stats.allConceptIdsInScope ? "✅" : "❌"}`);
    console.log(`   allCategoryIdsCanonical: ${validation.stats.allCategoryIdsCanonical ? "✅" : "❌"}`);
    console.log(`   categoryPresence: ${validation.stats.categoryPresence ? "✅" : "❌"}`);
    console.log(`   conceptFrequencyCap: ${validation.stats.conceptFrequencyCap ? "✅" : "❌"}`);
    
    // Check for L10+ concepts
    const l10PlusConcepts: string[] = [];
    generatedExam.questions.forEach((q: any) => {
      q.conceptIds?.forEach((cid: string) => {
        if (cid.match(/^L(1[0-9]|[2-9][0-9])-/)) {
          l10PlusConcepts.push(cid);
        }
      });
    });
    if (l10PlusConcepts.length > 0) {
      console.log(`\n❌ CRITICAL: Found L10+ concepts: ${[...new Set(l10PlusConcepts)].join(", ")}`);
    } else {
      console.log(`\n✅ No L10+ concepts found (Gap A fixed)`);
    }
    
    // Check for placeholder category IDs
    const placeholderCategories: string[] = [];
    generatedExam.questions.forEach((q: any) => {
      q.categoryIds?.forEach((catId: string) => {
        if (!catId.startsWith("cmj") && catId.length < 20) {
          placeholderCategories.push(catId);
        }
      });
    });
    if (placeholderCategories.length > 0) {
      console.log(`\n❌ CRITICAL: Found placeholder category IDs: ${[...new Set(placeholderCategories)].join(", ")}`);
    } else {
      console.log(`✅ All category IDs are canonical (Gap B fixed)`);
    }

    if (validation.isValid) {
      console.log("\n✅ VALIDATION PASSED");
    } else {
      console.log("\n❌ VALIDATION FAILED:");
      validation.errors.forEach((e) => console.error(`   - ${e}`));
    }

    if (validation.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      validation.warnings.forEach((w) => console.warn(`   - ${w}`));
    }

    // Step 12: Store exam
    console.log("\n📋 Step 12: Storing generated exam...");
    const updatedExam = await (prisma as any).exam.update({
      where: { id: level10Exam.id },
      data: {
        questions: generatedExam,
        systemPromptSnapshot: systemPrompt,
        status: "PUBLISHED",
        generationConfig: {
          questionCount: LEVEL_10_BOSS_BLUEPRINT.examStructure.questionCount,
          difficulty: "intermediate-advanced",
          passMark: LEVEL_10_BOSS_BLUEPRINT.scoring.passMark,
          isBoss: true,
          bossWeighting: LEVEL_10_BOSS_BLUEPRINT.scoring.weighting,
          generatedAt: new Date().toISOString(),
        },
      },
    });
    console.log(`✅ Exam stored: ${updatedExam.id}`);

    // Step 13: Create exam attempt
    console.log("\n📋 Step 13: Creating exam attempt...");
    const attempt = await (prisma as any).examAttempt.create({
      data: {
        examId: updatedExam.id,
        userId: testUser.id,
        attemptNumber: 1,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        answers: [],
      },
    });
    console.log(`✅ Created attempt: ${attempt.id}`);

    // Step 14: Generate redacted exam payload (without answer keys)
    console.log("\n📋 Step 14: Generating redacted exam payload...");
    const redactedQuestions = generatedExam.questions.map((q: any) => ({
      id: q.id,
      stem: q.stem,
      options: q.options,
      conceptIds: q.conceptIds,
      categoryIds: q.categoryIds,
      difficultyTag: q.difficultyTag,
      // correctOptionId and rationale excluded
    }));

    // Step 15: Test scoring with sample answers
    console.log("\n📋 Step 15: Testing deterministic scoring...");
    
    // Generate sample answers (50% correct for testing)
    const sampleAnswers = generatedExam.questions.map((q: any, index: number) => {
      const options = q.options.map((opt: any) => opt.id);
      // Alternate between correct and incorrect answers
      const selectedOption = index % 2 === 0 ? q.correctOptionId : options.find((id: string) => id !== q.correctOptionId);
      return {
        questionId: q.id,
        selectedOptionId: selectedOption,
        timeSpent: 60 + Math.random() * 120, // 60-180 seconds
      };
    });

    const assessmentResult = assessExam(
      generatedExam.questions as any,
      sampleAnswers as any,
      {
        questionCount: LEVEL_10_BOSS_BLUEPRINT.examStructure.questionCount,
        passMark: LEVEL_10_BOSS_BLUEPRINT.scoring.passMark,
        scoringMethod: "binary",
        isBoss: true,
        bossWeighting: LEVEL_10_BOSS_BLUEPRINT.scoring.weighting,
      }
    );

    console.log(`\n📊 SCORING RESULTS:`);
    console.log("=" .repeat(60));
    console.log(`Correct Count: ${assessmentResult.correctCount}/${assessmentResult.totalQuestions}`);
    console.log(`Percentage Score: ${assessmentResult.percentage}%`);
    console.log(`Pass Mark Required: ${LEVEL_10_BOSS_BLUEPRINT.scoring.passMark}%`);
    console.log(`Passed: ${assessmentResult.pass ? "✅ YES" : "❌ NO"}`);
    console.log(`Weak Concepts: ${assessmentResult.weakConceptIds.length}`);
    if (assessmentResult.weakConceptIds.length > 0) {
      console.log(`   ${assessmentResult.weakConceptIds.slice(0, 5).join(", ")}${assessmentResult.weakConceptIds.length > 5 ? "..." : ""}`);
    }

    // Output results
    console.log("\n" + "=" .repeat(60));
    console.log("📄 TEST RESULTS SUMMARY");
    console.log("=" .repeat(60));
    
    console.log("\n✅ VALIDATION REPORT:");
    console.log(JSON.stringify({
      isValid: validation.isValid,
      stats: validation.stats,
      errors: validation.errors,
      warnings: validation.warnings,
    }, null, 2));

    console.log("\n📝 REDACTED EXAM PAYLOAD (First 3 Questions):");
    console.log(JSON.stringify({
      examId: updatedExam.id,
      questionCount: redactedQuestions.length,
      questions: redactedQuestions.slice(0, 3), // First 3 for brevity
    }, null, 2));

    console.log("\n📊 PROMPT SNAPSHOT (First 500 chars):");
    console.log(systemPrompt.substring(0, 500) + "...");

    console.log("\n✅ Test completed successfully!");
    console.log(`\nTest User ID: ${testUser.id}`);
    console.log(`Exam ID: ${updatedExam.id}`);
    console.log(`Attempt ID: ${attempt.id}`);

  } catch (error: any) {
    console.error("\n❌ Test failed:", error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLevel10Boss();

