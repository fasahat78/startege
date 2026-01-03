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

