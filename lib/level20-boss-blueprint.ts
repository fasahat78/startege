/**
 * Level 20 Boss Exam Blueprint (v1.0 — LOCKED)
 * 
 * This blueprint defines the authoritative requirements for the Building Boss Exam.
 * It certifies that the learner has integrated, end-to-end mastery of all Building
 * concepts (Levels 11–19) and can make sound governance decisions under realistic constraints.
 */

export const LEVEL_20_BOSS_BLUEPRINT = {
  version: "1.0",
  levelNumber: 20,
  superLevelGroup: "BUILDING",
  
  /**
   * Eligibility & Gating (Hard Rules)
   * 
   * A user may start Level 20 Boss only if ALL are true:
   * - Levels 11-19 are PASSED
   * - All Category Exams for categories introduced in Levels 11–19 are PASSED
   * - No active cooldown from prior Level 20 attempts
   */
  eligibility: {
    requiresLevel19Passed: true,
    requiresAllCategoryExamsPassed: true,
    categoriesToCheck: [
      // Domain 1
      "Use Case Definition & Scoping",
      "Governance Structures & Roles",
      "AI Lifecycle Governance",
      "Algorithmic Accountability & Assurance",
      "Transparency & Communication",
      "Compliance Frameworks",
      // Domain 2
      "Cross-Border Data & Jurisdiction",
      "Data Protection & Privacy Law",
      "AI-Specific Regulation",
      "AI Act Obligations & Requirements",
      "High-Risk AI Systems",
      // Domain 3
      "Risk Identification & Assessment",
      "Impact Assessments",
      "Bias Fairness & Model Risk",
      // Domain 4
      "Enforcement Oversight & Remedies",
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
    difficultyBand: "advanced",
    timeLimitMinutes: 45, // Recommended 40-45 minutes
  },

  /**
   * Question Composition Rules (Enforced at Generation)
   */
  questionComposition: {
    // Multi-concept questions: ≥ 70% (≥ 14 questions)
    minMultiConceptRatio: 0.7,
    minMultiConceptCount: 14,
    
    // Cross-category questions: ≥ 70% (≥ 14 questions)
    minCrossCategoryRatio: 0.7,
    minCrossCategoryCount: 14,
    
    // Scenario-based questions: ≥ 70% (≥ 14 questions, likely 100%)
    minScenarioRatio: 0.7,
    minScenarioCount: 14,
    
    // No single concept should appear in more than 4 questions
    maxQuestionsPerConcept: 4,
    
    // Difficulty mix: Apply ~30%, Analyse ~40%, Judgement ~30%
    difficultyMix: {
      apply: 0.3,    // ~6 questions
      analyse: 0.4,  // ~8 questions
      judgement: 0.3, // ~6 questions
    },
  },

  /**
   * Scoring & Assessment (Boss-Specific)
   */
  scoring: {
    passMark: 75, // Percentage
    weighting: {
      singleConcept: 1.0,
      multiConcept: 1.2,
      judgement: 1.3,
    },
    scoringMethod: "weighted", // Uses multi-concept and judgement weighting
    negativeMarking: false,
    partialCredit: false,
  },

  /**
   * Retry & Cooldown Policy (Boss-Specific)
   */
  cooldown: {
    attempts: "unlimited",
    consecutiveFailures: {
      fail1: 24 * 60, // 24 hours in minutes
      fail2: 48 * 60, // 48 hours in minutes
      fail3Plus: 48 * 60, // 48 hours in minutes
    },
    mandatoryRemediation: true, // Require review or prep quiz after any fail
  },

  /**
   * On Pass Behavior
   */
  onPass: {
    markLevel20Passed: true,
    unlockLevel21: true,
    passIsPermanent: true, // Never revoked
    markBuildingSuperLevelComplete: true,
  },

  /**
   * Scope Definition
   * 
   * Concept Scope = ALL concepts with primaryLevel ∈ [11..19]
   * Scope must be computed at runtime, never hardcoded.
   */
  scope: {
    levelRange: [11, 19], // Inclusive
    computeAtRuntime: true,
  },

  /**
   * Category Coverage (must be represented across the exam)
   * All categories introduced in Levels 11-19 must appear at least once
   */
  requiredCategories: [
    // Domain 1
    "Use Case Definition & Scoping",
    "Governance Structures & Roles",
    "AI Lifecycle Governance",
    "Algorithmic Accountability & Assurance",
    "Transparency & Communication",
    "Compliance Frameworks",
    // Domain 2
    "Cross-Border Data & Jurisdiction",
    "Data Protection & Privacy Law",
    "AI-Specific Regulation",
    "AI Act Obligations & Requirements",
    "High-Risk AI Systems",
    // Domain 3
    "Risk Identification & Assessment",
    "Impact Assessments",
    "Bias Fairness & Model Risk",
    // Domain 4
    "Enforcement Oversight & Remedies",
    "Incident & Issue Management",
  ],

  /**
   * Level Cluster Representation
   * Each cluster must be represented in the exam
   */
  levelClusters: [
    { levels: [11], theme: "Use case design" },
    { levels: [12], theme: "Cross-border context" },
    { levels: [13], theme: "AI Act obligations" },
    { levels: [14], theme: "Impact assessments" },
    { levels: [15], theme: "High-risk AI" },
    { levels: [16], theme: "Assurance" },
    { levels: [17], theme: "Bias & fairness" },
    { levels: [18], theme: "Enforcement & remedies" },
    { levels: [19], theme: "Compliance frameworks" },
  ],
} as const;

/**
 * Exam Generation Contract
 * 
 * When generating Level 20 Boss, the backend must pass this structure
 */
export interface Level20BossExamGenerationRequest {
  isBoss: true;
  questionCount: number;
  difficulty: "advanced";
  passMark: number;
  minMultiConceptRatio: number;
  minCrossCategoryRatio: number;
  weighting: {
    multiConcept: number;
    judgement: number;
  };
  conceptScope: string[]; // Concept IDs from Levels 11-19
  categoryMap: Record<string, string[]>; // categoryId -> conceptIds[]
  difficultyMix: {
    apply: number;
    analyse: number;
    judgement: number;
  };
}

/**
 * Question Payload Requirements
 * 
 * Each generated question must include these fields
 */
export interface Level20BossExamQuestion {
  id: string;
  stem: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  conceptIds: string[]; // Required: 2-3 concepts per question
  categoryIds: string[]; // Required: 2+ categories per question
  difficultyTag: "apply" | "analyse" | "judgement"; // No recall allowed
  rationale: {
    correct: string;
    incorrect: Record<string, string>;
  };
}

/**
 * Validate boss exam meets composition requirements
 */
export function validateLevel20BossExamComposition(
  questions: Level20BossExamQuestion[],
  requirements: typeof LEVEL_20_BOSS_BLUEPRINT.questionComposition,
  options?: {
    allowedConceptIds?: Set<string>; // Strict scope enforcement
    canonicalCategoryIds?: Set<string>; // Canonical category IDs
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
    difficultyDistribution: {
      apply: number;
      analyse: number;
      judgement: number;
    };
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
    difficultyDistribution: {
      apply: 0,
      analyse: 0,
      judgement: 0,
    },
  };

  // Strict concept scope enforcement
  if (options?.allowedConceptIds) {
    questions.forEach((q, idx) => {
      q.conceptIds?.forEach((cid) => {
        if (!options.allowedConceptIds!.has(cid)) {
          stats.allConceptIdsInScope = false;
          errors.push(
            `Question ${q.id || `Q${idx + 1}`}: conceptId "${cid}" is outside allowed scope (Levels 11-19 only)`
          );
        }
      });
    });
  }

  // Canonical category ID validation
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

  // Count question types and difficulty
  questions.forEach((q) => {
    // Multi-concept: 2+ conceptIds
    if (q.conceptIds && q.conceptIds.length >= 2) {
      stats.multiConceptCount++;
    }

    // Cross-category: 2+ categoryIds
    if (q.categoryIds && q.categoryIds.length >= 2) {
      stats.crossCategoryCount++;
    }

    // Scenario: apply, analyse, or judgement difficultyTag
    if (q.difficultyTag === "apply" || q.difficultyTag === "analyse" || q.difficultyTag === "judgement") {
      stats.scenarioCount++;
    }

    // Track difficulty distribution
    if (q.difficultyTag === "apply") {
      stats.difficultyDistribution.apply++;
    } else if (q.difficultyTag === "analyse") {
      stats.difficultyDistribution.analyse++;
    } else if (q.difficultyTag === "judgement") {
      stats.difficultyDistribution.judgement++;
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

  // Validate difficulty mix (allow some tolerance)
  const total = stats.difficultyDistribution.apply + stats.difficultyDistribution.analyse + stats.difficultyDistribution.judgement;
  if (total > 0) {
    const applyRatio = stats.difficultyDistribution.apply / total;
    const analyseRatio = stats.difficultyDistribution.analyse / total;
    const judgementRatio = stats.difficultyDistribution.judgement / total;

    // Allow ±10% tolerance
    if (Math.abs(applyRatio - requirements.difficultyMix.apply) > 0.1) {
      warnings.push(
        `Apply difficulty: ${(applyRatio * 100).toFixed(1)}% (target: ${(requirements.difficultyMix.apply * 100).toFixed(1)}%)`
      );
    }
    if (Math.abs(analyseRatio - requirements.difficultyMix.analyse) > 0.1) {
      warnings.push(
        `Analyse difficulty: ${(analyseRatio * 100).toFixed(1)}% (target: ${(requirements.difficultyMix.analyse * 100).toFixed(1)}%)`
      );
    }
    if (Math.abs(judgementRatio - requirements.difficultyMix.judgement) > 0.1) {
      warnings.push(
        `Judgement difficulty: ${(judgementRatio * 100).toFixed(1)}% (target: ${(requirements.difficultyMix.judgement * 100).toFixed(1)}%)`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}

