# Exam Assessment Architecture - ChatGPT Recommendations

## ✅ Acknowledged Understanding

This document captures the authoritative recommendations for exam assessment architecture, ensuring separation of responsibilities, auditability, and deterministic scoring.

---

## 1. Core Principle (MUST FOLLOW)

### Separation of Responsibilities

- **ChatGPT**: Generates MCQs only (questions + correctOptionId + rationales)
- **Backend**: Scores attempts deterministically, sets pass/fail, applies gating, enforces cooldowns
- **AI NEVER scores and NEVER determines pass/fail**

This is essential for auditability and trust.

---

## 2. Schema Recommendations

### 2.1 Add AttemptStatus Enum

```prisma
enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  EVALUATED
  EXPIRED
}
```

### 2.2 Exam Model (Snapshot Approach - Recommended)

**Option A (Recommended, audit-grade)**: Create a new Exam per attempt (snapshot exam)

Each Exam stores:
- `systemPromptSnapshot` - Full prompt used
- `generationConfig` - Assessment parameters
- `questions` - Including correctOptionId (server-side only)

Each attempt references a unique Exam, making every attempt fully reproducible and immutable.

**generationConfig must include assessment parameters:**
```json
{
  "questionCount": 10,
  "passMark": 70,
  "scoringMethod": "binary",
  "negativeMarking": false,
  "difficulty": "beginner|intermediate|advanced|expert",
  "isBoss": true|false,
  "bossWeighting": { "multiConcept": 1.2 }
}
```

This is the single source of truth for assessment rules.

### 2.3 ExamAttempt Model Updates

Ensure attempts are immutable after submit:

```prisma
model ExamAttempt {
  id            String        @id @default(cuid())
  examId        String
  userId        String

  attemptNumber Int           @default(1)
  status        AttemptStatus @default(IN_PROGRESS)

  startedAt     DateTime      @default(now())
  submittedAt   DateTime?
  evaluatedAt   DateTime?

  score         Float?
  pass          Boolean?

  answers       Json          // { answers: [{questionId, selectedOptionId}] }
  feedback      Json?         // Computed deterministically

  exam          Exam          @relation(fields: [examId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([examId])
  @@unique([examId, userId, attemptNumber])
}
```

**Cooldown support** (optional field):
```prisma
nextEligibleAt DateTime?  // Optional, can compute from attempt history
```

### 2.4 Progress Tables (Confirm Behavior)

**UserCategoryProgress:**
- `bestScore` = max historical score
- `passedAt` = first time passed; never unset

**UserLevelProgress:**
- Same semantics
- Boss passes never revoked

### 2.5 LevelCategoryCoverage Integration

Import script must validate that every concept assigned to a level has a category present in `LevelCategoryCoverage` for that level (I/P/A).

---

## 3. Question Payload Requirements

### 3.1 Store Answer Keys (Server-Side)

Questions MUST include `correctOptionId` (for deterministic scoring). Do NOT send this to client.

### 3.2 Recommended Metadata for Feedback & Remediation

Add these fields per question in stored JSON:

```json
{
  "id": "Q1",
  "stem": "...",
  "options": [{ "id":"A","text":"..." }, ...],
  "correctOptionId": "B",
  "conceptIds": ["L4-C03", "L4-C01"],
  "categoryId": "cat_xxx",
  "difficultyTag": "apply|recall|judgement"
}
```

**Why this matters:**
- `conceptIds` → Compute weak concepts deterministically
- `categoryId` → Compute weak categories
- `difficultyTag` → Validate boss integration (more judgement questions)

### 3.3 Prompt Requirement

When asking ChatGPT to generate the exam, provide:
- Explicit list of allowed conceptIds/names
- Request that each question includes `conceptIds`

---

## 4. Assessment Workflow (Authoritative)

### 4.1 Attempt Lifecycle

**Start Attempt:**
1. Enforce cooldown
2. Generate exam (ChatGPT)
3. Persist Exam snapshot (prompt + config + questions)
4. Create ExamAttempt `status=IN_PROGRESS`

**Submit Attempt:**
1. Validate attempt is `IN_PROGRESS`
2. Deterministically score (backend)
3. Store score/pass + feedback
4. Mark attempt `EVALUATED` (immutable thereafter)
5. Update progress + gating

**Retries:**
- New attempt = new row
- Old attempts never overwritten

---

## 5. Cooldown + Retry Policy (v1 Locked)

### Category Exams
- Unlimited attempts
- Cooldown based on consecutive fails:
  - Fail #1 → 0 min
  - Fail #2 → 5 min
  - Fail #3+ → 15 min

### Level Exams (Non-Boss)
- Unlimited attempts
- Cooldown:
  - Fail #1 → 5 min
  - Fail #2+ → 15 min

### Boss Exams (10/20/30/40)
- Unlimited attempts (for now)
- Cooldown:
  - Fail #1 → 30 min
  - Fail #2 → 12 hours
  - Fail #3+ → 24 hours

**Optional UX gate (recommended):**
- After any boss fail, require "prep step" (review weak concepts OR short prep quiz) before starting another boss attempt

**Implementation:**
- Enforce cooldown server-side
- If user starts too early, return 429 (or 400) with `nextEligibleAt`

