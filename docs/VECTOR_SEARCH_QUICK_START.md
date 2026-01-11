# Vector Search Quick Start

## ✅ Code Changes Complete

The RAG system now automatically uses semantic search when Vector Search is configured, with graceful fallback to keyword search.

## Setup Checklist

### 1. GCP Setup (30-60 minutes)

- [ ] Enable Vertex AI API
- [ ] Create Vector Search Index (`startege-knowledge-base`)
  - Dimensions: `768`
  - Distance: `Cosine Distance`
  - Algorithm: `Tree-AH`
- [ ] Create Index Endpoint (`startege-vector-endpoint`)
- [ ] Deploy Index to Endpoint
  - Note: Deployment ID (e.g., `startege-knowledge-base-deployment`)
- [ ] Create Cloud Storage bucket for batch imports (`gs://startege-vector-imports`)

### 2. Environment Variables

Add to `.env.local` and GitHub Secrets:

```bash
VECTOR_SEARCH_INDEX_ID=your-index-id
VECTOR_SEARCH_ENDPOINT_ID=your-endpoint-id
VECTOR_SEARCH_DEPLOYMENT_ID=your-deployment-id
```

### 3. Generate Embeddings (30-60 minutes)

```bash
# Backfill all existing content
npx tsx scripts/backfill-all-embeddings.ts

# Or separately:
npx tsx scripts/backfill-article-embeddings.ts
npx tsx scripts/backfill-standard-embeddings.ts
```

### 4. Test

```bash
# Test Vector Search
npx tsx scripts/test-vector-search.ts

# Test semantic search with query
npx tsx scripts/test-semantic-search.ts "AI governance accountability"
```

### 5. Verify in Production

1. Test Startegizer queries
2. Check logs for `[RAG] Using semantic search`
3. Compare citation quality vs keyword search

## How It Works

1. **Automatic Detection**: RAG checks if Vector Search is configured
2. **Semantic Search First**: Uses semantic search if available
3. **Graceful Fallback**: Falls back to keyword search if:
   - Vector Search not configured
   - Semantic search fails
   - No results found
4. **Hybrid Results**: Combines Market Scan + Standards results

## Monitoring

- **Logs**: Look for `[RAG] Using semantic search` vs `[RAG] Using keyword search`
- **Costs**: Monitor in GCP Console → Vertex AI → Usage
- **Performance**: Compare query response times

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Vector Search not configured" | Check environment variables |
| "No results found" | Run backfill scripts to generate embeddings |
| "Index not found" | Verify index ID matches GCP |
| "Permission denied" | Check service account permissions |

## Next Steps

After setup:
1. ✅ Monitor costs (~$0.50/month expected)
2. ✅ Compare citation quality
3. ✅ Update Market Scan to auto-generate embeddings for new articles
4. ✅ Consider hybrid search (combine semantic + keyword results)

