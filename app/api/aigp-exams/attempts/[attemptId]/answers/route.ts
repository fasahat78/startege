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

