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

