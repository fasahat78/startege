import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { redirect } from 'next/navigation';
import ExamSimulator from '@/components/aigp-exams/ExamSimulator';
import { prisma } from '@/lib/db';

export default async function ExamAttemptPage({
  params,
}: {
  params: Promise<{ examId: string; attemptId: string }>;
}) {
  const { examId, attemptId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin-firebase?redirect=/aigp-exams');
  }
  
  // Verify attempt belongs to user
  const attempt = await prisma.aIGPExamAttempt.findUnique({
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
}

