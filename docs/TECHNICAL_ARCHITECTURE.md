# Technical Architecture Overview

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  - React Components                                          │
│  - Tailwind CSS + shadcn/ui                                 │
│  - Client-side state management                             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              API Layer (Next.js API Routes)                  │
│  - RESTful APIs                                              │
│  - Authentication middleware                                 │
│  - Rate limiting                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼───┐ ┌──────▼──────┐ ┌──▼──────────────┐
│ PostgreSQL│ │ Vertex AI   │ │ Cloud Storage   │
│ Database  │ │ (AI Agent)  │ │ (Media/Files)   │
└───────────┘ └─────────────┘ └─────────────────┘
        │
┌───────▼──────────────────────────────────────┐
│      Google Cloud Services                    │
│  - Cloud Run (App Hosting)                   │
│  - Cloud SQL (PostgreSQL)                    │
│  - Cloud Storage (Files)                     │
│  - Cloud Functions (Serverless)              │
│  - Cloud Scheduler (Cron Jobs)               │
│  - Vertex AI (LLM)                          │
│  - Cloud Pub/Sub (Event Streaming)          │
└──────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context / Zustand (if needed)
- **Forms**: React Hook Form + Zod validation
- **Charts/Analytics**: Recharts or Chart.js

### Backend
- **API**: Next.js API Routes (or separate FastAPI service)
- **Language**: TypeScript (Next.js) or Python (FastAPI)
- **Authentication**: NextAuth.js or Firebase Auth
- **Database ORM**: Prisma (for PostgreSQL)

### Database
- **Primary DB**: PostgreSQL (Cloud SQL)
- **Vector DB**: Vertex AI Vector Search or Pinecone (for AI Agent RAG)
- **Caching**: Redis (Cloud Memorystore) - optional

### AI/ML Services
- **LLM**: Google Vertex AI (Gemini) or OpenAI API
- **Embeddings**: Vertex AI Embeddings API
- **Vector Search**: Vertex AI Vector Search
- **NLP**: Cloud Natural Language API (for market scan)

### Infrastructure
- **Hosting**: Google Cloud Run
- **Database**: Cloud SQL (PostgreSQL)
- **Storage**: Cloud Storage (for media, PDFs)
- **CDN**: Cloud CDN
- **Monitoring**: Cloud Monitoring + Cloud Logging
- **CI/CD**: Cloud Build

---

## Database Schema (High-Level)

### Core Tables

#### Users
```sql
- id (UUID, PK)
- email (string, unique)
- password_hash (string)
- subscription_tier (enum: free, premium)
- subscription_expires_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### User_Profiles
```sql
- user_id (UUID, FK -> Users)
- display_name (string)
- avatar_url (string)
- exam_date (date, nullable)
- study_goals (json)
- preferences (json)
```

#### Concept_Cards
```sql
- id (UUID, PK)
- domain (string)
- category (string)
- concept (string)
- definition (text)
- examples (text)
- scenario_question (text)
- difficulty (enum: beginner, intermediate, advanced)
- estimated_read_time (integer)
- domain_classification (text)
- governance_context (text)
- ethical_implications (text)
- key_takeaways (text)
- version (string)
- created_at (timestamp)
```

#### User_Progress
```sql
- id (UUID, PK)
- user_id (UUID, FK -> Users)
- concept_card_id (UUID, FK -> Concept_Cards)
- status (enum: not_started, in_progress, completed)
- completed_at (timestamp)
- time_spent (integer, seconds)
- mastery_score (float, 0-1)
```

#### Practice_Questions
```sql
- id (UUID, PK)
- concept_card_id (UUID, FK -> Concept_Cards)
- question_text (text)
- option_a (text)
- option_b (text)
- option_c (text)
- option_d (text)
- correct_answer (enum: A, B, C, D)
- rationale (text)
- difficulty (enum: beginner, intermediate, advanced)
- domain (string)
- created_at (timestamp)
```

#### User_Question_Attempts
```sql
- id (UUID, PK)
- user_id (UUID, FK -> Users)
- question_id (UUID, FK -> Practice_Questions)
- selected_answer (enum: A, B, C, D)
- is_correct (boolean)
- time_taken (integer, seconds)
- attempted_at (timestamp)
```

#### Mock_Exams
```sql
- id (UUID, PK)
- user_id (UUID, FK -> Users)
- exam_type (enum: full_length, adaptive, domain_specific)
- total_questions (integer)
- time_limit (integer, seconds)
- started_at (timestamp)
- completed_at (timestamp)
- score (float, 0-100)
- status (enum: in_progress, completed, abandoned)
```

#### Exam_Questions
```sql
- exam_id (UUID, FK -> Mock_Exams)
- question_id (UUID, FK -> Practice_Questions)
- question_order (integer)
- user_answer (enum: A, B, C, D, nullable)
- is_correct (boolean, nullable)
```

#### Gamification
```sql
-- Points
- user_id (UUID, FK -> Users)
- points (integer)
- points_earned_today (integer)
- last_points_reset (date)

