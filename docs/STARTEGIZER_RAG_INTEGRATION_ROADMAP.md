# Startegizer RAG Integration Roadmap

**Date**: 2025-02-11  
**Status**: Ready to Implement

---

## 🎯 Overview

Integrate Market Scan articles and AI Governance standards/frameworks into Startegizer AI responses using RAG (Retrieval-Augmented Generation). This will transform Startegizer from a generic AI tutor to a domain expert with real-time regulatory knowledge.

---

## 📚 Knowledge Base Components

### 1. **Market Scan Articles** (Dynamic)
- Real-time regulatory updates
- Enforcement actions
- Case studies
- News and analysis
- **Source**: Daily Market Scan

### 2. **AI Governance Standards & Frameworks** (Static)
- **Legislation**:
  - EU AI Act (full text)
  - GDPR (relevant sections)
  - CCPA (relevant sections)
  - Algorithmic Accountability Act (if applicable)
  
- **Standards**:
  - ISO/IEC 42001 (AI Management System)
  - NIST AI Risk Management Framework
  - IEEE Ethically Aligned Design
  
- **Guidelines & Principles**:
  - OECD AI Principles
  - UNESCO Recommendation on AI Ethics
  - EU Ethics Guidelines for Trustworthy AI
  - Singapore Model AI Governance Framework
  
- **Regulatory Guidance**:
  - ICO AI and Data Protection Guidance
  - FTC AI Guidelines
  - NIST AI Standards

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Startegizer Chat Request                    │
│  User: "What does the EU AI Act say about high-risk AI?"│
└──────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         RAG Query Engine (lib/startegizer-rag.ts)       │
│  1. Generate query embedding                            │
│  2. Search Vector DB (Market Scan + Standards)          │
│  3. Retrieve top-k relevant documents                    │
└──────────────────────┬──────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐          ┌──────────────────────┐
│  Market Scan     │          │  Standards &          │
│  Articles        │          │  Frameworks           │
│  (Vector DB)     │          │  (Vector DB)          │
└──────────────────┘          └──────────────────────┘
        │                                 │
        └───────────────┬─────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Context Builder (lib/startegizer-prompts.ts)    │
│  - Format retrieved documents                           │
│  - Add citations and links                              │
│  - Build enhanced prompt                                │
└──────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Gemini AI (with RAG context)                    │
│  - Generates response with citations                    │
│  - References specific articles/standards               │
│  - Provides links to sources                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📅 Implementation Phases

### Phase 1: Knowledge Base Setup (Week 1)

#### Step 1.1: Standards & Frameworks Ingestion System
**Files**: `lib/knowledge-base/standards.ts`, `scripts/ingest-standards.ts`

**What to Build**:
- Define list of key standards/frameworks
- Create ingestion script to process PDFs/texts
- Extract text content
- Generate embeddings
- Store in Vector DB

**Key Standards to Include**:
1. EU AI Act (full text)
2. GDPR Articles 13-22 (AI-relevant)
3. NIST AI RMF
4. ISO/IEC 42001
5. OECD AI Principles
6. UNESCO AI Ethics Recommendation
7. EU Ethics Guidelines
8. ICO AI Guidance
9. FTC AI Guidelines

**Estimated Effort**: 2-3 days

#### Step 1.2: Vector DB Setup
**Files**: `lib/vector-db/index.ts`, `lib/vector-db/embeddings.ts`

**What to Build**:
- Vertex AI Vector Search index setup
- Embedding generation service
- Document storage and retrieval
- Search functionality

**Estimated Effort**: 2-3 days

---

### Phase 2: RAG Integration (Week 2)

#### Step 2.1: RAG Query Engine
**Files**: `lib/startegizer-rag.ts`

**What to Build**:
- Query embedding generation
- Vector similarity search
- Top-k document retrieval
- Relevance scoring
- Hybrid search (vector + keyword)

**Functions**:
```typescript
async function searchKnowledgeBase(query: string, topK: number = 5)
async function searchMarketScan(query: string, topK: number = 3)
async function searchStandards(query: string, topK: number = 3)
async function retrieveRAGContext(query: string)
```

**Estimated Effort**: 2-3 days

#### Step 2.2: Startegizer Prompt Enhancement
**Files**: `lib/startegizer-prompts.ts`

**What to Build**:
- Integrate RAG context into prompts
- Format retrieved documents
- Add citations and links
- Handle cases with no relevant documents

**Prompt Structure**:
```
You are an AI Governance expert. Use the following context to answer:

[Retrieved Documents with Citations]

User Question: {question}

Provide a comprehensive answer citing specific sources.
```

