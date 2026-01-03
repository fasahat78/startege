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
  // Extract exam number (01, 02, 03) and convert to format used in filenames (1, 2, 3)
  const examNumber = examId.replace('AIGP_Practice_Exam_', '').replace(/^0+/, '') || '1';
  const batchFiles = [
    `exam${examNumber}.1.json`,
    `exam${examNumber}.2.json`,
    `exam${examNumber}.3.json`,
    `exam${examNumber}.4.json`,
    `exam${examNumber}.5.json`,
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
      title: examId.replace(/_/g, ' ').replace(/Practice Exam/g, 'Practice Exam'),
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

