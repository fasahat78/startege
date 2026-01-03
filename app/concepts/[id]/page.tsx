import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConceptCardActions from "@/components/concepts/ConceptCardActions";

async function getConceptCard(id: string) {
  return await prisma.conceptCard.findUnique({
    where: { id },
  });
}

async function getUserProgress(userId: string, conceptCardId: string) {
  return await prisma.userProgress.findUnique({
    where: {
      userId_conceptCardId: {
        userId,
        conceptCardId,
      },
    },
  });
}

export default async function ConceptCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/concepts");
  }

  const { id } = await params;
  const conceptCard = await getConceptCard(id);

  if (!conceptCard) {
    notFound();
  }

  const userProgress = await getUserProgress(user.id, id);

  const difficultyColors: Record<string, string> = {
    beginner: "bg-status-success/10 text-status-success border-status-success/20",
    intermediate: "bg-status-warning/10 text-status-warning border-status-warning/20",
    advanced: "bg-status-error/10 text-status-error border-status-error/20",
  };

  // Standard read time for all concepts
  const estimatedReadTime = 2;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/concepts"
            className="text-accent hover:text-accent/80 mb-4 inline-flex items-center transition"
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
            Back to Concepts
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card rounded-lg shadow-card p-6 md:p-8">
          {/* Header Info */}
          <div className="mb-6 pb-6 border-b border-border">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-card-foreground mb-3">
                  {conceptCard.concept}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="font-medium">{conceptCard.domain}</span>
                  <span className="text-border">•</span>
                  <span>{conceptCard.category}</span>
                  <span className="text-border">•</span>
                  <span>{estimatedReadTime} min read</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-lg border text-sm font-medium ${
                  difficultyColors[conceptCard.difficulty] ||
                  "bg-muted text-muted-foreground border-border"
                }`}
              >
                {conceptCard.difficulty}
              </span>
            </div>
          </div>

          {/* Definition */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Definition
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-card-foreground leading-relaxed text-base">
                {conceptCard.definition}
              </p>
            </div>
          </section>

          {/* AI Governance Scenario */}
          {conceptCard.scenarioQuestion && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                AI Governance Scenario
              </h2>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-card-foreground leading-relaxed text-base">
                    {conceptCard.scenarioQuestion}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="pt-6 border-t border-border">
            <ConceptCardActions
              conceptCardId={id}
              currentStatus={userProgress?.status || "not_started"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

