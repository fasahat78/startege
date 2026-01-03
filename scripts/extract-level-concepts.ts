/**
 * Extract Level-Concept Mapping
 * Generates a JSON file with all 36 levels and their assigned concepts
 */

import { prisma } from "../lib/db";

async function extractLevelConcepts() {
  const levels = [];
  
  // Process levels 1-40 (excluding boss levels 10, 20, 30, 40)
  const regularLevels = Array.from({ length: 40 }, (_, i) => i + 1).filter(
    (level) => ![10, 20, 30, 40].includes(level)
  );
  
  for (const levelNumber of regularLevels) {
    const challenge = await (prisma as any).challenge.findUnique({
      where: { levelNumber },
      select: { 
        concepts: true, 
        title: true,
        questionCount: true,
        timeLimit: true,
        passingScore: true
      }
    });
    
    if (!challenge || !challenge.concepts || challenge.concepts.length === 0) {
      console.warn(`⚠️  Level ${levelNumber}: No concepts found`);
      continue;
    }
    
    const concepts = await (prisma as any).conceptCard.findMany({
      where: { id: { in: challenge.concepts } },
      select: {
        id: true,
        concept: true,
        name: true,
        definition: true,
        difficulty: true,
        categoryId: true,
        categoryRelation: {
          select: {
            id: true,
            name: true,
            domain: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { concept: "asc" }
    });
    
    levels.push({
      levelNumber,
      title: challenge.title,
      questionCount: challenge.questionCount || 10,
      timeLimit: challenge.timeLimit || 20,
      passingScore: challenge.passingScore || 70,
      conceptCount: concepts.length,
      concepts: concepts.map((c: any) => ({
        id: c.id,
        concept: c.concept,
        name: c.name || c.concept,
        definition: c.definition,
        difficulty: c.difficulty,
        categoryId: c.categoryRelation?.id || c.categoryId,
        categoryName: c.categoryRelation?.name || "Unknown",
        domainName: c.categoryRelation?.domain?.name || "Unknown"
      }))
    });
  }
  
  return levels;
}

extractLevelConcepts()
  .then(levels => {
    console.log(JSON.stringify(levels, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });

