# Answer Shuffling Fix - Investigation & Resolution

## Problem
User selected correct answers but exam evaluation shows incorrect results. The issue is that shuffled option IDs are not being mapped back to original option IDs during answer evaluation.

## Root Cause
1. **Option Mappings Not Stored**: When an exam starts, `optionMappings` should be stored in `attempt.answers.optionMappings`, but they're missing in production attempts.
2. **Mapping Not Applied**: When submitting answers, the code tries to map shuffled answers back to original, but if `optionMappings` are missing, it uses shuffled IDs directly, causing incorrect evaluation.

## Fixes Applied

### 1. Enhanced Start Route (`app/api/exams/[examId]/start/route.ts`)
- Added error handling and verification when storing `optionMappings`
- Added logging to verify mappings are stored correctly
- Ensures `optionMappings` are persisted before returning questions to client

### 2. Enhanced Submit Route (`app/api/exams/[examId]/submit/route.ts`)
- Improved handling of both old format (answers as array) and new format (answers as object with optionMappings)
- Added logging to track mapping process
- Preserves `optionMappings` when storing user answers (doesn't overwrite them)
- Maps shuffled answers back to original option IDs before evaluation

### 3. Enhanced Results Route (`app/api/exams/attempts/[attemptId]/results/route.ts`)
- Updated to handle both answer formats (array and object)
- Extracts `userAnswers` from new format if present

## Testing
Run the verification script to test shuffling:
```bash
npx tsx scripts/verify-answer-shuffling.ts
```

## Deployment
**A rebuild IS required** because we modified application code (API routes), not just database data.

## Next Steps
1. Deploy the updated code to production
2. Test with a new exam attempt (old attempts won't have optionMappings)
3. Verify that new attempts store optionMappings correctly
4. Verify that answer evaluation works correctly with shuffled options

