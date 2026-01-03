# Exam Generation & Mastery Exams Roadmap

## ✅ Completed

1. **Option Shuffling** ✅
   - Implemented and verified working
   - Prevents answer bias exploitation
   - Users see randomized option positions per attempt

2. **Exam Generation Files** ✅
   - `exam-generation-system-prompt.md` - System prompt for ChatGPT
   - `levels-concepts-mapping.json` - All 36 levels with 360 concepts
   - `exam-output-format.json` - JSON schema for regular exams
   - `boss-level-10-schema.json` - Boss Level 10 schema
   - `boss-level-20-schema.json` - Boss Level 20 schema
   - `boss-level-30-schema.json` - Boss Level 30 schema
   - `boss-level-40-schema.json` - Boss Level 40 schema
   - `exam-generation-instructions.md` - Instructions for ChatGPT
   - `exam-generation-answers.md` - Answers to implementation questions

3. **Analysis Tools** ✅
   - `scripts/analyze-exam-bias.ts` - Analyzes answer distribution bias
   - `scripts/test-shuffling.ts` - Tests option shuffling functionality

---

## 🎯 Phase 1: Critical (Do First)

### 1.1 Fix Null CategoryId Issue ⚠️ **BLOCKER**

**Problem:** 19 concepts have `categoryId: null` and `categoryName: "Unknown"`
- Blocks boss level generation (requires 2+ categories per question)
- Breaks category-based analytics
- Prevents proper coverage tracking

**Solution:**
1. Create script to backfill missing categories
2. Assign concepts to proper categories based on name/definition
3. Create "Unclassified" category bucket for truly ambiguous concepts

**Action Items:**
- [ ] Create `scripts/fix-missing-categories.ts`
- [ ] Run script to backfill categories
- [ ] Verify all concepts have valid categoryId
- [ ] Update `levels-concepts-mapping.json` if needed

**Estimated Time:** 1-2 hours

---

### 1.2 Generate Question Banks (External ChatGPT)

**Goal:** Pre-generate 2-3x questionCount per level for better UX and quality control

**Process:**
1. Use ChatGPT with provided files:
   - `exam-generation-system-prompt.md`
   - `levels-concepts-mapping.json`
   - `exam-output-format.json` (for regular levels)
   - `boss-level-X-schema.json` (for boss levels)

2. Generate in batches:
   - Regular levels (1-9, 11-19, 21-29, 31-39): 2-3x questionCount
   - Boss levels (10, 20, 30, 40): 2-3x questionCount

3. Validate each batch:
   - Answer distribution (~25% each: A, B, C, D)
   - Concept coverage (all concepts tested)
   - Category coverage (boss levels: 2+ categories per question)

**Action Items:**
- [ ] Generate Level 1-5 question banks (test batch)
- [ ] Validate answer distribution
- [ ] Generate remaining regular levels (6-9, 11-19, 21-29, 31-39)
- [ ] Generate boss levels (10, 20, 30, 40)
- [ ] Store JSON files per level

**Estimated Time:** 2-3 days (depending on ChatGPT generation speed)

---

### 1.3 Create Import Script

**Goal:** Import generated question banks into database

**Requirements:**
- Load JSON files per level
- Validate against schema
- Store in `Exam.questions` field
- Update `Exam.questionBankSize` field
- Handle existing exams (update vs. create)

**Action Items:**
- [ ] Create `scripts/import-question-banks.ts`
- [ ] Validate JSON against schema
- [ ] Import regular level banks
- [ ] Import boss level banks
- [ ] Verify imports in database

**Estimated Time:** 2-3 hours

---

### 1.4 Update Exam Start Endpoint

**Goal:** Select questions from pre-generated banks instead of generating on-demand

**Changes Needed:**
- Check if question bank exists
- Randomly select `questionCount` questions from bank
- Ensure even answer distribution when selecting
- Shuffle options (already implemented)
- Fallback to on-demand generation if bank missing

