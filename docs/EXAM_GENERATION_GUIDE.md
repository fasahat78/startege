# Exam Generation System - Complete Guide

## Overview

Exams are **generated dynamically at runtime** using ChatGPT (GPT-4o). They are **NOT pre-generated** - each exam is created fresh when a user starts an attempt, ensuring variety and preventing question leakage.

---

## Architecture Flow

```
User clicks "Start Exam"
    ↓
POST /api/exams/[examId]/start
    ↓
1. Check cooldown (if failed recently)
2. Check if exam already generated (reuse if exists)
3. Determine exam type (CATEGORY / LEVEL / BOSS)
4. Build system prompt (layered approach)
5. Call ChatGPT API
6. Validate generated questions
7. Store in database
8. Return questions to client (without answers)
```

---

## Exam Types

### 1. **Category Exams** (`CATEGORY`)
- **Purpose**: Test mastery of a single category (e.g., "AI Fundamentals")
- **Scope**: Only concepts from that category
- **Prompt**: `Category.examSystemPrompt` + base prompt
- **Coverage**: All concepts in category should appear

### 2. **Level Exams** (`LEVEL`)
- **Levels 1-9**: Coverage-first approach
  - **1 question per concept**
  - **Single-concept questions only**
  - **Deterministic planning** (backend assigns concepts to questions)
  - Uses `generateCoverageFirstLevelExamPrompt()`
  
- **Levels 10+**: Standard approach
  - Multi-concept questions allowed
  - Integration across concepts
  - Uses `Challenge.examSystemPrompt` + base prompt

### 3. **Boss Exams** (`BOSS`)
- **Levels**: 10, 20, 30, 40
- **Purpose**: Gate to next super-level
- **Requirements**:
  - ≥60% multi-concept questions (2-3 concepts)
  - ≥60% cross-category questions (2+ categories)
  - ≥70% scenario-based
  - Higher pass marks (75-85%)
- **Scope**: All concepts from previous super-level block
  - Level 10 boss: Concepts from Levels 1-9
  - Level 20 boss: Concepts from Levels 11-19
  - etc.

---

## Prompt System (Layered Architecture)

### Layer 1: Global Base Prompt (`EXAM_BASE_PROMPT`)
**Location**: `lib/exam-prompts.ts`

**Purpose**: Foundation rules for ALL exams
- MCQ format (4 options, 1 correct answer)
- Cognitive quality rules (application over memorization)
- Scope boundaries (no hallucinations)
- Difficulty calibration
- Governance framing (organizational perspective)
- Output format (JSON schema)

**Never changes** - locked foundation.

### Layer 2: Type-Specific Prompt
**Category Exams**: `Category.examSystemPrompt`
- Stored in database per category
- Defines category scope and boundaries
- Enforces category purity (no bleed)

**Level Exams**: `Challenge.examSystemPrompt`
- Stored in database per level
- Defines level context and concept list
- Boss logic included for Levels 10/20/30/40

### Layer 3: Runtime Parameters
- Question count
- Difficulty level
- Concept list (fetched from database)
- Category IDs (canonical database IDs)
- Question plan (for Levels 1-9)

---

## ChatGPT Integration

### API Call (`lib/chatgpt.ts`)

```typescript
generateExamQuestions({
  systemPrompt: string,        // Layered prompt
  questionCount: number,        // 10-15 typically
  difficulty: "beginner" | "intermediate" | "advanced" | "expert",
  isBoss?: boolean,
  allowedConceptIds?: string[], // Gap A: Strict scope enforcement
  categoryIdMap?: Record<string, string>, // Gap B: Canonical IDs
  requiredCategoryIds?: string[],
})
```

### Model Configuration
- **Model**: `gpt-4o`
- **Temperature**: 0.7 (balance creativity/consistency)
- **Response Format**: `json_object` (forced JSON output)
- **Max Tokens**: Default (sufficient for 10-15 questions)

