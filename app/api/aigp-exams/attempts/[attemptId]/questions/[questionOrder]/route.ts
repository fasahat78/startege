import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';
import { shuffleAIGPQuestionOptions } from '@/lib/aigp-option-shuffle';

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
  
  // Get or create answer record
  let answer = await prisma.aIGPExamAnswer.findUnique({
    where: {
      attemptId_questionId: {
        attemptId: attempt.id,
        questionId: question.id,
      },
    },
  });
  
  // Get shuffled options and mapping
  let shuffledOptions: Array<{ key: string; text: string }>;
  let selectedAnswer = answer?.selectedAnswer || null;
  
  if (answer?.shuffledOrder && typeof answer.shuffledOrder === 'object') {
    // Use existing shuffled order (question was already accessed)
    const reverseMapping = answer.shuffledOrder as Record<string, string>;
    const originalOptions = question.options as Array<{ key: string; text: string }>;
    
    // Reconstruct shuffled options from mapping
    shuffledOptions = ['A', 'B', 'C', 'D'].map((shuffledKey) => {
      const originalKey = reverseMapping[shuffledKey];
      const originalOption = originalOptions.find(opt => opt.key === originalKey);
      return {
        key: shuffledKey,
        text: originalOption?.text || '',
      };
    });
    
    // Map selected answer from original to shuffled format for display
    if (selectedAnswer && reverseMapping) {
      // Find which shuffled key maps to the original selected answer
      const shuffledKey = Object.keys(reverseMapping).find(
        key => reverseMapping[key] === selectedAnswer
      );
      if (shuffledKey) {
        selectedAnswer = shuffledKey;
      }
    }
  } else {
    // First time accessing this question - shuffle and store mapping
    const shuffledQuestion = shuffleAIGPQuestionOptions({
      questionId: question.questionId,
      options: question.options as Array<{ key: string; text: string }>,
      correctAnswer: question.correctAnswer,
    });
    
    shuffledOptions = shuffledQuestion.shuffledOptions;
    
    // Create or update answer record with mapping
    if (answer) {
      // Update existing answer with mapping
      answer = await prisma.aIGPExamAnswer.update({
        where: { id: answer.id },
        data: {
          shuffledOrder: shuffledQuestion.reverseMapping,
          optionOrder: question.options,
        },
      });
    } else {
      // Create new answer record with mapping
      answer = await prisma.aIGPExamAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: question.id,
          shuffledOrder: shuffledQuestion.reverseMapping, // Store mapping for answer evaluation
          optionOrder: question.options, // Store original order for review
        },
      });
    }
  }
  
  // Return question with shuffled options (without correct_answer until submitted)
  return NextResponse.json({
    questionId: question.questionId,
    questionOrder: question.questionOrder,
    question: question.question,
    options: shuffledOptions, // Return shuffled options
    domain: question.domain,
    topic: question.topic,
    difficulty: question.difficulty,
    isCaseStudy: question.isCaseStudy,
    estimatedTimeSec: question.estimatedTimeSec,
    jurisdiction: question.jurisdiction,
    sourceRefs: question.sourceRefs,
    selectedAnswer: selectedAnswer, // Selected answer in shuffled format
    isFlagged: answer?.isFlagged || false,
    timeSpentSec: answer?.timeSpentSec || 0,
  });
}

