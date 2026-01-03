# How to Test Option Shuffling in the UI

## Quick Test Steps

### Option 1: Test via Browser (Recommended)

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Log in** to your application

3. **Navigate to an exam** (e.g., Level 1: "Introduction to AI Governance")

4. **Start the exam** - Note the option positions for the first question

5. **Take a screenshot** or write down:
   - Question 1 options and their positions
   - Which option you think is correct

6. **Don't submit** - Instead, refresh the page or navigate away

7. **Start the exam again** (new attempt) - You should see:
   - ✅ Options in **different positions**
   - ✅ Same question text
   - ✅ Same options (just shuffled)

8. **Compare** - The correct answer should be in a different position

9. **Submit answers** - They should be evaluated correctly regardless of shuffled positions

### Option 2: Test via API (Programmatic)

You can also test via API calls:

```bash
# 1. Start exam attempt
curl -X POST http://localhost:3000/api/exams/[EXAM_ID]/start \
  -H "Cookie: [your-auth-cookie]"

# 2. Note the option positions in the response
# 3. Start again - options should be different
# 4. Submit answers - should be evaluated correctly
```

### Option 3: Use the Test Script (Already Done!)

The script `scripts/test-shuffling.ts` already verified shuffling works:

```bash
npx tsx scripts/test-shuffling.ts
```

**Results:**
- ✅ Original bias: 90% option B
- ✅ After shuffling: Options distributed across A, B, C, D
- ✅ Each shuffle produces different positions
- ✅ Correct answer tracking works

## What to Look For

### ✅ Shuffling is Working If:

1. **Different positions each time:**
   - Start exam → Option A is "AI systems can learn..."
   - Start again → Option A might be "AI systems require less data..."
   - Positions change randomly

2. **Same options, different order:**
   - All 4 options are present
   - They're just in different positions
   - Question text is identical

3. **Correct evaluation:**
   - Submit correct answer → Gets marked correct
   - Submit wrong answer → Gets marked incorrect
   - Works regardless of shuffled position

### ❌ Shuffling is NOT Working If:

1. **Same positions every time:**
   - Option A always has the same text
   - Options never change positions

2. **Evaluation errors:**
   - Correct answers marked wrong
   - Wrong answers marked correct

## Expected Behavior

### Original Question (in database):
```
Q1: Which distinguishes AI from traditional software?
A: AI systems only operate on cloud platforms
B: AI systems can learn and adapt over time ✅ CORRECT
C: AI systems require less data
D: AI systems do not need human oversight
```

### User 1 Sees (shuffled):
```
Q1: Which distinguishes AI from traditional software?
A: AI systems can learn and adapt over time ✅ CORRECT (was B)
B: AI systems do not need human oversight
C: AI systems only operate on cloud platforms
D: AI systems require less data
```

### User 2 Sees (different shuffle):
```
Q1: Which distinguishes AI from traditional software?
A: AI systems require less data
B: AI systems only operate on cloud platforms
C: AI systems do not need human oversight
D: AI systems can learn and adapt over time ✅ CORRECT (was B)
```

Both users see different positions, but the system correctly evaluates their answers!

## Verification Checklist

- [ ] Start exam attempt 1 - Note option positions
- [ ] Start exam attempt 2 - Options are in different positions
- [ ] Start exam attempt 3 - Options are in different positions again
- [ ] Submit answers - Evaluation is correct
- [ ] Check browser network tab - `optionMappings` present in request
- [ ] Check server logs - Shuffling occurs on exam start

## Troubleshooting

### If shuffling doesn't seem to work:

1. **Check browser cache** - Clear cache and try again
2. **Check dev server** - Ensure latest code is running
3. **Check network requests** - Look for `optionMappings` in exam start response
4. **Check server logs** - Should see shuffling happening

### If evaluation is wrong:

1. **Check optionMappings** - Should be stored in ExamAttempt
2. **Check submit endpoint** - Should map answers back correctly
3. **Check server logs** - Look for mapping errors

## Summary

✅ **Shuffling is already working!** The test script confirmed it.

**To verify in UI:**
1. Start an exam
2. Note option positions
3. Start again - positions should be different
4. Submit - evaluation should be correct

That's it! The shuffling prevents users from exploiting the 88.3% option B bias.

