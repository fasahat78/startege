import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';
import { generateResponse, isGeminiConfigured } from '@/lib/gemini';
import { deductCredits, checkCreditBalance } from '@/lib/ai-credits';

const CREDITS_PER_CALL = 10; // Fixed cost per API call - Startegizer premium AI tutor

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { questionId, userQuestion } = await request.json();
  
  if (!questionId) {
    return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
  }
  
  // Verify attempt belongs to user
  const attempt = await prisma.aIGPExamAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
    },
  });
  
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }
  
  if (attempt.status === 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Exam not yet submitted' }, { status: 400 });
  }
  
  // Find the question by questionId (the string ID like "AIGP-Q-001")
  const question = await prisma.aIGPQuestion.findUnique({
    where: { questionId }, // questionId is the unique string ID
  });
  
  if (!question || question.examId !== attempt.examId) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }
  
  // Get the answer for this question (using question.id which is the Prisma ID)
  const answer = await prisma.aIGPExamAnswer.findUnique({
    where: {
      attemptId_questionId: {
        attemptId: attempt.id,
        questionId: question.id, // Use Prisma ID, not questionId string
      },
    },
  });
  
  // Check premium status
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionTier: true },
  });
  
  if (dbUser?.subscriptionTier !== 'premium') {
    return NextResponse.json(
      { error: 'Premium subscription required' },
      { status: 403 }
    );
  }
  
  // Check credit balance
  const currentBalance = await checkCreditBalance(user.id);
  if (currentBalance < CREDITS_PER_CALL) {
    return NextResponse.json(
      {
        error: 'Insufficient credits',
        message: `You need at least ${CREDITS_PER_CALL} credits to use this feature. Your current balance: ${currentBalance} credits.`,
        currentBalance,
        requiredCredits: CREDITS_PER_CALL,
      },
      { status: 402 }
    );
  }
  
  // Build context for Startegizer
  const optionsText = question.options && Array.isArray(question.options)
    ? question.options.map((opt: any) => `  ${opt.key}. ${opt.text}`).join('\n')
    : 'No options available';

  const questionContext = `
Question: ${question.question}

Options:
${optionsText}

Correct Answer: ${question.correctAnswer}
Your Answer: ${answer?.selectedAnswer || 'Not answered'}
Result: ${answer?.isCorrect ? 'Correct' : answer?.selectedAnswer ? 'Incorrect' : 'Unanswered'}

Domain: ${question.domain}
Topic: ${question.topic}
Difficulty: ${question.difficulty}
Jurisdiction: ${question.jurisdiction}
${question.isCaseStudy ? 'Type: Case Study' : ''}

Basic Explanation: ${question.explanation}
  `.trim();
  
  // Build prompt
  const systemPrompt = `You are an expert AI Governance tutor helping a student understand an exam question they got wrong or want to learn more about.

Context:
${questionContext}

${userQuestion 
  ? `Student's specific question: ${userQuestion}`
  : `Provide a detailed, educational explanation that:
1. Explains why the correct answer is correct
2. Explains why the other options are incorrect (if the student got it wrong)
3. Provides additional context about the topic and domain
4. Relates it to real-world AI governance scenarios
5. Offers actionable insights for understanding this concept better

Be conversational, educational, and encouraging. Help the student truly understand the concept, not just memorize the answer.`}

Keep your response focused, clear, and under 300 words unless the student asks for more detail.`;

  let responseText = '';
  let creditsDeducted = false;
  
  if (isGeminiConfigured()) {
    try {
      const geminiResponse = await generateResponse(systemPrompt);
      responseText = geminiResponse.text;
      
      // Deduct credits
      const deductionResult = await deductCredits(user.id, CREDITS_PER_CALL);
      if (!deductionResult.success) {
        console.error('[CREDIT_DEDUCTION_FAILED]', deductionResult.error);
      } else {
        creditsDeducted = true;
        console.log(`[CREDITS_DEDUCTED] ✅ User ${user.id}: ${CREDITS_PER_CALL} credits deducted. Remaining: ${deductionResult.remainingBalance}`);
      }
    } catch (error: any) {
      console.error('[GEMINI_ERROR]', error);
      return NextResponse.json(
        { error: 'Failed to generate explanation', details: error.message },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: 'AI service not configured' },
      { status: 503 }
    );
  }
  
  const updatedBalance = await checkCreditBalance(user.id);
  
  return NextResponse.json({
    explanation: responseText,
    credits: {
      deducted: creditsDeducted ? CREDITS_PER_CALL : 0,
      balance: updatedBalance,
    },
  });
}