-- Badges
- id (UUID, PK)
- badge_name (string)
- badge_type (enum: learning, exam, streak, domain, social)
- rarity (enum: common, uncommon, rare, epic, legendary)
- icon_url (string)

-- User_Badges
- user_id (UUID, FK -> Users)
- badge_id (UUID, FK -> Badges)
- earned_at (timestamp)

-- Streaks
- user_id (UUID, FK -> Users)
- current_streak (integer)
- longest_streak (integer)
- last_activity_date (date)
```

#### Market_Scan
```sql
-- Regulations
- id (UUID, PK)
- title (string)
- jurisdiction (string)
- regulation_type (enum: act, directive, guideline, case_law)
- effective_date (date)
- summary (text)
- full_text_url (string)
- key_provisions (json)
- tags (array)
- created_at (timestamp)
- updated_at (timestamp)

-- News_Articles
- id (UUID, PK)
- title (string)
- source (string)
- url (string)
- summary (text)
- published_at (timestamp)
- tags (array)
- relevance_score (float)

-- User_Alerts
- user_id (UUID, FK -> Users)
- alert_type (enum: new_regulation, regulation_update, enforcement_action)
- jurisdiction_filter (array)
- topic_filter (array)
- frequency (enum: real_time, daily_digest, weekly_digest)
```

#### AI_Agent_Conversations
```sql
- id (UUID, PK)
- user_id (UUID, FK -> Users)
- conversation_id (UUID)
- message_type (enum: user, assistant)
- message_text (text)
- context (json)
- created_at (timestamp)
```

---

## AI Governance Agent Architecture

### Components

1. **LLM Service** (Vertex AI Gemini)
   - Handles natural language understanding
   - Generates contextual responses
   - Maintains conversation context

2. **RAG System** (Retrieval Augmented Generation)
   - **Vector Database**: Vertex AI Vector Search
   - **Embeddings**: Concept cards, regulations, study materials
   - **Retrieval**: Semantic search for relevant context
   - **Generation**: LLM generates answers using retrieved context

3. **Knowledge Base**
   - Concept cards (embedded)
   - Practice questions and explanations
   - Regulatory frameworks
   - Study materials

4. **Conversation Management**
   - Session tracking
   - Context window management
   - User preference learning
   - Conversation history storage

### Flow
```
User Query
    ↓
Query Embedding (Vector Search)
    ↓
Retrieve Relevant Context (Top K documents)
    ↓
Construct Prompt (Query + Context + System Instructions)
    ↓
LLM Generation (Vertex AI)
    ↓
Response + Sources
    ↓
