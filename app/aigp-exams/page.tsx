import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { redirect } from 'next/navigation';
import AIGPExamsClient from '@/components/aigp-exams/AIGPExamsClient';
import { prisma } from '@/lib/db';

// Mark as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

export default async function AIGPExamsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/signin-firebase?redirect=/aigp-exams');
  }
  
  // Premium check
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionTier: true },
  });
  
  if (userRecord?.subscriptionTier !== 'premium') {
    redirect('/pricing?feature=aigp-exams');
  }
  
  // Fetch exams
  const exams = await prisma.aIGPExam.findMany({
    where: { isActive: true, status: 'PUBLISHED' },
    include: {
      attempts: {
        where: { userId: user.id },
        orderBy: { attemptNumber: 'desc' },
        select: {
          id: true,
          attemptNumber: true,
          status: true,
          score: true,
          submittedAt: true,
        },
      },
    },
    orderBy: { examId: 'asc' },
  });
  
  return <AIGPExamsClient exams={exams} />;
}

