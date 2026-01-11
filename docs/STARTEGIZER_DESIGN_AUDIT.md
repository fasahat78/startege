# Startegizer Design Audit

**Date**: 2025-01-27  
**Component**: AI Governance Expert Assistant (Startegizer)

---

## 📋 Executive Summary

Startegizer is a premium AI tutor powered by Google Vertex AI Gemini that provides personalized, context-aware AI governance guidance. It uses **Retrieval-Augmented Generation (RAG)** to enhance responses with real-time regulatory updates and authoritative standards.

**Key Features:**
- ✅ RAG-powered responses with citations
- ✅ Personalized based on user persona and knowledge level
- ✅ Access to Market Scan articles and AI Governance standards
- ✅ Conversation history support
- ✅ Fixed cost model: 10 credits per API call

---

## 🔍 Part 1: RAG Sources

### 1.1 Data Sources Overview

Startegizer has access to **two primary knowledge bases**:

#### **Source 1: Market Scan Articles**
- **Table**: `MarketScanArticle` (PostgreSQL)
- **Type**: Real-time regulatory intelligence and news articles
- **Content**: AI governance news, regulatory updates, enforcement actions, industry analysis
- **Filter**: `sourceType != 'STANDARD'`
- **Fields Used**:
  - `title`, `summary`, `content`
  - `source`, `sourceUrl`
  - `jurisdiction`, `publishedAt`
  - `relevanceScore` (0.0 - 1.0)
  - `keyTopics` (array)
  - `affectedFrameworks` (array)

#### **Source 2: Standards & Frameworks**
- **Table**: `MarketScanArticle` (same table, different filter)
- **Type**: AI Governance standards, frameworks, and regulatory documents
- **Content**: Publicly available standards (EU AI Act, GDPR, ISO/IEC 42001, NIST AI RMF, etc.)
- **Filter**: `sourceType == 'STANDARD'`
- **Fields Used**: Same as Market Scan articles
- **Status**: ✅ 11 standards successfully ingested

### 1.2 RAG Retrieval Method

**Current Implementation**: **Keyword-Based Search** (not semantic/vector search)

**Search Strategy** (`lib/startegizer-rag.ts`):

1. **Query Processing**:
   - Converts query to lowercase
   - Removes stop words: `['what', 'does', 'the', 'say', 'about', 'is', 'are', 'how', 'when', 'where', 'why', 'can', 'will', 'would', 'should', 'could']`
   - Extracts keywords (words > 2 characters, max 5 keywords)
   - Falls back to first 20 characters if no keywords found

2. **Search Queries** (for both sources):
   ```typescript
   OR conditions:
   - title contains query (case-insensitive)
   - summary contains query (case-insensitive)
   - content contains query (case-insensitive)
   - title contains keyword (for each keyword)
   - summary contains keyword (for each keyword)
   - keyTopics array contains keyword
   - affectedFrameworks array contains keyword
   ```

3. **Ranking**:
   - Primary: `relevanceScore DESC`
   - Secondary: `publishedAt DESC` (newer articles first)

4. **Result Limits**:
   - Market Scan: Top 3 articles (`marketScanTopK: 3`)
   - Standards: Top 3 standards (`standardsTopK: 3`)
   - Total: Maximum 6 documents per query

5. **Relevance Filtering**:
   - Default threshold: `minRelevanceScore: 0.3`
   - If no results above threshold, accepts all results (lenient fallback)
   - In production: Uses `minRelevanceScore: 0.1` (very lenient)

### 1.3 RAG Context Formatting

**Format** (`formatRAGContext` function):
```
[1] Document Title
Source: Source Name (URL if available)
Type: Market Scan Article / Standard/Framework
Jurisdiction: [if available]
Content: [summary or first 1000 chars of content]

[2] Document Title
...
```

**Citation Instructions**:
- Reference sources using numbered citations [1], [2], etc.
- Include links to sources when available
- Prioritize information from retrieved context
- If context doesn't fully answer, use knowledge but note when doing so

### 1.4 Current Limitations

