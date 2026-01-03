# Answers to Exam Generation Questions

This document provides answers to the questions raised about exam generation, based on the current codebase implementation and recommended best practices.

---

## Analysis Review

**I agree with most of the analysis**, with some clarifications:

✅ **Correct observations:**
- The three core files are properly structured
- Null/Unknown taxonomy is a real issue (19 concepts found with null categoryId)
- Boss level requirements are well-defined
- Answer distribution bias prevention is critical
- Explanation quality following AIGP standards is essential

⚠️ **Clarifications:**
- Exams are currently **generated on-demand** (not pre-generated), but this can be changed
- Scoring is currently **binary** (% correct), but weighted scoring infrastructure exists
- Level progression is **linear** (maxUnlockedLevel system exists)

---

## Answers to Questions

### Product & UX

#### Q1: Do you want levels to be strictly linear (must pass Level N to attempt N+1), or allow "testing out" if someone is already strong?

**Answer: Strictly linear progression**

**Current Implementation:**
- The codebase uses `maxUnlockedLevel` (default: 1) to control access
- Free users max at level 10, premium users can access up to their `maxUnlockedLevel`
- Levels must be passed sequentially

**Recommendation:** Keep linear progression for now because:
- Ensures foundational knowledge before advanced concepts
- Aligns with mastery-based learning philosophy
- Boss levels (10, 20, 30, 40) act as gates requiring integration of previous levels
- Can add "test out" feature later if needed (would require passing a comprehensive assessment)

**Implementation Note:** The `canAccessLevel` function in `lib/levels.ts` already enforces this.

---

#### Q2: Should failed levels show targeted remediation (mini-lesson + 3 retry questions) before a full retake?

**Answer: Yes, implement targeted remediation**

**Current Implementation:**
- Failed attempts are tracked in `ExamAttempt` table
- No remediation system exists yet

**Recommendation:** Implement remediation because:
- Improves learning outcomes
- Reduces frustration from repeated failures
- Aligns with adaptive learning best practices

**Proposed Implementation:**
1. On failure, identify weak concepts from `conceptIds` in failed questions
2. Show concept cards for failed concepts (already have `ConceptCard` model)
3. Generate 3-5 targeted retry questions focusing on weak concepts
4. Allow retake after remediation (with cooldown period)

**Schema Addition Needed:**
```prisma
model RemediationSession {
  id          String   @id @default(cuid())
  userId      String
  examId      String
  attemptId   String   // Failed attempt
  weakConcepts String[] // Concept IDs that need remediation
  status      String   // PENDING, IN_PROGRESS, COMPLETED
  createdAt   DateTime @default(now())
  completedAt DateTime?
}
```

---

### Content Governance

#### Q3: What's your stance on "Unknown" taxonomy items: fix upstream (preferred) or allow them but treat them as a separate category/domain?

**Answer: Fix upstream + create "Unclassified" bucket as fallback**

**Current Issue:**
- 19 concepts have `categoryId: null` and `categoryName: "Unknown"`
- This breaks boss level requirements (need 2+ categories per question)

**Recommendation:**
1. **Primary approach:** Fix upstream by assigning proper categories to all concepts
   - Run a script to backfill missing `categoryId` based on concept name/definition
   - Use domain experts to classify remaining ambiguous concepts

2. **Fallback approach:** Create an "Unclassified" category bucket
   - Create a real category: `{ id: "unclassified", name: "Unclassified", domainId: "domain-1" }`
   - Assign all null concepts to this bucket
   - This ensures boss level constraints can be enforced

**Implementation Script Needed:**
```typescript
// scripts/fix-missing-categories.ts
// 1. Find all concepts with null categoryId
// 2. Attempt to match by concept name/definition to existing categories
// 3. Assign remaining to "Unclassified" category
// 4. Update ConceptCard records
```

---

#### Q4: Do you want each concept to have examples / counterexamples (beyond the current definition) to support better scenario writing?

**Answer: Yes, enhance concept cards with examples**

**Current Implementation:**
- `ConceptCard` model already has `examples` field (optional, currently mostly null)
- Also has `scenarioQuestion` field (optional)

**Recommendation:** Populate these fields because:
- Improves question generation quality
- Provides context for scenario-based questions
- Helps AI generate more realistic governance situations

**Schema Enhancement:**
```prisma
model ConceptCard {
  // ... existing fields ...
  examples             String? @db.Text // Already exists
  counterExamples      String? @db.Text // NEW: What NOT to do
  scenarioQuestion     String? @db.Text // Already exists
  commonMisconceptions String? @db.Text // NEW: Common errors
}
```

