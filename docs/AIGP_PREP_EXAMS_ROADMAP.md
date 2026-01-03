# AIGP Prep Exams - Implementation Roadmap

## 🎯 Overview

Replace Category Exams with AIGP Prep Exams - a comprehensive exam preparation system featuring 3 full-length practice exams (100 questions each) aligned with the AIGP certification blueprint.

---

## 📋 Requirements Summary

### Exam Structure
- **3 Full Exams**: Each exam has 5 batch files (20 questions each = 100 questions total)
- **Exam IDs**: `AIGP_Practice_Exam_01`, `AIGP_Practice_Exam_02`, `AIGP_Practice_Exam_03`
- **Blueprint Alignment**: Domain I=20, Domain II=30, Domain III=30, Domain IV=20 (per 100Q)
- **Difficulty Distribution**: ~20 easy / 60 medium / 20 hard (per 100Q)
- **Jurisdiction Coverage**: ~70% US/EU, 30% Other/Mixed

### Core Features
1. **Ingestion**: Load and merge batch JSON files, validate integrity
2. **Exam Simulator**: Timed/untimed mode, pause/resume, navigation, flagging
3. **Scoring & Review**: Store responses, compute scores, show detailed review
4. **Analytics**: Breakdown by domain, difficulty, jurisdiction, topic
5. **Data Persistence**: Store exams, attempts, answers, metadata for adaptive practice

### Safety Requirements
- **No transformation**: Use JSON as single source of truth
- **Deterministic shuffling**: If option shuffling is implemented, must be deterministic-per-attempt and remap `correct_answer` accordingly
- **Preserve metadata**: Keep `source_refs`, `estimated_time_sec`, `topic`, `domain` for filtering

---

## 🏗️ Phase 1: Data Model & Schema Updates (Week 1)

### Step 1.1: Update Prisma Schema

Add new models for AIGP Prep Exams:

```prisma
// AIGP Practice Exam
model AIGPExam {
  id          String   @id @default(cuid())
  examId      String   @unique // "AIGP_Practice_Exam_01"
  title       String   // "AIGP Practice Exam 1"
  version     String   // "2026-01-01-r3"
  description String?  @db.Text
  
  // Exam metadata
  totalQuestions Int      @default(100)
  estimatedTimeMin Int    // Total estimated time in minutes
  passMark        Float?  // Optional pass threshold (e.g., 70%)
  
  // Blueprint compliance
  domainDistribution Json  // { "I": 20, "II": 30, "III": 30, "IV": 20 }
  difficultyDistribution Json // { "easy": 20, "medium": 60, "hard": 20 }
  jurisdictionDistribution Json // { "US": 35, "EU": 35, "Other": 15, "Mixed": 15 }
  
  // Status
  status      ExamStatus @default(PUBLISHED)
  isActive    Boolean    @default(true)
  
  // Relations
  questions   AIGPQuestion[]
  attempts    AIGPExamAttempt[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([status, isActive])
}

// Individual Question (normalized from JSON)
model AIGPQuestion {
  id                String   @id @default(cuid())
  examId            String
  questionId        String    // "AIGP-Q-001" (unique across all exams)
  
  // Question content (preserved exactly from JSON)
  question          String    @db.Text
  options           Json      // [{ key: "A", text: "..." }, ...]
  correctAnswer     String    // "A" | "B" | "C" | "D"
  explanation       String    @db.Text
  
  // Metadata
  domain            String    // "I" | "II" | "III" | "IV"
  topic             String
  difficulty        String    // "easy" | "medium" | "hard"
  isCaseStudy       Boolean   @default(false)
  estimatedTimeSec  Int
  jurisdiction      String    // "US" | "EU" | "Other" | "Mixed"
  sourceRefs        String[]  // ["AIGP_BOK", "GDPR"]
  
  // Order within exam (for deterministic presentation)
  questionOrder     Int       // 1-100
  
  // Relations
  exam              AIGPExam  @relation(fields: [examId], references: [id], onDelete: Cascade)
  attemptAnswers    AIGPExamAnswer[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([examId, questionOrder])
  @@unique([questionId]) // Ensure unique across all exams
  @@index([examId])
  @@index([domain])
  @@index([difficulty])
  @@index([jurisdiction])
  @@index([topic])
}

// Exam Attempt
model AIGPExamAttempt {
  id              String   @id @default(cuid())
  examId          String
  userId          String
  
  attemptNumber   Int      @default(1)
  status          AttemptStatus @default(IN_PROGRESS)
  
  // Timing
  startedAt       DateTime @default(now())
  pausedAt        DateTime?
  resumedAt       DateTime?
  submittedAt     DateTime?
  evaluatedAt     DateTime?
  
  // Exam mode
  isTimed         Boolean  @default(true)
  timeLimitSec    Int?     // Optional time limit
  timeRemainingSec Int?   // For pause/resume
  
  // Responses
  answers         AIGPExamAnswer[]
  
  // Scoring
  score           Float?   // Percentage (0-100)
  rawScore        Int?     // Correct answers count
  totalQuestions  Int?     // Total questions answered
  pass            Boolean?
  
  // Analytics (computed)
  domainScores    Json?    // { "I": { correct: 15, total: 20, score: 75 }, ... }
  difficultyScores Json?   // { "easy": { correct: 18, total: 20, score: 90 }, ... }
  jurisdictionScores Json? // { "US": { correct: 12, total: 15, score: 80 }, ... }
  topicScores     Json?   // Breakdown by topic
  
  // Review flags
  flaggedQuestions String[] // Question IDs flagged for review
  
  // Relations
  exam            AIGPExam @relation(fields: [examId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([examId, userId, attemptNumber])
  @@index([userId])
  @@index([examId])
  @@index([status])
  @@index([submittedAt])
}

// Individual Answer (normalized for analytics)
model AIGPExamAnswer {
  id              String   @id @default(cuid())
  attemptId       String
  questionId      String
  
  // Response
  selectedAnswer  String?  // "A" | "B" | "C" | "D" | null (unanswered)
  isCorrect       Boolean?
  timeSpentSec    Int?     // Time spent on this question
  
  // Option shuffling (if implemented)
  optionOrder     Json?    // Original order mapping: { "A": 0, "B": 1, "C": 2, "D": 3 }
  shuffledOrder   Json?    // Shuffled order: { "0": "C", "1": "A", "2": "D", "3": "B" }
  
  // Review flag
  isFlagged       Boolean  @default(false)
  
  // Relations
  attempt         AIGPExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question        AIGPQuestion    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  @@unique([attemptId, questionId])
  @@index([attemptId])
  @@index([questionId])
  @@index([isCorrect])
}

// Update User model
model User {
  // ... existing fields ...
  
  aigpExamAttempts AIGPExamAttempt[]
}
```

