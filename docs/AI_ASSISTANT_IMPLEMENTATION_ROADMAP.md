# AI Governance Expert Assistant - Implementation Roadmap

## 🎯 Quick Start Guide

This document provides a step-by-step implementation guide for the AI Governance Expert Assistant.

---

## Phase 1: Database & Infrastructure (Week 1)

### Step 1.1: Update Prisma Schema

Add the new models to `prisma/schema.prisma`:

```prisma
// Market Scan Articles
model MarketScanArticle {
  id              String   @id @default(cuid())
  title           String
  content         String   @db.Text
  summary         String?  @db.Text
  source          String
  sourceUrl       String?
  category        String   // "Regulatory Update", "Case Study", "News", "Enforcement"
  jurisdiction    String?  // "EU", "UK", "US", "Global", "Multi-Jurisdictional"
  publishedAt     DateTime
  relevanceTags   String[] // ["GDPR", "AI Act", "Bias", "Transparency", etc.]
  embeddingId     String?  // Reference to vector embedding
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([publishedAt])
  @@index([category])
  @@index([jurisdiction])
  @@index([relevanceTags])
}

// Prompt Library
model PromptTemplate {
  id              String   @id @default(cuid())
  title           String
  description     String   @db.Text
  category        String   // "Risk Assessment", "Compliance", "Policy", etc.
  template        String   @db.Text // The actual prompt template with {{variables}}
  variables       Json?    // Schema: { varName: { type, description, options? } }
  useCase         String   @db.Text
  example         String?  @db.Text
  tags            String[]
  usageCount      Int      @default(0)
  averageRating   Float?   @default(0)
  ratingCount     Int      @default(0)
  isPremium       Boolean  @default(true)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([category])
  @@index([tags])
  @@index([isPremium])
}

// Agent Conversations
model AgentConversation {
  id              String   @id @default(cuid())
  userId          String
  title           String?  // Auto-generated from first message
  messages        Json     // Array of { role, content, timestamp, sources? }
  contextUsed     Json?    // RAG context retrieved
  sourcesCited    Json?    // Sources referenced
  messageCount    Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
}

// Agent Usage Tracking
model AgentUsage {
  id              String   @id @default(cuid())
  userId          String
  conversationId  String?
  promptId        String?
  feature         String   // "chat", "market_scan", "prompt_library", "rag_query"
  tokensUsed      Int      @default(0)
  cost            Float?   // Estimated cost in USD
  metadata        Json?    // Additional tracking data
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
  @@index([feature])
}

// Update User model
model User {
  // ... existing fields ...
  
  agentConversations AgentConversation[]
  agentUsage         AgentUsage[]
}
```

### Step 1.2: Run Migration

```bash
npx prisma migrate dev --name add_ai_agent_models
npx prisma generate
```

### Step 1.3: Set Up Vertex AI Credentials

Create `.env.local` additions:

```env
# Vertex AI Configuration
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Vector Search Configuration
VECTOR_SEARCH_INDEX_ID=ai-governance-knowledge
VECTOR_SEARCH_ENDPOINT_ID=your-endpoint-id
```

---

## Phase 2: Core Libraries (Week 2)

### Step 2.1: Create Vertex AI Client

Create `lib/vertex-ai.ts`:

```typescript
import { VertexAI } from '@google-cloud/aiplatform';

export const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID!,
  location: process.env.GCP_LOCATION!,
});

export const geminiModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
  },
});
```

### Step 2.2: Create Embedding Service

Create `lib/embeddings.ts`:

```typescript
import { VertexAI } from '@google-cloud/aiplatform';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID!,
  location: process.env.GCP_LOCATION!,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Vertex AI Embeddings API
  const model = vertexAI.preview.getGenerativeModel({
    model: 'text-embedding-004',
  });
  
  const result = await model.embedContent({
    content: { parts: [{ text }] },
  });
  
  return result.embedding.values;
}
```

### Step 2.3: Create RAG Retrieval Service

Create `lib/rag-retrieval.ts`:

```typescript
import { generateEmbedding } from './embeddings';
import { prisma } from './db';

export interface RetrievedContext {
  content: string;
  source: string;
  category: string;
  date?: Date;
  relevanceScore: number;
}

export async function retrieveRelevantContext(
  query: string,
  maxResults: number = 5,
  filters?: {
    category?: string;
    jurisdiction?: string;
    dateRange?: { start: Date; end: Date };
  }
): Promise<RetrievedContext[]> {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // 2. Search vector database (Vertex AI Vector Search)
  // Note: This is a placeholder - actual implementation depends on your Vector Search setup
  const results = await searchVectorDatabase(queryEmbedding, maxResults, filters);
  
  return results;
}

async function searchVectorDatabase(
  embedding: number[],
  topK: number,
  filters?: any
): Promise<RetrievedContext[]> {
  // TODO: Implement Vertex AI Vector Search query
  // This will query your vector index and return relevant documents
  return [];
}
```

