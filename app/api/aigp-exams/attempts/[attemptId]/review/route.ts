import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';
import { mapAIGPAnswerToOriginal } from '@/lib/aigp-option-shuffle';

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
  
  // Build review data - show original options and map selected answers back
  const reviewQuestions = attempt.exam.questions.map(question => {
    const answer = attempt.answers.find(a => a.questionId === question.id);
    
    // Map selected answer from shuffled back to original
    let selectedAnswerOriginal = answer?.selectedAnswer || null;
    if (selectedAnswerOriginal && answer?.shuffledOrder && typeof answer.shuffledOrder === 'object') {
      const reverseMapping = answer.shuffledOrder as Record<string, string>;
      selectedAnswerOriginal = mapAIGPAnswerToOriginal(selectedAnswerOriginal, reverseMapping);
    }
    
    // Use original options (from optionOrder if stored, otherwise from question)
    const originalOptions = (answer?.optionOrder && Array.isArray(answer.optionOrder))
      ? answer.optionOrder as Array<{ key: string; text: string }>
      : question.options as Array<{ key: string; text: string }>;
    
    return {
      questionId: question.questionId,
      questionOrder: question.questionOrder,
      question: question.question,
      options: originalOptions, // Show original options
      correctAnswer: question.correctAnswer, // Original correct answer
      explanation: question.explanation,
      domain: question.domain,
      topic: question.topic,
      difficulty: question.difficulty,
      isCaseStudy: question.isCaseStudy,
      jurisdiction: question.jurisdiction,
      sourceRefs: question.sourceRefs,
      selectedAnswer: selectedAnswerOriginal, // Selected answer in original format
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