### Step 1.2: Migration Script

Create migration:
```bash
npx prisma migrate dev --name add_aigp_prep_exams
npx prisma generate
```

---

## 📥 Phase 2: Data Ingestion (Week 1-2)

### Step 2.1: Create Ingestion Script

Create `scripts/ingest-aigp-exams.ts`:

```typescript
import { prisma } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

interface ExamBatch {
  exam_id: string;
  batch_id: string;
  version: string;
  notes: string;
  questions: Question[];
  analytics: Analytics;
  pattern_check: PatternCheck;
}

interface Question {
  id: string;
  domain: string;
  topic: string;
  difficulty: string;
  is_case_study: boolean;
  estimated_time_sec: number;
  jurisdiction: string;
  source_refs: string[];
  question: string;
  options: Array<{ key: string; text: string }>;
  correct_answer: string;
  explanation: string;
}

interface Analytics {
  domain_counts: { I: number; II: number; III: number; IV: number };
  difficulty_counts: { easy: number; medium: number; hard: number };
  case_study_count: number;
  jurisdiction_counts: { US: number; EU: number; Other: number; Mixed: number };
  correct_answer_distribution: { A: number; B: number; C: number; D: number };
}

interface PatternCheck {
  max_same_letter_run: number;
  detected_repeating_cycle: boolean;
  notes: string;
}

async function validateQuestion(question: Question, questionId: string): Promise<void> {
  // Validate 4 unique option keys
  const optionKeys = question.options.map(o => o.key).sort();
  if (optionKeys.length !== 4 || new Set(optionKeys).size !== 4) {
    throw new Error(`Question ${questionId}: Must have exactly 4 unique option keys (A, B, C, D)`);
  }
  
  if (!['A', 'B', 'C', 'D'].every(key => optionKeys.includes(key))) {
    throw new Error(`Question ${questionId}: Must include all keys A, B, C, D`);
  }
  
  // Validate correct_answer exists
  if (!['A', 'B', 'C', 'D'].includes(question.correct_answer)) {
    throw new Error(`Question ${questionId}: Invalid correct_answer: ${question.correct_answer}`);
  }
  
  // Validate correct_answer matches an option
  if (!question.options.some(o => o.key === question.correct_answer)) {
    throw new Error(`Question ${questionId}: correct_answer doesn't match any option key`);
  }
  
  // Validate explanation exists
  if (!question.explanation || question.explanation.trim().length === 0) {
    throw new Error(`Question ${questionId}: Missing or empty explanation`);
  }
  
  // Validate question text exists
  if (!question.question || question.question.trim().length === 0) {
    throw new Error(`Question ${questionId}: Missing or empty question text`);
  }
}

