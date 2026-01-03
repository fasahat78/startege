# Exam Regeneration Guide - Balanced Answer Distribution

## Overview

This guide explains how to regenerate all 40 level exams with balanced answer distribution and improved explanation quality, following AIGP exam best practices.

## Problem Solved

Previous exams showed **89.2% bias towards option B**, making exams predictable and reducing their educational value. The regeneration addresses this by:

1. **Updated Prompts**: Varied correctOptionId examples (A, B, C, D) instead of always "B"
2. **Enhanced Explanations**: Following AIGP exam quality standards
3. **Option Shuffling**: Client-side shuffling prevents pattern recognition
4. **Distribution Analysis**: Built-in analysis to verify balance

## Script: `regenerate-all-exams-balanced.ts`

### Features

- **Batch Processing**: Processes 5 exams per batch (configurable)
- **Concept Coverage**: Respects level-specific concept requirements
- **Boss Exam Handling**: Properly handles Levels 10, 20, 30 with blueprints
- **Level 40**: Skipped (runtime-only per blueprint)
- **Validation**: Validates generated exams before saving
- **Progress Tracking**: Shows progress and distribution statistics

### Configuration

```typescript
const BATCH_SIZE = 5; // Max 5 exams per batch
const DELAY_BETWEEN_BATCHES_MS = 60000; // 60 seconds
const DELAY_BETWEEN_LEVELS_MS = 10000; // 10 seconds
const MAX_RETRIES = 2; // For boss exams
```

### Running the Script

```bash
# Run the full regeneration (all 39 exams)
npx tsx scripts/regenerate-all-exams-balanced.ts
```

**Estimated Time**: 30-60 minutes (due to API rate limits and delays)

### What Gets Regenerated

- **Regular Levels**: 1-9, 11-19, 21-29, 31-39 (36 exams)
- **Boss Levels**: 10, 20, 30 (3 exams)
- **Total**: 39 exams (Level 40 is runtime-only)

## Question Structure (Following AIGP Best Practices)

Each question includes:

1. **Question Text** (`stem`): Scenario-based, testing understanding
2. **4 Options** (`options`): Plausible distractors, one correct answer
3. **Correct Answer** (`correctOptionId`): Evenly distributed (A, B, C, D)
4. **Comprehensive Explanations** (`rationale`):
   - **Correct**: 2-4 sentences explaining WHY it's correct, referencing governance principles
   - **Incorrect**: Specific explanations for each distractor, identifying misconceptions

### Example Question Structure

```json
{
  "id": "Q1",
  "stem": "Scenario-based question text...",
  "options": [
    { "id": "A", "text": "Option A" },
    { "id": "B", "text": "Option B" },
    { "id": "C", "text": "Option C" },
    { "id": "D", "text": "Option D" }
  ],
  "correctOptionId": "A",
  "rationale": {
    "correct": "Clear explanation (2-4 sentences) of why this option is correct, referencing specific governance principles or regulations.",
    "incorrect": {
      "B": "Specific explanation of why B is wrong, identifying the misconception.",
      "C": "Specific explanation of why C is wrong, identifying the error.",
      "D": "Specific explanation of why D is wrong, identifying the misunderstanding."
    }
  }
}
```

## Level-Specific Requirements

### Regular Levels (1-9, 11-19, 21-29, 31-39)

- **Levels 1-9**: Coverage-first approach (1 question per concept)
- **Levels 11-39**: Standard approach with concept integration
- **Concept Coverage**: Each level tests its assigned concepts
- **Question Count**: Varies by level (typically 10-18 questions)

### Boss Exams (10, 20, 30)

- **Level 10**: Foundation Boss (Levels 1-9 concepts)
  - 20 questions, 75% pass mark
  - ≥40% multi-concept, ≥20% cross-category, ≥70% scenario-based
  
- **Level 20**: Building Boss (Levels 11-19 concepts)
  - 20 questions, 75% pass mark
  - ≥70% multi-concept, ≥70% cross-category, ≥70% scenario-based
  
- **Level 30**: Advanced Boss (Levels 21-29 concepts)
  - 20 questions, 80% pass mark
  - ≥75% multi-concept, ≥75% cross-category, ≥80% scenario-based

- **Level 40**: Mastery Boss (Runtime-only, not pre-generated)
  - 25 questions, 85% pass mark
  - Generated dynamically when users attempt it

## Answer Distribution Goals

- **Target**: ~25% for each option (A, B, C, D)
- **Acceptable Range**: 20-30% per option
- **Current Problem**: 89.2% B (will be fixed)

## Verification

After regeneration, run the analysis script to verify:

```bash
npx tsx scripts/analyze-exam-bias.ts
```

Expected results:
- Balanced distribution (~25% each option)
- Comprehensive explanations
- All concepts covered
- Boss exams meet composition requirements

## Important Notes

1. **API Costs**: Regenerating all exams will use ChatGPT API credits
2. **Time**: Allow 30-60 minutes for full regeneration
3. **Backup**: Consider backing up existing exams before regeneration
4. **Testing**: Test a few levels first before running full regeneration
5. **Level 40**: Not regenerated (runtime-only per blueprint)

## Troubleshooting

### API Rate Limits
- Increase `DELAY_BETWEEN_BATCHES_MS` if hitting rate limits
- Reduce `BATCH_SIZE` if needed

### Validation Failures
- Boss exams may retry up to 2 times
- Check logs for specific validation errors
- Some warnings may be acceptable (logged but not fatal)

### Concept Coverage Issues
- Ensure all levels have concepts assigned
- Check `Challenge.concepts` array for each level
- Verify concept IDs exist in database

## Files Modified

- `lib/exam-prompts.ts` - Enhanced base prompt with explanation requirements
- `lib/level-exam-prompt.ts` - Updated examples and explanation guidance
- `system-prompts/boss/boss-exam-template.md` - Enhanced boss exam template
- `scripts/regenerate-all-exams-balanced.ts` - Main regeneration script
- `lib/exam-option-shuffle.ts` - Option shuffling utility (already implemented)

## Next Steps

1. Review the script configuration
2. Run regeneration in batches (script handles this automatically)
3. Verify results with analysis script
4. Test a few exams to ensure quality
5. Deploy updated exams

