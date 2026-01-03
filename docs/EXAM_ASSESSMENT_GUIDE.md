# Exam Assessment Guide - Deterministic Scoring

## Overview

This guide documents the deterministic exam assessment system. **ChatGPT is NEVER used for scoring** - only for question generation.

## Key Principles

### 1. Deterministic Scoring

- All scoring happens server-side
- Compare `userAnswer.selectedOptionId` with `question.correctOptionId`
- Score is computed deterministically: `(correctCount / totalQuestions) * 100`
- Pass/fail determined by: `percentage >= passMark`

### 2. Immutable Audit Records

- Every exam attempt creates a **new** `ExamAttempt` row
- Past attempts are **never overwritten or recalculated**
- `attemptNumber` increments per user per exam
- All attempts are preserved for auditability

### 3. Progress Tracking Rules

#### UserCategoryProgress
- `bestScore`: Stores highest score across all attempts
- `passedAt`: Set on **first successful attempt only**
- Failed later attempts **do not revoke** a pass
- Status: `LOCKED` → `AVAILABLE` → `PASSED` (one-way progression)

#### UserLevelProgress
- `bestScore`: Stores highest score across all attempts
- `passedAt`: Set on **first successful attempt only**
- Failed later attempts **do not revoke** a pass
- `attemptsCount`: Increments on every attempt
- Status: `LOCKED` → `AVAILABLE` → `PASSED` (one-way progression)

## Assessment Configuration

Assessment rules are stored in `Exam.generationConfig`:

```json
{
  "questionCount": 10,
  "passMark": 70,
  "scoringMethod": "binary",
  "bossWeighting": {
    "Q1": 1.0,
    "Q2": 1.5,
    "Q3": 1.0
  }
}
```

### Fields

- `questionCount`: Number of questions in exam
- `passMark`: Passing percentage (0-100)
- `scoringMethod`: Currently only "binary" supported
- `bossWeighting`: Optional per-question weights for boss exams

## API Endpoints

### POST `/api/exams/[examId]/start`

Starts a new exam attempt:
- Creates `ExamAttempt` record
- Returns questions (without correct answers)
- Sets `attemptNumber` automatically

**Request:**
```json
{}
```

**Response:**
```json
{
  "attemptId": "exam_attempt_id",
  "exam": {
    "id": "exam_id",
    "type": "LEVEL",
    "questionCount": 10
  },
  "questions": [
    {
      "id": "Q1",
      "stem": "Question text...",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ]
    }
  ],
  "attemptNumber": 1
}
```

### POST `/api/exams/[examId]/submit`

Submits exam answers and gets results:
- Assesses answers deterministically
- Updates `ExamAttempt` with score and pass/fail
- Updates `UserCategoryProgress` or `UserLevelProgress`
- Returns detailed feedback

**Request:**
```json
{
  "answers": [
    {
      "questionId": "Q1",
      "selectedOptionId": "B",
      "timeSpent": 45
    }
  ],
  "timeSpent": 600
}
```

**Response:**
```json
{
  "attempt": {
    "id": "exam_attempt_id",
    "score": 85.0,
    "pass": true,
    "attemptNumber": 1
  },
  "results": {
    "score": 8,
    "percentage": 85.0,
    "pass": true,
    "totalQuestions": 10,
    "correctCount": 8,
    "answerFeedback": [
      {
        "questionId": "Q1",
        "selectedOptionId": "B",
        "correctOptionId": "B",
        "isCorrect": true,
        "rationale": "Correct because..."
      }
    ]
  }
}
```

## Assessment Flow

1. **User starts exam** → `POST /api/exams/[examId]/start`
   - Creates `ExamAttempt` with `attemptNumber`
   - Returns questions (no correct answers)

2. **User answers questions** → Client-side only
   - Timer running
   - Answers stored locally

3. **User submits** → `POST /api/exams/[examId]/submit`
   - Server fetches exam questions
   - Compares answers with `correctOptionId`
   - Computes score deterministically
   - Determines pass/fail
   - Updates `ExamAttempt` (immutable record)
   - Updates progress records

4. **Results returned** → Client displays feedback

## Scoring Logic

```typescript
// Pseudo-code
correctCount = 0
for each question:
  if userAnswer.selectedOptionId === question.correctOptionId:
    correctCount++

percentage = (correctCount / totalQuestions) * 100
pass = percentage >= config.passMark
```

## Progress Update Logic

### First Attempt
- Create progress record if doesn't exist
- Set `bestScore` = current score
- Set `passedAt` = now if passed
- Set `status` = PASSED if passed, else AVAILABLE

### Subsequent Attempts
- Update `bestScore` = max(existing bestScore, current score)
- Set `passedAt` = now **only if** passed AND `passedAt` is null
- **Never revoke** `passedAt` if already set
- Status remains PASSED if already passed, even if current attempt fails

## Example Scenarios

### Scenario 1: First Attempt Pass
```
Attempt 1: Score 75%, Pass ✅
→ bestScore = 75
→ passedAt = now
→ status = PASSED
```

### Scenario 2: First Attempt Fail, Second Pass
```
Attempt 1: Score 65%, Fail ❌
→ bestScore = 65
→ passedAt = null
→ status = AVAILABLE

Attempt 2: Score 72%, Pass ✅
→ bestScore = 72 (updated)
→ passedAt = now (set)
→ status = PASSED
```

### Scenario 3: Pass, Then Lower Score
```
Attempt 1: Score 85%, Pass ✅
→ bestScore = 85
→ passedAt = now
→ status = PASSED

Attempt 2: Score 70%, Pass ✅
→ bestScore = 85 (unchanged, higher)
→ passedAt = now (unchanged, already set)
→ status = PASSED (unchanged)
```

### Scenario 4: Pass, Then Fail
```
Attempt 1: Score 75%, Pass ✅
→ bestScore = 75
→ passedAt = now
→ status = PASSED

Attempt 2: Score 60%, Fail ❌
→ bestScore = 75 (unchanged)
→ passedAt = now (unchanged, NOT revoked)
→ status = PASSED (unchanged, NOT revoked)
```

## Implementation Status

✅ **Completed:**
- Deterministic assessment logic (`lib/exam-assessment.ts`)
- Exam submission API (`/api/exams/[examId]/submit`)
- Exam start API (`/api/exams/[examId]/start`)
- Progress update logic (category and level)
- Immutable ExamAttempt records

⏭️ **Next Steps:**
- Implement ChatGPT API integration for exam generation
- Add exam generation to `/api/exams/[examId]/start`
- Test with Level 1 exam
- Implement gating logic (category exams required before level exams)

