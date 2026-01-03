# Schema Upgrade Guide - Progressive Coverage System

This guide documents the major schema upgrade to support progressive category coverage, canonical taxonomy, and mandatory exam gating.

## Overview

The upgrade implements:
1. **Canonical Taxonomy**: Domain + Category tables (no free-text categories)
2. **Progressive Coverage**: INTRODUCED → PRACTICED → ASSESSED progression
3. **No Accidental Repeats**: Concepts only repeat if explicitly marked as spiral learning
4. **Mandatory Exams**: Category exams and Level exams are required
5. **Boss Exams**: Capstone exams at levels 10/20/30/40 gate progression
6. **Unified Exam System**: Single Exam model for both category and level exams

## Migration Steps

### Step 1: Update Schema

The schema has been updated with:
- New enums (SuperLevelGroup, ExamType, ExamStatus, ProgressStatus, CoverageType)
- Domain and Category models
- Updated ConceptCard (with categoryId, legacy fields kept)
- Updated Challenge (with boss flags, exam prompts)
- LevelCategoryCoverage model
- Unified Exam and ExamAttempt models
- UserCategoryProgress model

### Step 2: Generate Prisma Client

```bash
npm run db:generate
```

### Step 3: Push Schema to Database

```bash
npm run db:push
```

**Note**: This will add new tables but won't delete old data. Legacy fields are kept for backward compatibility.

### Step 4: Seed Domains and Categories

```bash
npm run seed:domains-categories
```

**Important**: Update `scripts/seed-domains-categories.ts` with your actual category names (9 per domain).

### Step 5: Seed Challenges

```bash
npm run seed:challenges
```

This creates/updates all 40 challenges with boss flags and exam prompts.

### Step 6: Seed LevelCategoryCoverage

```bash
npm run seed:coverage
```

**Critical**: Update `scripts/seed-level-category-coverage.ts` with your actual curriculum coverage map. This defines which categories are INTRODUCED/PRACTICED/ASSESSED at each level.

### Step 7: Migrate ConceptCard.categoryId

You need to backfill `categoryId` for all existing concepts:

```typescript
// Run a migration script to:
// 1. Match concepts by domain + category strings
// 2. Set categoryId based on Category table
// 3. Validate all concepts have categoryId
```

### Step 8: Import Level Mappings

After ChatGPT categorizes concepts:

```bash
npm run import:level-mapping your-mappings.csv
```

The import script will validate:
- ✅ No accidental repeats
- ✅ Primary level uniqueness
- ✅ 10 concepts per level
- ✅ Category coverage alignment
- ✅ Boss exam eligibility

## Validation Rules

### A) No Accidental Repeats

A concept can appear in multiple levels ONLY if:
- `isSpiralLearning=true` AND
- `spiralLevels` includes those levels

**Validation**:
- If concept appears in >1 level and `isSpiralLearning=false` → ERROR
- If concept appears in >3 levels → ERROR

### B) Primary Level Uniqueness

Each concept must have exactly ONE primary level across the entire file.

**Validation**:
- If multiple rows set different `primaryLevel` for same concept → ERROR

### C) Level Concept Distribution

Each level must have exactly **10 primary concepts**.

**Validation**:
- If level has ≠10 primary concepts → ERROR
- Boss levels still have 10 primary concepts, but exam covers entire block

### D) Category Coverage Alignment

Each concept's category must be covered in `LevelCategoryCoverage` at its primary level.

**Validation**:
- If category not in LevelCategoryCoverage for that level → ERROR

### E) Boss Exam Eligibility

Before allowing boss exam generation:
- All levels in block (1-10, 11-20, etc.) must exist
- Each level must have 10 primary concepts
- Total unique concepts in block = 100

## Application Gating Rules

### Unlocking Level N+1 (non-boss)

User must have:
1. `UserLevelProgress(N).status = PASSED`
2. All categories marked `INTRODUCED` in Level N have `UserCategoryProgress.status = PASSED`

### Unlocking Next Super Level

To enter:
- **Level 11**: Must pass Level 10 boss exam
- **Level 21**: Must pass Level 20 boss exam
- **Level 31**: Must pass Level 30 boss exam
- **Level 40**: Final level

### Boss Exam Scope

Boss exams cover ALL concepts from their block:
- **Level 10**: Concepts from levels 1-10
- **Level 20**: Concepts from levels 11-20
- **Level 30**: Concepts from levels 21-30
- **Level 40**: Concepts from levels 31-40

## Data Model for ChatGPT

Use the CSV format specified in `CONCEPT_LEVEL_MAPPING_FORMAT.md`:

```csv
conceptId,conceptName,primaryLevel,levelTheme,complexity,alignment,isSpiralLearning,spiralLevels,domain,category,notes
```

**Required Fields**:
- `conceptName`: Exact concept name
- `primaryLevel`: 1-40
- `levelTheme`: Must match level title exactly
- `complexity`: beginner | intermediate | advanced | expert
- `alignment`: high | medium | low
- `isSpiralLearning`: true | false
- `spiralLevels`: Comma-separated levels (e.g., "3,7,15")
- `domain`: Domain 1 | Domain 2 | Domain 3 | Domain 4
- `category`: Must match Category.name exactly

## Next Steps

1. ✅ Schema updated
2. ✅ Seed scripts created
3. ✅ Import script with validation created
4. ⏭️ Update category names in `seed-domains-categories.ts`
5. ⏭️ Create LevelCategoryCoverage map in `seed-level-category-coverage.ts`
6. ⏭️ Run seed scripts
7. ⏭️ Get ChatGPT categorization
8. ⏭️ Import mappings
9. ⏭️ Implement application gating logic
10. ⏭️ Remove legacy fields after migration complete

## Breaking Changes

- `Challenge.level` → `Challenge.levelNumber` (legacy field kept temporarily)
- `ConceptCard.category` → `ConceptCard.categoryId` (legacy field kept temporarily)
- New required fields: `Challenge.examSystemPrompt`, `Challenge.superLevelGroup`, `Challenge.isBoss`
- New required models: `Domain`, `Category`, `LevelCategoryCoverage`, `Exam`, `ExamAttempt`, `UserCategoryProgress`

## Rollback Plan

If needed, you can rollback by:
1. Keeping legacy fields populated
2. Not enforcing new validation rules
3. Gradually migrating to new system

The schema is designed to be backward-compatible during migration.

