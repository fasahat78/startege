# Step 7 Testing Guide - Runtime Exam Generation

## Overview

This guide outlines what to test after importing Level 1 concepts. **Exams are NOT pre-generated** - they are generated at runtime using ChatGPT API.

## What to Test

### 1. Import Level 1 Concepts ✅

```bash
npm run import:level-mapping data/level-1-concepts.csv
```

**Verify:**
- ✅ All 10 concepts imported successfully
- ✅ Concepts assigned to correct categories
- ✅ Level 1 Challenge.concepts array updated
- ✅ ConceptCard records updated with categoryId, difficulty, importance
- ✅ No validation errors

### 2. Category Assignment Verification

**Check Database:**
```sql
-- Verify concepts have categoryId
SELECT c.concept, c.categoryId, cat.name as category_name
FROM "ConceptCard" c
LEFT JOIN "Category" cat ON c."categoryId" = cat.id
WHERE c.concept IN (
  'Artificial Intelligence vs Traditional Software',
  'Types of AI Systems (Rule-Based, ML, Generative)',
  'AI System vs AI Model vs AI Capability',
  'Autonomy and Decision-Making in AI Systems'
);
```

**Expected:**
- All Level 1 concepts have categoryId set
- Categories match: AI Fundamentals, Governance Principles, Governance Structures & Roles

### 3. LevelCategoryCoverage Enforcement

**Check Database:**
```sql
-- Verify Level 1 category coverage
SELECT lcc."levelNumber", c.name as category, lcc."coverageType"
FROM "LevelCategoryCoverage" lcc
JOIN "Category" c ON lcc."categoryId" = c.id
WHERE lcc."levelNumber" = 1
ORDER BY c.name;
```

**Expected:**
- Level 1 has INTRODUCED coverage for:
  - AI Fundamentals
  - Governance Principles
  - Governance Structures & Roles

### 4. Runtime Exam Generation Hooks

**Verify API Routes Exist:**
- ✅ `app/api/challenges/[level]/start/route.ts` - Generates exam at runtime
- ✅ `app/api/challenges/[level]/submit/route.ts` - Handles submission

**Check Implementation:**
- Exam generation should call ChatGPT API with composed prompt
- Prompt should include:
  - Global Base Exam Prompt
  - Level/Category examSystemPrompt
  - Runtime parameters (difficulty, questionCount, timeLimit)
  - Explicit concept list

### 5. Category Exam Gating Logic

**Test Flow:**
1. User attempts to access category exam
2. System checks `UserCategoryProgress.status`
3. Status should be:
   - `LOCKED` - Category not yet introduced
   - `AVAILABLE` - Category introduced, exam available
   - `PASSED` - Category exam passed

**Implementation Check:**
- Category exams unlock based on LevelCategoryCoverage
- User must pass category exam before level exam (if required)
- Status updates correctly after passing

### 6. Level Exam Gating Logic

**Test Flow:**
1. User attempts to access Level 1 exam
2. System checks:
   - Level 1 unlocked? (should be unlocked by default)
   - Previous level passed? (N/A for Level 1)
   - Required category exams passed? (check LevelCategoryCoverage)

**Implementation Check:**
- Level 1 should be unlocked by default
- Level N+1 unlocks when Level N passed
- Boss levels (10, 20, 30, 40) gate super-level progression

### 7. Boss Gating Scaffolding (Level 10 Stub)

**Test:**
- Level 10 marked as `isBoss: true`
- Level 10 exam prompt includes boss exam rules
- Level 11 requires Level 10 boss exam passed

## What NOT to Do

❌ **Do NOT pre-generate Category exams**
❌ **Do NOT pre-generate Level exams**
❌ **Do NOT hardcode MCQs into database**
❌ **Do NOT seed Exam records**

## Runtime Exam Generation Flow

### When User Starts Exam Attempt

1. **User clicks "Start Exam"**
   - API: `POST /api/challenges/[level]/start`
   - Or: `POST /api/exams/category/[categoryId]/start`

2. **System Generates Exam Dynamically**
   - Fetch `examSystemPrompt` from Category or Challenge
   - Compose full prompt:
     ```
     EXAM_BASE_PROMPT
     + Category/Level examSystemPrompt
     + Runtime parameters
     + Concept list
     ```
   - Call ChatGPT API to generate questions
   - Store prompt snapshot in `Exam.systemPromptSnapshot`
   - Store generated questions in `Exam.questions` (JSON)

3. **Create ExamAttempt Record**
   - `ExamAttempt.examId` → links to generated Exam
   - `ExamAttempt.startedAt` → timestamp
   - Return questions to client

4. **User Submits Answers**
   - API: `POST /api/challenges/[level]/submit`
   - Grade answers
   - Update `ExamAttempt.score`, `ExamAttempt.pass`
   - Update `UserLevelProgress` or `UserCategoryProgress`
   - Award points, badges, unlock next level/category

## Database Schema for Runtime Exams

### Exam Model (Unified)
```prisma
model Exam {
  id                   String     @id @default(cuid())
  type                 ExamType   // CATEGORY or LEVEL
  status               ExamStatus @default(DRAFT)
  
  categoryId           String?
  levelNumber          Int?
  
  systemPromptSnapshot String     @db.Text  // Snapshot of prompt used
  generationConfig     Json       // {questionCount, difficulty, etc.}
  questions            Json       // Generated MCQs
  
  attempts             ExamAttempt[]
}
```

### ExamAttempt Model
```prisma
model ExamAttempt {
  id            String   @id @default(cuid())
  examId        String
  userId        String
  
  startedAt     DateTime @default(now())
  submittedAt   DateTime?
  
  score         Float?
  pass          Boolean?
  
  answers       Json     // User's answers
  feedback      Json?    // Detailed feedback
  
  exam          Exam     @relation(...)
  user          User     @relation(...)
}
```

## Next Steps After Testing

Once runtime generation is confirmed working:

1. ✅ Generate exams dynamically on first attempt
2. ✅ Evaluate exam quality
3. ✅ Tune prompts if needed
4. ✅ Generate remaining levels (2-40)
5. ✅ Generate category exams as needed

## Testing Checklist

- [ ] Level 1 concepts imported successfully
- [ ] Category assignment verified
- [ ] LevelCategoryCoverage enforced
- [ ] Runtime exam generation hooks implemented
- [ ] Category exam gating logic working
- [ ] Level exam gating logic working
- [ ] Boss gating scaffolding in place
- [ ] No pre-generated exams in database
- [ ] Exam generation API calls ChatGPT correctly
- [ ] Prompt composition working correctly

