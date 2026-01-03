# Step 7 Status - Runtime Exam Generation Setup

## Current Status

### ✅ Completed
1. **Schema Updated** - All new models and enums added
2. **Database Pushed** - Schema changes applied to database
3. **Challenges Seeded** - All 40 levels created with exam prompts
4. **Level 1 Concepts CSV** - Ready for import

### ⚠️ Current Issue

**Problem:** Level 1 concepts don't exist in the database yet.

The import script expects concepts to already exist in `ConceptCard` table, but Level 1 concepts are new and haven't been created yet.

**Solution Options:**

1. **Create concepts first** (recommended):
   - Use existing `import-concepts.ts` script to create ConceptCard records
   - Then run `import-level-mapping.ts` to assign them to levels

2. **Modify import script** to create concepts if they don't exist

## Next Steps

### Option 1: Create Concepts First

```bash
# Step 1: Create ConceptCard records for Level 1 concepts
# (Need to prepare a CSV with concept definitions)

# Step 2: Import level mappings
npm run import:level-mapping data/level-1-concepts.csv
```

### Option 2: Modify Import Script

Update `scripts/import-level-mapping.ts` to:
- Create ConceptCard records if they don't exist
- Use conceptName as the concept field
- Set basic required fields (definition, etc.)

## Runtime Exam Generation Architecture

### ✅ What's Ready

1. **Prompt System:**
   - `EXAM_BASE_PROMPT` - Global base prompt (locked)
   - `CATEGORY_EXAM_PROMPT_TEMPLATE` - Category-specific template
   - `LEVEL_EXAM_PROMPT_TEMPLATE` - Level-specific template
   - Helper functions to compose prompts

2. **Database Schema:**
   - `Category.examSystemPrompt` - Stores category prompts
   - `Challenge.examSystemPrompt` - Stores level prompts
   - `Exam` model - Stores generated exams
   - `ExamAttempt` model - Stores user attempts

3. **Seed Scripts:**
   - `seed-domains-categories.ts` - Creates categories with placeholder prompts
   - `seed-challenges.ts` - Creates levels with exam prompts
   - `seed-level-category-coverage.ts` - Creates coverage map

### ⏭️ What Needs Implementation

1. **Runtime Exam Generation API:**
   - Modify `/api/challenges/[level]/start` to generate exams dynamically
   - Call ChatGPT API with composed prompt
   - Store generated exam in `Exam` table
   - Return questions to client

2. **Gating Logic:**
   - Category exam gating (LOCKED → AVAILABLE → PASSED)
   - Level exam gating (unlock requirements)
   - Boss exam gating (Level 10, 20, 30, 40)

3. **Concept Creation:**
   - Create Level 1 ConceptCard records
   - Then import level mappings

## Testing Checklist

- [ ] Create Level 1 ConceptCard records
- [ ] Import Level 1 concepts to levels
- [ ] Verify category assignment
- [ ] Verify LevelCategoryCoverage enforcement
- [ ] Implement runtime exam generation API
- [ ] Test category exam gating
- [ ] Test level exam gating
- [ ] Test boss exam scaffolding

## Important Notes

❌ **DO NOT:**
- Pre-generate exams
- Seed Exam records
- Hardcode MCQs

✅ **DO:**
- Generate exams at runtime
- Store prompt snapshots
- Store generated questions in Exam.questions (JSON)
- Create ExamAttempt records on submission

