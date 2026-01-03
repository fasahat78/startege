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

