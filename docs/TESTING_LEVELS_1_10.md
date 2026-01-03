# Testing Levels 1-10 Guide

## ✅ Schema Fixes Applied

Fixed database schema mismatches:
- ✅ `UserLevelProgress.level` → `UserLevelProgress.levelNumber`
- ✅ `Challenge.level` → `Challenge.levelNumber` (for queries)
- ✅ Unique constraint: `userId_level` → `userId_levelNumber`
- ✅ Progress check: `completedAt` → `passedAt`

## 🚀 Testing Steps

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Navigate to Challenges Page
Go to: `http://localhost:3000/challenges`

You should see:
- Foundation Levels (1-10) - Free
- Building Levels (11-20) - Premium
- Advanced Levels (21-30) - Premium
- Mastery Levels (31-40) - Premium

### 3. Test Level 1

**Click on Level 1 card** → Should navigate to `/challenges/1`

**Expected:**
- Level 1 challenge page loads
- Shows challenge details
- "Start Challenge" button available

### 4. Start Level 1 Exam

**Click "Start Challenge"** → Should call:
- `POST /api/exams/[examId]/start`
- Generates 10 questions dynamically
- Returns questions without answers

**Expected:**
- 10 questions displayed
- Each question has exactly 1 conceptId
- All 10 concepts covered
- categoryIds are canonical DB IDs
- Single-concept questions only

### 5. Submit Level 1 Exam

**Answer questions and submit** → Should call:
- `POST /api/exams/[examId]/submit`
- Scores deterministically
- Updates progress
- Unlocks Level 2

**Expected:**
- Score calculated correctly
- Pass/fail determined
- Level 2 unlocked if passed
- Progress saved

### 6. Test Level 2-10

Repeat steps 3-5 for each level:
- Level 2 should unlock after Level 1 passed
- Each level generates 10 questions
- All concepts covered
- Progress tracked correctly

### 7. Test Level 10 Boss Exam

**Level 10 is a Boss Exam:**
- Should cover concepts from Levels 1-9
- Multi-concept questions (≥60%)
- Cross-category questions (≥70%)
- Higher pass mark (75%)
- Longer cooldown on failure

## 🔍 Verification Checklist

### Level Exams (1-9)
- [ ] Page loads without errors
- [ ] 10 questions generated
- [ ] Each question has 1 conceptId
- [ ] All concepts covered
- [ ] categoryIds are canonical DB IDs
- [ ] Submission scores correctly
- [ ] Next level unlocks on pass

### Boss Exam (Level 10)
- [ ] Page loads without errors
- [ ] Questions cover Levels 1-9 concepts
- [ ] Multi-concept questions present
- [ ] Cross-category questions present
- [ ] Pass mark is 75%
- [ ] Cooldown works on failure

## 🐛 Troubleshooting

### Error: "The column UserLevelProgress.level does not exist"
**Fixed:** Code now uses `levelNumber` instead of `level`

### Error: "Challenge not found"
**Check:** Ensure Challenge records exist with `levelNumber` set

### Error: "No concepts assigned"
**Fix:** Run `npx tsx scripts/populate-challenge-concepts.ts`

### Questions not generating
**Check:**
- OpenAI API key set in `.env`
- ChatGPT API accessible
- Exam generation endpoint working

## 📝 Notes

- All fixes are applied
- Database schema is synced
- Code uses `levelNumber` consistently
- Progress tracking uses `passedAt` instead of `completedAt`

**Ready to test!** 🎉

