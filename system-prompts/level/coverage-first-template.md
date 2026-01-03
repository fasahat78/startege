# Coverage-First Level Exam Prompt Template

For Levels 1-9: 1 question per concept, single-concept only
This ensures complete coverage without impossible constraints.

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

**Level Number:** <<LEVEL_NUMBER>>
**Level Title:** <<LEVEL_TITLE>>
**Super Level Group:** <<SUPER_LEVEL_GROUP>>
**Number of Questions:** <<QUESTION_COUNT>>
**Number of Concepts:** <<CONCEPT_COUNT>>

---

## LEVEL-SPECIFIC INSTRUCTIONS

<<LEVEL_SYSTEM_PROMPT>>

---

## CONCEPTS IN SCOPE (MANDATORY)

You may **ONLY** test the following concepts.
Each concept **MUST** appear in exactly **ONE** question.

<<CONCEPTS_LIST>>

---

## CRITICAL: CONCEPT ID MAPPING (MANDATORY)

You MUST use these exact conceptIds (ConceptCard database IDs) in your questions. DO NOT invent conceptIds like "L5-C01".

Use ONLY these conceptIds:
{
<<CONCEPT_ID_MAPPING>>
}

Every question's conceptIds array MUST contain only IDs from the mapping above.

---

## CRITICAL: CATEGORY ID MAPPING (MANDATORY)

You MUST use these exact categoryIds (database IDs) in your questions. DO NOT use placeholder IDs like "cat_001", "cat_privacy", "cat_compliance", etc.

Use ONLY these categoryIds:
{
<<CATEGORY_ID_MAPPING>>
}

Every question's categoryIds array MUST contain only IDs from the mapping above. Use the categoryId that corresponds to the concept's category.

---

## QUESTION PLAN (DETERMINISTIC ASSIGNMENT)

The backend has assigned each question to a specific concept. Follow this plan exactly:

<<QUESTION_PLAN>>

---

## OUTPUT FORMAT

Generate exactly <<QUESTION_COUNT>> multiple-choice questions.

Each question must:
- test exactly one concept (from the question plan above)
- include exactly 4 answer options
- have one correct answer
- be scenario-based but focused on a single idea
- use the exact ConceptCard ID from the question plan

Return ONLY valid JSON matching this exact JSON Schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["questions"],
  "properties": {
    "questions": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["id", "stem", "options", "correctOptionId", "conceptIds", "categoryIds", "difficultyTag", "rationale"],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^Q[0-9]+$",
            "description": "Sequential question ID (Q1, Q2, Q3, ...)"
          },
          "stem": {
            "type": "string",
            "minLength": 20,
            "description": "The question text"
          },
          "options": {
            "type": "array",
            "minItems": 4,
            "maxItems": 4,
            "items": {
              "type": "object",
              "required": ["id", "text"],
              "properties": {
                "id": {
                  "type": "string",
                  "enum": ["A", "B", "C", "D"],
                  "description": "Option identifier"
                },
                "text": {
                  "type": "string",
                  "minLength": 1,
                  "description": "Option text"
                }
              },
              "additionalProperties": false
            }
          },
          "correctOptionId": {
            "type": "string",
            "enum": ["A", "B", "C", "D"],
            "description": "The ID of the correct option"
          },
          "conceptIds": {
            "type": "array",
            "minItems": 1,
            "maxItems": 1,
            "items": {
              "type": "string",
              "pattern": "^cmj[a-z0-9]+$",
              "description": "ConceptCard database ID (exactly one per question)"
            },
            "description": "Array containing exactly one ConceptCard database ID"
          },
          "categoryIds": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "string",
              "pattern": "^cmj[a-z0-9]+$",
              "description": "Category database ID"
            },
            "description": "Array containing at least one category database ID"
          },
          "difficultyTag": {
            "type": "string",
            "enum": ["recall", "understand", "apply", "analyze", "evaluate"],
            "description": "Cognitive level tag"
          },
          "rationale": {
            "type": "object",
            "required": ["correct", "incorrect"],
            "properties": {
              "correct": {
                "type": "string",
                "minLength": 10,
                "description": "Explanation of why the correct option is correct"
              },
              "incorrect": {
                "type": "object",
                "minProperties": 3,
                "additionalProperties": {
                  "type": "string",
                  "minLength": 10
                },
                "description": "Explanations for each incorrect option, keyed by option ID"
              }
            },
            "additionalProperties": false
          }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
```

**Example valid output:**

```json
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
      "correctOptionId": "B",
      "conceptIds": ["cmj4621ir00010an4f0j6i7p0"],
      "categoryIds": ["cmj461y0l00050aiqga4zs82y"],
      "difficultyTag": "apply",
      "rationale": {
        "correct": "Why this option is correct",
        "incorrect": {
          "A": "Why option A is incorrect",
          "C": "Why option C is incorrect",
          "D": "Why option D is incorrect"
        }
      }
    }
  ]
}
```

**CRITICAL REMINDERS:**
- Each question tests EXACTLY ONE concept (from question plan)
- Use ONLY ConceptCard IDs from the mapping above
- Use ONLY canonical category IDs
- Generate exactly <<QUESTION_COUNT>> questions (one per concept)

Do not include any markdown, commentary, or text outside the JSON payload.

