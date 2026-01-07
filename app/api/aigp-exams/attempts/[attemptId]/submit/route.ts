import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function POST(
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
  
  if (attempt.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Attempt already submitted' }, { status: 400 });
  }
  
  // Get total number of questions in the exam
  const totalQuestions = attempt.exam.questions.length;
  
  // Calculate scores
  let correctCount = 0;
  let totalAnswered = 0;
  const domainStats = new Map<string, { correct: number; total: number }>();
  const difficultyStats = new Map<string, { correct: number; total: number }>();
  const jurisdictionStats = new Map<string, { correct: number; total: number }>();
  const topicStats = new Map<string, { correct: number; total: number }>();
  
  // Process each answer
  for (const answer of attempt.answers) {
    const question = answer.question;
    
    if (answer.selectedAnswer) {
      totalAnswered++;
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      // Update answer with correctness
      await prisma.aIGPExamAnswer.update({
        where: { id: answer.id },
        data: { isCorrect },
      });
      
      // Aggregate domain stats
      const domainStat = domainStats.get(question.domain) || { correct: 0, total: 0 };
      domainStat.total++;
      if (isCorrect) domainStat.correct++;
      domainStats.set(question.domain, domainStat);
      
      // Aggregate difficulty stats
      const difficultyStat = difficultyStats.get(question.difficulty) || { correct: 0, total: 0 };
      difficultyStat.total++;
      if (isCorrect) difficultyStat.correct++;
      difficultyStats.set(question.difficulty, difficultyStat);
      
      // Aggregate jurisdiction stats
      const jurisdictionStat = jurisdictionStats.get(question.jurisdiction) || { correct: 0, total: 0 };
      jurisdictionStat.total++;
      if (isCorrect) jurisdictionStat.correct++;
      jurisdictionStats.set(question.jurisdiction, jurisdictionStat);
      
      // Aggregate topic stats
      const topicStat = topicStats.get(question.topic) || { correct: 0, total: 0 };
      topicStat.total++;
      if (isCorrect) topicStat.correct++;
      topicStats.set(question.topic, topicStat);
    }
  }
  
  // Calculate percentage score based on TOTAL questions, not just answered ones
  // This ensures that unanswered questions count as incorrect
  const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const pass = score >= (attempt.exam.passMark || 70);
  
  // Convert stats to JSON
  const domainScores: Record<string, any> = {};
  for (const [domain, stat] of domainStats) {
    domainScores[domain] = {
      ...stat,
      score: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0,
    };
  }
  
  const difficultyScores: Record<string, any> = {};
  for (const [difficulty, stat] of difficultyStats) {
    difficultyScores[difficulty] = {
      ...stat,
      score: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0,
    };
  }
  
  const jurisdictionScores: Record<string, any> = {};
  for (const [jurisdiction, stat] of jurisdictionStats) {
    jurisdictionScores[jurisdiction] = {
      ...stat,
      score: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0,
    };
  }
  
  const topicScores: Record<string, any> = {};
  for (const [topic, stat] of topicStats) {
    topicScores[topic] = {
      ...stat,
      score: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0,
    };
  }
  
  // Update attempt
  const updatedAttempt = await prisma.aIGPExamAttempt.update({
    where: { id: attemptId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      evaluatedAt: new Date(),
      score,
      rawScore: correctCount,
      totalQuestions: totalQuestions, // Store actual total questions, not just answered
      pass,
      domainScores,
      difficultyScores,
      jurisdictionScores,
      topicScores,
    },
  });
  
  return NextResponse.json({
    success: true,
    score,
    rawScore: correctCount,
    totalQuestions: totalQuestions, // Return actual total questions
    totalAnswered: totalAnswered, // Also return answered count for reference
    pass,
    domainScores,
    difficultyScores,
    jurisdictionScores,
    topicScores,
  });
}

