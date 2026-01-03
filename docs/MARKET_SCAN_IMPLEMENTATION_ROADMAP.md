# Market Scan Feature - Implementation Roadmap

## 🎯 Overview

Market Scan is a premium feature that automatically scans verified sources daily to build a comprehensive, searchable database of AI governance news, regulatory updates, case studies, and standards. This central database (stored in Vertex AI Vector Search) powers both the Market Scan UI and the Startegizer AI assistant's RAG capabilities.

---

## 📋 Feature Requirements

### Core Functionality
1. **Daily Automated Scanning**: Runs once per day via Cloud Scheduler
2. **Verified Sources Only**: Only authentic, verified sources (regulatory bodies, official publications, reputable news)
3. **Central Database**: Single vector DB shared across all users (not per-user)
4. **Content Verification**: Fact-checking and verification before storage
5. **Vector Embeddings**: All content embedded and stored in Vertex AI Vector Search
6. **Deduplication**: Prevent duplicate articles from being added

### Data Sources
- **Regulatory Bodies**: EU Commission, ICO, FTC, NIST, etc.
- **Official Publications**: Official Journals, Regulatory Bulletins
- **Reputable News**: TechCrunch AI, MIT Technology Review, etc.
- **Case Studies**: Legal databases, enforcement actions
- **Standards**: ISO, IEEE, NIST publications
- **Academic**: Peer-reviewed papers (optional)

---

## 🏗️ Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│              Cloud Scheduler (Daily Trigger)              │
└──────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         Cloud Function: Market Scan Orchestrator         │
│  - Fetches from configured sources                      │
│  - Validates and verifies content                       │
│  - Generates embeddings                                 │
│  - Stores in PostgreSQL + Vector DB                    │
└──────────────────────┬──────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐          ┌──────────────────────┐
│   PostgreSQL     │          │  Vertex AI Vector   │
│   (Metadata)     │          │  Search (Content)    │
│                  │          │                      │
│ - Articles       │          │ - Embeddings         │
│ - Metadata       │          │ - Vector Search      │
│ - Relations      │          │ - Semantic Search    │
└──────────────────┘          └──────────────────────┘
        │                                 │
        └───────────────┬─────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Startegizer RAG + Market Scan UI            │
│  - Query vector DB for relevant articles                │
│  - Display in Market Scan feed                          │
│  - Use in AI assistant responses                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📅 Implementation Phases

### Phase 1: Infrastructure & Database Setup (Week 1)

#### Step 1.1: Verify Schema
✅ Already exists in `prisma/schema.prisma`:
- `MarketScanArticle` model
- `ScanJob` model
- `ArticleCitation` and `ArticleRelation` models

#### Step 1.2: Set Up Vertex AI Vector Search Index
1. Create Vector Search index in GCP Console
2. Configure embedding model (text-embedding-004)
3. Set up index endpoint
4. Add to `.env.local`:
```env
VERTEX_AI_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_VECTOR_SEARCH_INDEX_ID=market-scan-index
VERTEX_AI_VECTOR_SEARCH_ENDPOINT_ID=your-endpoint-id
```

#### Step 1.3: Create Source Configuration
Create `lib/market-scan/sources.ts`:
```typescript
export interface ScanSource {
  id: string;
  name: string;
  type: 'RSS' | 'API' | 'SCRAPE' | 'MANUAL';
  url: string;
  verified: boolean;
  jurisdiction?: string;
  category: string[];
  enabled: boolean;
  lastScanned?: Date;
}

export const VERIFIED_SOURCES: ScanSource[] = [
  {
    id: 'eu-commission-ai',
    name: 'EU Commission - AI Act Updates',
    type: 'RSS',
    url: 'https://digital-strategy.ec.europa.eu/en/rss.xml',
    verified: true,
    jurisdiction: 'EU',
    category: ['Regulatory Update'],
    enabled: true,
  },
  {
    id: 'ico-ai-guidance',
    name: 'ICO - AI Guidance',
    type: 'RSS',
    url: 'https://ico.org.uk/rss-feeds/',
    verified: true,
    jurisdiction: 'UK',
    category: ['Regulatory Update', 'Guidance'],
    enabled: true,
  },
  // Add more verified sources...
];
```

---

### Phase 2: Content Fetching & Verification (Week 2)