**Action:** Add `counterExamples` and `commonMisconceptions` fields, then populate via:
- Manual curation by domain experts
- AI-assisted generation from definitions
- Extraction from existing exam explanations

---

### Exam Design + Scoring

#### Q5: For passingScore, is it strictly "% correct", or do you want weighted scoring (e.g., harder questions worth more)?

**Answer: Binary % correct for now, weighted scoring available for future**

**Current Implementation:**
- Scoring is binary: `score = (correctAnswers / totalQuestions) * 100`
- `passMark` is percentage-based (70% for regular, 75% for boss)
- Infrastructure exists for weighted scoring (`bossWeighting` config exists but not fully used)

**Recommendation:** 
- **Keep binary scoring** for simplicity and fairness
- **Use difficulty tags** (recall, apply, analyse, judgement) for analytics only
- **Consider weighted scoring** only if:
  - Users complain about unfairness
  - Analytics show difficulty imbalance
  - Need to differentiate mastery levels

**Current Code Reference:**
```typescript
// lib/exam-assessment.ts
scoringMethod: config.scoringMethod || "binary"
bossWeighting: config.bossWeighting || { multiConcept: 1.2 }
```

**Future Enhancement:** If implementing weighted scoring:
```typescript
const weights = {
  recall: 1.0,
  apply: 1.2,
  analyse: 1.5,
  judgement: 2.0
};
```

---

#### Q6: Will you allow partial credit for multi-concept boss questions, or always binary correct/incorrect?

**Answer: Always binary correct/incorrect**

**Reasoning:**
- Certification exams use binary scoring (AIGP standard)
- Partial credit adds complexity without clear benefit
- Multi-concept questions test integration, not partial knowledge
- Binary scoring is simpler to explain and defend

**Current Implementation:** Binary scoring is enforced in `lib/exam-assessment.ts`

---

### Generation Pipeline

#### Q7: Are you generating questions on-demand per user attempt, or will you pre-generate a bank per level and rotate?

**Answer: Currently on-demand, recommend pre-generating banks**

**Current Implementation:**
- Questions are generated **on-demand** when user starts exam (`app/api/exams/[examId]/start/route.ts`)
- Each attempt gets a fresh set of questions
- Questions are stored in `Exam.questions` JSON field

**Recommendation: Pre-generate question banks** because:
- **Consistency:** All users see same questions for same level
- **Quality control:** Can review and curate questions before release
- **Performance:** Faster exam start (no API call delay)
- **Analytics:** Can track question difficulty and performance
- **Cost:** Reduces ChatGPT API calls

**Proposed Architecture:**
1. **Pre-generation:** Run script to generate 2-3x questionCount per level
   - Level 1: Generate 20-30 questions (need 10)
   - Level 10 (Boss): Generate 30-40 questions (need 12)
2. **Storage:** Store in `Exam.questions` as question bank array
3. **Selection:** Randomly select `questionCount` questions per attempt
4. **Rotation:** Track which questions were used, rotate to ensure coverage

**Schema Enhancement:**
```prisma
model Exam {
  // ... existing fields ...
  questions        Json // Array of all questions in bank
  questionBankSize Int  @default(0) // Number of questions in bank
  lastRegenerated  DateTime? // When bank was last refreshed
}
```

**Migration Path:**
1. Generate question banks for all 36 levels (using your ChatGPT tool)
2. Store JSON files per level
3. Import into database
4. Update exam start endpoint to select from bank instead of generating

---

#### Q8: Do you want to enforce the "even distribution of A/B/C/D correct answers" per attempt or only across the bank?

**Answer: Enforce per attempt (strict) + validate across bank (quality control)**

**Current Implementation:**
- System prompt requires even distribution
- Option shuffling randomizes display order (prevents pattern recognition)
- No validation of distribution in generated questions

**Recommendation:**
1. **Per attempt:** Enforce strict even distribution when selecting from bank
   - If selecting 10 questions, ensure 2-3 correct answers per option (A, B, C, D)
   - This prevents users from exploiting patterns

2. **Across bank:** Validate distribution in pre-generated banks
   - Ensure bank has roughly equal distribution (e.g., 25% each)
   - Flag banks with >30% bias for regeneration