**Action Items:**
- [ ] Update `app/api/exams/[examId]/start/route.ts`
- [ ] Add question selection logic
- [ ] Add even distribution enforcement
- [ ] Test with imported banks
- [ ] Verify shuffling still works

**Estimated Time:** 2-3 hours

---

## 🚀 Phase 2: High Priority (For Production)

### 2.1 Concept-Level Progress Tracking

**Goal:** Track user progress at the concept level for better analytics and remediation

**Schema Addition:**
```prisma
model UserConceptProgress {
  id            String   @id @default(cuid())
  userId        String
  conceptId     String
  timesSeen     Int      @default(0)
  timesCorrect  Int      @default(0)
  timesIncorrect Int    @default(0)
  masteryScore  Float    @default(0)
  isWeakArea    Boolean  @default(false)
  // ...
}
```

**Action Items:**
- [ ] Add `UserConceptProgress` model to schema
- [ ] Create migration
- [ ] Update exam submission to track concept progress
- [ ] Create analytics dashboard
- [ ] Add weak area identification

**Estimated Time:** 4-6 hours

---

### 2.2 Remediation System

**Goal:** Provide targeted remediation for failed exam attempts

**Features:**
- Identify weak concepts from failed questions
- Show concept cards for weak concepts
- Generate 3-5 targeted retry questions
- Allow retake after remediation

**Action Items:**
- [ ] Add `RemediationSession` model
- [ ] Create remediation flow
- [ ] Generate targeted questions
- [ ] Add UI for remediation
- [ ] Track remediation completion

**Estimated Time:** 6-8 hours

---

### 2.3 Enhanced Concept Cards

**Goal:** Add examples and counterexamples to improve question generation quality

**Schema Addition:**
```prisma
model ConceptCard {
  // ... existing fields
  counterExamples      String? @db.Text
  commonMisconceptions String? @db.Text
}
```

**Action Items:**
- [ ] Add fields to schema
- [ ] Create migration
- [ ] Populate fields (manual or AI-assisted)
- [ ] Update question generation to use new fields

**Estimated Time:** 4-6 hours

---

## 🔮 Phase 3: Future Enhancements

### 3.1 Analytics Dashboard
- Concept-level performance metrics
- Weak area identification
- Time spent analytics
- Difficulty calibration

### 3.2 Adaptive Learning
- Personalized learning paths
- Spaced repetition
- Concept mastery tracking

### 3.3 Quality Improvements
- Question difficulty calibration
- Explanation quality scoring
- User feedback on questions

---

## 📋 Immediate Next Steps (This Week)

### Priority 1: Fix Null Categories
```bash
# Create and run fix script
npx tsx scripts/fix-missing-categories.ts
```

### Priority 2: Generate Question Banks (External)
1. Use ChatGPT with provided files
2. Generate Level 1-5 as test batch
3. Validate and iterate
4. Generate remaining levels

### Priority 3: Import Script
```bash
# Create import script
npx tsx scripts/import-question-banks.ts
```

### Priority 4: Update Exam Start Endpoint
- Modify to use question banks
- Test end-to-end

---

## 🎯 Success Metrics

### Phase 1 Complete When:
- ✅ All concepts have valid categoryId
- ✅ Question banks generated for all 40 levels
- ✅ Banks imported into database
- ✅ Exam start uses banks instead of on-demand generation
- ✅ Answer distribution validated (~25% each)

### Phase 2 Complete When:
- ✅ Concept-level progress tracking implemented
- ✅ Remediation system functional
- ✅ Enhanced concept cards populated

---

## 📝 Notes

- **Option shuffling is working** - No changes needed
- **Current exams have bias** - But shuffling solves user-facing problem
- **Boss levels need 2+ categories** - Must fix null categories first
- **Pre-generation preferred** - Better UX, quality control, performance

---

## 🚨 Blockers

1. **Null categoryId** - Must fix before generating boss levels
2. **Question bank generation** - External ChatGPT process (time-consuming)
3. **Import process** - Need to validate and handle edge cases

---

**Last Updated:** Based on current implementation status
**Next Review:** After Phase 1 completion