#### Step 2.1: Create Content Fetcher
Create `lib/market-scan/fetcher.ts`:
```typescript
import { VERIFIED_SOURCES, ScanSource } from './sources';
import Parser from 'rss-parser';

const parser = new Parser();

export interface FetchedArticle {
  title: string;
  content: string;
  url: string;
  publishedAt: Date;
  source: string;
  sourceType: string;
  jurisdiction?: string;
}

export async function fetchFromSource(source: ScanSource): Promise<FetchedArticle[]> {
  switch (source.type) {
    case 'RSS':
      return await fetchFromRSS(source);
    case 'API':
      return await fetchFromAPI(source);
    default:
      return [];
  }
}

async function fetchFromRSS(source: ScanSource): Promise<FetchedArticle[]> {
  const feed = await parser.parseURL(source.url);
  
  return feed.items.map(item => ({
    title: item.title || '',
    content: item.contentSnippet || item.content || '',
    url: item.link || '',
    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
    source: source.name,
    sourceType: 'NEWS',
    jurisdiction: source.jurisdiction,
  }));
}
```

#### Step 2.2: Create Content Verifier
Create `lib/market-scan/verifier.ts`:
```typescript
import { geminiModel } from '@/lib/vertex-ai';

export interface VerificationResult {
  isVerified: boolean;
  relevanceScore: number; // 0-1
  keyTopics: string[];
  affectedFrameworks: string[];
  riskAreas: string[];
  complianceImpact?: 'High' | 'Medium' | 'Low';
  summary?: string;
  reason?: string;
}

export async function verifyArticle(
  title: string,
  content: string,
  source: string
): Promise<VerificationResult> {
  const prompt = `Analyze this AI governance article for relevance and accuracy:

Title: ${title}
Source: ${source}
Content: ${content.substring(0, 2000)}

Provide:
1. Is this relevant to AI governance? (yes/no)
2. Relevance score (0-1)
3. Key topics (array)
4. Affected frameworks (GDPR, AI Act, ISO 42001, etc.)
5. Risk areas (Data Protection, Bias, Transparency, etc.)
6. Compliance impact (High/Medium/Low)
7. Brief summary (2-3 sentences)

Return as JSON.`;

  const result = await geminiModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const response = result.response.text();
  // Parse JSON response
  return JSON.parse(response);
}
```

#### Step 2.3: Create Deduplication Check
Create `lib/market-scan/deduplication.ts`:
```typescript
import { prisma } from '@/lib/db';
import { generateEmbedding } from '@/lib/embeddings';

export async function isDuplicate(
  title: string,
  url: string,
  content: string
): Promise<boolean> {
  // Check by URL first (fastest)
  const existingByUrl = await prisma.marketScanArticle.findUnique({
    where: { sourceUrl: url },
  });
  if (existingByUrl) return true;

  // Check by title similarity
  const existingByTitle = await prisma.marketScanArticle.findFirst({
    where: {
      title: {
        contains: title.substring(0, 50),
        mode: 'insensitive',
      },
    },
  });

  if (existingByTitle) {
    // Use embedding similarity for final check
    const existingEmbedding = await generateEmbedding(existingByTitle.content);
    const newEmbedding = await generateEmbedding(content);
    const similarity = cosineSimilarity(existingEmbedding, newEmbedding);
    
    return similarity > 0.95; // 95% similarity threshold
  }

  return false;
}

function cosineSimilarity(a: number[], b: number[]): number {
  // Calculate cosine similarity
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

---

### Phase 3: Vector DB Integration (Week 2-3)

#### Step 3.1: Create Embedding Service
Create `lib/market-scan/embeddings.ts`:
```typescript
import { generateEmbedding } from '@/lib/embeddings';
import { VertexAI } from '@google-cloud/aiplatform';

const vertexAI = new VertexAI({
  project: process.env.VERTEX_AI_PROJECT_ID!,
  location: process.env.VERTEX_AI_LOCATION!,
});