Store Conversation
```

---

## Market Scan System Architecture

### Data Collection Pipeline

1. **Sources**
   - Regulatory body websites (web scraping)
   - RSS feeds
   - API integrations (where available)
   - Manual curation

2. **Processing**
   - Content ingestion (Cloud Functions)
   - NLP processing (Cloud Natural Language API)
   - Categorization and tagging
   - Duplicate detection
   - Relevance scoring

3. **Storage**
   - PostgreSQL (structured data)
   - Cloud Storage (documents, PDFs)

4. **Updates**
   - Cloud Scheduler (daily scans)
   - Real-time webhooks (if available)
   - Manual updates (admin interface)

5. **Alert System**
   - Cloud Pub/Sub (event streaming)
   - Cloud Functions (alert processing)
   - Email service (SendGrid/SES)
   - Push notifications (Firebase Cloud Messaging)

---

## API Endpoints (High-Level)

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Concept Cards
- `GET /api/concepts` (list with filters)
- `GET /api/concepts/:id`
- `POST /api/concepts/:id/complete`
- `GET /api/concepts/progress`

### Practice Questions
- `GET /api/questions` (list with filters)
- `GET /api/questions/:id`
- `POST /api/questions/:id/attempt`
- `GET /api/questions/performance`

### Mock Exams
- `POST /api/exams/create`
- `GET /api/exams/:id`
- `POST /api/exams/:id/submit`
- `GET /api/exams/history`

### AI Agent
- `POST /api/agent/chat`
- `GET /api/agent/conversations`
- `GET /api/agent/recommendations`

### Market Scan
- `GET /api/market-scan/regulations`
- `GET /api/market-scan/news`
- `GET /api/market-scan/:id`
- `POST /api/market-scan/alerts` (create/update)
- `GET /api/market-scan/alerts`

### Gamification
- `GET /api/gamification/points`
- `GET /api/gamification/badges`
- `GET /api/gamification/leaderboard`
- `GET /api/gamification/streak`

### User Management
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/user/subscription`
- `POST /api/user/subscription/upgrade`

---

## Security Considerations

### Authentication & Authorization
- JWT tokens for API authentication
- Role-based access control (RBAC)
- Premium feature gating
- Rate limiting per user

### Data Protection
- Encryption at rest (Cloud SQL)
- Encryption in transit (HTTPS/TLS)
- Password hashing (bcrypt/argon2)
- PII data minimization
- GDPR compliance measures

### API Security
- Input validation and sanitization
- SQL injection prevention (ORM)
- XSS prevention
- CSRF protection
- Rate limiting

### Infrastructure Security
- VPC for private networking
- Cloud Armor (DDoS protection)
- Secret management (Secret Manager)
- Regular security audits

---

## Scalability Considerations

### Horizontal Scaling
- Cloud Run auto-scaling
- Database read replicas
- CDN for static assets
- Caching layer (Redis)

### Performance Optimization
- Database indexing
- Query optimization
- Lazy loading
- Pagination
- Image optimization

### Monitoring & Observability
- Cloud Monitoring (metrics)
- Cloud Logging (logs)
- Error tracking (Sentry)
- Performance monitoring (APM)
- Uptime monitoring

---

## Deployment Strategy

### Environments
- **Development**: Local development
- **Staging**: Cloud Run (staging)
- **Production**: Cloud Run (production)

### CI/CD Pipeline
1. Code push to repository
2. Cloud Build triggers
3. Run tests
4. Build Docker image
5. Deploy to staging
6. Run integration tests
7. Deploy to production (manual approval)

### Database Migrations
- Prisma migrations
- Version-controlled schema
- Rollback capabilities

---

## Cost Optimization

### Google Cloud Services
- Use Cloud Run (pay per use)
- Cloud SQL instance sizing
- Cloud Storage lifecycle policies
- Vertex AI usage optimization
- CDN caching

### Monitoring
- Set up billing alerts
- Regular cost reviews
- Optimize resource usage

---

## Future Enhancements

### Mobile App
- React Native or Flutter
- Offline mode
- Push notifications
- Native mobile features

### Advanced Features
- Video tutorials
- Live webinars
- Peer-to-peer learning
- Certification tracking
- Integration with exam providers

### Analytics
- Advanced user analytics
- Learning path optimization
- A/B testing framework
- Predictive analytics

---

## Development Phases

### Phase 1: MVP
- Basic concept cards
- User authentication
- Simple gamification
- PostgreSQL database
- Basic UI

### Phase 2: Premium Features
- Practice questions
- Mock exams
- Basic AI Agent
- Subscription system

### Phase 3: Advanced Features
- Market scan
- Advanced AI Agent (RAG)
- Study plans
- Community features

### Phase 4: Optimization
- Performance optimization
- Advanced analytics
- Mobile optimization
- Scale infrastructure

