# QA Harness Status Report

## Step 1: Baseline QA Harness Results

### Current Status

**Level Exams:**
- ✅ **Level 1**: PASSED (all 3 generations) ✅
- ❌ **Levels 2-9**: FAILED (1 error each) - **Concepts not imported**

**Category Exams:**
- ❌ Multiple failures - **Needs investigation after level imports**

### Root Cause

Levels 2-9 have CSV files (`data/level-2-concepts.csv` through `data/level-9-concepts.csv`) but **concepts are not imported into the database**.

The QA harness correctly identifies this:
```
No ConceptCard records found for Level X concepts
```

### Required Action

**Import Levels 2-9 concepts before running full QA harness:**

```bash
# Import each level
npx tsx scripts/import-level-mapping.ts data/level-2-concepts.csv
npx tsx scripts/import-level-mapping.ts data/level-3-concepts.csv
npx tsx scripts/import-level-mapping.ts data/level-4-concepts.csv
npx tsx scripts/import-level-mapping.ts data/level-5-concepts.csv
npx tsx scripts/import-level-mapping.ts data/level-6-concepts.csv
npx tsx scripts/import-level-mapping.ts data/level-7-concepts.csv
npx tsx scripts/import-level-mapping.ts data/level-8-concepts.csv
npx tsx scripts/import-level-mapping.ts data/level-9-concepts.csv
```

Or batch import:
```bash
for level in {2..9}; do
  npx tsx scripts/import-level-mapping.ts data/level-${level}-concepts.csv
done
```

### Expected After Import

Once concepts are imported:
- ✅ Levels 1-9: Should PASS (all 3 generations each)
- ✅ Category Exams: Should PASS (all 3 generations each)
- ✅ No constraint conflicts

## Step 2: Spot-Check Payload Correctness

**Status:** ⏸️ Pending concept imports

Once imports complete, we'll verify:
- Level exam: 1 conceptId per question, all concepts covered
- Category exam: conceptIds in category scope
- Boss exam: canonical IDs, scope compliance, frequency ≤4

## Step 3: Production Gating Behavior

**Status:** ⏸️ Pending concept imports

Once imports complete, we'll test:
- Category exam → fail → cooldown → retry
- Pass category exams → unlock Level exam
- Pass Level exam → unlock Level 2

## Next Steps

1. **Import Levels 2-9 concepts** (required)
2. **Re-run QA harness** to get baseline
3. **Spot-check payloads** for correctness
4. **Test production gating** end-to-end

