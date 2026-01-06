import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { redirect } from 'next/navigation';
import ExamSimulator from '@/components/aigp-exams/ExamSimulator';
import { prisma } from '@/lib/db';

export default async function ExamAttemptPage({
  params,
}: {
  params: Promise<{ examId: string; attemptId: string }>;
}) {
  try {
    const { examId, attemptId } = await params;
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/auth/signin-firebase?redirect=/aigp-exams');
    }
    
    // Verify attempt belongs to user
    let attempt;
    try {
      attempt = await prisma.aIGPExamAttempt.findUnique({
        where: { id: attemptId },
        include: {
          exam: {
            select: {
              id: true,
              examId: true,
              title: true,
              totalQuestions: true,
              estimatedTimeMin: true,
            },
          },
        },
      });
    } catch (dbError: any) {
      console.error('[EXAM ATTEMPT PAGE] Error fetching attempt:', dbError);
      // If table doesn't exist or query fails, redirect to exams list
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        console.warn('[EXAM ATTEMPT PAGE] AIGPExamAttempt table not found');
        redirect('/aigp-exams');
      }
      throw dbError;
    }
    
    if (!attempt || attempt.userId !== user.id) {
      redirect('/aigp-exams');
    }
    
    if (attempt.exam.examId !== examId) {
      redirect('/aigp-exams');
    }
    
    if (attempt.status !== 'IN_PROGRESS') {
      redirect(`/aigp-exams/${examId}/attempt/${attemptId}/review`);
    }
    
    return <ExamSimulator attemptId={attemptId} examId={examId} />;
  } catch (error: any) {
    // redirect() throws a NEXT_REDIRECT error - this is expected behavior, don't log it
    if (error?.digest === 'NEXT_REDIRECT' || error?.message === 'NEXT_REDIRECT') {
      throw error; // Re-throw redirect errors without logging
    }
    
    // Only log actual errors, not redirects
    console.error('[EXAM ATTEMPT PAGE] Fatal error:', error);
    console.error('[EXAM ATTEMPT PAGE] Error code:', error?.code);
    console.error('[EXAM ATTEMPT PAGE] Error message:', error?.message);
    throw error;
  }
}