async function loadAndMergeExam(examId: string): Promise<ExamBatch> {
  const examDir = path.join(process.cwd(), 'aigp_exams');
  const batchFiles = [
    `${examId.replace('AIGP_Practice_Exam_', 'exam')}.1.json`,
    `${examId.replace('AIGP_Practice_Exam_', 'exam')}.2.json`,
    `${examId.replace('AIGP_Practice_Exam_', 'exam')}.3.json`,
    `${examId.replace('AIGP_Practice_Exam_', 'exam')}.4.json`,
    `${examId.replace('AIGP_Practice_Exam_', 'exam')}.5.json`,
  ];
  
  const batches: ExamBatch[] = [];
  const allQuestions: Question[] = [];
  const seenQuestionIds = new Set<string>();
  
  // Load all batches
  for (const batchFile of batchFiles) {
    const filePath = path.join(examDir, batchFile);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Batch file not found: ${batchFile}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const batch: ExamBatch = JSON.parse(content);
    
    // Validate exam_id matches
    if (batch.exam_id !== examId) {
      throw new Error(`Batch ${batchFile}: exam_id mismatch. Expected ${examId}, got ${batch.exam_id}`);
    }
    
    batches.push(batch);
    
    // Validate and collect questions
    for (const question of batch.questions) {
      // Check for duplicate IDs
      if (seenQuestionIds.has(question.id)) {
        throw new Error(`Duplicate question ID found: ${question.id}`);
      }
      seenQuestionIds.add(question.id);
      
      // Validate question integrity
      await validateQuestion(question, question.id);
      
      allQuestions.push(question);
    }
  }
  
  // Validate total question count
  if (allQuestions.length !== 100) {
    throw new Error(`Expected 100 questions, got ${allQuestions.length}`);
  }
  
  // Merge analytics (sum across batches)
  const mergedAnalytics: Analytics = {
    domain_counts: { I: 0, II: 0, III: 0, IV: 0 },
    difficulty_counts: { easy: 0, medium: 0, hard: 0 },
    case_study_count: 0,
    jurisdiction_counts: { US: 0, EU: 0, Other: 0, Mixed: 0 },
    correct_answer_distribution: { A: 0, B: 0, C: 0, D: 0 },
  };
  
  for (const batch of batches) {
    mergedAnalytics.domain_counts.I += batch.analytics.domain_counts.I;
    mergedAnalytics.domain_counts.II += batch.analytics.domain_counts.II;
    mergedAnalytics.domain_counts.III += batch.analytics.domain_counts.III;
    mergedAnalytics.domain_counts.IV += batch.analytics.domain_counts.IV;
    
    mergedAnalytics.difficulty_counts.easy += batch.analytics.difficulty_counts.easy;
    mergedAnalytics.difficulty_counts.medium += batch.analytics.difficulty_counts.medium;
    mergedAnalytics.difficulty_counts.hard += batch.analytics.difficulty_counts.hard;
    
    mergedAnalytics.case_study_count += batch.analytics.case_study_count;
    
    mergedAnalytics.jurisdiction_counts.US += batch.analytics.jurisdiction_counts.US;
    mergedAnalytics.jurisdiction_counts.EU += batch.analytics.jurisdiction_counts.EU;
    mergedAnalytics.jurisdiction_counts.Other += batch.analytics.jurisdiction_counts.Other;
    mergedAnalytics.jurisdiction_counts.Mixed += batch.analytics.jurisdiction_counts.Mixed;
    
    mergedAnalytics.correct_answer_distribution.A += batch.analytics.correct_answer_distribution.A;
    mergedAnalytics.correct_answer_distribution.B += batch.analytics.correct_answer_distribution.B;
    mergedAnalytics.correct_answer_distribution.C += batch.analytics.correct_answer_distribution.C;
    mergedAnalytics.correct_answer_distribution.D += batch.analytics.correct_answer_distribution.D;
  }
  
  // Return merged exam structure
  return {
    exam_id: examId,
    batch_id: 'merged',
    version: batches[0].version, // Use first batch version
    notes: `Merged from ${batches.length} batch files`,
    questions: allQuestions,
    analytics: mergedAnalytics,
    pattern_check: batches[0].pattern_check, // Use first batch pattern check
  };
}