⚠️ **Keyword Search Limitations**:
- No semantic understanding (doesn't understand meaning/synonyms)
- Limited to exact keyword matches
- May miss relevant documents with different terminology
- No understanding of context or intent

⏳ **Future Enhancement**: Vector Search (Phase 4)
- Semantic similarity search using embeddings
- Better relevance matching
- Understands meaning, not just keywords
- Requires Vertex AI Vector Search setup

---

## 📝 Part 2: Prompt Design for Gemini LLM

### 2.1 System Prompt Structure

The system prompt (`buildSystemPrompt` in `lib/startegizer-prompts.ts`) is **comprehensive and multi-layered**:

#### **Base Knowledge Declaration**
Startegizer declares expertise in:
- **Regulatory Frameworks**: EU (GDPR, AI Act, DSA, DMA), UK (UK GDPR, Data Protection Act), US (Algorithmic Accountability Act, Executive Order on AI, State regulations), International (ISO/IEC 42001, ISO/IEC 23894, NIST AI RMF, IEEE)
- **Risk Management**: EU AI Act risk categories, NIST AI RMF functions, ISO/IEC 42001 risk-based approach
- **Best Practices**: Ethical AI principles, bias detection/mitigation, explainability, MLOps, data governance
- **Case Studies**: Real-world enforcement actions, compliance examples
- **Technical Implementation**: MLOps pipelines, model documentation, monitoring frameworks
- **Industry Considerations**: Healthcare, Financial Services, Education, Employment, Public Sector, E-commerce

#### **User Context Integration**

1. **Persona-Specific Guidance** (9 personas supported):
   - `COMPLIANCE_OFFICER`: Focus on regulatory requirements, audit readiness, compliance frameworks
   - `AI_ETHICS_RESEARCHER`: Focus on ethical principles, bias detection, fairness metrics, societal implications
   - `TECHNICAL_AI_DEVELOPER`: Focus on MLOps, technical implementation, code examples, architecture patterns
   - `LEGAL_REGULATORY_PROFESSIONAL`: Focus on legal interpretation, regulatory requirements, enforcement actions
   - `BUSINESS_EXECUTIVE`: Focus on strategic implications, ROI, risk management, resource allocation
   - `DATA_PROTECTION_OFFICER`: Focus on GDPR, DPIAs, privacy by design, data subject rights
   - `AI_GOVERNANCE_CONSULTANT`: Focus on governance frameworks, maturity assessments, implementation strategies
   - `AI_PRODUCT_MANAGER`: Focus on product compliance, user trust, product risk management
   - `STUDENT_ACADEMIC`: Focus on foundational concepts, theoretical frameworks, learning resources

2. **Knowledge Level Adaptation**:
   - `BEGINNER`: Simple language, analogies, step-by-step, foundational concepts
   - `INTERMEDIATE`: Balanced theory/practice, standard terminology, industry examples
   - `ADVANCED`: Technical details, strategic guidance, edge cases, regulatory citations
   - `NOT_ASSESSED`: Balanced approach, progressive disclosure

3. **Interests & Goals Integration**:
   - Prioritizes aspects related to user interests
   - Structures recommendations to achieve user goals
   - Connects guidance to interest areas

### 2.2 Response Guidelines

**8 Core Guidelines**:

1. **Accuracy & Citations**:
   - Factually accurate information
   - Cite specific regulations (e.g., "EU AI Act Article 6(2)")
   - Reference latest regulatory updates
   - Prioritize RAG context when available
   - Acknowledge limitations

2. **Actionable Recommendations**:
   - Specific, implementable steps
   - Timelines and priorities
   - Tools, frameworks, methodologies
   - Checklists and templates
   - "What to do next" guidance

3. **Depth & Complexity**:
   - Match complexity to knowledge level
   - Beginners: Simple language, analogies
   - Intermediate: Theory + practice
   - Advanced: Nuances, edge cases, technical details

4. **Context-Aware Guidance**:
   - Consider user role and responsibilities
   - Align with stated goals
   - Emphasize relevant interests
   - Role-specific examples

5. **Structured Responses**:
   - Clear headings and subheadings
   - Bullet points and numbered lists
   - Examples and case studies
   - Tables for comparisons

6. **Regulatory Focus**:
   - Distinguish: Legal requirements vs. best practices vs. emerging standards
   - Note jurisdictional differences (EU vs. UK vs. US)
   - Highlight: Current vs. proposed, enforcement dates, regional variations

7. **Risk & Compliance Emphasis**:
   - Assess risk implications
   - Provide compliance checklists
   - Highlight enforcement risks and penalties
   - Suggest risk mitigation strategies

8. **Practical Implementation**:
   - Technical implementation guidance
   - Tools, platforms, resources
   - Code examples for technical users
   - Integration considerations

### 2.3 Response Structure Template

**9-Section Template**:
1. **Executive Summary** (1-2 sentences)
2. **Key Considerations** (bullet points)
3. **Detailed Analysis** (comprehensive explanation)
4. **Regulatory Requirements** (specific obligations)
5. **Risk Assessment** (risks and implications)
6. **Recommended Actions** (actionable steps)
7. **Compliance Checklist** (where applicable)
8. **Resources & References** (further reading, tools, standards)
9. **Next Steps** (immediate actions and follow-ups)

### 2.4 Full Prompt Construction

**Function**: `buildFullPrompt` (`lib/startegizer-prompts.ts`)

**Components**:
1. **System Prompt** (from `buildSystemPrompt`)
2. **RAG Context Section** (if available):
   - Formatted documents with citations
   - Citation instructions
3. **Conversation History** (if exists):
   - Previous user/assistant messages
4. **Current Question**:
   - User's current query

**Final Prompt Format**:
```
[System Prompt with persona/knowledge level/guidelines]

[RAG Context Section with formatted documents]

[Conversation History if exists]

**Current Question:**
[User's question]

Please provide a comprehensive answer to the user's question, citing specific sources from the provided context.
```

### 2.5 Prompt Length Considerations

- **System Prompt**: ~2000-3000 tokens (varies by persona/knowledge level)
- **RAG Context**: ~500-2000 tokens (depends on number of documents, ~500 chars per doc)
- **Conversation History**: Variable (depends on conversation length)
- **User Question**: ~10-100 tokens

**Total Prompt Size**: Typically 3000-6000 tokens per request

---

## 🔄 Part 3: Integration Flow

### 3.1 Request Flow

```
1. User submits question
   ↓
2. Check premium status & profile completion
   ↓
3. Retrieve conversation history (if conversationId exists)
   ↓
4. Build user context (persona, knowledge level, interests, goals)
   ↓
5. Retrieve RAG context:
   - Search Market Scan (top 3)
   - Search Standards (top 3)
   - Combine and rank results
   ↓
6. Build full prompt:
   - System prompt (with user context)
   - RAG context section
   - Conversation history
   - Current question
   ↓
7. Check credit balance (10 credits required)
   ↓
8. Generate response via Gemini API
   ↓
9. Deduct credits (10 credits)
   ↓
10. Generate citations from RAG context
   ↓
11. Save conversation (user message + assistant response)
   ↓
12. Return response with citations and updated credit balance
```

### 3.2 API Endpoint

**Route**: `POST /api/startegizer/chat`

**Request Body**:
```json
{
  "message": "User's question",
  "conversationId": "optional-conversation-id",
  "promptTemplateId": "optional-template-id"
}
```

**Response**:
```json
{
  "response": "AI-generated response text",
  "conversationId": "conversation-id",
  "sources": [
    {
      "title": "Document Title",
      "source": "Source Name",
      "url": "https://...",
      "type": "Article" | "Standard"
    }
  ],
  "credits": {
    "deducted": 10,
    "balance": 1430
  }
}
```

---

## 📊 Part 4: Current Status & Metrics

### 4.1 RAG Sources Status

✅ **Market Scan Articles**:
- **Status**: Active and updating
- **Source**: Daily market scans via RSS feeds
- **Content**: Regulatory news, enforcement actions, industry analysis
- **Search**: Keyword-based (PostgreSQL `ILIKE` queries)

✅ **Standards & Frameworks**:
- **Status**: 11 standards ingested
- **Source**: Publicly available standards
- **Content**: EU AI Act, GDPR, ISO/IEC 42001, NIST AI RMF, etc.
- **Search**: Keyword-based (same as Market Scan)

### 4.2 Prompt Design Status

✅ **System Prompt**: Comprehensive, multi-layered, persona-aware  
✅ **User Context Integration**: Persona, knowledge level, interests, goals  
✅ **Response Guidelines**: 8 core guidelines implemented  
✅ **Response Structure**: 9-section template defined  
✅ **RAG Integration**: Context formatting and citation instructions  

### 4.3 Performance Metrics

**Cost Model**:
- **Fixed Cost**: 10 credits per API call
- **Rationale**: Premium positioning, encourages thoughtful usage

**RAG Retrieval**:
- **Market Scan Top K**: 3 articles
- **Standards Top K**: 3 standards
- **Total Context**: Max 6 documents
- **Relevance Threshold**: 0.1 (very lenient in production)

**Prompt Size**:
- **Typical**: 3000-6000 tokens
- **Max**: ~8000 tokens (with long conversation history)

---

## ⚠️ Part 5: Limitations & Future Enhancements

### 5.1 Current Limitations

1. **Keyword Search Only**:
   - No semantic understanding
   - Limited to exact keyword matches
   - May miss relevant documents

2. **No Vector Search**:
   - Embeddings not generated
   - Vector DB not set up
   - Semantic search pending (Phase 4)

3. **Basic Relevance Scoring**:
   - Uses `relevanceScore` from database (pre-computed)
   - No ML-based relevance ranking
   - Simple keyword matching

4. **Fixed Context Size**:
   - Always retrieves top 3 + top 3 = 6 documents
   - No dynamic context sizing based on query complexity

5. **No Source Quality Scoring**:
   - All sources treated equally
   - No prioritization by authority/reliability

### 5.2 Future Enhancements (Planned)

**Phase 4: Vector Search**:
- Set up Vertex AI Vector Search
- Generate embeddings for all content
- Implement semantic similarity search
- Replace keyword search with vector search

**Phase 5: Advanced Features**:
- Citation tracking (which citations were used)
- Source quality scoring
- Multi-language support
- Source version tracking
- Dynamic context sizing
- ML-based relevance ranking

---

## 🎯 Part 6: Recommendations

### 6.1 Immediate Improvements

1. **Enhance Keyword Search**:
   - Add synonym expansion
   - Improve stop word list
   - Add query expansion (e.g., "EU AI Act" → "European Union Artificial Intelligence Act")

2. **Improve Relevance Filtering**:
   - Increase `minRelevanceScore` threshold (currently 0.1 is too lenient)
   - Add post-retrieval relevance scoring
   - Filter out low-quality matches

3. **Better Context Formatting**:
   - Truncate content more intelligently (sentence boundaries)
   - Include more metadata (jurisdiction, date, framework)
   - Highlight matching keywords in context

### 6.2 Medium-Term Enhancements

1. **Hybrid Search**:
   - Combine keyword search + semantic search
   - Use keyword for exact matches, semantic for meaning
   - Rank and merge results

2. **Context Optimization**:
   - Dynamic context sizing based on query complexity
   - Prioritize most relevant documents
   - Remove redundant information

3. **Citation Quality**:
   - Track which citations are actually used
   - Improve citation extraction from responses
   - Validate citation accuracy

### 6.3 Long-Term Vision

1. **Full Vector Search Migration**:
   - Complete Phase 4 implementation
   - Semantic search as primary method
   - Keyword search as fallback

2. **Advanced RAG**:
   - Multi-hop reasoning
   - Query decomposition
   - Context compression

3. **Personalization**:
   - Learn from user interactions
   - Adapt RAG retrieval to user preferences
   - Personalized source prioritization

---

## 📚 Appendix: Key Files

### RAG Implementation
- `lib/startegizer-rag.ts`: RAG retrieval engine
- `lib/startegizer-prompts.ts`: Prompt construction
- `app/api/startegizer/chat/route.ts`: API endpoint

### Database Schema
- `prisma/schema.prisma`: `MarketScanArticle` model definition

### Documentation
- `docs/RAG_INTEGRATION_STATUS.md`: RAG integration status
- `docs/STARTEGIZER_RAG_INTEGRATION_ROADMAP.md`: Future roadmap

---

**Last Updated**: 2025-01-27  
**Status**: ✅ Core implementation complete, keyword search active, vector search pending

