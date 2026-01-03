# Vector Search: Batch vs Streaming Update Method

## The Issue

Your Vector Search index was created with **"Batch"** update method, but our code uses the **streaming** API (`upsertDatapoints`).

## Solution Options

### Option 1: Recreate Index with Streaming (Recommended - Easier)

**Steps:**
1. Go to GCP Console → Vertex AI → Vector Search
2. Delete the current index (or create a new one)
3. Create a new index with:
   - **Update method**: `Streaming` (not Batch)
   - All other settings stay the same (768 dimensions, cosine distance, etc.)
4. Deploy to endpoint
5. Update `.env` with new Index ID and Endpoint ID

**Pros:**
- ✅ Works with our current code
- ✅ Real-time updates
- ✅ Simpler implementation

**Cons:**
- ⚠️ Need to recreate index
- ⚠️ Need to re-run backfill

---

### Option 2: Use Cloud Storage Import (More Complex)

For batch indexes, you need to:
1. Upload embeddings to Cloud Storage in JSON format
2. Use `importData` API to import from GCS
3. Wait for import to complete

**Pros:**
- ✅ Works with existing batch index
- ✅ Good for large bulk imports

**Cons:**
- ❌ More complex setup
- ❌ Requires Cloud Storage bucket
- ❌ Slower (batch processing)

---

## Recommendation

**Use Option 1 (Streaming)** - It's simpler and our code already supports it!

After recreating with Streaming:
- Run backfill scripts again
- Everything will work automatically

---

## Quick Fix Steps

1. **Delete current index** (or keep it, create new one)
2. **Create new index**:
   - Name: `startege-knowledge-base-streaming`
   - Update method: **Streaming** ← Important!
   - Dimensions: 768
   - Distance: Cosine
   - Algorithm: Tree-AH
   - Neighbors: 10
3. **Deploy to endpoint**
4. **Update .env**:
   ```
   VECTOR_SEARCH_INDEX_ID=new-index-id
   VECTOR_SEARCH_ENDPOINT_ID=new-endpoint-id
   ```
5. **Run backfill again**

---

**Status**: Waiting for index recreation with Streaming method

