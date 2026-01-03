/**
 * Level 40 Boss Exam Blueprint (v1.0 — FINAL BOSS)
 * 
 * This blueprint defines the authoritative requirements for the Final Boss Exam.
 * This is the terminal, certification-grade capstone that tests whether a learner
 * can be trusted with the highest level of AI governance responsibility.
 * 
 * There is nothing after Level 40. This is earned authority.
 */

export const LEVEL_40_BOSS_BLUEPRINT = {
  version: "1.0",
  levelNumber: 40,
  superLevelGroup: "MASTERY",
  isFinalBoss: true,
  
  /**
   * Eligibility & Gating (Absolute Gate)
   * 
   * A learner may attempt Level 40 only if ALL are true:
   * - Levels 1-39 are PASSED
   * - All category exams across the entire platform are PASSED
   * - Level 39 is PASSED
   * - No active cooldown from prior Level 40 attempts
   * 
   * There are no shortcuts, overrides, or partial access.
   */
  eligibility: {
    requiresAllLevelsPassed: true,
    requiredLevelRange: { start: 1, end: 39 },
    requiresAllCategoryExamsPassed: true,
    requiresLevel39Passed: true,
    cooldownHours: 72, // 72 hours on failure
  },

  /**
   * Exam Structure
   */
  examStructure: {
    questionCount: 25,
    timeLimitMinutes: 60,
    passingScore: 85, // 85% required
    attempts: "unlimited",
    generationMode: "runtime_only", // Never pre-generated
  },

  /**
   * Scenario Design Rules (Hard Constraints)
   * 
   * Every question must:
   * - Be deeply scenario-based
   * - Span multiple time horizons (now / later / future)
   * - Involve conflicting stakeholder pressures
   * - Require a governance position, not a tactic
   * - Reference 3-5 concepts
   * - Reference 3+ domains
   * - Contain no obviously "correct" answer
   * 
   * The correct option is the most defensible, not the most compliant.
   */
  questionRequirements: {
    minConceptsPerQuestion: 3,
    maxConceptsPerQuestion: 5,
    minDomainsPerQuestion: 3,
    mustBeScenarioBased: true,
    mustSpanTimeHorizons: true,
    mustHaveConflictingPressures: true,
    noObviousAnswers: true,
  },

  /**
   * Coverage Requirements (Global)
   * 
   * Across the 25 questions, the exam must collectively cover:
   */
  coverageRequirements: {
    governanceDimensions: [
      "Strategy",
      "Risk",
      "Ethics",
      "Law",
      "Accountability",
      "Enforcement",
      "Multi-domain integration",
      "Multi-jurisdictional coherence",
      "Framework evolution",
      "Long-term consequence ownership",
    ],
    conceptScope: {
      levels: { start: 1, end: 39 },
      maxFrequencyPerConcept: 5,
      minLevel31To39Percentage: 60, // At least 60% must include Level 31-39 concepts
    },
  },

  /**
   * Difficulty Composition (Extreme)
   * 
   * If a question can be answered without internal debate, it is invalid.
   */
  difficultyMix: {
    judgement: 0.60, // ≥ 60%
    analyse: 0.35,  // ~35%
    apply: 0.05,    // ≤ 5%
  },

  /**
   * Scoring Model (Mastery-Grade)
   * 
   * Base scoring: 1 point per question
   * 
   * Weighting multipliers:
   * - Judgement-tag questions: ×1.5
   * - Questions spanning ≥4 domains: ×1.4
   * - Long-horizon consequence questions: ×1.3
   * 
   * Final score normalized to 100%.
   */
  scoring: {
    basePointsPerQuestion: 1,
    multipliers: {
      judgementTag: 1.5,
      fourPlusDomains: 1.4,
      longHorizonConsequence: 1.3,
    },
    passingScore: 85,
  },

  /**
   * Validation Rules (Engine-Enforced)
   * 
   * Must reject any exam that fails:
   * - Question count ≠ 25
   * - Missing multi-domain coverage
   * - Concept frequency > 5
   * - Judgement questions < 60%
   * - Any question referencing <3 concepts
   * - Any question with obvious "best practice" answers
   * 
   * Max retries: 2
   * Fail after that → abort with error.
   */
  validation: {
    maxRetries: 2,
    requiredQuestionCount: 25,
    minJudgementPercentage: 60,
    minConceptsPerQuestion: 3,
    maxConceptFrequency: 5,
    rejectObviousAnswers: true,
  },

  /**
   * Prompt Intent (Final Boss – Immutable)
   * 
   * This is the core intent the runtime system prompt must enforce:
   * 
   * "You are generating the FINAL BOSS EXAM for an AI Governance mastery platform.
   * This exam evaluates whether a learner can be trusted with the highest level of
   * AI governance responsibility.
   * 
   * Rules:
   * - Every question must involve conflicting values, pressures, or risks
   * - There is no 'safe' or 'perfect' option
   * - Correct answers are those that are most defensible over time
   * - Each question must reference multiple concepts and domains
   * - Avoid textbook, compliance-only, or procedural questions
   * - Do not invent laws, regulators, or obligations
   * - Use only the provided ConceptCard IDs and Category IDs
   * 
   * The learner should feel:
   * - accountability
   * - uncertainty
   * - responsibility for long-term outcomes"
   */
  promptIntent: {
    examType: "FINAL_BOSS",
    learnerFeeling: ["accountability", "uncertainty", "responsibility"],
    answerPhilosophy: "most_defensible_over_time",
    forbiddenTypes: ["textbook", "compliance_only", "procedural"],
  },
};

