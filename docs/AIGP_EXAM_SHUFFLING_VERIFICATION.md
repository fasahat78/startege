# AIGP Exam Answer Shuffling Verification

## Current Status

**AIGP exams do NOT shuffle options** - they display options in the same order as stored in the database.

## How AIGP Exams Work

1. **Question Storage**: Options are stored as `Array<{ key: string; text: string }>` where `key` is "A", "B", "C", "D"
2. **Display**: Options are displayed in the exact order from the database
3. **Answer Selection**: User selects `option.key` (e.g., "A", "B", "C", "D")
4. **Evaluation**: Direct comparison `selectedAnswer === question.correctAnswer` (both are keys like "A", "B", "C", "D")

## Comparison with Mastery Exams

| Feature | Mastery Exams | AIGP Exams |
|---------|---------------|------------|
| Option Shuffling | ✅ Yes (server-side) | ❌ No |
| Option Mappings | ✅ Stored in attempt | ❌ Not needed |
| Answer Mapping | ✅ Maps shuffled → original | ❌ Direct comparison |
| Answer Bias Prevention | ✅ Yes | ❌ No |

## Potential Issue

**Answer Bias Risk**: If AIGP exam questions always have the correct answer in the same position (e.g., always "B"), users could learn patterns and guess correctly without understanding the content.

## Recommendation

**Option 1: Implement Shuffling (Recommended)**
- Apply the same shuffling logic as mastery exams
- Store `optionMappings` in `AIGPExamAttempt`
- Map answers back during submission
- Prevents answer bias and pattern recognition

**Option 2: Keep Current Implementation**
- If AIGP exam questions are designed with balanced answer distribution
- If options are already randomized during question generation
- Simpler code, but no protection against answer bias

## Implementation Notes

If implementing shuffling for AIGP exams:

1. **Start Route** (`app/api/aigp-exams/[examId]/start/route.ts`):
   - Shuffle options using `shuffleExamOptions` from `lib/exam-option-shuffle.ts`
   - Store `optionMappings` in attempt metadata

2. **Question Route** (`app/api/aigp-exams/attempts/[attemptId]/questions/[questionOrder]/route.ts`):
   - Return shuffled options to client
   - Don't expose `correctAnswer`

3. **Submit Route** (`app/api/aigp-exams/attempts/[attemptId]/submit/route.ts`):
   - Map shuffled answers back to original using `optionMappings`
   - Compare mapped answers with `correctAnswer`

4. **Review Route** (`app/api/aigp-exams/attempts/[attemptId]/review/route.ts`):
   - Show original option order
   - Highlight correct answer

## Current Status: ✅ No Action Needed

Since AIGP exams don't shuffle options, they don't have the mapping bug that affected mastery exams. However, consider implementing shuffling to prevent answer bias.