**Estimated Effort**: 1-2 days

#### Step 2.3: Startegizer Chat Route Update
**Files**: `app/api/startegizer/chat/route.ts`

**What to Build**:
- Call RAG query engine before AI generation
- Pass context to prompt builder
- Include citations in response
- Track RAG usage for analytics

**Estimated Effort**: 1 day

---

### Phase 3: UI Enhancements (Week 2-3)

#### Step 3.1: Citation Display
**Files**: `components/startegizer/ChatMessages.tsx`

**What to Build**:
- Display citations in chat responses
- Link to Market Scan articles
- Link to standards/frameworks
- Visual citation indicators

**Estimated Effort**: 1 day

#### Step 3.2: Source Links
**Files**: `components/startegizer/SourceLinks.tsx` (new)

**What to Build**:
- Component to display source links
- "View Article" buttons
- "Read Standard" links
- Expandable source details

**Estimated Effort**: 1 day

---

## 🔧 Technical Implementation

### 1. Knowledge Base Structure

```typescript
interface KnowledgeDocument {
  id: string;
  type: 'market_scan' | 'standard' | 'framework' | 'guidance';
  title: string;
  content: string;
  source: string;
  url?: string;
  metadata: {
    jurisdiction?: string;
    domain?: string; // AIGP domain
    topic?: string;
    publishedDate?: Date;
    effectiveDate?: Date;
  };
  embedding?: number[];
}
```

### 2. RAG Query Flow

```typescript
async function retrieveRAGContext(userQuery: string): Promise<RAGContext> {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(userQuery);
  
  // 2. Search both knowledge bases
  const [marketScanResults, standardsResults] = await Promise.all([
    searchMarketScan(queryEmbedding, topK: 3),
    searchStandards(queryEmbedding, topK: 3),
  ]);
  
  // 3. Combine and rank by relevance
  const combinedResults = [...marketScanResults, ...standardsResults]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
  
  // 4. Format for prompt
  return formatRAGContext(combinedResults);
}
```

### 3. Enhanced Prompt Template

```typescript
function buildRAGPrompt(
  userQuery: string,
  ragContext: RAGContext,
  conversationHistory: Message[]
): string {
  return `You are Startegizer, an expert AI Governance tutor helping users prepare for the AIGP certification.

${ragContext.documents.length > 0 ? `
**Relevant Context:**
${ragContext.documents.map((doc, idx) => `
[${idx + 1}] ${doc.title}
Source: ${doc.source}${doc.url ? ` (${doc.url})` : ''}
Content: ${doc.content.substring(0, 500)}...
`).join('\n')}
` : ''}

**Conversation History:**
${formatHistory(conversationHistory)}

**User Question:** ${userQuery}

Provide a comprehensive, accurate answer. ${ragContext.documents.length > 0 ? 'Cite specific sources using [1], [2], etc.' : 'Use your knowledge of AI governance principles.'}

Format your response with:
- Clear explanation
- Specific examples
- Citations where applicable
- Links to sources when available`;
}
```

---

## 📊 Success Metrics

### Quantitative
- **Citation Rate**: % of responses with citations
- **Source Diversity**: Number of unique sources cited
- **User Engagement**: Increase in Startegizer usage
- **Response Quality**: User ratings/satisfaction

### Qualitative
- **Accuracy**: Responses align with authoritative sources
- **Relevance**: Citations match user questions
- **Completeness**: Responses cover all aspects of question
- **User Feedback**: Qualitative comments

---

## 🚀 Next Steps

### Immediate (This Week)
1. ✅ Create standards ingestion system
2. ✅ Set up Vector DB infrastructure
3. ✅ Ingest key standards/frameworks
4. ✅ Build RAG query engine

### Short-term (Next Week)
5. ✅ Integrate RAG into Startegizer prompts
6. ✅ Update chat route
7. ✅ Add citation display
8. ✅ Test and refine

### Medium-term (Following Weeks)
9. ⏳ Continuous ingestion of new standards
10. ⏳ Market Scan RAG integration
11. ⏳ Analytics and optimization
12. ⏳ User feedback integration

---

## 📝 Notes

- **Standards Ingestion**: Start with publicly available texts (EU AI Act, NIST RMF, etc.)
- **Vector DB**: Use Vertex AI Vector Search for both Market Scan and Standards
- **Hybrid Search**: Combine vector similarity with keyword matching for better results
- **Citation Format**: Use numbered citations [1], [2] with links
- **Fallback**: If no relevant documents found, use general knowledge (current behavior)

---

**Status**: Ready to implement  
**Priority**: High (Critical for product differentiation)

