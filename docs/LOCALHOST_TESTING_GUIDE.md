# Localhost Testing Guide

## ✅ Setup Complete

All fixes have been applied:
- ✅ Coverage-first level exam prompts (Levels 1-9)
- ✅ Deterministic question planning
- ✅ Exam-type-aware validation
- ✅ CategoryIdMap block in prompts (canonical IDs)
- ✅ Challenge.concepts populated for all levels

## 🚀 Starting the Dev Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 🧪 Testing Exam Generation

### 1. Test Level Exam Generation

**Endpoint:** `POST /api/exams/[examId]/start`

**Example: Start Level 1 Exam**

```bash
# First, get the exam ID for Level 1
# You'll need to query the database or use the API to find the exam ID

curl -X POST http://localhost:3000/api/exams/{examId}/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id"
  }'
```

**Expected Response:**
```json
{
  "attemptId": "...",
  "examId": "...",
  "passMark": 70,
  "questions": [
    {
      "id": "Q1",
      "stem": "...",
      "options": [...],
      "conceptIds": ["cmj..."],
      "categoryIds": ["cmj..."],
      "difficultyTag": "apply"
    }
  ],
  "nextEligibleAt": null
}
```

### 2. Test Exam Submission

**Endpoint:** `POST /api/exams/[examId]/submit`

```bash
curl -X POST http://localhost:3000/api/exams/{examId}/submit \
  -H "Content-Type: application/json" \
  -d '{
    "attemptId": "...",
    "answers": {
      "Q1": "A",
      "Q2": "B",
      ...
    }
  }'
```

**Expected Response:**
```json
{
  "pass": true,
  "scorePercent": 85.0,
  "correctCount": 8,
  "totalQuestions": 10,
  "weakConceptIds": [...],
  "nextUnlocks": {
    "levels": [2],
    "categories": [...]
  }
}
```

## 📋 Quick Test Checklist

### Level Exams (1-9)
- [ ] Level 1 exam generates 10 questions
- [ ] Each question has exactly 1 conceptId
- [ ] All 10 concepts are covered
- [ ] categoryIds are canonical DB IDs (not placeholders)
- [ ] Validation passes (0 errors, 0 warnings)

### Category Exams
- [ ] Category exam generates questions
- [ ] All conceptIds belong to that category
- [ ] categoryIds match the category

### Boss Exam (Level 10)
- [ ] Level 10 boss exam generates questions
- [ ] Questions cover concepts from Levels 1-9
- [ ] Multi-concept questions present (≥60%)
- [ ] Cross-category questions present (≥70%)
- [ ] Concept frequency ≤4 per concept

## 🔍 Verification Steps

### 1. Check Database State

```bash
# Verify concepts are assigned to challenges
npx tsx -e "(async () => { const { prisma } = await import('./lib/db'); const c = await (prisma as any).challenge.findMany({ where: { levelNumber: { lte: 9 } }, select: { levelNumber: true, concepts: true } }); c.forEach(ch => console.log(\`Level \${ch.levelNumber}: \${ch.concepts?.length || 0} concepts\`)); await prisma.\$disconnect(); })()"
```

### 2. Test Single Level Exam Generation

Use the diagnostic scripts:
```bash
npx tsx scripts/diagnose-level1-gen1.ts
npx tsx scripts/diagnose-level2-gen1.ts
npx tsx scripts/diagnose-level8-gen1.ts
```

### 3. Run Full QA Harness

```bash
npx tsx scripts/exam-qa-harness.ts
```

Expected: All Levels 1-9 should pass ✅

## 🐛 Troubleshooting

### Issue: "No concepts assigned to Level X"
**Solution:** Run the populate script:
```bash
npx tsx scripts/populate-challenge-concepts.ts
```

### Issue: "CategoryIdMap block not included"
**Solution:** Already fixed in `lib/level-exam-prompt.ts` - ensure you're using the latest version

### Issue: "Validation errors"
**Check:**
1. Are concepts CUIDs (start with "cmj")?
2. Are categoryIds canonical DB IDs?
3. Is question count = concept count for level exams?

## 📝 Notes

- All Level exams (1-9) use coverage-first prompts
- Boss exams (10, 20, 30, 40) use different prompts
- Category exams use category-specific prompts
- Validation is exam-type-aware

## 🎯 Next Steps After Testing

Once localhost testing confirms everything works:
1. Test production gating behavior
2. Test cooldown policies
3. Test unlock logic
4. Proceed to Level 11 content

