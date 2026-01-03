# Vector DB Semantic Search Implementation Plan

**Date**: 2025-02-11  
**Status**: 🚀 In Progress  
**Phase**: 4 - Vector DB Semantic Search

---

## 🎯 Goal

Upgrade RAG from keyword search to semantic search using Vertex AI Vector Search, dramatically improving citation quality and relevance.

---

## 📋 Implementation Steps

### Phase 4.1: Vertex AI Vector Search Infrastructure ✅ In Progress

**What to Build**:
- Set up Vertex AI Vector Search index
- Configure embedding dimensions (768 for text-embedding-004)
- Set up index endpoint
- Configure distance metric (cosine similarity)

**Files to Create**:
- `lib/vector-db/config.ts` - Vector Search configuration
- `lib/vector-db/index.ts` - Index management

**GCP Setup Required**:
1. Enable Vertex AI Vector Search API
2. Create Vector Search index
3. Deploy index to endpoint
4. Configure IAM permissions

**Estimated Effort**: 1 day

---

### Phase 4.2: Embedding Generation Service

**What to Build**:
- Implement actual embedding generation using Vertex AI Embeddings API
- Use `text-embedding-004` model
- Handle batching for efficiency
- Error handling and retries

**Files to Update**:
- `lib/market-scan/embeddings.ts` - Implement `generateEmbedding()`
- `lib/vector-db/embeddings.ts` - New service for vector embeddings

**Key Functions**:
```typescript
async function generateEmbedding(text: string): Promise<number[]>
async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]>
```

**Estimated Effort**: 1 day

---

### Phase 4.3: Vector Storage & Indexing

**What to Build**:
- Store embeddings in Vertex AI Vector Search
- Index documents with metadata
- Update existing documents
- Handle document updates/deletes

**Files to Create**:
- `lib/vector-db/storage.ts` - Document storage and indexing
- `lib/vector-db/types.ts` - Type definitions

**Key Functions**:
```typescript
async function indexDocument(doc: VectorDocument): Promise<string>
async function updateDocument(docId: string, doc: VectorDocument): Promise<void>
async function deleteDocument(docId: string): Promise<void>
async function batchIndexDocuments(docs: VectorDocument[]): Promise<string[]>
```

**Estimated Effort**: 1-2 days

---

### Phase 4.4: Update RAG Query Engine

**What to Build**:
- Replace keyword search with semantic similarity search
- Query Vector Search index
- Rank results by similarity score
- Combine Market Scan + Standards results

**Files to Update**:
- `lib/startegizer-rag.ts` - Replace `searchMarketScan()` and `searchStandards()`
- `lib/vector-db/search.ts` - New semantic search service

**Key Functions**:
```typescript
async function semanticSearch(
  query: string,
  indexId: string,
  topK: number,
  filter?: SearchFilter
): Promise<SearchResult[]>
```

**Estimated Effort**: 1-2 days

---

### Phase 4.5: Generate Embeddings for Existing Articles

**What to Build**:
- Script to backfill embeddings for existing Market Scan articles
- Process articles in batches
- Update database with embedding IDs
- Handle errors gracefully

**Files to Create**:
- `scripts/backfill-article-embeddings.ts`

**Estimated Effort**: 0.5 day

---

### Phase 4.6: Generate Embeddings for Existing Standards

**What to Build**:
- Script to generate embeddings for ingested standards
- Process standards in batches
- Index in Vector Search
- Update database references

**Files to Create**:
- `scripts/backfill-standard-embeddings.ts`

**Estimated Effort**: 0.5 day

---

### Phase 4.7: Testing & Optimization

**What to Do**:
- Test semantic search queries
- Compare keyword vs semantic results
- Measure citation quality improvement
- Optimize embedding generation (batching)
- Performance testing

**Estimated Effort**: 1 day

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│         User Query: "EU AI Act high-risk AI"            │
└──────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│      Generate Query Embedding (text-embedding-004)      │
│              Vector: [0.123, -0.456, ...]               │
└──────────────────────┬──────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐          ┌──────────────────────┐
│  Vector Search   │          │  Vector Search       │
│  Market Scan     │          │  Standards          │
│  Index           │          │  Index              │
└──────────────────┘          └──────────────────────┘
        │                                 │
        └───────────────┬─────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│      Top-K Results (Ranked by Similarity Score)         │
│  [1] EU AI Act Article (score: 0.92)                   │
│  [2] GDPR Guidance (score: 0.88)                      │
│  [3] NIST Framework (score: 0.85)                      │
└──────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Enhanced Prompt with RAG Context                │
│         + Citations [1], [2], [3]                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Details

### Embedding Model
- **Model**: `text-embedding-004`
- **Dimensions**: 768
- **Task Type**: `RETRIEVAL_DOCUMENT` (for documents)
- **Task Type**: `RETRIEVAL_QUERY` (for queries)

### Vector Search Configuration
- **Distance Metric**: Cosine Similarity
- **Index Type**: Approximate Nearest Neighbor (ANN)
- **Top-K**: 3-5 results per query
- **Filtering**: By source type, jurisdiction, date range

### Document Structure
```typescript
interface VectorDocument {
  id: string;
  embedding: number[]; // 768 dimensions
  metadata: {
    title: string;
    content: string;
    source: string;
    url?: string;
    type: 'market_scan' | 'standard';
    jurisdiction?: string;
    publishedDate?: Date;
  };
}
```

---

## 📊 Success Metrics

### Quantitative
- **Citation Relevance**: % of citations actually relevant to query
- **Search Accuracy**: Precision@K (top-K results are relevant)
- **Response Quality**: User satisfaction scores
- **Performance**: Query latency < 500ms

### Qualitative
- **Better Context**: Citations match user intent
- **Fewer False Positives**: Less irrelevant citations
- **More Accurate Answers**: AI responses align with sources

---

## 🚀 Implementation Order

1. ✅ **Phase 4.1**: Infrastructure setup (GCP + index)
2. ⏳ **Phase 4.2**: Embedding generation service
3. ⏳ **Phase 4.3**: Vector storage & indexing
4. ⏳ **Phase 4.4**: Update RAG query engine
5. ⏳ **Phase 4.5**: Backfill article embeddings
6. ⏳ **Phase 4.6**: Backfill standard embeddings
7. ⏳ **Phase 4.7**: Testing & optimization

---

## 📝 Notes

- **Hybrid Approach**: Can combine semantic + keyword search for best results
- **Incremental**: Start with semantic search, add keyword fallback if needed
- **Batching**: Process embeddings in batches for efficiency
- **Error Handling**: Graceful degradation if Vector Search unavailable
- **Cost**: Monitor embedding generation costs (Vertex AI pricing)

---

**Status**: Phase 4.1 In Progress  
**Next**: Set up GCP Vector Search infrastructure