### Step 2.4: Create Agent Service

Create `lib/ai-agent.ts`:

```typescript
import { geminiModel } from './vertex-ai';
import { retrieveRelevantContext } from './rag-retrieval';

const SYSTEM_PROMPT = `You are an expert AI Governance consultant with deep knowledge of:
- GDPR, EU AI Act, and global AI regulations
- Risk management frameworks (NIST AI RMF, ISO/IEC 42001)
- Real-world case studies and enforcement actions
- Best practices for AI governance implementation

Your role:
1. Provide accurate, factual information based on retrieved knowledge
2. Always cite sources when referencing regulations, frameworks, or case studies
3. Offer practical, actionable advice
4. Acknowledge uncertainty when information is incomplete
5. Focus on AI governance context, not general AI/ML technical topics

Response format:
- Start with a direct answer
- Provide context and examples
- Cite sources: [Source: Name, Date]
- End with actionable recommendations when appropriate

Always distinguish between:
- Legal requirements vs. best practices
- Different jurisdictional requirements
- Current vs. proposed regulations`;

export async function chatWithAgent(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<{
  response: string;
  sources: Array<{ title: string; source: string; date?: Date }>;
  context: RetrievedContext[];
}> {
  // 1. Retrieve relevant context
  const context = await retrieveRelevantContext(userMessage, 5);
  
  // 2. Build context string
  const contextString = context
    .map((c, i) => `[${i + 1}] ${c.content}\nSource: ${c.source}${c.date ? ` (${c.date.toLocaleDateString()})` : ''}`)
    .join('\n\n');
  
  // 3. Build prompt
  const prompt = `${SYSTEM_PROMPT}

Retrieved Context:
${contextString}

User Question: ${userMessage}

Please provide a comprehensive answer based on the context above. Cite sources using [1], [2], etc.`;

  // 4. Generate response
  const result = await geminiModel.generateContent({
    contents: [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: prompt }] },
    ],
  });
  
  const response = result.response.text();
  
  // 5. Extract sources
  const sources = context.map(c => ({
    title: c.content.substring(0, 100),
    source: c.source,
    date: c.date,
  }));
  
  return {
    response,
    sources,
    context,
  };
}
```

---

## Phase 3: API Routes (Week 2-3)

### Step 3.1: Create Chat API

Create `app/api/agent/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { chatWithAgent } from '@/lib/ai-agent';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check premium access
  if (session.user.subscriptionTier !== 'premium') {
    return NextResponse.json(
      { error: 'Premium feature. Please upgrade.' },
      { status: 403 }
    );
  }
  
  const { message, conversationId } = await request.json();
  
  // Get conversation history if exists
  let conversation = null;
  let history: Array<{ role: string; content: string }> = [];
  
  if (conversationId) {
    conversation = await prisma.agentConversation.findUnique({
      where: { id: conversationId, userId: session.user.id },
    });
    if (conversation) {
      history = (conversation.messages as any[]) || [];
    }
  }
  
  // Get agent response
  const { response, sources, context } = await chatWithAgent(message, history);
  
  // Update or create conversation
  const updatedMessages = [
    ...history,
    { role: 'user', content: message, timestamp: new Date() },
    { role: 'assistant', content: response, timestamp: new Date(), sources },
  ];
  
  if (conversation) {
    await prisma.agentConversation.update({
      where: { id: conversationId },
      data: {
        messages: updatedMessages,
        sourcesCited: sources,
        contextUsed: context,
        messageCount: updatedMessages.length,
        updatedAt: new Date(),
      },
    });
  } else {
    conversation = await prisma.agentConversation.create({
      data: {
        userId: session.user.id,
        title: message.substring(0, 100),
        messages: updatedMessages,
        sourcesCited: sources,
        contextUsed: context,
        messageCount: updatedMessages.length,
      },
    });
  }
  
  // Track usage
  await prisma.agentUsage.create({
    data: {
      userId: session.user.id,
      conversationId: conversation.id,
      feature: 'chat',
      tokensUsed: response.length / 4, // Rough estimate
    },
  });
  
  return NextResponse.json({
    response,
    sources,
    conversationId: conversation.id,
  });
}
```

### Step 3.2: Create Market Scan API

