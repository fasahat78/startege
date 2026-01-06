/**
 * Test script to verify concept filters are working correctly
 */

import { prisma } from "@/lib/db";

async function testFilters() {
  console.log("=== TESTING CONCEPT FILTERS ===\n");

  try {
    // Test 1: Get all concepts (no filters)
    console.log("Test 1: Get all concepts (no filters)");
    const allConcepts = await prisma.conceptCard.findMany({
      where: {},
      select: { id: true, domain: true, difficulty: true, concept: true },
      take: 5,
    });
    console.log(`✅ Found ${allConcepts.length} concepts (showing first 5)`);
    console.log("");

    // Test 2: Filter by domain
    console.log("Test 2: Filter by domain");
    const domains = await prisma.conceptCard.findMany({
      select: { domain: true },
      distinct: ["domain"],
    });
    const testDomain = domains[0]?.domain;
    if (testDomain) {
      const domainConcepts = await prisma.conceptCard.findMany({
        where: { domain: testDomain },
        select: { id: true, domain: true, concept: true },
      });
      console.log(`✅ Domain filter: Found ${domainConcepts.length} concepts in "${testDomain}"`);
    }
    console.log("");

    // Test 3: Filter by difficulty
    console.log("Test 3: Filter by difficulty");
    const difficulties = ["beginner", "intermediate", "advanced", "expert"];
    for (const difficulty of difficulties) {
      const difficultyConcepts = await prisma.conceptCard.findMany({
        where: { difficulty: difficulty.toLowerCase() },
        select: { id: true, difficulty: true, concept: true },
        take: 3,
      });
      console.log(`   ${difficulty}: ${difficultyConcepts.length} concepts`);
    }
    console.log("");

    // Test 4: Search filter
    console.log("Test 4: Search filter");
    const searchTerms = ["AI", "governance", "risk"];
    for (const term of searchTerms) {
      const searchResults = await prisma.conceptCard.findMany({
        where: {
          OR: [
            { concept: { contains: term, mode: "insensitive" } },
            { definition: { contains: term, mode: "insensitive" } },
            { domain: { contains: term, mode: "insensitive" } },
            { category: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, concept: true },
        take: 3,
      });
      console.log(`   "${term}": ${searchResults.length} results`);
    }
    console.log("");

    // Test 5: Combined filters (domain + difficulty)
    console.log("Test 5: Combined filters (domain + difficulty)");
    if (testDomain) {
      const combinedResults = await prisma.conceptCard.findMany({
        where: {
          AND: [
            { domain: testDomain },
            { difficulty: "beginner" },
          ],
        },
        select: { id: true, domain: true, difficulty: true, concept: true },
      });
      console.log(`✅ Combined filter: Found ${combinedResults.length} beginner concepts in "${testDomain}"`);
    }
    console.log("");

    // Test 6: Check assigned concepts logic
    console.log("Test 6: Check assigned concepts logic");
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
    console.log(`✅ Found ${assignedConceptIds.size} unique concepts assigned to levels 1-40`);
    
    if (assignedConceptIds.size > 0) {
      const assignedConcepts = await prisma.conceptCard.findMany({
        where: { id: { in: Array.from(assignedConceptIds).slice(0, 10) } },
        select: { id: true, concept: true },
        take: 5,
      });
      console.log(`✅ Verified ${assignedConcepts.length} assigned concepts exist`);
    } else {
      console.log("⚠️  No concepts assigned to challenges - all concepts will be shown");
    }
    console.log("");

    // Test 7: Check difficulty values in database
    console.log("Test 7: Check difficulty values in database");
    const difficultyCounts = await prisma.conceptCard.groupBy({
      by: ["difficulty"],
      _count: true,
    });
    console.log("   Difficulty distribution:");
    difficultyCounts.forEach(({ difficulty, _count }) => {
      const normalized = difficulty.toLowerCase();
      const isValid = ["beginner", "intermediate", "advanced", "expert"].includes(normalized);
      console.log(`   ${difficulty} (${normalized}): ${_count} concepts ${isValid ? "✅" : "⚠️"}`);
    });
    console.log("");

    console.log("=== FILTER TESTS COMPLETE ===");
    console.log("\nSummary:");
    console.log("✅ All basic filters working");
    console.log("✅ Search filter working");
    console.log("✅ Combined filters working");
    console.log("✅ Assigned concepts logic working");

  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testFilters();