export async function createArticleEmbedding(
  articleId: string,
  title: string,
  content: string,
  summary?: string
): Promise<string> {
  // Combine title, summary, and content for embedding
  const textToEmbed = `${title}\n\n${summary || ''}\n\n${content}`;
  const embedding = await generateEmbedding(textToEmbed);

  // Store in Vertex AI Vector Search
  const indexEndpoint = vertexAI.indexEndpoint(
    process.env.VERTEX_AI_VECTOR_SEARCH_ENDPOINT_ID!
  );

  const response = await indexEndpoint.upsertDatapoints({
    datapoints: [
      {
        datapointId: articleId,
        featureVector: embedding,
        restricts: [
          {
            namespace: 'article',
            allow: [articleId],
          },
        ],
      },
    ],
  });

  return response.upsertedDatapoints[0].id;
}
```

#### Step 3.2: Create Vector Search Query
Create `lib/market-scan/search.ts`:
```typescript
import { generateEmbedding } from '@/lib/embeddings';
import { VertexAI } from '@google-cloud/aiplatform';

const vertexAI = new VertexAI({
  project: process.env.VERTEX_AI_PROJECT_ID!,
  location: process.env.VERTEX_AI_LOCATION!,
});

export interface SearchResult {
  articleId: string;
  score: number;
}

export async function searchArticles(
  query: string,
  limit: number = 10,
  filters?: {
    jurisdiction?: string;
    category?: string;
    dateRange?: { start: Date; end: Date };
  }
): Promise<SearchResult[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  const indexEndpoint = vertexAI.indexEndpoint(
    process.env.VERTEX_AI_VECTOR_SEARCH_ENDPOINT_ID!
  );

  const response = await indexEndpoint.findNeighbors({
    deployedIndexId: process.env.VERTEX_AI_VECTOR_SEARCH_INDEX_ID!,
    queries: [
      {
        datapoint: {
          featureVector: queryEmbedding,
        },
        neighborCount: limit,
      },
    ],
  });

  return response.nearestNeighbors[0].neighbors.map(n => ({
    articleId: n.datapointId,
    score: n.distance,
  }));
}
```

---

### Phase 4: Daily Scan Orchestrator (Week 3)

#### Step 4.1: Create Scan Service
Create `lib/market-scan/scan.ts`:
```typescript
import { prisma } from '@/lib/db';
import { VERIFIED_SOURCES } from './sources';
import { fetchFromSource } from './fetcher';
import { verifyArticle } from './verifier';
import { isDuplicate } from './deduplication';
import { createArticleEmbedding } from './embeddings';