Create `app/api/agent/market-scan/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (session.user.subscriptionTier !== 'premium') {
    return NextResponse.json(
      { error: 'Premium feature' },
      { status: 403 }
    );
  }
  
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const jurisdiction = searchParams.get('jurisdiction');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const where: any = { isActive: true };
  if (category) where.category = category;
  if (jurisdiction) where.jurisdiction = jurisdiction;
  
  const [articles, total] = await Promise.all([
    prisma.marketScanArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.marketScanArticle.count({ where }),
  ]);
  
  return NextResponse.json({ articles, total });
}
```

### Step 3.3: Create Prompt Library API

Create `app/api/agent/prompts/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  const where: any = { isActive: true };
  
  if (session.user.subscriptionTier !== 'premium') {
    where.isPremium = false; // Only show free prompts
  }
  
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];
  }
  
  const prompts = await prisma.promptTemplate.findMany({
    where,
    orderBy: { usageCount: 'desc' },
  });
  
  return NextResponse.json({ prompts });
}
```

---

## Phase 4: UI Components (Week 3-4)

### Step 4.1: Create Chat Interface

Create `app/agent/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PremiumGate from '@/components/premium/PremiumGate';

export default function AgentPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const userMessage = input;
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      setMessages([...messages, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PremiumGate feature="AI Governance Expert Assistant">
      <div className="flex flex-col h-screen">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about AI governance..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </PremiumGate>
  );
}
```

### Step 4.2: Create Premium Gate Component

Create `components/premium/PremiumGate.tsx`:

```typescript
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function PremiumGate({
  feature,
  children,
}: {
  feature: string;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const isPremium = session?.user?.subscriptionTier === 'premium';
  
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-card rounded-lg shadow-card p-8 max-w-md text-center">
          <div className="mb-4">
            <svg className="h-16 w-16 mx-auto text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">Premium Feature</h2>
          <p className="text-muted-foreground mb-6">
            {feature} is available for premium members only.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
```

---

## Phase 5: Initial Data Seeding (Week 4)

### Step 5.1: Create Prompt Templates Seed Script

Create `scripts/seed-prompt-library.ts`:

```typescript
import { prisma } from '../lib/db';

const prompts = [
  {
    title: 'AI Risk Classification Prompt',
    category: 'Risk Assessment',
    description: 'Classify an AI system according to risk categories',
    template: `Analyze the following AI use case and classify its risk level:

Use Case: {{useCase}}
Context: {{context}}
Data Types: {{dataTypes}}
Decision Impact: {{decisionImpact}}

Provide:
1. Risk classification (Unacceptable/High/Limited/Minimal)
2. Rationale
3. Key risk factors
4. Recommended mitigation strategies`,
    variables: {
      useCase: { type: 'string', description: 'Description of the AI use case' },
      context: { type: 'string', description: 'Business context and application area' },
      dataTypes: { type: 'string', description: 'Types of data processed' },
      decisionImpact: { type: 'string', description: 'Impact of AI decisions' },
    },
    tags: ['risk', 'classification', 'ai-act'],
    isPremium: true,
  },
  // Add 49+ more prompts...
];

async function seed() {
  for (const prompt of prompts) {
    await prisma.promptTemplate.upsert({
      where: { title: prompt.title },
      update: prompt,
      create: prompt,
    });
  }
  console.log(`✅ Seeded ${prompts.length} prompt templates`);
}

seed();
```

### Step 5.2: Create Market Scan Seed Script

Create `scripts/seed-market-scan.ts`:

```typescript
import { prisma } from '../lib/db';

const articles = [
  {
    title: 'EU AI Act Officially Published',
    content: 'The EU AI Act was published in the Official Journal...',
    source: 'EU Commission',
    sourceUrl: 'https://...',
    category: 'Regulatory Update',
    jurisdiction: 'EU',
    publishedAt: new Date('2024-07-12'),
    relevanceTags: ['AI Act', 'EU', 'Regulation'],
  },
  // Add 99+ more articles...
];

async function seed() {
  for (const article of articles) {
    await prisma.marketScanArticle.create({
      data: article,
    });
  }
  console.log(`✅ Seeded ${articles.length} market scan articles`);
}

seed();
```

---

## 🎯 Next Steps

1. **Review and approve** the strategy document
2. **Set up Vertex AI** project and credentials
3. **Run database migrations** (Phase 1)
4. **Implement core libraries** (Phase 2)
5. **Build API routes** (Phase 3)
6. **Create UI components** (Phase 4)
7. **Seed initial data** (Phase 5)

---

**Ready to start?** Begin with Phase 1, Step 1.1: Update Prisma Schema!

