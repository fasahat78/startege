/**
 * Coverage-First Level Exam Prompt
 * 
 * For Levels 1-9: 1 question per concept, single-concept only
 * This ensures complete coverage without impossible constraints
 */

import { EXAM_BASE_PROMPT } from "./exam-prompts";
import { QuestionPlan } from "./exam-planning";

export interface LevelExamPromptParams {
  levelNumber: number;
  levelTitle: string;
  superLevelGroup: string;
  concepts: Array<{ id: string; name?: string | null; concept?: string; categoryId?: string | null }>;
  questionPlan: QuestionPlan[];
  levelSystemPrompt?: string;
  categoryIdMap?: Record<string, string>; // categoryId -> categoryName
  requiredCategoryIds?: string[];
}

/**
 * Generate coverage-first level exam prompt
 */
export function generateCoverageFirstLevelExamPrompt(params: LevelExamPromptParams): string {
  const { levelNumber, levelTitle, superLevelGroup, concepts, questionPlan, levelSystemPrompt, categoryIdMap, requiredCategoryIds } = params;

  // Build concept list with IDs
  const conceptsList = concepts
    .map((c, i) => {
      const name = c.name || c.concept || `Concept ${i + 1}`;
      return `${i + 1}. ${name} (ID: ${c.id})`;
    })
    .join("\n");

  // Build concept ID mapping
  const conceptIdMapping = concepts
    .map((c) => {
      const name = c.name || c.concept || "Unknown";
      return `  "${c.id}": "${name}"`;
    })
    .join(",\n");

  // Build question plan guidance
  const questionPlanText = questionPlan
    .map((p) => {
      const concept = concepts.find((c) => c.id === p.primaryConceptId);
      const name = concept?.name || concept?.concept || p.primaryConceptId;
      return `Question ${p.questionNumber}: Test concept "${name}" (ID: ${p.primaryConceptId}) - exactly 1 concept, no multi-concept`;
    })
    .join("\n");

  return EXAM_BASE_PROMPT + `

---

## LEVEL EXAM SYSTEM PROMPT (Coverage-First)

You are generating a **LEVEL EXAM** for a professional AI Governance learning platform.

This exam is designed to **VERIFY COVERAGE** of concepts, not deep integration.

---

## CRITICAL RULES (MUST FOLLOW)

1. This is a **LEVEL exam** (NOT a boss exam).
2. **EVERY concept listed below MUST be tested AT LEAST ONCE.**
3. **If the number of questions equals the number of concepts:**
   - Generate **EXACTLY ONE question per concept**.
   - Each question MUST reference **EXACTLY ONE concept**.
   - Do **NOT** create multi-concept questions.
4. Use **ONLY** the provided ConceptCard database IDs for conceptIds.
5. Do **NOT** invent or reuse concept IDs.
6. Every question MUST include:
   - conceptIds (array with exactly 1 ID)
   - categoryIds (canonical database IDs only)
   - difficultyTag

---

## EXAM GOAL

The goal of this exam is to confirm that the learner understands **EACH concept individually** before advancing.

This exam is **NOT** intended to:
- test integration across concepts
- combine multiple concepts into one question
- stress advanced judgement

That will happen in later levels and boss exams.

---

## LEVEL CONTEXT

**Level Number:** ${levelNumber}
**Level Title:** ${levelTitle}
**Super Level Group:** ${superLevelGroup}
**Number of Questions:** ${questionPlan.length}
**Number of Concepts:** ${concepts.length}

---

## LEVEL-SPECIFIC INSTRUCTIONS

${levelSystemPrompt || "Generate exam questions for this level."}

---

## CONCEPTS IN SCOPE (MANDATORY)

You may **ONLY** test the following concepts.
Each concept **MUST** appear in exactly **ONE** question.

${conceptsList}

---

## CRITICAL: CONCEPT ID MAPPING (MANDATORY)

You MUST use these exact conceptIds (ConceptCard database IDs) in your questions. DO NOT invent conceptIds like "L5-C01".

Use ONLY these conceptIds:
{
${conceptIdMapping}
}

Every question's conceptIds array MUST contain only IDs from the mapping above.

${categoryIdMap && Object.keys(categoryIdMap).length > 0 ? `
---

## CRITICAL: CATEGORY ID MAPPING (MANDATORY)

You MUST use these exact categoryIds (database IDs) in your questions. DO NOT use placeholder IDs like "cat_001", "cat_privacy", "cat_compliance", etc.

Use ONLY these categoryIds:
{
${Object.entries(categoryIdMap).map(([id, name]) => `  "${id}": "${name}"`).join(",\n")}
}

Every question's categoryIds array MUST contain only IDs from the mapping above. Use the categoryId that corresponds to the concept's category.` : ""}

---

## QUESTION PLAN (DETERMINISTIC ASSIGNMENT)

The backend has assigned each question to a specific concept. Follow this plan exactly:

${questionPlanText}

---

## OUTPUT FORMAT

Generate exactly ${questionPlan.length} multiple-choice questions.

Each question must:
- test exactly one concept (from the question plan above)
- include exactly 4 answer options
- have one correct answer
- be scenario-based but focused on a single idea
- use the exact ConceptCard ID from the question plan

Return ONLY valid JSON matching this exact schema:
{
  "questions": [
    {
      "id": "Q1",
      "stem": "Scenario-based question text here (testing single concept)",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "A",
      "conceptIds": ["cmj4621ir00010an4f0j6i7p0"],
      "categoryIds": ["cmj461y0l00050aiqga4zs82y"],
      "difficultyTag": "apply",
      "rationale": {
        "correct": "Clear explanation of why this option is correct, referencing specific governance principles or concepts. Should be 2-4 sentences, educational, and help learners understand the reasoning.",
        "incorrect": {
          "B": "Specific explanation of why option B is incorrect, identifying the misconception or error in reasoning",
          "C": "Specific explanation of why option C is incorrect, identifying the misconception or error in reasoning",
          "D": "Specific explanation of why option D is incorrect, identifying the misconception or error in reasoning"
        }
      }
    },
    {
      "id": "Q2",
      "stem": "Another scenario-based question",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "D",
      "conceptIds": ["cmj4621ir00010an4f0j6i7p1"],
      "categoryIds": ["cmj461y0l00050aiqga4zs82y"],
      "difficultyTag": "apply",
      "rationale": {
        "correct": "Clear explanation of why this option is correct, referencing specific governance principles or concepts. Should be 2-4 sentences, educational, and help learners understand the reasoning.",
        "incorrect": {
          "A": "Specific explanation of why option A is incorrect, identifying the misconception or error in reasoning",
          "B": "Specific explanation of why option B is incorrect, identifying the misconception or error in reasoning",
          "C": "Specific explanation of why option C is incorrect, identifying the misconception or error in reasoning"
        }
      }
    }
  ]
}

**IMPORTANT REQUIREMENTS:**

1. **Answer Distribution**: Distribute correct answers evenly across all options (A, B, C, D). Do NOT bias towards any particular option. Each exam should have approximately equal numbers of correct answers for each option.

2. **Explanation Quality** (Following AIGP Exam Best Practices):
   - **Correct Answer Explanations**: Must be clear, concise (2-4 sentences), and educational. Reference specific governance principles, regulations, or frameworks when relevant. Help learners understand WHY the answer is correct, not just that it is correct.
   - **Incorrect Answer Explanations**: For each distractor, explain WHY it is wrong. Identify the specific misconception or error in reasoning. Be specific rather than generic (e.g., "This option confuses X with Y" rather than "This is incorrect").
   - **Style**: Follow the explanation style and depth found in AIGP practice exams - professional, certification-level, and pedagogically sound.

**CRITICAL REMINDERS:**
- Each question tests EXACTLY ONE concept (from question plan)
- Use ONLY ConceptCard IDs from the mapping above
- Use ONLY canonical category IDs
- Generate exactly ${questionPlan.length} questions (one per concept)

Do not include any markdown, commentary, or text outside the JSON payload.`;
}

