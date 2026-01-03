import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { rateLimiters } from "@/lib/rate-limit";
import { composeCategoryExamPrompt, EXAM_BASE_PROMPT } from "@/lib/exam-prompts";
import { generateExamQuestions } from "@/lib/chatgpt";
import { checkCooldown, type AttemptHistory } from "@/lib/exam-cooldown";
import { checkBossEligibility, getBossConceptScope, getBossCategoryMap } from "@/lib/boss-exam-gating";
import { LEVEL_10_BOSS_BLUEPRINT, validateBossExamComposition } from "@/lib/boss-exam-blueprint";
import { checkLevel20BossEligibility, getLevel20BossConceptScope, getLevel20BossCategoryMap } from "@/lib/level20-boss-gating";
import { LEVEL_20_BOSS_BLUEPRINT, validateLevel20BossExamComposition } from "@/lib/level20-boss-blueprint";
import { checkLevel30BossEligibility, getLevel30BossConceptScope, getLevel30BossCategoryMap } from "@/lib/level30-boss-gating";
import { LEVEL_30_BOSS_BLUEPRINT, validateLevel30BossExamComposition } from "@/lib/level30-boss-blueprint";
import { checkLevel40BossEligibility } from "@/lib/level40-boss-gating";
import { LEVEL_40_BOSS_BLUEPRINT } from "@/lib/level40-boss-blueprint";
import { getLevel40BossConceptScope, getLevel40BossCategoryMap, getLevel40BossRequiredCategoryIds } from "@/lib/level40-boss-helpers";
import { generateBossExamPrompt } from "@/lib/boss-exam-prompt";
import { buildLevelExamPlan } from "@/lib/exam-planning";
import { generateCoverageFirstLevelExamPrompt } from "@/lib/level-exam-prompt";
import { validateLevelExam, validateCategoryExam, validateBossExam } from "@/lib/exam-validation";
import { shuffleExamOptions, analyzeAnswerDistribution } from "@/lib/exam-option-shuffle";