### Response Format
```json
{
  "questions": [
    {
      "id": "Q1",
      "stem": "Question text",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctOptionId": "B",
      "conceptIds": ["cmj4621ir00010an4f0j6i7p0"],
      "categoryIds": ["cmj461y0l00050aiqga4zs82y"],
      "difficultyTag": "apply",
      "rationale": {
        "correct": "Why B is correct",
        "incorrect": {
          "A": "Why A is wrong",
          "C": "Why C is wrong",
          "D": "Why D is wrong"
        }
      }
    }
  ]
}
```

---

## Coverage-First Approach (Levels 1-9)

### Problem Solved
Previously, ChatGPT would generate questions that didn't cover all concepts, leading to validation failures and infinite retries.

### Solution: Deterministic Planning
**Location**: `lib/exam-planning.ts`

```typescript
buildLevelExamPlan(concepts, questionCount)
```

**How it works**:
1. Backend creates a **question plan** (1 question per concept)
2. Plan is passed to ChatGPT in the prompt
3. ChatGPT fills in content but follows the plan
4. Ensures **100% concept coverage**

**Example Plan**:
```
Question 1: Test concept "AI Fundamentals" (ID: cmj4621ir00010an4f0j6i7p0)
Question 2: Test concept "Governance Principles" (ID: cmj4621ir00020an4f0j6i7p1)
...
```

### Prompt Structure (`lib/level-exam-prompt.ts`)
- Emphasizes **1 question per concept**
- **Single-concept only** (no multi-concept)
- Includes concept ID mapping (prevents hallucinations)
- Includes category ID mapping (canonical IDs only)

---

## Validation System

### Level Exams (1-9)
**Location**: `lib/exam-validation.ts` → `validateLevelExam()`

**Checks**:
- ✅ Exact question count matches
- ✅ Every concept appears exactly once
- ✅ All concept IDs are canonical (from database)
- ✅ All category IDs are canonical
- ✅ Single-concept questions only

### Category Exams
**Location**: `lib/exam-validation.ts` → `validateCategoryExam()`

**Checks**:
- ✅ Scope purity (only category concepts)
- ✅ Canonical category IDs
- ✅ No concept repetition limits

### Boss Exams
**Location**: `lib/boss-exam-blueprint.ts` → `validateBossExamComposition()`

**Checks**:
- ✅ Multi-concept ratio ≥60%
- ✅ Cross-category ratio ≥60%
- ✅ Scenario-based ratio ≥70%
- ✅ Concept scope (no L10+ concepts for L10 boss)
- ✅ Canonical category IDs
- ✅ Category presence (all required categories appear)
- ✅ Concept frequency cap (max 4 appearances)

---

## Retry Logic