**Implementation:**
```typescript
function selectQuestionsWithEvenDistribution(
  questionBank: Question[],
  count: number
): Question[] {
  // Group by correctOptionId
  const byOption = {
    A: questionBank.filter(q => q.correctOptionId === 'A'),
    B: questionBank.filter(q => q.correctOptionId === 'B'),
    C: questionBank.filter(q => q.correctOptionId === 'C'),
    D: questionBank.filter(q => q.correctOptionId === 'D'),
  };
  
  // Select evenly
  const perOption = Math.floor(count / 4);
  const remainder = count % 4;
  
  const selected = [
    ...byOption.A.slice(0, perOption + (remainder > 0 ? 1 : 0)),
    ...byOption.B.slice(0, perOption + (remainder > 1 ? 1 : 0)),
    ...byOption.C.slice(0, perOption + (remainder > 2 ? 1 : 0)),
    ...byOption.D.slice(0, perOption),
  ];
  
  // Shuffle to randomize order
  return shuffleArray(selected);
}
```

---

### Analytics & Personalization

#### Q9: Do you want progress tracking at the concept ID level (recommended, since your schema already includes conceptIds)?

**Answer: Yes, implement concept-level tracking**

**Current Implementation:**
- `UserLevelProgress` tracks level completion
- `UserCategoryProgress` tracks category completion
- No concept-level tracking exists

**Recommendation:** Add concept-level tracking because:
- Enables targeted remediation
- Supports adaptive learning paths
- Provides granular analytics
- Schema already includes `conceptIds` in questions

**Schema Addition:**
```prisma
model UserConceptProgress {
  id            String   @id @default(cuid())
  userId        String
  conceptId     String
  concept       ConceptCard @relation(fields: [conceptId], references: [id])
  
  // Mastery metrics
  timesSeen     Int      @default(0)
  timesCorrect  Int      @default(0)
  timesIncorrect Int    @default(0)
  masteryScore  Float    @default(0) // 0-1 scale
  lastSeen      DateTime?
  lastCorrect   DateTime?
  
  // Weak area tracking
  isWeakArea    Boolean  @default(false)
  flaggedAt     DateTime?
  
  user          User     @relation(fields: [userId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([userId, conceptId])
  @@index([userId])
  @@index([conceptId])
}
```

**Update Logic:** After exam submission, update `UserConceptProgress` for each `conceptId` in answered questions.

---

#### Q10: Should the system adapt timeLimit or difficulty if a user consistently performs fast/slow?

**Answer: No adaptive timeLimit, but track for analytics**

**Reasoning:**
- **Time limits** should be consistent for fairness and certification validity
- **Difficulty** should match level (not adapt per user)
- **Analytics** should track time spent for insights

**Recommendation:**
- Keep fixed `timeLimit` per level (as defined in `levels-concepts-mapping.json`)
- Track `timeSpent` in `ExamAttempt` (already implemented)
- Use analytics to:
  - Identify levels that are too easy/hard
  - Adjust time limits for future levels (not per-user)
  - Show users their pace vs. average

**Current Implementation:**
- `timeSpent` is already tracked in `ExamAttempt`
- `timeLimit` is fixed per level
- No adaptive logic exists (good!)

---

## Implementation Priority

### Phase 1: Critical (Before Exam Generation)
1. ✅ Fix null categoryId issue (create Unclassified bucket)
2. ✅ Validate answer distribution in generated questions
3. ✅ Ensure all concepts have proper category assignments

### Phase 2: High Priority (For Production)
1. Pre-generate question banks (2-3x questionCount per level)
2. Implement concept-level progress tracking
3. Add remediation system for failed attempts

### Phase 3: Nice to Have (Future Enhancements)
1. Add counterExamples and commonMisconceptions to ConceptCard
2. Implement weighted scoring (if needed)
3. Add adaptive timeLimit analytics (not adaptation)

---

## Next Steps for Exam Generation

1. **Fix taxonomy issues:**
   ```bash
   # Run script to fix null categories
   npx tsx scripts/fix-missing-categories.ts
   ```

2. **Generate question banks:**
   - Use your ChatGPT tool with the three files provided
   - Generate 2-3x questionCount per level
   - Validate answer distribution (should be ~25% each)
   - Store as JSON files

3. **Import question banks:**
   - Create import script to load JSON into database
   - Update exam start endpoint to select from bank

4. **Test and validate:**
   - Verify boss levels have 2+ categories per question
   - Verify answer distribution is even
   - Verify all concepts are covered

---

## Summary

The analysis is accurate and the questions are well-thought-out. The answers above provide a clear implementation path forward. The most critical items are:

1. **Fix null categories** (blocks boss level generation)
2. **Pre-generate question banks** (better UX, quality control)
3. **Enforce even answer distribution** (prevents bias)

All other items can be implemented incrementally as the platform evolves.