/**
 * Start Exam Attempt
 * 
 * This endpoint:
 * 1. Checks if exam exists and user has access
 * 2. Generates exam dynamically using ChatGPT (if not already generated)
 * 3. Creates ExamAttempt record
 * 4. Returns questions to client (without correct answers)
 * 
 * Exams are generated at runtime, not pre-generated.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: Limit exam generation requests
    const identifier = user.id || request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await rateLimiters.examGeneration.limit(identifier);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: "Too many requests", 
          message: "Please wait before starting another exam.",
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          }
        }
      );
    }

    const { examId } = await params;

    // Get exam
    const exam = await (prisma as any).exam.findUnique({
      where: { id: examId },
      include: {
        category: true,
        challenge: true,
      },
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    // Get user subscription tier
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true },
    });

    const isPremium = dbUser?.subscriptionTier === "premium";

    // Check level progression and premium gating
    if (exam.levelNumber) {
      const levelNumber = exam.levelNumber;

      // Premium gating: Levels 11-40 require premium
      if (levelNumber > 10 && !isPremium) {
        return NextResponse.json(
          { 
            error: "Premium subscription required",
            message: "Levels 11-40 require a premium subscription. Please upgrade to continue.",
            requiresUpgrade: true
          },
          { status: 403 }
        );
      }

      // Incremental progression: Level 1 is always available, Level N requires Level N-1 to be completed
      if (levelNumber > 1) {
        const previousLevel = levelNumber - 1;
        const previousLevelProgress = await (prisma as any).userLevelProgress.findUnique({
          where: {
            userId_levelNumber: {
              userId: user.id,
              levelNumber: previousLevel,
            },
          },
          select: {
            passedAt: true,
          },
        });

        if (!previousLevelProgress?.passedAt) {
          return NextResponse.json(
            { 
              error: "Level progression required",
              message: `You must complete Level ${previousLevel} before attempting Level ${levelNumber}.`,
              requiresProgression: true,
              requiredLevel: previousLevel
            },
            { status: 403 }
          );
        }
      }
    }

    // Debug: Log exam structure
    if (process.env.NODE_ENV === "development") {
      console.log("Exam loaded:", {
        id: exam.id,
        levelNumber: exam.levelNumber,
        challenge: exam.challenge ? { id: exam.challenge.id, levelNumber: exam.challenge.levelNumber } : null,
      });
    }

    // Check cooldown before starting new attempt
    const existingAttempts = await (prisma as any).examAttempt.findMany({
      where: {
        examId,
        userId: user.id,
      },
      select: {
        id: true, // CRITICAL: Include id field!
        attemptNumber: true,
        submittedAt: true,
        pass: true,
        status: true,
      },
      orderBy: {
        attemptNumber: "desc",
      },
    });

    // Check if there's an IN_PROGRESS attempt
    const inProgressAttempt = existingAttempts.find((a: any) => a.status === "IN_PROGRESS");
    if (inProgressAttempt) {
      console.log("Found IN_PROGRESS attempt:", {
        attemptId: inProgressAttempt.id,
        attemptNumber: inProgressAttempt.attemptNumber,
        status: inProgressAttempt.status,
      });

      // Return existing attempt
      const existingExam = await (prisma as any).exam.findUnique({
        where: { id: examId },
        include: {
          challenge: true,
        },
      });
      
      if (!existingExam) {
        return NextResponse.json(
          { error: "Exam not found" },
          { status: 404 }
        );
      }

      if (!inProgressAttempt.id) {
        console.error("CRITICAL: inProgressAttempt.id is missing!", {
          inProgressAttempt,
          existingAttempts,
        });
        return NextResponse.json(
          { error: "Invalid attempt ID" },
          { status: 500 }
        );
      }
      
      const questions = existingExam.questions as any;
      const questionsForClient = questions.questions.map((q: any) => ({
        id: q.id,
        stem: q.stem,
        options: Array.isArray(q.options) 
          ? q.options.map((opt: any) => ({ id: opt.id, text: opt.text }))
          : q.options,
      }));

      // Get challenge metadata
      const challenge = existingExam.challenge;
      const config = existingExam.generationConfig as any;
      
      let challengeData;
      if (challenge) {
        challengeData = {
          id: challenge.id,
          level: challenge.levelNumber || challenge.level || existingExam.levelNumber || 0,
          title: challenge.title || `Level ${existingExam.levelNumber}`,
          questionCount: questions.questions.length,
          timeLimit: Math.floor((config.timeLimitSec || (challenge.timeLimit || 20) * 60) / 60),
          passingScore: config.passMark || challenge.passingScore || 70,
        };
      } else if (existingExam.levelNumber) {
        const challengeByLevel = await (prisma as any).challenge.findUnique({
          where: { levelNumber: existingExam.levelNumber },
        });
        challengeData = challengeByLevel ? {
          id: challengeByLevel.id,
          level: challengeByLevel.levelNumber || existingExam.levelNumber || 0,
          title: challengeByLevel.title || `Level ${existingExam.levelNumber}`,
          questionCount: questions.questions.length,
          timeLimit: Math.floor((config.timeLimitSec || (challengeByLevel.timeLimit || 20) * 60) / 60),
          passingScore: config.passMark || challengeByLevel.passingScore || 70,
        } : {
          id: existingExam.id,
          level: existingExam.levelNumber || 0,
          title: `Level ${existingExam.levelNumber}`,
          questionCount: questions.questions.length,
          timeLimit: Math.floor((config.timeLimitSec || 20 * 60) / 60),
          passingScore: config.passMark || 70,
        };
      } else {
        challengeData = {
          id: existingExam.id,
          level: 0,
          title: "Exam",
          questionCount: questions.questions.length,
          timeLimit: Math.floor((config.timeLimitSec || 20 * 60) / 60),
          passingScore: config.passMark || 70,
        };
      }

      const existingResponseData = {
        attemptId: inProgressAttempt.id,
        challenge: challengeData,
        exam: {
          id: existingExam.id,
          type: existingExam.type,
          questionCount: questions.questions.length,
        },
        questions: questionsForClient,
        attemptNumber: inProgressAttempt.attemptNumber,
      };

      console.log("Returning existing IN_PROGRESS attempt:", {
        attemptId: existingResponseData.attemptId,
        hasChallenge: !!existingResponseData.challenge,
        questionCount: existingResponseData.questions.length,
        keys: Object.keys(existingResponseData),
      });

      return NextResponse.json(existingResponseData, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Check cooldown
    const attemptHistory: AttemptHistory[] = existingAttempts.map((a: any) => ({
      attemptNumber: a.attemptNumber,
      submittedAt: a.submittedAt ? new Date(a.submittedAt) : null,
      pass: a.pass,
    }));

    const lastFailedAttempt = existingAttempts
      .filter((a: any) => a.pass === false && a.submittedAt)
      .sort((a: any, b: any) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )[0];

    const nextEligibleAt = checkCooldown(
      exam.type as "CATEGORY" | "LEVEL" | "BOSS",
      attemptHistory,
      lastFailedAttempt?.submittedAt ? new Date(lastFailedAttempt.submittedAt) : null
    );

    if (nextEligibleAt) {
      return NextResponse.json(
        {
          error: "COOLDOWN_ACTIVE",
          nextEligibleAt: nextEligibleAt.toISOString(),
          message: `Please wait until ${nextEligibleAt.toISOString()} before starting a new attempt.`,
        },
        { status: 429 }
      );
    }

    // Check if exam is already generated (pre-generated or cached)
    let questions = exam.questions as any;
    
    // Check if this is a boss exam (for logging purposes)
    const isBossExamCheck = exam.levelNumber === 10 || exam.levelNumber === 20 || exam.levelNumber === 30 || exam.levelNumber === 40;
    
    if (!questions || !questions.questions || questions.questions.length === 0) {
      // For boss exams, check if we should use pre-generated version
      if (isBossExamCheck) {
        console.log(`[Exam Start] Level ${exam.levelNumber} boss exam not pre-generated. Generating on-demand...`);
        console.log(`[Exam Start] Consider running: npx tsx scripts/pre-generate-boss-exams.ts to pre-generate boss exams for better performance.`);
      }
      
      // Generate exam dynamically using ChatGPT
      const config = exam.generationConfig as any;
      const questionCount = config.questionCount || 10;
      const difficulty = config.difficulty || "beginner";

      let systemPrompt: string = ""; // Initialize to satisfy TypeScript
      let concepts: string[] = [];
      let challenge: any = null;
      let isBossExam = false; // Declare at higher scope

      if (exam.type === "CATEGORY" && exam.categoryId) {
        // Category exam
        const category = exam.category;
        if (!category) {
          return NextResponse.json(
            { error: "Category not found" },
            { status: 404 }
          );
        }

        // Get concepts for this category
        const categoryConcepts = await (prisma as any).conceptCard.findMany({
          where: {
            categoryId: exam.categoryId,
          },
          select: {
            name: true,
            concept: true,
            shortDefinition: true,
          },
        });

        concepts = categoryConcepts.map((c: any) => c.name || c.concept);

        // Compose category exam prompt
        const categoryPrompt = category.examSystemPrompt || "";
        systemPrompt = composeCategoryExamPrompt(
          categoryPrompt,
          concepts,
          difficulty,
          questionCount
        );
      } else if (exam.type === "LEVEL" && exam.levelNumber) {
        // Level exam
        challenge = exam.challenge;
        if (!challenge) {
          return NextResponse.json(
            { error: "Challenge not found" },
            { status: 404 }
          );
        }

        // Determine if this is a boss exam BEFORE checking concepts
        // Boss exams (10, 20, 30, 40) don't use challenge.concepts - they pull from multiple levels
        isBossExam = challenge?.isBoss || exam.levelNumber === 10 || exam.levelNumber === 20 || exam.levelNumber === 30 || exam.levelNumber === 40;
        
        // Boss exam eligibility checks (enabled for production)
        if (exam.levelNumber === 40) {
          const eligibility = await checkLevel40BossEligibility(user.id);
          if (!eligibility.eligible) {
            return NextResponse.json(
              {
                error: "NOT_ELIGIBLE",
                reasons: eligibility.reasons,
                nextEligibleAt: eligibility.nextEligibleAt?.toISOString(),
                message: `You are not eligible to attempt Level 40. ${eligibility.reasons.join(" ")}`,
              },
              { status: 403 }
            );
          }
        }

        // Only check challenge.concepts for non-boss exams
        if (!isBossExam) {
          // Get concepts for this level
          const levelConcepts = challenge.concepts || [];
          
          if (levelConcepts.length === 0) {
            return NextResponse.json(
              { error: "No concepts assigned to this level. Please assign concepts first." },
              { status: 400 }
            );
          }
          
          // Fetch ConceptCard records for these concepts (challenge.concepts contains ConceptCard IDs)
          const conceptCards = await (prisma as any).conceptCard.findMany({
            where: {
              id: { in: levelConcepts },
            },
            select: {
              id: true,
              name: true,
              concept: true,
              shortDefinition: true,
              categoryId: true,
            },
          });

          if (conceptCards.length === 0) {
            return NextResponse.json(
              { error: `No ConceptCard records found for level ${exam.levelNumber}. Concepts array: ${levelConcepts.join(", ")}` },
              { status: 400 }
            );
          }

          // For Level Exams (1-9): Use coverage-first approach with deterministic planning
          if (exam.levelNumber <= 9) {
          // Build deterministic question plan (1 question per concept)
          const questionPlan = buildLevelExamPlan(conceptCards, questionCount);
          
          // Get categories for this level
          const levelCategoryCoverage = await (prisma as any).levelCategoryCoverage.findMany({
            where: {
              levelNumber: exam.levelNumber,
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

          const levelCategoryIdMap: Record<string, string> = {};
          const levelRequiredCategoryIds: string[] = [];
          
          levelCategoryCoverage.forEach((coverage: any) => {
            if (coverage.category) {
              levelCategoryIdMap[coverage.category.id] = coverage.category.name;
              levelRequiredCategoryIds.push(coverage.category.id);
            }
          });

          // Generate coverage-first prompt
          systemPrompt = generateCoverageFirstLevelExamPrompt({
            levelNumber: exam.levelNumber,
            levelTitle: challenge.title,
            superLevelGroup: challenge.superLevelGroup || "FOUNDATION",
            concepts: conceptCards.map((c: any) => ({
              id: c.id,
              name: c.name,
              concept: c.concept,
              categoryId: c.categoryId,
            })),
            questionPlan,
            levelSystemPrompt: challenge.examSystemPrompt,
            categoryIdMap: Object.keys(levelCategoryIdMap).length > 0 ? levelCategoryIdMap : undefined,
            requiredCategoryIds: levelRequiredCategoryIds.length > 0 ? levelRequiredCategoryIds : undefined,
          });
          } else {
            // Levels 10-40 (non-boss): Use original approach
            concepts = conceptCards.map((c: any) => c.name || c.concept);
            const levelPrompt = challenge.examSystemPrompt || "";
            const conceptsList = concepts.map((c, i) => `${i + 1}. ${c}`).join("\n");
            
            systemPrompt = EXAM_BASE_PROMPT + `

---

## LEVEL-SPECIFIC INSTRUCTIONS

` + levelPrompt + `

---

## CONCEPTS IN SCOPE

The following concepts are available for this exam. You may ONLY test these concepts:

` + conceptsList + `

---

## EXAM PARAMETERS

* Difficulty Level: ` + difficulty + `
* Number of Questions: ` + questionCount + `
* Question Type: Multiple Choice (4 options each)
* Is Boss Level: ` + (challenge.isBoss ? "true" : "false") + `

---

Generate exactly ` + questionCount + ` questions that test understanding of all concepts listed above, following all rules in the base prompt and level-specific instructions.

**CRITICAL:** Every concept in the scope list must be assessed at least once.`;
          }
        }
        // For boss exams, we'll set systemPrompt in the boss exam block below
      } else {
        return NextResponse.json(
          { error: "Invalid exam type or missing target" },
          { status: 400 }
        );
      }

      // Gap A & B: Get concept scope and category IDs for boss exams
      // Note: isBossExam was already determined above
      let allowedConceptIds: Set<string> | undefined;
      let categoryIdMap: Record<string, string> | undefined;
      let requiredCategoryIds: string[] | undefined;
      let bossBlueprint: typeof LEVEL_10_BOSS_BLUEPRINT | typeof LEVEL_20_BOSS_BLUEPRINT | typeof LEVEL_30_BOSS_BLUEPRINT | typeof LEVEL_40_BOSS_BLUEPRINT | undefined;
      
      if (isBossExam && exam.levelNumber === 10) {
        // Level 10 Boss (Foundation Mastery)
        bossBlueprint = LEVEL_10_BOSS_BLUEPRINT;
        
        // Get boss concept scope (Levels 1-9 only)
        const bossConcepts = await getBossConceptScope();
        if (!bossConcepts || bossConcepts.length === 0) {
          return NextResponse.json(
            { error: "No concepts found for Level 10 boss exam. Please ensure Levels 1-9 have concepts assigned." },
            { status: 400 }
          );
        }
        allowedConceptIds = new Set(
          bossConcepts.map((c: any) => c.id).filter(Boolean)
        );
        
        // Get canonical category IDs
        const requiredCategories = LEVEL_10_BOSS_BLUEPRINT.requiredCategories;
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
        
        if (!categories || categories.length === 0) {
          return NextResponse.json(
            { error: `No categories found for Level 10 boss exam. Required categories: ${requiredCategories.join(", ")}` },
            { status: 400 }
          );
        }
        
        // Build categoryIdMap (categoryId -> categoryName)
        categoryIdMap = {};
        categories.forEach((cat: any) => {
          categoryIdMap![cat.id] = cat.name;
        });
        
        requiredCategoryIds = categories.map((cat: any) => cat.id);
        
        // Generate Level 10 boss exam prompt
        const levelClusters = LEVEL_10_BOSS_BLUEPRINT.levelClusters.map((cluster: { levels: readonly number[]; theme: string }) => ({
          levels: [...cluster.levels],
          theme: cluster.theme,
        }));
        
        systemPrompt = generateBossExamPrompt({
          levelNumber: exam.levelNumber,
          levelTitle: challenge.title,
          superLevelGroup: challenge.superLevelGroup || "FOUNDATION",
          questionCount: LEVEL_10_BOSS_BLUEPRINT.examStructure.questionCount,
          levelRange: LEVEL_10_BOSS_BLUEPRINT.scope.levelRange as [number, number],
          concepts: bossConcepts.map((c: any) => ({
            id: c.id,
            name: c.name || c.concept,
            concept: c.concept,
            categoryId: c.categoryRelation?.id || c.categoryId,
          })),
          categoryIdMap: categoryIdMap!,
          requiredCategoryIds: requiredCategoryIds!,
          levelClusters,
          difficultyMix: LEVEL_10_BOSS_BLUEPRINT.questionComposition.difficultyMix,
          maxConceptFrequency: LEVEL_10_BOSS_BLUEPRINT.questionComposition.maxQuestionsPerConcept,
        });
      } else if (isBossExam && exam.levelNumber === 20) {
        // Level 20 Boss (Intermediate Mastery)
        bossBlueprint = LEVEL_20_BOSS_BLUEPRINT;
        
        // Get boss concept scope (Levels 11-19 only)
        const bossConcepts = await getLevel20BossConceptScope();
        if (!bossConcepts || bossConcepts.length === 0) {
          return NextResponse.json(
            { error: "No concepts found for Level 20 boss exam. Please ensure Levels 11-19 have concepts assigned." },
            { status: 400 }
          );
        }
        allowedConceptIds = new Set(
          bossConcepts.map((c: any) => c.id).filter(Boolean)
        );
        
        // Get canonical category IDs
        const requiredCategories = LEVEL_20_BOSS_BLUEPRINT.requiredCategories;
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
        
        if (!categories || categories.length === 0) {
          return NextResponse.json(
            { error: `No categories found for Level 20 boss exam. Required categories: ${requiredCategories.join(", ")}` },
            { status: 400 }
          );
        }
        
        // Build categoryIdMap (categoryId -> categoryName)
        categoryIdMap = {};
        categories.forEach((cat: any) => {
          categoryIdMap![cat.id] = cat.name;
        });
        
        requiredCategoryIds = categories.map((cat: any) => cat.id);
        
        // Generate Level 20 boss exam prompt
        const levelClusters = LEVEL_20_BOSS_BLUEPRINT.levelClusters.map((cluster) => ({
          levels: [...cluster.levels], // Convert readonly array to mutable array
          theme: cluster.theme,
        }));
        
        systemPrompt = generateBossExamPrompt({
          levelNumber: exam.levelNumber,
          levelTitle: challenge.title,
          superLevelGroup: challenge.superLevelGroup || "BUILDING",
          questionCount: LEVEL_20_BOSS_BLUEPRINT.examStructure.questionCount,
          levelRange: LEVEL_20_BOSS_BLUEPRINT.scope.levelRange as [number, number],
          concepts: bossConcepts.map((c: any) => ({
            id: c.id,
            name: c.name || c.concept,
            concept: c.concept,
            categoryId: c.categoryRelation?.id || c.categoryId,
          })),
          categoryIdMap: categoryIdMap!,
          requiredCategoryIds: requiredCategoryIds!,
          levelClusters,
          difficultyMix: LEVEL_20_BOSS_BLUEPRINT.questionComposition.difficultyMix,
          maxConceptFrequency: LEVEL_20_BOSS_BLUEPRINT.questionComposition.maxQuestionsPerConcept,
        });
      } else if (isBossExam && exam.levelNumber === 30) {
        // Level 30 Boss (Advanced Mastery)
        const startTime = Date.now();
        console.log("[Level 30 Boss] Starting concept scope fetch...");
        
        bossBlueprint = LEVEL_30_BOSS_BLUEPRINT;
        
        // Get boss concept scope (Levels 21-29 only)
        const bossConcepts = await getLevel30BossConceptScope();
        const conceptFetchTime = Date.now() - startTime;
        console.log(`[Level 30 Boss] Fetched ${bossConcepts?.length || 0} concepts in ${conceptFetchTime}ms`);
        
        if (!bossConcepts || bossConcepts.length === 0) {
          return NextResponse.json(
            { error: "No concepts found for Level 30 boss exam. Please ensure Levels 21-29 have concepts assigned." },
            { status: 400 }
          );
        }
        allowedConceptIds = new Set(
          bossConcepts.map((c: any) => c.id).filter(Boolean)
        );
        
        // Get canonical category IDs
        const categoryStartTime = Date.now();
        const requiredCategories = LEVEL_30_BOSS_BLUEPRINT.requiredCategories;
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
        const categoryFetchTime = Date.now() - categoryStartTime;
        console.log(`[Level 30 Boss] Fetched ${categories?.length || 0} categories in ${categoryFetchTime}ms`);
        
        if (!categories || categories.length === 0) {
          return NextResponse.json(
            { error: `No categories found for Level 30 boss exam. Required categories: ${requiredCategories.join(", ")}` },
            { status: 400 }
          );
        }
        
        // Build categoryIdMap (categoryId -> categoryName)
        categoryIdMap = {};
        categories.forEach((cat: any) => {
          categoryIdMap![cat.id] = cat.name;
        });
        
        requiredCategoryIds = categories.map((cat: any) => cat.id);
        
        // Generate Level 30 boss exam prompt
        const promptStartTime = Date.now();
        const levelClusters = LEVEL_30_BOSS_BLUEPRINT.levelClusters.map((cluster) => ({
          levels: [...cluster.levels], // Convert readonly array to mutable array
          theme: cluster.theme,
        }));
        
        systemPrompt = generateBossExamPrompt({
          levelNumber: exam.levelNumber,
          levelTitle: challenge.title,
          superLevelGroup: challenge.superLevelGroup || "ADVANCED",
          questionCount: LEVEL_30_BOSS_BLUEPRINT.examStructure.questionCount,
          levelRange: LEVEL_30_BOSS_BLUEPRINT.scope.levelRange as [number, number],
          concepts: bossConcepts.map((c: any) => ({
            id: c.id,
            name: c.name || c.concept,
            concept: c.concept,
            categoryId: c.categoryRelation?.id || c.categoryId,
          })),
          categoryIdMap: categoryIdMap!,
          requiredCategoryIds: requiredCategoryIds!,
          levelClusters,
          difficultyMix: LEVEL_30_BOSS_BLUEPRINT.questionComposition.difficultyMix,
          maxConceptFrequency: LEVEL_30_BOSS_BLUEPRINT.questionComposition.maxQuestionsPerConcept,
        });
        const promptGenTime = Date.now() - promptStartTime;
        console.log(`[Level 30 Boss] Generated prompt (${systemPrompt.length} chars) in ${promptGenTime}ms`);
        console.log(`[Level 30 Boss] Total prep time: ${Date.now() - startTime}ms`);
      } else if (isBossExam && exam.levelNumber === 40) {
        // Level 40 Boss (Final Boss - AI Governance Master)
        const startTime = Date.now();
        console.log("[Level 40 Boss] Starting concept scope fetch...");
        
        bossBlueprint = LEVEL_40_BOSS_BLUEPRINT;
        
        // Get ALL concepts from Levels 1-39
        const bossConcepts = await getLevel40BossConceptScope();
        console.log(`[Level 40 Boss] Fetched ${bossConcepts.length} concepts from Levels 1-39`);
        
        allowedConceptIds = new Set(bossConcepts.map((c: any) => c.id));
        
        // Get ALL categories
        categoryIdMap = await getLevel40BossCategoryMap();
        requiredCategoryIds = await getLevel40BossRequiredCategoryIds();
        console.log(`[Level 40 Boss] Fetched ${requiredCategoryIds.length} categories`);
        
        // Generate Level 40 boss exam prompt
        const promptStartTime = Date.now();
        // Level 40 uses all levels 1-39, so create clusters by super level groups
        const levelClusters = [
          { levels: [1, 2, 3, 4, 5, 6, 7, 8, 9], theme: "Foundation" },
          { levels: [10], theme: "Foundation Mastery (Boss)" },
          { levels: [11, 12, 13, 14, 15, 16, 17, 18, 19], theme: "Intermediate" },
          { levels: [20], theme: "Intermediate Mastery (Boss)" },
          { levels: [21, 22, 23, 24, 25, 26, 27, 28, 29], theme: "Advanced" },
          { levels: [30], theme: "Advanced Mastery (Boss)" },
          { levels: [31, 32, 33, 34, 35, 36, 37, 38, 39], theme: "Mastery" },
        ];
        
        systemPrompt = generateBossExamPrompt({
          levelNumber: exam.levelNumber,
          levelTitle: challenge.title,
          superLevelGroup: challenge.superLevelGroup || "MASTERY",
          questionCount: LEVEL_40_BOSS_BLUEPRINT.examStructure.questionCount,
          levelRange: [1, 39] as [number, number],
          concepts: bossConcepts.map((c: any) => ({
            id: c.id,
            name: c.name || c.concept,
            concept: c.concept,
            categoryId: c.categoryId,
          })),
          categoryIdMap: categoryIdMap!,
          requiredCategoryIds: requiredCategoryIds!,
          levelClusters,
          difficultyMix: LEVEL_40_BOSS_BLUEPRINT.difficultyMix,
          maxConceptFrequency: LEVEL_40_BOSS_BLUEPRINT.coverageRequirements.conceptScope.maxFrequencyPerConcept,
        });
        const promptGenTime = Date.now() - promptStartTime;
        console.log(`[Level 40 Boss] Generated prompt (${systemPrompt.length} chars) in ${promptGenTime}ms`);
        console.log(`[Level 40 Boss] Total prep time: ${Date.now() - startTime}ms`);
      }
      
      const bossConfig = isBossExam && bossBlueprint
        ? {
            isBoss: true,
            minMultiConceptRatio: exam.levelNumber === 40 
              ? undefined // Level 40 uses questionRequirements instead
              : (bossBlueprint as any).questionComposition?.minMultiConceptRatio,
            minMultiConceptCount: exam.levelNumber === 40
              ? LEVEL_40_BOSS_BLUEPRINT.questionRequirements.minConceptsPerQuestion
              : (bossBlueprint as any).questionComposition?.minMultiConceptCount,
            minCrossCategoryRatio: exam.levelNumber === 40
              ? undefined // Level 40 uses questionRequirements instead
              : (bossBlueprint as any).questionComposition?.minCrossCategoryRatio,
            minCrossCategoryCount: exam.levelNumber === 40
              ? LEVEL_40_BOSS_BLUEPRINT.questionRequirements.minDomainsPerQuestion
              : (bossBlueprint as any).questionComposition?.minCrossCategoryCount,
            allowedConceptIds: allowedConceptIds ? Array.from(allowedConceptIds) : undefined,
            categoryIdMap,
            requiredCategoryIds,
          }
        : {};

      // Ensure systemPrompt is set (should be set above, but check for TypeScript)
      if (!systemPrompt) {
        return NextResponse.json(
          { error: "Failed to generate exam prompt. Please try again." },
          { status: 500 }
        );
      }

      // Generate questions using ChatGPT with retry logic (max 2 retries)
      let generatedExam;
      let validation;
      let attempts = 0;
      const maxRetries = 2;
      const MAX_GENERATION_TIME = 90000; // 90 seconds max for Level 30
      
      console.log(`[Exam Generation] Starting generation for Level ${exam.levelNumber}${isBossExam ? " (BOSS)" : ""}, attempt ${attempts + 1}/${maxRetries + 1}`);
      const generationStartTime = Date.now();
      
      while (attempts <= maxRetries) {
        try {
          const attemptStartTime = Date.now();
          console.log(`[Exam Generation] Calling ChatGPT API (attempt ${attempts + 1})...`);
          
          // For Level 30, add timeout protection
          let generationPromise = generateExamQuestions({
            systemPrompt,
            questionCount: isBossExam && bossBlueprint
              ? bossBlueprint.examStructure.questionCount 
              : questionCount,
            difficulty: isBossExam && bossBlueprint
              ? (exam.levelNumber === 10 ? "intermediate-advanced" : exam.levelNumber === 30 ? "expert" : "advanced")
              : difficulty,
            isBoss: isBossExam, // Pass flag for logging
            ...bossConfig,
          });
          
          // Add timeout for Level 30 boss exams
          if (isBossExam && exam.levelNumber === 30) {
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error(`Exam generation timed out after ${MAX_GENERATION_TIME / 1000} seconds. Please try again.`));
              }, MAX_GENERATION_TIME);
            });
            
            generatedExam = await Promise.race([generationPromise, timeoutPromise]) as any;
          } else {
            generatedExam = await generationPromise;
          }
          
          const attemptTime = Date.now() - attemptStartTime;
          console.log(`[Exam Generation] ChatGPT API call completed in ${attemptTime}ms (${Math.round(attemptTime / 1000)}s)`);

          // Validate boss exam composition with enhanced checks
          if (isBossExam && bossBlueprint) {
            const validationStartTime = Date.now();
            console.log(`[Exam Generation] Starting validation (attempt ${attempts + 1})...`);
            
            if (exam.levelNumber === 10) {
              validation = validateBossExamComposition(
                generatedExam.questions as any,
                LEVEL_10_BOSS_BLUEPRINT.questionComposition,
                {
                  allowedConceptIds,
                  canonicalCategoryIds: requiredCategoryIds ? new Set(requiredCategoryIds) : undefined,
                  requiredCategoryIds,
                }
              );
            } else if (exam.levelNumber === 20) {
              validation = validateLevel20BossExamComposition(
                generatedExam.questions as any,
                LEVEL_20_BOSS_BLUEPRINT.questionComposition,
                {
                  allowedConceptIds,
                  canonicalCategoryIds: requiredCategoryIds ? new Set(requiredCategoryIds) : undefined,
                  requiredCategoryIds,
                }
              );
            } else if (exam.levelNumber === 30) {
              validation = validateLevel30BossExamComposition(
                generatedExam.questions as any,
                LEVEL_30_BOSS_BLUEPRINT.questionComposition,
                {
                  allowedConceptIds,
                  canonicalCategoryIds: requiredCategoryIds ? new Set(requiredCategoryIds) : undefined,
                  requiredCategoryIds,
                }
              );
            } else if (exam.levelNumber === 40) {
              // Level 40: Skip validation for now (validation function to be implemented)
              // Level 40 has different requirements and needs custom validation
              console.log("[Exam Generation] Level 40: Skipping validation (to be implemented)");
              validation = { isValid: true, errors: [], warnings: [] };
            }
            
            const validationTime = Date.now() - validationStartTime;
            console.log(`[Exam Generation] Validation completed in ${validationTime}ms`);
            
            // If validation fails, retry (unless max retries reached)
            // For Level 30, be more lenient - accept warnings but retry on critical errors only
            const criticalErrors = validation?.errors?.filter((e: string) => 
              e.includes("Multi-concept") || e.includes("Cross-category") || e.includes("Scenario")
            ) || [];
            
            if (validation && !validation.isValid && attempts < maxRetries) {
              // For Level 30, only retry on critical errors, accept warnings
              if (exam.levelNumber === 30 && criticalErrors.length === 0 && validation.warnings.length > 0) {
                console.warn(`[Exam Generation] Level 30 validation has warnings but no critical errors. Accepting exam.`);
                break; // Accept the exam with warnings
              }
              
              // Level 40: Skip retry logic for now
              if (exam.levelNumber === 40) {
                console.warn(`[Exam Generation] Level 40: Accepting exam without validation retry`);
                break;
              }
              
              console.warn(`[Exam Generation] Boss exam validation failed (attempt ${attempts + 1}/${maxRetries + 1}):`, validation.errors);
              console.warn(`[Exam Generation] Retrying generation...`);
              attempts++;
              continue; // Retry generation
            }
            
            // If still invalid after retries, abort
            if (validation && !validation.isValid) {
              // For Level 30, if only warnings remain, accept it
              if (exam.levelNumber === 30 && criticalErrors.length === 0) {
                console.warn("[Exam Generation] Level 30 validation has warnings but no critical errors. Accepting exam.");
                break;
              }
              
              // Level 40: Skip validation failure abort for now
              if (exam.levelNumber === 40) {
                console.warn("[Exam Generation] Level 40: Accepting exam despite validation issues");
                break;
              }
              
              console.error("[Exam Generation] Boss exam validation failed after max retries:", validation.errors);
              return NextResponse.json(
                { 
                  error: "Failed to generate valid boss exam after retries",
                  validationErrors: validation.errors,
                },
                { status: 500 }
              );
            }
            
            if (validation && validation.warnings.length > 0) {
              console.warn("[Exam Generation] Boss exam warnings:", validation.warnings);
            }
          }
          
          const totalGenerationTime = Date.now() - generationStartTime;
          console.log(`[Exam Generation] Total generation time: ${totalGenerationTime}ms (${Math.round(totalGenerationTime / 1000)}s)`);
          
          // Success - break out of retry loop
          break;
        } catch (error: any) {
          if (attempts >= maxRetries) {
            throw error; // Re-throw if max retries reached
          }
          console.warn(`Exam generation failed (attempt ${attempts + 1}/${maxRetries + 1}):`, error.message);
          attempts++;
        }
      }

      // Determine pass mark (higher for boss exams)
      const passMark = isBossExam && bossBlueprint
        ? ('passMark' in bossBlueprint.scoring ? bossBlueprint.scoring.passMark : ('passingScore' in bossBlueprint.scoring ? bossBlueprint.scoring.passingScore : 75))
        : (exam.levelNumber === 10 ? 75 : exam.levelNumber === 20 ? 75 : exam.levelNumber === 30 ? 80 : exam.levelNumber === 40 ? 85 : 70);

      // Store generated questions in Exam
      const updatedExam = await (prisma as any).exam.update({
        where: { id: examId },
        data: {
          questions: generatedExam,
          systemPromptSnapshot: systemPrompt,
          status: "PUBLISHED",
          generationConfig: {
            ...config,
            questionCount: isBossExam && bossBlueprint
              ? bossBlueprint.examStructure.questionCount 
              : questionCount,
            difficulty: isBossExam && bossBlueprint
              ? (exam.levelNumber === 10 ? "intermediate-advanced" : exam.levelNumber === 30 ? "expert" : "advanced")
              : difficulty,
            passMark,
            isBoss: isBossExam,
            bossWeighting: isBossExam && bossBlueprint
              ? (exam.levelNumber === 20 
                  ? { multiConcept: LEVEL_20_BOSS_BLUEPRINT.scoring.weighting.multiConcept, judgement: LEVEL_20_BOSS_BLUEPRINT.scoring.weighting.judgement }
                  : exam.levelNumber === 30
                  ? { multiConcept: LEVEL_30_BOSS_BLUEPRINT.scoring.weighting.multiConcept, judgement: LEVEL_30_BOSS_BLUEPRINT.scoring.weighting.judgement, multiDomain: LEVEL_30_BOSS_BLUEPRINT.scoring.weighting.multiDomain }
                  : exam.levelNumber === 40
                  ? { judgement: LEVEL_40_BOSS_BLUEPRINT.scoring.multipliers.judgementTag, fourPlusDomains: LEVEL_40_BOSS_BLUEPRINT.scoring.multipliers.fourPlusDomains, longHorizonConsequence: LEVEL_40_BOSS_BLUEPRINT.scoring.multipliers.longHorizonConsequence }
                  : { multiConcept: 1.2 })
              : undefined,
            generatedAt: new Date().toISOString(),
          },
        },
      });

      questions = generatedExam;
    }

    // Determine attempt number
    const attemptNumber = existingAttempts.length > 0
      ? Math.max(...existingAttempts.map((a: any) => a.attemptNumber)) + 1
      : 1;

    // Create ExamAttempt record with IN_PROGRESS status
    const examAttempt = await (prisma as any).examAttempt.create({
      data: {
        examId,
        userId: user.id,
        attemptNumber,
        status: "IN_PROGRESS",
        startedAt: new Date(),
        submittedAt: null,
        evaluatedAt: null,
        score: null,
        pass: null,
        answers: [],
        feedback: null,
      },
    });

    // Analyze answer distribution before shuffling (for logging/debugging)
    const distributionAnalysis = analyzeAnswerDistribution(questions.questions);
    if (!distributionAnalysis.isBalanced) {
      console.warn(`[Exam Start] Answer distribution warning: ${distributionAnalysis.recommendation}`);
      console.warn(`[Exam Start] Distribution:`, distributionAnalysis.distribution);
    } else {
      console.log(`[Exam Start] Answer distribution is balanced:`, distributionAnalysis.distribution);
    }
    
    // Shuffle options for each question to prevent answer bias
    // This ensures users see options in random order, preventing pattern recognition
    const shuffledQuestions = shuffleExamOptions(questions.questions);
    
    // Store the shuffled mapping in the attempt for answer evaluation
    const optionMappings = shuffledQuestions.map((q: any) => ({
      questionId: q.id,
      reverseMapping: q.reverseMapping, // Maps shuffled position back to original
    }));
    
    // Update exam attempt with option mappings
    await (prisma as any).examAttempt.update({
      where: { id: examAttempt.id },
      data: {
        answers: {
          optionMappings, // Store mappings for answer evaluation
        },
      },
    });
    
    // Return questions without correct answers (options are now shuffled)
    const questionsForClient = shuffledQuestions.map((q: any) => ({
      id: q.id,
      stem: q.stem,
      options: q.shuffledOptions.map((opt: any) => ({ id: opt.id, text: opt.text })),
      // Do not include correctOptionId or rationale
    }));

    // Get challenge metadata for client
    const challenge = exam.challenge;
    const config = exam.generationConfig as any;
    
    // If challenge is null, fetch it by levelNumber
    let challengeData;
    if (challenge) {
      challengeData = {
        id: challenge.id,
        level: challenge.levelNumber || challenge.level || exam.levelNumber || 0,
        title: challenge.title || `Level ${exam.levelNumber}`,
        questionCount: questions.questions.length,
        timeLimit: Math.floor((config.timeLimitSec || (challenge.timeLimit || 20) * 60) / 60), // Convert to minutes
        passingScore: config.passMark || challenge.passingScore || 70,
      };
    } else if (exam.levelNumber) {
      // Fetch challenge by levelNumber if not included
      const challengeByLevel = await (prisma as any).challenge.findUnique({
        where: { levelNumber: exam.levelNumber },
      });
      
      if (challengeByLevel) {
        challengeData = {
          id: challengeByLevel.id,
          level: challengeByLevel.levelNumber || exam.levelNumber || 0,
          title: challengeByLevel.title || `Level ${exam.levelNumber}`,
          questionCount: questions.questions.length,
          timeLimit: Math.floor((config.timeLimitSec || (challengeByLevel.timeLimit || 20) * 60) / 60),
          passingScore: config.passMark || challengeByLevel.passingScore || 70,
        };
      } else {
        // Fallback if no challenge found
        challengeData = {
          id: exam.id,
          level: exam.levelNumber || 0,
          title: `Level ${exam.levelNumber}`,
          questionCount: questions.questions.length,
          timeLimit: Math.floor((config.timeLimitSec || 20 * 60) / 60),
          passingScore: config.passMark || 70,
        };
      }
    } else {
      // Fallback if no levelNumber
      challengeData = {
        id: exam.id,
        level: 0,
        title: "Exam",
        questionCount: questions.questions.length,
        timeLimit: Math.floor((config.timeLimitSec || 20 * 60) / 60),
        passingScore: config.passMark || 70,
      };
    }

    const responseData = {
      attemptId: examAttempt.id,
      challenge: challengeData,
      exam: {
        id: exam.id,
        type: exam.type,
        questionCount: questions.questions.length,
      },
      questions: questionsForClient,
      attemptNumber,
    };

    // Debug logging
    console.log("Exam start API returning:", {
      attemptId: responseData.attemptId,
      hasChallenge: !!responseData.challenge,
      challengeLevel: responseData.challenge?.level,
      questionCount: responseData.questions.length,
      responseDataKeys: Object.keys(responseData),
      attemptIdType: typeof responseData.attemptId,
      attemptIdValue: responseData.attemptId,
    });

    // Validate responseData before sending
    if (!responseData.attemptId) {
      console.error("CRITICAL: responseData.attemptId is missing!", {
        examAttemptId: examAttempt.id,
        examAttempt,
        responseData,
        responseDataString: JSON.stringify(responseData),
      });
      return NextResponse.json(
        { error: "Failed to create exam attempt - missing attemptId" },
        { status: 500 }
      );
    }

    // Log the exact response we're about to send
    console.log("Sending response with attemptId:", responseData.attemptId);
    console.log("Response data structure:", {
      hasAttemptId: !!responseData.attemptId,
      hasChallenge: !!responseData.challenge,
      hasExam: !!responseData.exam,
      hasQuestions: !!responseData.questions,
      questionCount: responseData.questions?.length,
      keys: Object.keys(responseData),
    });

    // Try to serialize the response to catch any serialization errors
    try {
      const testSerialization = JSON.stringify(responseData);
      console.log("Response serialization test successful, length:", testSerialization.length);
    } catch (serializationError: any) {
      console.error("CRITICAL: Failed to serialize responseData:", serializationError);
      console.error("ResponseData that failed:", responseData);
      return NextResponse.json(
        { error: "Failed to serialize response", details: serializationError.message },
        { status: 500 }
      );
    }

    const jsonResponse = NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Response created, headers:", Object.fromEntries(jsonResponse.headers.entries()));
    console.log("Response body preview:", JSON.stringify(responseData).substring(0, 200));
    
    return jsonResponse;
  } catch (error: any) {
    console.error("=== ERROR STARTING EXAM ===");
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Log additional context if available
    if (error.response) {
      console.error("Error response:", error.response);
    }
    if (error.config) {
      console.error("Error config:", error.config);
    }
    
    return NextResponse.json(
      { 
        error: "Failed to start exam", 
        details: error.message || "Unknown error",
        errorType: error.name || "Error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