### For Boss Exams
- **Max retries**: 2
- **Trigger**: Validation failure
- **Action**: Regenerate with same prompt
- **If still fails**: Return error (don't infinite loop)

### For Regular Exams
- **No retries** (validation is less strict)
- **If generation fails**: Return error immediately

---

## Storage

### Exam Record (`Exam` model)
```typescript
{
  id: string,
  type: "CATEGORY" | "LEVEL" | "BOSS",
  questions: { questions: ExamQuestion[] }, // Full questions with answers
  systemPromptSnapshot: string,             // Prompt used for generation
  generationConfig: {
    questionCount: number,
    difficulty: string,
    passMark: number,
    isBoss?: boolean,
    bossWeighting?: { multiConcept: 1.2 },
    generatedAt: string,
  },
  status: "PUBLISHED",
}
```

### Exam Attempt (`ExamAttempt` model)
```typescript
{
  id: string,
  examId: string,
  userId: string,
  attemptNumber: number,
  status: "IN_PROGRESS" | "SUBMITTED" | "EVALUATED" | "EXPIRED",
  answers: { [questionId]: optionId },
  score: number | null,
  pass: boolean | null,
}
```

---

## Security & Privacy

### Client-Side Protection
- **Questions returned WITHOUT answers**
- Only `id`, `stem`, and `options` sent to client
- `correctOptionId` and `rationale` never exposed

### Server-Side Scoring
- All scoring happens server-side
- Answers compared deterministically
- No AI needed for assessment

---

## Cooldown System

### Category Exams
- **Unlimited attempts**
- **Cooldowns**: 0 min / 5 min / 15 min (consecutive fails)

### Level Exams (non-boss)
- **Unlimited attempts**
- **Cooldowns**: 5 min / 15 min

### Boss Exams
- **Unlimited attempts**
- **Cooldowns**: 30 min / 12 hours / 24 hours

---

## Cost Optimization

### Current Approach
- **No caching** - each exam generated fresh
- **Per-attempt generation** - ensures variety

### Future Optimizations (Not Implemented)
- Cache generated exams for reuse
- Batch generation for common exams
- Selective regeneration only if user fails multiple times

---

## Error Handling

### Generation Failures
- **ChatGPT API error**: Return 500 with error message
- **JSON parse error**: Try extracting from markdown code blocks
- **Validation failure**: Retry (boss exams) or return error

### Common Issues
1. **Missing API key**: Check `OPENAI_API_KEY` or `CHATGPT_API_KEY` env var
2. **Invalid JSON**: ChatGPT sometimes wraps JSON in markdown
3. **Scope violations**: Concept IDs outside allowed list
4. **Category ID mismatches**: Using placeholders instead of canonical IDs

---

## Example Flow: Level 1 Exam

1. **User starts Level 1 exam**
   ```
   POST /api/exams/[examId]/start
   ```

2. **System checks**:
   - ✅ User authenticated
   - ✅ No cooldown active
   - ✅ Exam exists

3. **System determines**: Level exam (Level 1, not boss)

4. **System fetches**:
   - Level 1 concepts (10 concepts)
   - Level 1 category coverage
   - Level 1 system prompt

5. **System builds plan**:
   ```typescript
   buildLevelExamPlan(concepts, 10)
   // Returns: 10 questions, 1 per concept
   ```

6. **System builds prompt**:
   ```
   EXAM_BASE_PROMPT
   + Level 1 system prompt
   + Concept list with IDs
   + Question plan (1 per concept)
   + Category ID mapping
   ```

7. **System calls ChatGPT**:
   ```typescript
   generateExamQuestions({
     systemPrompt: "...",
     questionCount: 10,
     difficulty: "beginner",
     allowedConceptIds: [...],
     categoryIdMap: {...},
   })
   ```

8. **ChatGPT returns**: 10 questions in JSON format

9. **System validates**:
   - ✅ 10 questions
   - ✅ All concepts covered
   - ✅ Canonical IDs used

10. **System stores**:
    - Questions in `Exam.questions`
    - Prompt snapshot in `Exam.systemPromptSnapshot`
    - Config in `Exam.generationConfig`

11. **System creates attempt**:
    - `ExamAttempt` with `IN_PROGRESS` status

12. **System returns to client**:
    - Questions WITHOUT answers
    - Attempt ID
    - Exam metadata

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/api/exams/[examId]/start/route.ts` | Entry point, orchestrates generation |
| `lib/chatgpt.ts` | ChatGPT API integration |
| `lib/exam-prompts.ts` | Base prompts and templates |
| `lib/exam-planning.ts` | Deterministic question planning |
| `lib/level-exam-prompt.ts` | Coverage-first prompts for Levels 1-9 |
| `lib/exam-validation.ts` | Validation logic |
| `lib/boss-exam-blueprint.ts` | Boss exam requirements and validation |

---

## Summary

**Exam generation is**:
- ✅ **Dynamic** - Generated at runtime, not pre-stored
- ✅ **AI-powered** - Uses ChatGPT GPT-4o
- ✅ **Validated** - Ensures quality and coverage
- ✅ **Secure** - Answers never exposed to client
- ✅ **Deterministic** - Scoring happens server-side
- ✅ **Coverage-first** - Levels 1-9 guarantee concept coverage
- ✅ **Boss-ready** - Special handling for gate exams

**Key innovation**: Coverage-first approach for Levels 1-9 ensures every concept is tested exactly once, preventing validation failures and infinite retries.

