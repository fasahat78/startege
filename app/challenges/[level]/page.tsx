import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { getLevelConfig } from "@/lib/levels";
import Link from "next/link";
import ChallengeStart from "@/components/challenges/ChallengeStart";

async function getChallenge(levelNumber: number) {
  const challenge = await (prisma as any).challenge.findUnique({
    where: { levelNumber },
  });
  
  if (!challenge) {
    return null;
  }
  
  // Legacy code - keeping for backward compatibility but not used
  return {
    ...challenge,
    attempts: [],
  };
}

async function getUserLevelProgress(userId: string, levelNumber: number) {
  return await (prisma as any).userLevelProgress.findUnique({
    where: {
      userId_levelNumber: {
        userId,
        levelNumber,
      },
    },
  });
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/challenges");
  }

  const { level } = await params;
  const levelNumber = parseInt(level);

  if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 40) {
    redirect("/challenges");
  }

  const challenge = await getChallenge(levelNumber);
  const levelConfig = getLevelConfig(levelNumber);
  const userProgress = await getUserLevelProgress(user.id, levelNumber);

  if (!challenge || !levelConfig) {
    redirect("/challenges");
  }

  // Get exam for this level
  const exam = await (prisma as any).exam.findFirst({
    where: {
      type: "LEVEL",
      levelNumber: levelNumber,
    },
    select: {
      id: true,
    },
  });

  // Get past attempts for this exam
  let pastAttempts: any[] = [];
  if (exam) {
    pastAttempts = await (prisma as any).examAttempt.findMany({
      where: {
        examId: exam.id,
        userId: user.id,
        status: "EVALUATED", // Only show completed attempts
      },
      select: {
        id: true,
        attemptNumber: true,
        score: true,
        pass: true,
        submittedAt: true,
        evaluatedAt: true,
        startedAt: true,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });
  }

  // Check if user has access
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionTier: true },
  });

  if (!dbUser) {
    redirect("/auth/signin-firebase?redirect=/challenges");
  }

  // Premium gating: Levels 11-40 require premium
  if (levelNumber > 10 && dbUser.subscriptionTier !== "premium") {
    redirect("/pricing?feature=level-exams");
  }

  // Get concepts for this level
  const concepts = await prisma.conceptCard.findMany({
    where: {
      id: {
        in: challenge.concepts,
      },
    },
    select: {
      id: true,
      concept: true,
      domain: true,
    },
  });

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/challenges"
          className="text-accent hover:text-accent/80 mb-6 inline-flex items-center transition"
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Challenges
        </Link>

        <ChallengeStart
          challenge={{
            ...challenge,
            level: challenge.levelNumber || challenge.level || levelNumber,
          }}
          levelConfig={levelConfig}
          userProgress={userProgress}
          concepts={concepts}
          pastAttempts={pastAttempts}
        />
      </div>
    </div>
  );
}

