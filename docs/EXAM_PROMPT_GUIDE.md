# Exam Prompt System Guide

## Overview

The exam generation system uses a **layered prompt architecture**:

1. **Global Base Prompt** (`lib/exam-prompts.ts`) - Locked, never changes
2. **Category-Specific Prompts** (stored in `Category.examSystemPrompt`)
3. **Level-Specific Prompts** (stored in `Challenge.examSystemPrompt`)

## Architecture

### Base Prompt (Locked)

The `EXAM_BASE_PROMPT` in `lib/exam-prompts.ts` contains:
- Question design rules (MCQ format, 4 options, etc.)
- Cognitive quality standards
- Scope & boundary enforcement
- Difficulty control guidelines
- Governance accuracy rules
- Explanation & rationale requirements
- Strict JSON output format

**This prompt is NEVER modified** - it ensures consistency across all exams.

### Composing Exam Prompts

Use the `composeExamPrompt()` helper function to build full prompts:

```typescript
import { EXAM_BASE_PROMPT, composeExamPrompt } from "@/lib/exam-prompts";

const fullPrompt = composeExamPrompt(
  EXAM_BASE_PROMPT,
  categorySpecificInstructions, // From Category.examSystemPrompt
  conceptList,                  // Array of concept names/IDs
  "intermediate",              // Difficulty level
  10                          // Question count
);
```

## Prompt Storage

### Category Exams

Category-specific prompts are stored in `Category.examSystemPrompt`:
- Seeded via `scripts/seed-domains-categories.ts`
- Currently uses placeholder: `"PLACEHOLDER: Category exam prompt for <Category.name>"`
- Will be updated in Step 4 with actual category-specific instructions

### Level Exams

Level-specific prompts are stored in `Challenge.examSystemPrompt`:
- Seeded via `scripts/seed-challenges.ts`
- Includes boss exam logic (Levels 10, 20, 30, 40)
- Currently uses template with level-specific context

## Usage in Exam Generation

When generating an exam:

1. **Fetch the base prompt** from `lib/exam-prompts.ts`
2. **Fetch category/level-specific prompt** from database
3. **Fetch concepts in scope** (from `Challenge.concepts` or category concepts)
4. **Compose full prompt** using `composeExamPrompt()`
5. **Send to AI** (ChatGPT/Vertex AI) for question generation
6. **Store result** in `Exam` model with `systemPromptSnapshot`

## Output Format

All exam generation must return JSON matching this schema:

```json
{
  "questions": [
    {
      "id": "Q1",
      "stem": "Question text here",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "B",
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

## Category Exam Prompts

### Template Structure

Category-specific prompts are generated using `CATEGORY_EXAM_PROMPT_TEMPLATE` from `lib/exam-prompts.ts`.

The template includes placeholders:
- `<<CATEGORY_NAME>>` - Name of the category
- `<<DOMAIN_NAME>>` - Domain this category belongs to
- `<<CATEGORY_DEFINITION>>` - What this category covers
- `<<BULLET_LIST_OF_IN_SCOPE_CONCEPT_TYPES>>` - Concepts that can be tested
- `<<NEARBY_CATEGORIES_OR_CONCEPTS_TO_EXCLUDE>>` - What NOT to test

### Filling the Template

Use `fillCategoryExamPrompt()` helper function:

```typescript
import { fillCategoryExamPrompt } from "@/lib/exam-prompts";

const categoryPrompt = fillCategoryExamPrompt({
  categoryName: "AI Fundamentals",
  domainName: "Domain 1",
  categoryDefinition: "Core AI concepts and terminology...",
  inScope: [
    "Machine learning basics",
    "AI system types",
    "AI capabilities and limitations"
  ],
  outOfScope: [
    "Technical ML algorithms",
    "Software implementation details"
  ]
});
```

### Composing Category Exam Prompts

Use `composeCategoryExamPrompt()` to build the full prompt:

```typescript
import { composeCategoryExamPrompt } from "@/lib/exam-prompts";

const fullPrompt = composeCategoryExamPrompt(
  categoryPrompt,        // From Category.examSystemPrompt
  conceptList,          // Concepts assigned to this category
  "intermediate",       // Difficulty level
  10                    // Question count
);
```

### Storage

Category prompts are stored in `Category.examSystemPrompt`:
- Currently seeded with placeholders via `scripts/seed-domains-categories.ts`
- Will be updated with actual filled prompts from ChatGPT

## Level Exam Prompts

### Template Structure

Level-specific prompts are generated using `LEVEL_EXAM_PROMPT_TEMPLATE` from `lib/exam-prompts.ts`.

The template includes placeholders:
- `<<LEVEL_NUMBER>>` - Level number (1-40)
- `<<LEVEL_TITLE>>` - Title of the level
- `<<SUPER_LEVEL_GROUP>>` - FOUNDATION | BUILDING | ADVANCED | MASTERY
- `<<IS_BOSS_LEVEL>>` - true | false
- `<<EXPLICIT_LIST_OF_CONCEPT_NAMES_OR_IDS>>` - All concepts assigned to this level

### Filling the Template

Use `fillLevelExamPrompt()` helper function:

```typescript
import { fillLevelExamPrompt } from "@/lib/exam-prompts";

const levelPrompt = fillLevelExamPrompt({
  levelNumber: 10,
  levelTitle: "Foundation Mastery",
  superLevelGroup: "FOUNDATION",
  isBoss: true,
  concepts: ["Concept 1", "Concept 2", ...] // All concepts from level(s)
});
```

### Boss Level Logic

For Boss levels (10, 20, 30, 40):
- `isBoss: true` enables boss exam rules
- Concepts list must include ALL concepts from the entire super-level block
- At least 60% of questions must involve 2+ concepts and span 2+ categories
- Increased difficulty and integration requirements

### Composing Level Exam Prompts

Use `composeLevelExamPrompt()` to build the full prompt:

```typescript
import { composeLevelExamPrompt } from "@/lib/exam-prompts";

const fullPrompt = composeLevelExamPrompt(
  levelPrompt,        // From Challenge.examSystemPrompt
  15,                 // Question count
  20,                 // Time limit (minutes)
  70                  // Passing score (%)
);
```

### Storage

Level prompts are stored in `Challenge.examSystemPrompt`:
- Seeded via `scripts/seed-challenges.ts`
- Uses template with level-specific context
- Concepts list updated when concepts are assigned via import script

## Prompt Composition Flow

### Category Exam
```
EXAM_BASE_PROMPT
+ Category.examSystemPrompt
+ Concepts list
+ Runtime parameters (difficulty, questionCount)
```

### Level Exam
```
EXAM_BASE_PROMPT
+ Challenge.examSystemPrompt
+ Runtime parameters (questionCount, timeLimit, passingScore)
```

## Next Steps

- ✅ Step 3: Global base prompt created
- ✅ Step 4: Category exam prompt template created
- ✅ Step 5: Level exam prompt template created (including boss logic)
- ⏭️ Step 6: Generate Level 1 concepts
- ⏭️ Exam generation API implementation

