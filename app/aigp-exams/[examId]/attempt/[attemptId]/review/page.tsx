import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { redirect } from 'next/navigation';
import ExamReview from '@/components/aigp-exams/ExamReview';
import { prisma } from '@/lib/db';

export default async function ExamReviewPage({
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
          examId: true,
          title: true,
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
  
  if (attempt.status === 'IN_PROGRESS') {
    redirect(`/aigp-exams/${examId}/attempt/${attemptId}`);
  }
  
  return <ExamReview attemptId={attemptId} examId={examId} />;
}

