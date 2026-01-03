import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/firebase-auth-helpers';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { timeRemainingSec } = await request.json();
  
  const attempt = await prisma.aIGPExamAttempt.findUnique({
    where: { id: attemptId },
  });
  
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }
  
  if (attempt.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Attempt is not in progress' }, { status: 400 });
  }
  
  const updated = await prisma.aIGPExamAttempt.update({
    where: { id: attemptId },
    data: {
      pausedAt: new Date(),
      timeRemainingSec: timeRemainingSec || attempt.timeRemainingSec,
    },
  });
  
  return NextResponse.json({ success: true, pausedAt: updated.pausedAt });
}

