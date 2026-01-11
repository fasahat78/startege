# Deployment Checklist - January 2026

## ✅ Changes Ready for Production

### 1. Citation Extraction Fix (Critical)
**File**: `app/api/startegizer/chat/route.ts`
- **What**: Only shows citations that are actually referenced in LLM response
- **Impact**: Fixes irrelevant citations issue
- **Status**: ✅ Ready to deploy

### 2. Vector Search Integration (New Feature)
**Files**: 
- `lib/startegizer-rag.ts` - Semantic search integration
- `lib/vector-db/search.ts` - Enhanced filtering

**Impact**: Better citation relevance, semantic understanding
**Status**: ✅ Ready to deploy (requires env vars)

**⚠️ Required Environment Variables** (GitHub Secrets):
```bash
VECTOR_SEARCH_INDEX_ID=3161010167949033472
VECTOR_SEARCH_ENDPOINT_ID=3780782882293809152
VECTOR_SEARCH_DEPLOYMENT_ID=startege_vector_search_end_1767344026840
```

### 3. AIGP Exam Fixes
**Files**:
- `app/api/aigp-exams/attempts/[attemptId]/questions/[questionOrder]/route.ts`
- `app/api/aigp-exams/attempts/[attemptId]/submit/route.ts`
- `app/api/aigp-exams/attempts/[attemptId]/review/route.ts`
- `components/aigp-exams/StartegizerHelp.tsx`

**What**: 
- Answer option shuffling (fixes bias)
- Explanation persistence fix
- Proper answer mapping

**Status**: ✅ Ready to deploy

### 4. Mastery Exam Fixes
**Files**:
- `app/api/exams/[examId]/start/route.ts`
- `app/api/exams/[examId]/submit/route.ts`
- `app/api/exams/attempts/[attemptId]/results/route.ts`

**What**: Answer shuffling and proper option mapping
**Status**: ✅ Ready to deploy

## Pre-Deployment Checklist

### ✅ Code Changes
- [x] Citation extraction fix implemented
- [x] Vector Search integration complete
- [x] Exam fixes implemented
- [x] All tests passing locally

### ⚠️ Environment Variables
- [ ] **CRITICAL**: Add Vector Search env vars to GitHub Secrets:
  - `VECTOR_SEARCH_INDEX_ID`
  - `VECTOR_SEARCH_ENDPOINT_ID`
  - `VECTOR_SEARCH_DEPLOYMENT_ID`

### ✅ Database
- [x] Vector Search index created
- [x] Embeddings generated (60 documents)
- [x] Index operations complete

## Deployment Steps

1. **Add GitHub Secrets** (if not already done):
   ```bash
   VECTOR_SEARCH_INDEX_ID=3161010167949033472
   VECTOR_SEARCH_ENDPOINT_ID=3780782882293809152
   VECTOR_SEARCH_DEPLOYMENT_ID=startege_vector_search_end_1767344026840
   ```

2. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Fix citation extraction, add Vector Search, fix exam shuffling"
   git push origin main
   ```

3. **Cloud Build** will automatically trigger

4. **Verify Deployment**:
   - Test Startegizer citations
   - Test AIGP exam shuffling
   - Test mastery exam shuffling
   - Check logs for `[RAG] Using semantic search`

## Post-Deployment Verification

### Startegizer
- [ ] Citations only show referenced sources
- [ ] Semantic search working (check logs)
- [ ] Fallback to keyword search if Vector Search fails

### Exams
- [ ] AIGP exam options shuffled correctly
- [ ] Mastery exam options shuffled correctly
- [ ] Answers evaluated correctly
- [ ] Startegizer explanations reset between questions

## Rollback Plan

If issues occur:
1. Revert to previous commit
2. Vector Search will gracefully fallback to keyword search
3. Exam fixes are backward compatible

## Notes

- **Vector Search**: Will automatically use semantic search if configured, falls back to keyword search if not
- **Citation Fix**: Critical fix for citation accuracy
- **Exam Fixes**: Important for fairness and user experience

---

**Ready to Deploy**: ✅ Yes (after adding Vector Search env vars)