async function ingestExam(examId: string): Promise<void> {
  console.log(`\n📥 Ingesting ${examId}...`);
  
  // Load and merge batches
  const mergedExam = await loadAndMergeExam(examId);
  
  // Calculate total estimated time
  const totalEstimatedTimeSec = mergedExam.questions.reduce(
    (sum, q) => sum + q.estimated_time_sec,
    0
  );
  const totalEstimatedTimeMin = Math.ceil(totalEstimatedTimeSec / 60);
  
  // Create or update exam record
  const exam = await prisma.aIGPExam.upsert({
    where: { examId },
    update: {
      version: mergedExam.version,
      totalQuestions: mergedExam.questions.length,
      estimatedTimeMin: totalEstimatedTimeMin,
      domainDistribution: mergedExam.analytics.domain_counts,
      difficultyDistribution: mergedExam.analytics.difficulty_counts,
      jurisdictionDistribution: mergedExam.analytics.jurisdiction_counts,
    },
    create: {
      examId,
      title: examId.replace('_', ' ').replace(/_/g, ' '),
      version: mergedExam.version,
      description: `Full-length AIGP practice exam with ${mergedExam.questions.length} questions`,
      totalQuestions: mergedExam.questions.length,
      estimatedTimeMin: totalEstimatedTimeMin,
      domainDistribution: mergedExam.analytics.domain_counts,
      difficultyDistribution: mergedExam.analytics.difficulty_counts,
      jurisdictionDistribution: mergedExam.analytics.jurisdiction_counts,
      status: 'PUBLISHED',
      isActive: true,
    },
  });
  
  console.log(`✅ Exam record created/updated: ${exam.id}`);
  
  // Delete existing questions (for re-ingestion)
  await prisma.aIGPQuestion.deleteMany({
    where: { examId: exam.id },
  });
  
  // Create question records
  let questionOrder = 1;
  for (const questionData of mergedExam.questions) {
    await prisma.aIGPQuestion.create({
      data: {
        examId: exam.id,
        questionId: questionData.id,
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correct_answer,
        explanation: questionData.explanation,
        domain: questionData.domain,
        topic: questionData.topic,
        difficulty: questionData.difficulty,
        isCaseStudy: questionData.is_case_study,
        estimatedTimeSec: questionData.estimated_time_sec,
        jurisdiction: questionData.jurisdiction,
        sourceRefs: questionData.source_refs,
        questionOrder: questionOrder++,
      },
    });
  }
  
  console.log(`✅ Ingested ${mergedExam.questions.length} questions`);
  console.log(`📊 Domain distribution:`, mergedExam.analytics.domain_counts);
  console.log(`📊 Difficulty distribution:`, mergedExam.analytics.difficulty_counts);
}

