/**
 * Deterministic Question Assignment Algorithm
 * 
 * Backend controls coverage, LLM fills content.
 * This prevents infinite validation failures by ensuring
 * every concept is covered exactly once for level exams.
 */

export interface ConceptCard {
  id: string;
  name?: string | null;
  concept?: string;
  categoryId?: string | null;
}

export interface QuestionPlan {
  primaryConceptId: string;
  allowedConceptIds: string[];
  maxConceptsInQuestion: number;
  questionNumber: number;
}

/**
 * Build deterministic question plan for Level Exams (Levels 1-9)
 * 
 * Ensures:
 * - Every concept appears exactly once
 * - Perfect coverage match
 * - Single-concept questions only
 */
export function buildLevelExamPlan(
  concepts: ConceptCard[],
  questionCount: number
): QuestionPlan[] {
  const plan: QuestionPlan[] = [];

  // Case 1: Perfect coverage match (most Levels 1–9)
  if (questionCount === concepts.length) {
    concepts.forEach((concept, index) => {
      plan.push({
        primaryConceptId: concept.id,
        allowedConceptIds: [concept.id],
        maxConceptsInQuestion: 1,
        questionNumber: index + 1,
      });
    });
    return plan;
  }

  // Case 2: More questions than concepts (rare, but handle it)
  // First, assign one question per concept
  concepts.forEach((concept, index) => {
    plan.push({
      primaryConceptId: concept.id,
      allowedConceptIds: [concept.id],
      maxConceptsInQuestion: 1,
      questionNumber: index + 1,
    });
  });

  // Then, cycle through concepts for remaining questions
  const remaining = questionCount - concepts.length;
  for (let i = 0; i < remaining; i++) {
    const conceptIndex = i % concepts.length;
    plan.push({
      primaryConceptId: concepts[conceptIndex].id,
      allowedConceptIds: [concepts[conceptIndex].id],
      maxConceptsInQuestion: 1,
      questionNumber: concepts.length + i + 1,
    });
  }

  return plan;
}

/**
 * Format question plan for ChatGPT prompt
 */
export function formatQuestionPlanForPrompt(plan: QuestionPlan[]): string {
  return plan
    .map((p, idx) => {
      return `Question ${p.questionNumber}: Test concept ID "${p.primaryConceptId}" (exactly 1 concept, no multi-concept)`;
    })
    .join("\n");
}

/**
 * Build question plan JSON for structured guidance
 */
export function buildQuestionPlanJSON(plan: QuestionPlan[]): any {
  return {
    questionPlan: plan.map((p) => ({
      primaryConceptId: p.primaryConceptId,
      allowedConceptIds: p.allowedConceptIds,
      maxConceptsInQuestion: p.maxConceptsInQuestion,
    })),
  };
}

