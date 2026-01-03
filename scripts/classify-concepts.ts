import { prisma } from "../lib/db";

/**
 * Classify concepts by difficulty based on their domain and existing difficulty field
 */
async function classifyConcepts() {
  console.log("📊 Classifying concepts by difficulty and importance...");

  const allConcepts = await prisma.conceptCard.findMany();
  let updated = 0;

  for (const concept of allConcepts) {
    let difficulty = concept.difficulty.toLowerCase();
    let importance = concept.importance?.toLowerCase() || "medium";

    // Use existing difficulty field if valid, otherwise infer
    const validDifficulties = ["beginner", "intermediate", "advanced", "expert"];
    const existingDifficulty = concept.difficulty?.toLowerCase();
    
    if (validDifficulties.includes(existingDifficulty)) {
      difficulty = existingDifficulty;
    } else {
      // Infer from domain and category
      if (concept.domain === "Domain 1") {
        // Distribute Domain 1 across difficulty levels
        const domain1Concepts = allConcepts.filter(c => c.domain === "Domain 1");
        const index = domain1Concepts.findIndex(c => c.id === concept.id);
        const total = domain1Concepts.length;
        if (index < total * 0.4) {
          difficulty = "beginner";
        } else if (index < total * 0.7) {
          difficulty = "intermediate";
        } else if (index < total * 0.9) {
          difficulty = "advanced";
        } else {
          difficulty = "expert";
        }
      } else if (concept.domain === "Domain 2") {
        const domain2Concepts = allConcepts.filter(c => c.domain === "Domain 2");
        const index = domain2Concepts.findIndex(c => c.id === concept.id);
        const total = domain2Concepts.length;
        if (index < total * 0.3) {
          difficulty = "beginner";
        } else if (index < total * 0.6) {
          difficulty = "intermediate";
        } else if (index < total * 0.85) {
          difficulty = "advanced";
        } else {
          difficulty = "expert";
        }
      } else if (concept.domain === "Domain 3") {
        const domain3Concepts = allConcepts.filter(c => c.domain === "Domain 3");
        const index = domain3Concepts.findIndex(c => c.id === concept.id);
        const total = domain3Concepts.length;
        if (index < total * 0.2) {
          difficulty = "intermediate";
        } else if (index < total * 0.6) {
          difficulty = "advanced";
        } else {
          difficulty = "expert";
        }
      } else if (concept.domain === "Domain 4") {
        const domain4Concepts = allConcepts.filter(c => c.domain === "Domain 4");
        const index = domain4Concepts.findIndex(c => c.id === concept.id);
        const total = domain4Concepts.length;
        if (index < total * 0.3) {
          difficulty = "advanced";
        } else {
          difficulty = "expert";
        }
      } else if (concept.domain === "Bonus") {
        difficulty = "expert";
      } else {
        // Default to intermediate
        difficulty = "intermediate";
      }
    }

    // Set importance based on concept characteristics
    // High importance: Core concepts that appear frequently
    const highImportanceKeywords = [
      "GDPR",
      "AI Act",
      "Risk Management",
      "Privacy",
      "Data Protection",
      "Transparency",
      "Accountability",
      "Ethical",
      "Impact Assessment",
      "High-Risk",
      "Governance",
      "Compliance",
    ];

    const conceptText = `${concept.concept} ${concept.definition || ""} ${concept.overview || ""}`.toLowerCase();
    const keywordMatches = highImportanceKeywords.filter((keyword) =>
      conceptText.includes(keyword.toLowerCase())
    ).length;

    // High importance if multiple keywords match or if it's a fundamental concept
    if (keywordMatches >= 2 || conceptText.includes("fundamental") || conceptText.includes("core")) {
      importance = "high";
    } else if (keywordMatches >= 1 || concept.category === "Governance" || concept.category === "Compliance") {
      importance = "medium";
    } else {
      importance = "low";
    }

    // Update concept
    await prisma.conceptCard.update({
      where: { id: concept.id },
      data: {
        difficulty: difficulty,
        importance: importance,
      },
    });

    updated++;
  }

  console.log(`✅ Classified ${updated} concepts`);
  console.log("\n📊 Classification Summary:");

  const byDifficulty = await prisma.conceptCard.groupBy({
    by: ["difficulty"],
    _count: true,
  });

  const byImportance = await prisma.conceptCard.groupBy({
    by: ["importance"],
    _count: true,
  });

  console.log("\nBy Difficulty:");
  byDifficulty.forEach(({ difficulty, _count }) => {
    console.log(`  ${difficulty}: ${_count}`);
  });

  console.log("\nBy Importance:");
  byImportance.forEach(({ importance, _count }) => {
    console.log(`  ${importance}: ${_count}`);
  });
}

classifyConcepts()
  .then(() => {
    console.log("\n✨ Classification complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error classifying concepts:", error);
    process.exit(1);
  });

