import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ConceptsClient from "@/components/concepts/ConceptsClient";

// Mark as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

interface ConceptCard {
  id: string;
  domain: string;
  category: string;
  concept: string;
  difficulty: string;
  estimatedReadTime: number;
}

interface ConceptGroup {
  domain: string;
  categories: {
    category: string;
    concepts: ConceptCard[];
  }[];
}

async function getConcepts(
  domain?: string,
  difficulty?: string,
  search?: string
): Promise<ConceptCard[]> {
  // Get all concepts assigned to levels 1-40
  const challenges = await prisma.challenge.findMany({
    where: { levelNumber: { lte: 40 } },
    select: { concepts: true },
  });

  const assignedConceptIds = new Set<string>();
  challenges.forEach((challenge) => {
    if (Array.isArray(challenge.concepts)) {
      challenge.concepts.forEach((id: string) => assignedConceptIds.add(id));
    }
  });

  const where: any = {};
  const andConditions: any[] = [];

  if (assignedConceptIds.size > 0) {
    andConditions.push({ id: { in: Array.from(assignedConceptIds) } });
  }

  if (domain && domain !== "all") {
    andConditions.push({ domain });
  }

  if (difficulty && difficulty !== "all") {
    andConditions.push({ difficulty: difficulty.toLowerCase() });
  }

  if (search) {
    andConditions.push({
      OR: [
        { concept: { contains: search, mode: "insensitive" } },
        { definition: { contains: search, mode: "insensitive" } },
        { domain: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  // Only add where clause if we have conditions
  // Empty where {} means "return all"
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return await prisma.conceptCard.findMany({
    where,
    select: {
      id: true,
      domain: true,
      category: true,
      concept: true,
      difficulty: true,
      estimatedReadTime: true,
    },
    orderBy: {
      concept: "asc",
    },
  });
}

async function getDomains(): Promise<string[]> {
  const domains = await prisma.conceptCard.findMany({
    select: { domain: true },
    distinct: ["domain"],
    orderBy: { domain: "asc" },
  });
  return domains.map((d) => d.domain);
}

async function getCategories(): Promise<Array<{ domain: string; category: string; count: number }>> {
  const concepts = await prisma.conceptCard.findMany({
    select: { domain: true, category: true },
  });

  const categoryMap = new Map<string, number>();
  concepts.forEach((c) => {
    const key = `${c.domain}::${c.category}`;
    categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
  });

  return Array.from(categoryMap.entries()).map(([key, count]) => {
    const [domain, category] = key.split("::");
    return { domain, category, count };
  });
}

function groupConceptsByDomain(concepts: ConceptCard[]): ConceptGroup[] {
  const domainMap = new Map<string, Map<string, ConceptCard[]>>();

  concepts.forEach((concept) => {
    if (!domainMap.has(concept.domain)) {
      domainMap.set(concept.domain, new Map());
    }
    const categoryMap = domainMap.get(concept.domain)!;
    if (!categoryMap.has(concept.category)) {
      categoryMap.set(concept.category, []);
    }
    categoryMap.get(concept.category)!.push(concept);
  });

  return Array.from(domainMap.entries())
    .map(([domain, categoryMap]) => ({
      domain,
      categories: Array.from(categoryMap.entries())
        .map(([category, concepts]) => ({
          category,
          concepts: concepts.sort((a, b) => a.concept.localeCompare(b.concept)),
        }))
        .sort((a, b) => a.category.localeCompare(b.category)),
    }))
    .sort((a, b) => a.domain.localeCompare(b.domain));
}

export default async function ConceptsPage({
  searchParams,
}: {
  searchParams: { domain?: string; difficulty?: string; search?: string; view?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin-firebase?redirect=/concepts");
  }

  const domain = searchParams.domain || "all";
  const difficulty = searchParams.difficulty || "all";
  const search = searchParams.search || "";
  const view = searchParams.view || "grouped"; // "grouped" or "grid"

  const [concepts, domains, categories, userProgress] = await Promise.all([
    getConcepts(domain, difficulty, search),
    getDomains(),
    getCategories(),
    prisma.userProgress.findMany({
      where: { userId: user.id },
      select: {
        conceptCardId: true,
        status: true,
      },
    }),
  ]);

  const progressMap = new Map(
    userProgress.map((p) => [p.conceptCardId, p.status])
  );

  // Calculate progress per domain
  const domainProgress = new Map<string, { completed: number; total: number }>();
  concepts.forEach((concept) => {
    const current = domainProgress.get(concept.domain) || { completed: 0, total: 0 };
    current.total++;
    if (progressMap.get(concept.id) === "completed") {
      current.completed++;
    }
    domainProgress.set(concept.domain, current);
  });

  // Group concepts by domain and category
  const groupedConcepts = groupConceptsByDomain(concepts);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading concepts...</p>
        </div>
      </div>
    }>
      <ConceptsClient
        concepts={concepts}
        groupedConcepts={groupedConcepts}
        domains={domains}
        categories={categories}
        progressMap={progressMap}
        domainProgress={domainProgress}
        searchParams={{ domain, difficulty, search, view }}
      />
    </Suspense>
  );
}
