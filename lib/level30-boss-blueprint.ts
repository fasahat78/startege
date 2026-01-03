/**
 * Level 30 Boss Exam Blueprint (v1.0 — LOCKED)
 * 
 * This blueprint defines the authoritative requirements for the Advanced Boss Exam.
 * It certifies that the learner has integrated, end-to-end mastery of all Advanced
 * concepts (Levels 21–29) and can make expert-level governance decisions under uncertainty.
 */

export const LEVEL_30_BOSS_BLUEPRINT = {
  version: "1.0",
  levelNumber: 30,
  superLevelGroup: "ADVANCED",
  
  /**
   * Eligibility & Gating (Hard Rules)
   * 
   * A user may start Level 30 Boss only if ALL are true:
   * - Levels 21-29 are PASSED
   * - All Category Exams for categories introduced in Levels 21–29 are PASSED
   * - No active cooldown from prior Level 30 attempts
   */
  eligibility: {
    requiresLevel29Passed: true,
    requiresAllCategoryExamsPassed: true,
    categoriesToCheck: [
      // Domain 1
      "Advanced Governance Scenarios",
      "Multi-Jurisdictional Governance",
      "Ethical Frameworks",
      "Regulatory Sandboxes & Controlled Experimentation",
      "Case Law & Precedent",
      "Governance Models & Operating Structures",
      "Advanced Risk Management & Tolerance",
      "Strategic Compliance & Governance Alignment",
      "Compliance Frameworks",
      "Algorithmic Accountability & Assurance",
      "Governance Structures & Roles",
      "Transparency & Communication",
      // Domain 2
      "Emerging AI Regulation & Policy Trends",
      "AI Act Obligations & Requirements",
      "Data Protection & Privacy Law",
      "Cross-Border Data & Jurisdiction",
      // Domain 3
      "Bias Fairness & Model Risk",
      "Risk Identification & Assessment",
      "Impact Assessments",
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
    difficultyBand: "expert",
    timeLimitMinutes: 50, // Recommended 45-50 minutes
  },

  /**
   * Question Composition Rules (Enforced at Generation)
   */
  questionComposition: {
    // Multi-concept questions: ≥ 75% (≥ 15 questions)
    minMultiConceptRatio: 0.75,
    minMultiConceptCount: 15,
    
    // Cross-category questions: ≥ 75% (≥ 15 questions)
    minCrossCategoryRatio: 0.75,
    minCrossCategoryCount: 15,
    
    // Scenario-based questions: ≥ 80% (≥ 16 questions, likely 100%)
    minScenarioRatio: 0.8,
    minScenarioCount: 16,
    
    // No single concept should appear in more than 4 questions
    maxQuestionsPerConcept: 4,
    
    // Difficulty mix: Analyse ~40%, Judgement ~50%, Apply ≤10%
    difficultyMix: {
      analyse: 0.4,    // ~8 questions
      judgement: 0.5,  // ~10 questions
      apply: 0.1,      // ~2 questions (only when leading to judgement)
    },
  },

  /**
   * Scoring & Assessment (Boss-Specific)
   */
  scoring: {
    passMark: 80, // Percentage (higher than Level 20)
    weighting: {
      singleConcept: 1.0,
      multiConcept: 1.2,
      judgement: 1.4,
      multiDomain: 1.3,
    },
    scoringMethod: "weighted", // Uses multi-concept, judgement, and multi-domain weighting
    negativeMarking: false,
    partialCredit: false,
  },

  /**
   * Retry & Cooldown Policy (Boss-Specific)
   */
  cooldown: {
    attempts: "unlimited",
    consecutiveFailures: {
      fail1: 60, // 1 hour in minutes
      fail2: 60, // 1 hour in minutes
      fail3Plus: 60, // 1 hour in minutes
    },
    mandatoryRemediation: true, // Require review or prep quiz after any fail
  },

  /**
   * On Pass Behavior
   */
  onPass: {
    markLevel30Passed: true,
    unlockLevel31: true,
    passIsPermanent: true, // Never revoked
    markAdvancedSuperLevelComplete: true,
  },

  /**
   * Scope Definition
   * 
   * Concept Scope = ALL concepts with primaryLevel ∈ [21..29]
   * Scope must be computed at runtime, never hardcoded.
   */
  scope: {
    levelRange: [21, 29], // Inclusive
    computeAtRuntime: true,
  },

  /**
   * Category Coverage (must be represented across the exam)
   * All categories introduced in Levels 21-29 must appear at least once
   */
  requiredCategories: [
    // Domain 1
    "Advanced Governance Scenarios",
    "Ethical Frameworks",
    "Governance Models & Operating Structures",
    "Strategic Compliance & Governance Alignment",
    "Compliance Frameworks",
    "Algorithmic Accountability & Assurance",
    // Domain 2
    "Multi-Jurisdictional Governance",
    "Emerging AI Regulation & Policy Trends",
    "Case Law & Precedent",
    "AI Act Obligations & Requirements",
    "Data Protection & Privacy Law",
    // Domain 3
    "Advanced Risk Management & Tolerance",
    "Bias Fairness & Model Risk",
    "Risk Identification & Assessment",
    // Domain 4
    "Regulatory Sandboxes & Controlled Experimentation",
    "Enforcement Oversight & Remedies",
  ],

  /**
   * Level Cluster Representation
   * Each cluster must be represented in the exam
   */
  levelClusters: [
    { levels: [21], theme: "Advanced governance scenarios" },
    { levels: [22], theme: "Multi-jurisdictional governance" },
    { levels: [23], theme: "Ethical frameworks" },
    { levels: [24], theme: "Regulatory sandboxes" },
    { levels: [25], theme: "Case law & precedent" },
    { levels: [26], theme: "Governance models" },
    { levels: [27], theme: "Advanced risk management" },
    { levels: [28], theme: "Strategic compliance" },
    { levels: [29], theme: "Emerging regulations" },
  ],
} as const;

/**
 * Exam Generation Contract
 * 
 * When generating Level 30 Boss, the backend must pass this structure
 */
export interface Level30BossExamGenerationRequest {
  isBoss: true;
  questionCount: number;
  difficulty: "expert";
  passMark: number;
  minMultiConceptRatio: number;
  minCrossCategoryRatio: number;
  weighting: {
    multiConcept: number;
    judgement: number;
    multiDomain: number;
  };
  conceptScope: string[]; // Concept IDs from Levels 21-29
  categoryMap: Record<string, string[]>; // categoryId -> conceptIds[]
  difficultyMix: {
    analyse: number;
    judgement: number;
    apply: number;
  };
}

/**
 * Question Payload Requirements
 * 
 * Each generated question must include these fields
 */
export interface Level30BossExamQuestion {
  id: string;
  stem: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  conceptIds: string[]; // Required: 2-4 concepts per question
  categoryIds: string[]; // Required: 2+ categories per question
  difficultyTag: "apply" | "analyse" | "judgement"; // Judgement dominates
  rationale: {
    correct: string;
    incorrect: Record<string, string>;
  };
}

/**
 * Validate boss exam meets composition requirements
 */
export function validateLevel30BossExamComposition(
  questions: Level30BossExamQuestion[],
  requirements: typeof LEVEL_30_BOSS_BLUEPRINT.questionComposition,
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
            `Question ${q.id || `Q${idx + 1}`}: conceptId "${cid}" is outside allowed scope (Levels 21-29 only)`
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

    // Check that judgement + analyse ≥ 80%
    const judgementAnalyseRatio = (stats.difficultyDistribution.judgement + stats.difficultyDistribution.analyse) / total;
    if (judgementAnalyseRatio < 0.8) {
      errors.push(
        `Judgement + Analyse questions: ${(judgementAnalyseRatio * 100).toFixed(1)}% (required: ≥80%)`
      );
    }

    // Allow ±10% tolerance for individual difficulty targets
    if (applyRatio > requirements.difficultyMix.apply + 0.1) {
      warnings.push(
        `Apply difficulty: ${(applyRatio * 100).toFixed(1)}% (target: ≤${(requirements.difficultyMix.apply * 100).toFixed(1)}%)`
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

