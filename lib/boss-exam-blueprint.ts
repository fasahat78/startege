/**
 * Level 10 Boss Exam Blueprint (v1.0 — LOCKED)
 * 
 * This blueprint defines the authoritative requirements for the Foundation Boss Exam.
 * It certifies that the learner has integrated, end-to-end mastery of all Foundation
 * concepts (Levels 1–9) and can make sound governance decisions under realistic constraints.
 */

export const LEVEL_10_BOSS_BLUEPRINT = {
  version: "1.0",
  levelNumber: 10,
  superLevelGroup: "FOUNDATION",
  
  /**
   * Eligibility & Gating (Hard Rules)
   * 
   * A user may start Level 10 Boss only if ALL are true:
   * - UserLevelProgress(9).status = PASSED
   * - All Category Exams for categories introduced in Levels 1–9 are PASSED
   * - No active cooldown from prior Level 10 attempts
   */
  eligibility: {
    requiresLevel9Passed: true,
    requiresAllCategoryExamsPassed: true,
    categoriesToCheck: [
      // Domain 1
      "AI Fundamentals",
      "Governance Principles",
      "Governance Structures & Roles",
      "Policies & Standards (Internal)",
      "AI Lifecycle Governance",
      "Decision-Making & Escalation",
      // Domain 2
      "Data Protection & Privacy Law",
      "AI-Specific Regulation",
      // Domain 3
      "Data Governance & Management",
      "Risk Identification & Assessment",
      "Documentation & Record-Keeping",
      // Domain 4
      "Operational Monitoring & Controls",
      "Transparency & Communication",
      "Incident & Issue Management",
    ],
  },

  /**
   * Exam Structure (Fixed)
   */
  examStructure: {
    questionCount: 20,
    format: "MCQ", // Multiple Choice only
    optionsPerQuestion: 4,
    difficultyBand: "intermediate-advanced",
    timeLimitMinutes: 40, // Optional, recommended 30-40 minutes
  },

  /**
   * Question Composition Rules (Enforced at Generation)
   */
  questionComposition: {
    // Multi-concept questions: ≥ 40% (≥ 8 questions)
    minMultiConceptRatio: 0.4,
    minMultiConceptCount: 8,
    
    // Cross-category questions: ≥ 20% (≥ 4 questions)
    minCrossCategoryRatio: 0.2,
    minCrossCategoryCount: 4,
    
    // Scenario-based questions: ≥ 70%
    minScenarioRatio: 0.7,
    minScenarioCount: 14,
    
    // No single concept should appear in more than 3 questions
    maxQuestionsPerConcept: 3,
    
    // Difficulty mix: Apply ~40%, Analyse ~40%, Judgement ~20%
    difficultyMix: {
      apply: 0.4,    // ~8 questions
      analyse: 0.4,  // ~8 questions
      judgement: 0.2, // ~4 questions
    },
  },

  /**
   * Scoring & Assessment (Deterministic)
   */
  scoring: {
    passMark: 75, // Percentage
    weighting: {
      singleConcept: 1.0,
      multiConcept: 1.2,
    },
    scoringMethod: "weighted", // Uses multi-concept weighting
    negativeMarking: false,
    partialCredit: false,
  },

  /**
   * Retry & Cooldown Policy (Boss-Specific)
   */
  cooldown: {
    attempts: "unlimited",
    consecutiveFailures: {
      fail1: 30, // minutes
      fail2: 12 * 60, // 12 hours in minutes
      fail3Plus: 24 * 60, // 24 hours in minutes
    },
    mandatoryRemediation: true, // Require review or prep quiz after any fail
  },

  /**
   * On Pass Behavior
   */
  onPass: {
    markLevel10Passed: true,
    unlockLevel11: true,
    passIsPermanent: true, // Never revoked
  },

  /**
   * Scope Definition
   * 
   * Concept Scope = ALL concepts with primaryLevel ∈ [1..9]
   * Scope must be computed at runtime, never hardcoded.
   */
  scope: {
    levelRange: [1, 9], // Inclusive
    computeAtRuntime: true,
  },

  /**
   * Category Coverage (must be represented across the exam)
   */
  requiredCategories: [
    // Domain 1
    "AI Fundamentals",
    "Governance Principles",
    "Governance Structures & Roles",
    "Policies & Standards (Internal)",
    "AI Lifecycle Governance",
    "Decision-Making & Escalation",
    // Domain 2
    "Data Protection & Privacy Law",
    "AI-Specific Regulation",
    // Domain 3
    "Data Governance & Management",
    "Risk Identification & Assessment",
    "Documentation & Record-Keeping",
    // Domain 4
    "Operational Monitoring & Controls",
    "Transparency & Communication",
    "Incident & Issue Management",
  ],

  /**
   * Level Cluster Representation
   * Each cluster must be represented in the exam
   */
  levelClusters: [
    { levels: [1], theme: "AI fundamentals" },
    { levels: [2], theme: "Governance principles" },
    { levels: [3], theme: "Governance structures" },
    { levels: [4], theme: "Policies and standards" },
    { levels: [5], theme: "AI lifecycle" },
    { levels: [6], theme: "Decision-making" },
    { levels: [7], theme: "Risk identification" },
    { levels: [8], theme: "Data governance" },
    { levels: [9], theme: "Operational controls" },
  ],
} as const;

