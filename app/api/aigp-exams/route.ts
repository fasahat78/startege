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