export async function runDailyScan(): Promise<void> {
  const scanJob = await prisma.scanJob.create({
    data: {
      scanType: 'DAILY_NEWS',
      status: 'RUNNING',
    },
  });

  let articlesFound = 0;
  let articlesProcessed = 0;
  let articlesAdded = 0;
  const errors: any[] = [];

  try {
    for (const source of VERIFIED_SOURCES.filter(s => s.enabled)) {
      try {
        // Fetch articles
        const fetchedArticles = await fetchFromSource(source);
        articlesFound += fetchedArticles.length;

        for (const article of fetchedArticles) {
          try {
            articlesProcessed++;

            // Check for duplicates
            if (await isDuplicate(article.title, article.url, article.content)) {
              continue;
            }

            // Verify relevance
            const verification = await verifyArticle(
              article.title,
              article.content,
              article.source
            );

            if (!verification.isVerified || verification.relevanceScore < 0.5) {
              continue; // Skip low-relevance articles
            }

            // Create embedding
            const embeddingId = await createArticleEmbedding(
              `article-${Date.now()}`,
              article.title,
              article.content,
              verification.summary
            );

            // Store in PostgreSQL
            await prisma.marketScanArticle.create({
              data: {
                title: article.title,
                content: article.content,
                summary: verification.summary,
                source: article.source,
                sourceUrl: article.url,
                sourceType: article.sourceType as any,
                category: 'News',
                jurisdiction: article.jurisdiction,
                publishedAt: article.publishedAt,
                relevanceScore: verification.relevanceScore,
                relevanceTags: verification.affectedFrameworks,
                keyTopics: verification.keyTopics,
                affectedFrameworks: verification.affectedFrameworks,
                riskAreas: verification.riskAreas,
                complianceImpact: verification.complianceImpact as any,
                embeddingId,
              },
            });

            articlesAdded++;
          } catch (error) {
            errors.push({ article: article.title, error: String(error) });
          }
        }

        // Update source last scanned
        // (You might want to store this in a separate table)
      } catch (error) {
        errors.push({ source: source.name, error: String(error) });
      }
    }

    // Update scan job
    await prisma.scanJob.update({
      where: { id: scanJob.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        articlesFound,
        articlesProcessed,
        articlesAdded,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    await prisma.scanJob.update({
      where: { id: scanJob.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errors: [{ error: String(error) }],
      },
    });
    throw error;
  }
}
```

#### Step 4.2: Create API Route for Manual Trigger
Create `app/api/market-scan/run/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { runDailyScan } from '@/lib/market-scan/scan';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only admins can trigger manually (add admin check)
  // For now, allow premium users for testing
  if (user.subscriptionTier !== 'premium') {
    return NextResponse.json({ error: 'Premium feature' }, { status: 403 });
  }

  try {
    await runDailyScan();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

#### Step 4.3: Set Up Cloud Scheduler (Production)
In GCP Console:
1. Create Cloud Scheduler job
2. Schedule: `0 2 * * *` (2 AM daily)
3. Target: Cloud Function or Cloud Run endpoint
4. Payload: `{}`

---

### Phase 5: Market Scan UI (Week 4)

#### Step 5.1: Create Market Scan Page
Create `app/market-scan/page.tsx`:
```typescript
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { redirect } from 'next/navigation';
import MarketScanClient from '@/components/market-scan/MarketScanClient';
import { prisma } from '@/lib/db';

export default async function MarketScanPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin-firebase');
  }

  if (user.subscriptionTier !== 'premium') {
    redirect('/pricing?feature=market-scan');
  }

  // Fetch recent articles
  const articles = await prisma.marketScanArticle.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });

  return <MarketScanClient initialArticles={articles} />;
}
```

#### Step 5.2: Create Market Scan Client Component
Create `components/market-scan/MarketScanClient.tsx`:
```typescript
'use client';

import { useState } from 'react';
import ArticleCard from './ArticleCard';

interface Article {
  id: string;
  title: string;
  summary: string | null;
  source: string;
  sourceUrl: string | null;
  publishedAt: Date;
  jurisdiction: string | null;
  relevanceTags: string[];
  complianceImpact: string | null;
}

export default function MarketScanClient({ initialArticles }: { initialArticles: Article[] }) {
  const [articles] = useState(initialArticles);
  const [filter, setFilter] = useState<string>('all');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Market Scan</h1>
      
      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('EU')}>EU</button>
        <button onClick={() => setFilter('UK')}>UK</button>
        {/* More filters... */}
      </div>

      {/* Articles */}
      <div className="grid gap-4">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 6: Integration with Startegizer (Week 4)

#### Step 6.1: Update RAG Retrieval
Update `lib/rag-retrieval.ts` to include Market Scan articles:
```typescript
import { searchArticles } from '@/lib/market-scan/search';
import { prisma } from '@/lib/db';

export async function retrieveRelevantContext(
  query: string,
  maxResults: number = 5
): Promise<RetrievedContext[]> {
  // Search Market Scan articles
  const marketScanResults = await searchArticles(query, maxResults);
  
  // Fetch full article details
  const articles = await prisma.marketScanArticle.findMany({
    where: {
      id: { in: marketScanResults.map(r => r.articleId) },
      isActive: true,
    },
  });

  return articles.map(article => ({
    content: article.summary || article.content,
    source: article.source,
    category: article.category,
    date: article.publishedAt,
    relevanceScore: article.relevanceScore,
  }));
}
```

---

## 🔐 Security & Verification

### Source Verification
- Only pre-approved, verified sources
- Source verification badge in UI
- Source reputation scoring

### Content Verification
- AI-powered relevance checking
- Fact-checking against known regulations
- Duplicate detection
- Quality scoring

### Access Control
- Premium feature only
- Rate limiting on API endpoints
- Admin-only manual triggers

---

## 📊 Monitoring & Analytics

### Scan Metrics
- Articles found per source
- Articles processed
- Articles added
- Error rates
- Scan duration

### Quality Metrics
- Relevance scores
- User engagement (views, clicks)
- Article citations in Startegizer

---

## 🚀 Next Steps

1. **Set up Vertex AI Vector Search** index
2. **Configure verified sources** list
3. **Implement content fetcher** and verifier
4. **Create daily scan orchestrator**
5. **Set up Cloud Scheduler** for production
6. **Build Market Scan UI**
7. **Integrate with Startegizer RAG**

---

**Status**: Ready for implementation! 🎯