async function main() {
  const examIds = [
    'AIGP_Practice_Exam_01',
    'AIGP_Practice_Exam_02',
    'AIGP_Practice_Exam_03',
  ];
  
  for (const examId of examIds) {
    try {
      await ingestExam(examId);
    } catch (error) {
      console.error(`❌ Error ingesting ${examId}:`, error);
      throw error;
    }
  }
  
  console.log('\n✅ All exams ingested successfully!');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Step 2.2: Run Ingestion

```bash
npx tsx scripts/ingest-aigp-exams.ts
```

---

## 🎮 Phase 3: Exam Simulator API (Week 2)

### Step 3.1: Create Exam List API

Create `app/api/aigp-exams/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Premium feature check
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionTier: true },
  });
  
  if (userRecord?.subscriptionTier !== 'premium') {
    return NextResponse.json(
      { error: 'Premium feature' },
      { status: 403 }
    );
  }
  
  const exams = await prisma.aIGPExam.findMany({
    where: { isActive: true, status: 'PUBLISHED' },
    select: {
      id: true,
      examId: true,
      title: true,
      version: true,
      description: true,
      totalQuestions: true,
      estimatedTimeMin: true,
      domainDistribution: true,
      difficultyDistribution: true,
      createdAt: true,
    },
    orderBy: { examId: 'asc' },
  });
  
  // Get attempt counts per exam
  const examIds = exams.map(e => e.id);
  const attempts = await prisma.aIGPExamAttempt.findMany({
    where: {
      examId: { in: examIds },
      userId: user.id,
    },
    select: {
      examId: true,
      attemptNumber: true,
      status: true,
      score: true,
      submittedAt: true,
    },
  });
  
  const attemptsByExam = new Map<string, typeof attempts>();
  for (const attempt of attempts) {
    const examAttempts = attemptsByExam.get(attempt.examId) || [];
    examAttempts.push(attempt);
    attemptsByExam.set(attempt.examId, examAttempts);
  }
  
  const examsWithAttempts = exams.map(exam => ({
    ...exam,
    attempts: attemptsByExam.get(exam.id) || [],
    bestScore: attemptsByExam.get(exam.id)?.reduce(
      (max, a) => Math.max(max, a.score || 0),
      0
    ) || null,
  }));
  
  return NextResponse.json({ exams: examsWithAttempts });
}
```

### Step 3.2: Create Start Exam API

Create `app/api/aigp-exams/[examId]/start/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { isTimed, timeLimitSec } = await request.json().catch(() => ({}));
  
  // Find exam by examId (string like "AIGP_Practice_Exam_01")
  const exam = await prisma.aIGPExam.findUnique({
    where: { examId },
    include: {
      questions: {
        orderBy: { questionOrder: 'asc' },
        select: {
          id: true,
          questionId: true,
          questionOrder: true,
        },
      },
    },
  });
  
  if (!exam) {
    return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
  }
  
  // Get next attempt number
  const lastAttempt = await prisma.aIGPExamAttempt.findFirst({
    where: {
      examId: exam.id,
      userId: user.id,
    },
    orderBy: { attemptNumber: 'desc' },
    select: { attemptNumber: true },
  });
  
  const attemptNumber = (lastAttempt?.attemptNumber || 0) + 1;
  
  // Create attempt
  const attempt = await prisma.aIGPExamAttempt.create({
    data: {
      examId: exam.id,
      userId: user.id,
      attemptNumber,
      status: 'IN_PROGRESS',
      isTimed: isTimed ?? true,
      timeLimitSec: timeLimitSec || (isTimed ? exam.estimatedTimeMin * 60 : null),
      timeRemainingSec: timeLimitSec || (isTimed ? exam.estimatedTimeMin * 60 : null),
      totalQuestions: exam.totalQuestions,
    },
  });
  
  return NextResponse.json({
    attemptId: attempt.id,
    examId: exam.examId,
    totalQuestions: exam.totalQuestions,
    timeLimitSec: attempt.timeLimitSec,
    isTimed: attempt.isTimed,
  });
}
```

### Step 3.3: Create Get Question API

Create `app/api/aigp-exams/attempts/[attemptId]/questions/[questionOrder]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string; questionOrder: string }> }
) {
  const { attemptId, questionOrder } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const order = parseInt(questionOrder);
  if (isNaN(order) || order < 1) {
    return NextResponse.json({ error: 'Invalid question order' }, { status: 400 });
  }
  
  // Verify attempt belongs to user
  const attempt = await prisma.aIGPExamAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { questionOrder: 'asc' },
          },
        },
      },
    },
  });
  
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }
  
  if (attempt.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 });
  }
  
  // Get question
  const question = attempt.exam.questions.find(q => q.questionOrder === order);
  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }
  
  // Get existing answer (if any)
  const answer = await prisma.aIGPExamAnswer.findUnique({
    where: {
      attemptId_questionId: {
        attemptId: attempt.id,
        questionId: question.id,
      },
    },
  });
  
  // Return question (without correct_answer until submitted)
  return NextResponse.json({
    questionId: question.questionId,
    questionOrder: question.questionOrder,
    question: question.question,
    options: question.options,
    domain: question.domain,
    topic: question.topic,
    difficulty: question.difficulty,
    isCaseStudy: question.isCaseStudy,
    estimatedTimeSec: question.estimatedTimeSec,
    jurisdiction: question.jurisdiction,
    sourceRefs: question.sourceRefs,
    selectedAnswer: answer?.selectedAnswer || null,
    isFlagged: answer?.isFlagged || false,
    timeSpentSec: answer?.timeSpentSec || 0,
  });
}
```

### Step 3.4: Create Save Answer API

Create `app/api/aigp-exams/attempts/[attemptId]/answers/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { questionId, selectedAnswer, timeSpentSec, isFlagged } = await request.json();
  
  // Verify attempt
  const attempt = await prisma.aIGPExamAttempt.findUnique({
    where: { id: attemptId },
  });
  
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }
  
  if (attempt.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 });
  }
  
  // Find question by questionId
  const question = await prisma.aIGPQuestion.findUnique({
    where: { questionId },
  });
  
  if (!question || question.examId !== attempt.examId) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }
  
  // Validate selectedAnswer
  if (selectedAnswer && !['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
    return NextResponse.json({ error: 'Invalid answer' }, { status: 400 });
  }
  
  // Upsert answer
  const answer = await prisma.aIGPExamAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId: attempt.id,
        questionId: question.id,
      },
    },
    update: {
      selectedAnswer: selectedAnswer || null,
      timeSpentSec: timeSpentSec || undefined,
      isFlagged: isFlagged ?? false,
    },
    create: {
      attemptId: attempt.id,
      questionId: question.id,
      selectedAnswer: selectedAnswer || null,
      timeSpentSec: timeSpentSec || undefined,
      isFlagged: isFlagged ?? false,
    },
  });
  
  return NextResponse.json({ success: true, answer });
}
```

### Step 3.5: Create Pause/Resume API

Create `app/api/aigp-exams/attempts/[attemptId]/pause/route.ts` and `resume/route.ts`:

```typescript
// pause/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const attempt = await prisma.aIGPExamAttempt.findUnique({
    where: { id: attemptId },
  });
  
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }
  
  if (attempt.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 });
  }
  
  // Calculate time remaining
  const { timeRemainingSec } = await request.json();
  
  const updated = await prisma.aIGPExamAttempt.update({
    where: { id: attemptId },
    data: {
      pausedAt: new Date(),
      timeRemainingSec: timeRemainingSec || attempt.timeRemainingSec,
    },
  });
  
  return NextResponse.json({ success: true, pausedAt: updated.pausedAt });
}

// resume/route.ts (similar structure)
```

---

## ✅ Phase 4: Scoring & Review (Week 2-3)

### Step 4.1: Create Submit Exam API

Create `app/api/aigp-exams/attempts/[attemptId]/submit/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const attempt = await prisma.aIGPExamAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { questionOrder: 'asc' },
          },
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
    },
  });
  
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }
  
  if (attempt.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Attempt already submitted' }, { status: 400 });
  }
  
  // Calculate scores
  let correctCount = 0;
  let totalAnswered = 0;
  const domainStats = new Map<string, { correct: number; total: number }>();
  const difficultyStats = new Map<string, { correct: number; total: number }>();
  const jurisdictionStats = new Map<string, { correct: number; total: number }>();
  const topicStats = new Map<string, { correct: number; total: number }>();
  
  // Process each answer
  for (const answer of attempt.answers) {
    const question = answer.question;
    
    if (answer.selectedAnswer) {
      totalAnswered++;
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      // Update answer with correctness
      await prisma.aIGPExamAnswer.update({
        where: { id: answer.id },
        data: { isCorrect },
      });
      
      // Aggregate domain stats
      const domainStat = domainStats.get(question.domain) || { correct: 0, total: 0 };
      domainStat.total++;
      if (isCorrect) domainStat.correct++;
      domainStats.set(question.domain, domainStat);
      
      // Aggregate difficulty stats
      const difficultyStat = difficultyStats.get(question.difficulty) || { correct: 0, total: 0 };
      difficultyStat.total++;
      if (isCorrect) difficultyStat.correct++;
      difficultyStats.set(question.difficulty, difficultyStat);
      
      // Aggregate jurisdiction stats
      const jurisdictionStat = jurisdictionStats.get(question.jurisdiction) || { correct: 0, total: 0 };
      jurisdictionStat.total++;
      if (isCorrect) jurisdictionStat.correct++;
      jurisdictionStats.set(question.jurisdiction, jurisdictionStat);
      
      // Aggregate topic stats
      const topicStat = topicStats.get(question.topic) || { correct: 0, total: 0 };
      topicStat.total++;
      if (isCorrect) topicStat.correct++;
      topicStats.set(question.topic, topicStat);
    }
  }
  
  // Calculate percentage score
  const score = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;
  const pass = score >= (attempt.exam.passMark || 70);
  
  // Convert stats to JSON
  const domainScores: Record<string, any> = {};
  for (const [domain, stat] of domainStats) {
    domainScores[domain] = {
      ...stat,
      score: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0,
    };
  }
  
  const difficultyScores: Record<string, any> = {};
  for (const [difficulty, stat] of difficultyStats) {
    difficultyScores[difficulty] = {
      ...stat,
      score: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0,
    };
  }
  
  const jurisdictionScores: Record<string, any> = {};
  for (const [jurisdiction, stat] of jurisdictionStats) {
    jurisdictionScores[jurisdiction] = {
      ...stat,
      score: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0,
    };
  }
  
  const topicScores: Record<string, any> = {};
  for (const [topic, stat] of topicStats) {
    topicScores[topic] = {
      ...stat,
      score: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0,
    };
  }
  
  // Update attempt
  const updatedAttempt = await prisma.aIGPExamAttempt.update({
    where: { id: attemptId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      evaluatedAt: new Date(),
      score,
      rawScore: correctCount,
      totalQuestions: totalAnswered,
      pass,
      domainScores,
      difficultyScores,
      jurisdictionScores,
      topicScores,
    },
  });
  
  return NextResponse.json({
    success: true,
    score,
    rawScore: correctCount,
    totalQuestions: totalAnswered,
    pass,
    domainScores,
    difficultyScores,
    jurisdictionScores,
    topicScores,
  });
}
```

### Step 4.2: Create Review API

Create `app/api/aigp-exams/attempts/[attemptId]/review/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const attempt = await prisma.aIGPExamAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { questionOrder: 'asc' },
          },
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
    },
  });
  
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }
  
  if (attempt.status === 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Attempt not yet submitted' }, { status: 400 });
  }
  
  // Build review data
  const reviewQuestions = attempt.exam.questions.map(question => {
    const answer = attempt.answers.find(a => a.questionId === question.id);
    
    return {
      questionId: question.questionId,
      questionOrder: question.questionOrder,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      domain: question.domain,
      topic: question.topic,
      difficulty: question.difficulty,
      isCaseStudy: question.isCaseStudy,
      jurisdiction: question.jurisdiction,
      sourceRefs: question.sourceRefs,
      selectedAnswer: answer?.selectedAnswer || null,
      isCorrect: answer?.isCorrect || false,
      timeSpentSec: answer?.timeSpentSec || 0,
    };
  });
  
  return NextResponse.json({
    attemptId: attempt.id,
    examId: attempt.exam.examId,
    score: attempt.score,
    rawScore: attempt.rawScore,
    totalQuestions: attempt.totalQuestions,
    pass: attempt.pass,
    submittedAt: attempt.submittedAt,
    domainScores: attempt.domainScores,
    difficultyScores: attempt.difficultyScores,
    jurisdictionScores: attempt.jurisdictionScores,
    topicScores: attempt.topicScores,
    questions: reviewQuestions,
  });
}
```

---

## 📊 Phase 5: UI Components (Week 3-4)

### Step 5.1: Update Dashboard FeatureBlocks

Replace "Category Exams" with "AIGP Prep Exams" in `components/dashboard/FeatureBlocks.tsx`:

```typescript
{/* AIGP Prep Exams - Premium */}
<FeatureBlock
  title="AIGP Prep Exams"
  description="Full-length practice exams aligned with AIGP certification blueprint. 3 exams with 100 questions each covering all domains."
  icon={
    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  }
  isFree={false}
  isPremium={true}
  isUnlocked={isPremium}
  ctaText={isPremium ? "View Exams →" : "Upgrade to Premium →"}
  ctaHref={isPremium ? "/aigp-exams" : undefined}
  ctaAction={isPremium ? undefined : handleUpgrade}
/>
```

### Step 5.2: Create Exams List Page

Create `app/aigp-exams/page.tsx`:

```typescript
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { redirect } from 'next/navigation';
import AIGPExamsClient from '@/components/aigp-exams/AIGPExamsClient';
import { prisma } from '@/lib/db';

export default async function AIGPExamsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin-firebase?redirect=/aigp-exams');
  }
  
  // Premium check
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionTier: true },
  });
  
  if (userRecord?.subscriptionTier !== 'premium') {
    redirect('/pricing?feature=aigp-exams');
  }
  
  // Fetch exams
  const exams = await prisma.aIGPExam.findMany({
    where: { isActive: true, status: 'PUBLISHED' },
    include: {
      attempts: {
        where: { userId: user.id },
        orderBy: { attemptNumber: 'desc' },
        take: 1,
        select: {
          id: true,
          attemptNumber: true,
          status: true,
          score: true,
          submittedAt: true,
        },
      },
    },
    orderBy: { examId: 'asc' },
  });
  
  return <AIGPExamsClient exams={exams} />;
}
```

### Step 5.3: Create Exam Simulator Component

Create `components/aigp-exams/ExamSimulator.tsx`:

Key features:
- Timer (if timed mode)
- Question navigation (prev/next, jump to question)
- Flag for review
- Progress bar
- Pause/Resume functionality
- Auto-save answers
- Submit confirmation

### Step 5.4: Create Review Component

Create `components/aigp-exams/ExamReview.tsx`:

Key features:
- Score summary
- Domain breakdown
- Difficulty breakdown
- Jurisdiction breakdown
- Topic breakdown
- Question-by-question review with:
  - User's answer vs correct answer
  - Explanation
  - Time spent
  - Flagged questions highlighted

---

## 🔄 Phase 6: Migration from Category Exams (Week 4)

### Step 6.1: Archive Category Exams

- Keep `Exam` and `ExamAttempt` models for backward compatibility
- Add deprecation notice in UI
- Redirect `/categories` to `/aigp-exams` for premium users

### Step 6.2: Update Navigation

- Replace "Category Exams" links with "AIGP Prep Exams"
- Update dashboard quick actions

---

## 🧪 Phase 7: Testing & Validation (Week 4)

### Step 7.1: Unit Tests

- Ingestion script validation
- Scoring logic
- Time tracking
- Option shuffling (if implemented)

### Step 7.2: Integration Tests

- Full exam flow (start → answer → submit → review)
- Pause/resume functionality
- Multiple attempts
- Analytics accuracy

### Step 7.3: User Acceptance Testing

- Test with real exam data
- Validate blueprint compliance
- Verify no question transformation
- Check analytics accuracy

---

## 📈 Phase 8: Analytics & Reporting (Week 4-5)

### Step 8.1: User Performance Dashboard

- Overall exam performance
- Domain strengths/weaknesses
- Difficulty progression
- Time management insights

### Step 8.2: Adaptive Practice (Future)

- Use attempt data to recommend practice areas
- Filter questions by weak domains/topics
- Generate custom practice sets

---

## 🚀 Implementation Checklist

### Week 1
- [ ] Update Prisma schema
- [ ] Run migration
- [ ] Create ingestion script
- [ ] Test ingestion with all 3 exams
- [ ] Validate data integrity

### Week 2
- [ ] Create exam list API
- [ ] Create start exam API
- [ ] Create get question API
- [ ] Create save answer API
- [ ] Create pause/resume APIs
- [ ] Create submit exam API
- [ ] Create review API

### Week 3
- [ ] Create exams list page
- [ ] Create exam simulator component
- [ ] Implement timer
- [ ] Implement navigation
- [ ] Implement flagging
- [ ] Implement auto-save

### Week 4
- [ ] Create review component
- [ ] Implement analytics display
- [ ] Update dashboard
- [ ] Migrate from Category Exams
- [ ] Testing & bug fixes

---

## 🔐 Safety & Validation

### Question Integrity
- ✅ No transformation of question text
- ✅ Preserve exact option text
- ✅ Preserve correct_answer mapping
- ✅ Validate JSON structure on ingestion

### Option Shuffling (Optional)
- If implemented, must be deterministic per attempt
- Must remap `correct_answer` accordingly
- Store original and shuffled order in `AIGPExamAnswer`

### Data Validation
- Validate all questions on ingestion
- Check for duplicate question IDs
- Verify blueprint compliance
- Verify answer key integrity

---

## 📝 Notes

- **Question Order**: Preserve order from JSON (questionOrder field)
- **Metadata Preservation**: Keep all metadata (source_refs, topic, domain, etc.) for future filtering
- **Backward Compatibility**: Keep existing Exam model for Level Exams
- **Premium Feature**: AIGP Prep Exams are premium-only
- **Multiple Attempts**: Users can take each exam multiple times
- **Analytics**: Store detailed analytics for adaptive practice features

---

**Status**: Ready for implementation! 🎯

**Next Step**: Start with Phase 1, Step 1.1 - Update Prisma Schema

