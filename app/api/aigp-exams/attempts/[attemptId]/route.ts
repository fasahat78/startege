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
        select: {
          examId: true,
          title: true,
          totalQuestions: true,
          estimatedTimeMin: true,
        },
      },
    },
  });
  
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }
  
  return NextResponse.json({
    attemptId: attempt.id,
    examId: attempt.exam.examId,
    status: attempt.status,
    isTimed: attempt.isTimed,
    timeLimitSec: attempt.timeLimitSec,
    timeRemainingSec: attempt.timeRemainingSec,
    totalQuestions: attempt.totalQuestions,
    startedAt: attempt.startedAt,
    pausedAt: attempt.pausedAt,
    resumedAt: attempt.resumedAt,
  });
}