---

## 6. Boss Exam Rules (Authoritative)

### Boss Levels: 10 / 20 / 30 / 40

**Boss must be passed to unlock next super-level:**
- Level 10 → unlock level 11
- Level 20 → unlock level 21
- Level 30 → unlock level 31
- Level 40 → completion gate

**Boss Exam Scope:**
- Level 10: all concepts in levels 1–10
- Level 20: 11–20
- Level 30: 21–30
- Level 40: 31–40 (or optionally whole curriculum; decide later)

**Boss Question Design Enforcement (at generation time):**
- ≥ 60% questions must involve:
  - 2+ concepts AND
  - 2+ categories
- (Validate using `conceptIds` + concept→category mapping)

**Boss Pass Marks (Recommended):**
- L10: 75%
- L20: 75–80%
- L30: 80%
- L40: 80–85%
- (Or keep 75% universal if you want simplicity)

**Boss Scoring:**
- Deterministic
- Optional weighting:
  - Single-concept question weight = 1
  - Multi-concept question weight = 1.2 (configurable)

---

## 7. Gating Logic (Must Be Deterministic)

### Unlock Level N+1

User must have:
1. Level N exam passed (`UserLevelProgress(N)=PASSED`)
2. All categories marked `INTRODUCED` in Level N are passed (`UserCategoryProgress(category)=PASSED`)

### Unlock Next Super-Level

Additionally must pass boss:
- Level 10 → allows entering 11
- Level 20 → 21
- Level 30 → 31

---

## 8. API Hooks (Minimal and Clear)

### 8.1 Start Exam Attempt

**POST `/api/exams/start`**

**Request (Category):**
```json
{
  "type": "CATEGORY",
  "categoryId": "cat_...",
  "difficulty": "beginner",
  "questionCount": 10
}
```

**Request (Level):**
```json
{
  "type": "LEVEL",
  "levelNumber": 4,
  "difficulty": "beginner",
  "questionCount": 10
}
```

**Response:**
```json
{
  "attemptId": "att_...",
  "examId": "exam_...",
  "passMark": 70,
  "questions": [
    { "id":"Q1", "stem":"...", "options":[{"id":"A","text":"..."}, ...] }
  ],
  "nextEligibleAt": null
}
```

**If cooldown applies:**
```json
{
  "error": "COOLDOWN_ACTIVE",
  "nextEligibleAt": "2025-12-13T10:30:00Z"
}
```

### 8.2 Submit Exam Attempt

**POST `/api/exams/submit`**

**Request:**
```json
{
  "attemptId": "att_...",
  "answers": [
    { "questionId":"Q1", "selectedOptionId":"B" }
  ]
}
```

**Response:**
```json
{
  "pass": true,
  "scorePercent": 80,
  "correctCount": 8,
  "totalQuestions": 10,
  "weakConceptIds": ["L4-C03", "L4-C09"],
  "nextUnlocks": {
    "levels": [5],
    "categories": ["cat_..."]
  }
}
```

---

## 9. Deterministic Scoring Rules (Server-Side)

### Base Scoring (Binary)
- Correct → 1
- Incorrect/unanswered → 0
- `scorePercent = correct/total * 100`

### Optional Weighting (Boss)
- If boss and question has ≥2 `conceptIds`:
  - `weight = config.bossWeighting.multiConcept` (default 1.2)
  - `weightedScorePercent = sum(correct*weight)/sum(weights)*100`

---

## 10. Import Script Updates

### Required Improvements

When creating ConceptCard, set:
- `name`
- `categoryId` (resolved from canonical Category list)
- Placeholder `shortDefinition="TBD"`
- Placeholder `boundary="TBD"`

**Enforce no accidental repeats:**
- If concept appears in multiple levels but `isSpiralLearning=false` → fail

**Validate coverage:**
- `concept.categoryId` must exist in `LevelCategoryCoverage` for that level

---

## 11. Implementation Checklist (Ordered)

### Assessment Services
- [ ] `startExamAttempt()` - Generate exam, create attempt
- [ ] `submitExamAttempt()` - Deterministic scoring

### Cooldown Enforcement
- [ ] Compute consecutive fails per target
- [ ] Enforce policy table above

### Attempt Immutability
- [ ] Once `status=EVALUATED`, reject updates

### Progress Updates
- [ ] Update `UserCategoryProgress` / `UserLevelProgress`
- [ ] Unlock next level/categories

### Boss Gating
- [ ] Block next super-level until boss pass

### Question Metadata
- [ ] Include `conceptIds` in generation prompt
- [ ] Store them in questions JSON

---

## 12. Key Takeaways

1. **ChatGPT generates, backend scores** - Never let AI determine pass/fail
2. **Immutable attempts** - Every attempt is a new row, never overwritten
3. **Snapshot exams** - Each attempt gets its own Exam record (audit-grade)
4. **Deterministic scoring** - Binary or weighted, always server-side
5. **Cooldown enforcement** - Server-side validation prevents early retries
6. **Boss gates** - Strict progression control at super-level boundaries
7. **Question metadata** - Include `conceptIds` for weak-area analysis

---

## Status

✅ **Acknowledged and understood**

Ready to proceed with Level 7 concepts after implementing these recommendations.

