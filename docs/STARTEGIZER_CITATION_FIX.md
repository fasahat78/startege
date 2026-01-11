# Startegizer Citation Fix

## Problem

Citations/references in Startegizer responses were not making sense because:
1. **All retrieved documents** were shown as citations, regardless of whether they were used
2. **LLM might reference citation numbers** that don't exist (e.g., [4] when only 3 citations were retrieved)
3. **No validation** that citations mentioned in the response actually correspond to retrieved documents

## Solution

Implemented citation extraction that:
1. **Scans the LLM response** for citation patterns like `[1]`, `[2]`, `[[1]]`, etc.
2. **Validates citation numbers** against the retrieved documents
3. **Only returns citations** that were actually referenced in the response
4. **Falls back to all citations** if no explicit citations were found (LLM might have used them implicitly)

## Changes Made

### 1. New Function: `extractReferencedCitations()`
- Located in `app/api/startegizer/chat/route.ts`
- Uses regex pattern `/\[\[?(\d+)\]\]?/g` to find citations
- Validates that citation numbers exist in the retrieved documents
- Returns only referenced citations, or all if none were explicitly referenced

### 2. Updated Citation Generation Flow
- **Before**: All retrieved documents were shown as citations
- **After**: Only citations actually referenced in the response are shown

## How It Works

1. **RAG Context Retrieved**: 3 market scan + 3 standards = 6 documents
2. **Citations Generated**: All 6 documents get citation numbers [1] through [6]
3. **LLM Response Generated**: LLM references some citations (e.g., [1], [3], [5])
4. **Citation Extraction**: Function scans response and extracts referenced numbers
5. **Filtered Citations**: Only citations [1], [3], [5] are returned to the UI

## Benefits

✅ **Accurate Citations**: Only shows citations that were actually used
✅ **No Invalid References**: Filters out citation numbers that don't exist
✅ **Better User Experience**: Users see relevant sources, not all retrieved documents
✅ **Prevents Confusion**: No more citations that don't match the response content

## Testing

After deployment, verify:
1. Citations shown match what's referenced in the response
2. No invalid citation numbers (e.g., [4] when only 3 citations exist)
3. Citations are relevant to the response content

