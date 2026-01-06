import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { redirect } from 'next/navigation';
import AIGPExamsClient from '@/components/aigp-exams/AIGPExamsClient';
import { prisma } from '@/lib/db';

// Mark as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

export default async function AIGPExamsPage() {
  try {
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
    
    // Fetch exams - wrap in try-catch to handle missing table gracefully
    let exams = [];
    try {
      exams = await prisma.aIGPExam.findMany({
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
    } catch (dbError: any) {
      console.error('[AIGP EXAMS PAGE] Error fetching exams:', dbError);
      // If table doesn't exist, use empty array
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        console.warn('[AIGP EXAMS PAGE] AIGPExam table not found, using empty array');
        exams = [];
      } else {
        // Re-throw other database errors
        throw dbError;
      }
    }
    
    return <AIGPExamsClient exams={exams} />;
  } catch (error: any) {
    // redirect() throws a NEXT_REDIRECT error - this is expected behavior, don't log it
    if (error?.digest === 'NEXT_REDIRECT' || error?.message === 'NEXT_REDIRECT') {
      throw error; // Re-throw redirect errors without logging
    }
    
    // Only log actual errors, not redirects
    console.error('[AIGP EXAMS PAGE] Fatal error:', error);
    console.error('[AIGP EXAMS PAGE] Error code:', error?.code);
    console.error('[AIGP EXAMS PAGE] Error message:', error?.message);
    console.error('[AIGP EXAMS PAGE] Error stack:', error?.stack);
    throw error; // Re-throw to show error page
  }
}

