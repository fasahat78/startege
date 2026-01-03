import { prisma } from "../lib/db";

async function checkConcepts() {
  const challenges = await (prisma as any).challenge.findMany({
    where: {
      levelNumber: {
        gte: 1,
        lte: 9,
      },
    },
    select: {
      levelNumber: true,
      concepts: true,
    },
    orderBy: {
      levelNumber: "asc",
    },
  });

  console.log("Challenges with concepts:");
  challenges.forEach((c: any) => {
    console.log(`Level ${c.levelNumber}: ${c.concepts?.length || 0} concepts`);
    if (c.concepts && c.concepts.length > 0) {
      console.log(`  Sample: ${c.concepts.slice(0, 3).join(", ")}`);
    }
  });

  // Collect all concept IDs
  const allConceptIds = new Set<string>();
  challenges.forEach((c: any) => {
    if (c.concepts && Array.isArray(c.concepts)) {
      c.concepts.forEach((id: string) => allConceptIds.add(id));
    }
  });

  console.log(`\nTotal unique concept IDs: ${allConceptIds.size}`);
  console.log(`Sample IDs: ${Array.from(allConceptIds).slice(0, 5).join(", ")}`);

  // Try to find ConceptCards
  const conceptCards = await (prisma as any).conceptCard.findMany({
    where: {
      OR: [
        { name: { in: Array.from(allConceptIds).slice(0, 10) } },
        { concept: { in: Array.from(allConceptIds).slice(0, 10) } },
      ],
    },
    select: {
      id: true,
      name: true,
      concept: true,
    },
    take: 5,
  });

  console.log(`\nFound ${conceptCards.length} ConceptCards`);
  conceptCards.forEach((cc: any) => {
    console.log(`  ${cc.name || cc.concept} (id: ${cc.id})`);
  });

  await prisma.$disconnect();
}

checkConcepts();