/**
 * Exam Generation Contract
 * 
 * When generating Level 10 Boss, the backend must pass this structure
 */
export interface BossExamGenerationRequest {
  isBoss: true;
  questionCount: number;
  difficulty: "intermediate-advanced";
  passMark: number;
  minMultiConceptRatio: number;
  minCrossCategoryRatio: number;
  weighting: {
    multiConcept: number;
  };
  conceptScope: string[]; // Concept IDs
  categoryMap: Record<string, string[]>; // categoryId -> conceptIds[]
}

/**
 * Question Payload Requirements
 * 
 * Each generated question must include these fields
 */
export interface BossExamQuestion {
  id: string;
  stem: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  conceptIds: string[]; // Required: 2+ for multi-concept questions
  categoryIds: string[]; // Required: 2+ for cross-category questions
  difficultyTag: "recall" | "apply" | "judgement";
  rationale: {
    correct: string;
    incorrect: Record<string, string>;
  };
}

/**
 * Validation function to check if a question meets boss requirements
 */
export function validateBossQuestion(
  question: BossExamQuestion,
  requirements: typeof LEVEL_10_BOSS_BLUEPRINT.questionComposition
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check conceptIds present
  if (!question.conceptIds || question.conceptIds.length === 0) {
    errors.push("Missing conceptIds");
  }

  // Check categoryIds present
  if (!question.categoryIds || question.categoryIds.length === 0) {
    errors.push("Missing categoryIds");
  }

  // Check difficultyTag present
  if (!question.difficultyTag) {
    errors.push("Missing difficultyTag");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate boss exam meets composition requirements
 * 
 * Enhanced validation with:
 * - Strict concept scope enforcement (Gap A)
 * - Canonical category ID validation (Gap B)
 * - Category presence check
 * - Concept frequency cap enforcement
 */
export function validateBossExamComposition(
  questions: BossExamQuestion[],
  requirements: typeof LEVEL_10_BOSS_BLUEPRINT.questionComposition,
  options?: {
    allowedConceptIds?: Set<string>; // Gap A: strict scope enforcement
    canonicalCategoryIds?: Set<string>; // Gap B: canonical category IDs
    requiredCategoryIds?: string[]; // Required categories that must appear
  }
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalQuestions: number;
    multiConceptCount: number;
    crossCategoryCount: number;
    scenarioCount: number;
    conceptsPerQuestion: Record<string, number>;
    categoriesPresent: Set<string>;
    allConceptIdsInScope: boolean;
    allCategoryIdsCanonical: boolean;
    categoryPresence: boolean;
    conceptFrequencyCap: boolean;
  };
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const stats = {
    totalQuestions: questions.length,
    multiConceptCount: 0,
    crossCategoryCount: 0,
    scenarioCount: 0,
    conceptsPerQuestion: {} as Record<string, number>,
    categoriesPresent: new Set<string>(),
    allConceptIdsInScope: true,
    allCategoryIdsCanonical: true,
    categoryPresence: true,
    conceptFrequencyCap: true,
  };

  // Gap A: Strict concept scope enforcement
  if (options?.allowedConceptIds) {
    questions.forEach((q, idx) => {
      q.conceptIds?.forEach((cid) => {
        if (!options.allowedConceptIds!.has(cid)) {
          stats.allConceptIdsInScope = false;
          errors.push(
            `Question ${q.id || `Q${idx + 1}`}: conceptId "${cid}" is outside allowed scope (Levels 1-9 only)`
          );
        }
      });
    });
  }

  // Gap B: Canonical category ID validation
  if (options?.canonicalCategoryIds) {
    questions.forEach((q, idx) => {
      q.categoryIds?.forEach((catId) => {
        if (!options.canonicalCategoryIds!.has(catId)) {
          stats.allCategoryIdsCanonical = false;
          errors.push(
            `Question ${q.id || `Q${idx + 1}`}: categoryId "${catId}" is not a canonical category ID`
          );
        } else {
          stats.categoriesPresent.add(catId);
        }
      });
    });
  } else {
    // If no canonical IDs provided, just track what we see
    questions.forEach((q) => {
      q.categoryIds?.forEach((catId) => stats.categoriesPresent.add(catId));
    });
  }

  // Category presence check
  if (options?.requiredCategoryIds && options.requiredCategoryIds.length > 0) {
    const presentSet = new Set(stats.categoriesPresent);
    const missing = options.requiredCategoryIds.filter(
      (reqCatId) => !presentSet.has(reqCatId)
    );
    if (missing.length > 0) {
      stats.categoryPresence = false;
      errors.push(
        `Missing required categories: ${missing.join(", ")}`
      );
    }
  }

  // Count question types
  questions.forEach((q) => {
    // Multi-concept: 2+ conceptIds
    if (q.conceptIds && q.conceptIds.length >= 2) {
      stats.multiConceptCount++;
    }

    // Cross-category: 2+ categoryIds
    if (q.categoryIds && q.categoryIds.length >= 2) {
      stats.crossCategoryCount++;
    }

    // Scenario: judgement or apply difficultyTag
    if (q.difficultyTag === "judgement" || q.difficultyTag === "apply") {
      stats.scenarioCount++;
    }

    // Track concept usage
    q.conceptIds?.forEach((cid) => {
      stats.conceptsPerQuestion[cid] = (stats.conceptsPerQuestion[cid] || 0) + 1;
    });
  });

  // Concept frequency cap enforcement
  Object.entries(stats.conceptsPerQuestion).forEach(([conceptId, count]) => {
    if (count > requirements.maxQuestionsPerConcept) {
      stats.conceptFrequencyCap = false;
      errors.push(
        `Concept ${conceptId} appears in ${count} questions (max: ${requirements.maxQuestionsPerConcept})`
      );
    }
  });

  // Validate minimums
  if (stats.multiConceptCount < requirements.minMultiConceptCount) {
    errors.push(
      `Multi-concept questions: ${stats.multiConceptCount} (required: ${requirements.minMultiConceptCount})`
    );
  }

  if (stats.crossCategoryCount < requirements.minCrossCategoryCount) {
    errors.push(
      `Cross-category questions: ${stats.crossCategoryCount} (required: ${requirements.minCrossCategoryCount})`
    );
  }

  if (stats.scenarioCount < requirements.minScenarioCount) {
    errors.push(
      `Scenario-based questions: ${stats.scenarioCount} (required: ${requirements.minScenarioCount})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

