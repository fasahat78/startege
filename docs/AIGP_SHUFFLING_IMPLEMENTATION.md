# AIGP Exam Option Shuffling Implementation

## Overview

Implemented option shuffling for AIGP exams to counter severe answer bias (64% of answers were Option B).

## Changes Made

### 1. New Utility (`lib/aigp-option-shuffle.ts`)
- `shuffleAIGPQuestionOptions()`: Shuffles AIGP question options using Fisher-Yates with crypto.getRandomValues
- `mapAIGPAnswerToOriginal()`: Maps shuffled answer key back to original key for evaluation

### 2. Question Route (`app/api/aigp-exams/attempts/[attemptId]/questions/[questionOrder]/route.ts`)
- **Shuffles options on first access** to each question
- **Stores mapping** in `AIGPExamAnswer.shuffledOrder` (reverseMapping: shuffled key → original key)
- **Stores original options** in `AIGPExamAnswer.optionOrder` for review
- **Returns shuffled options** to client
- **Maps selected answer** from original to shuffled format for display

### 3. Submit Route (`app/api/aigp-exams/attempts/[attemptId]/submit/route.ts`)
- **Maps shuffled answers back** to original keys before evaluation
- **Compares with original correctAnswer** from database
- Ensures correct scoring regardless of shuffled order

### 4. Review Route (`app/api/aigp-exams/attempts/[attemptId]/review/route.ts`)
- **Shows original options** (not shuffled)
- **Maps selected answers** from shuffled back to original format
- Displays correct answer in original format

## How It Works

1. **First Access**: When user loads a question for the first time:
   - Options are shuffled using Fisher-Yates algorithm
   - Mapping is stored: `shuffledOrder = { "A": "B", "B": "A", "C": "C", "D": "D" }`
   - Original options stored: `optionOrder = [{ key: "A", ... }, { key: "B", ... }, ...]`
   - Shuffled options returned to client

2. **Answer Selection**: User selects an option (e.g., "B" in shuffled position)
   - Stored as-is in `selectedAnswer` field (shuffled format)

3. **Submission**: When exam is submitted:
   - For each answer, map shuffled key back to original: `"B" (shuffled) → "A" (original)`
   - Compare mapped answer with `question.correctAnswer`
   - Store `isCorrect` result

4. **Review**: When viewing results:
   - Show original options from `optionOrder`
   - Map selected answer back to original format for display
   - Show correct answer in original format

## Data Storage

- `AIGPExamAnswer.shuffledOrder`: JSON object mapping shuffled keys to original keys
- `AIGPExamAnswer.optionOrder`: JSON array of original options
- `AIGPExamAnswer.selectedAnswer`: Selected key in shuffled format

## Benefits

✅ **Prevents answer bias**: Users can't exploit Option B bias (64% → random distribution)
✅ **Maintains exam validity**: Accurate assessment of knowledge
✅ **Consistent experience**: Same question shows same shuffled order throughout attempt
✅ **Correct evaluation**: Answers mapped correctly during submission
✅ **Clear review**: Original options shown in review for clarity

## Testing

After deployment, verify:
1. Options are shuffled differently for each question
2. Answer selection works correctly
3. Submission evaluates answers correctly
4. Review shows original options and correct mapping

## Backward Compatibility

- Old attempts without `shuffledOrder` will work (no mapping applied, direct comparison)
- New attempts will use shuffling automatically

