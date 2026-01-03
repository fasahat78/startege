/**
 * Search script to find Level 11 concepts in the database
 * Helps identify if concepts exist with different names
 */

import { prisma } from "../lib/db";

const LEVEL_11_CONCEPTS = [
  "What Is an AI Use Case (Governance Perspective)",
  "Business Objective vs AI Capability",
  "Defining Intended Purpose of an AI System",
  "Users Subjects and Affected Stakeholders",
  "In-Scope vs Out-of-Scope Decisions",
  "Assumptions and Constraints in AI Use Cases",
  "Who Owns an AI Use Case",
  "Early Risk Signals During Use Case Design",
  "When a Use Case Should Be Stopped or Redesigned",
  "Mapping Use Cases to the AI Lifecycle",
];

async function findConcepts() {
  console.log("🔍 Searching for Level 11 concepts...\n");

  for (const conceptName of LEVEL_11_CONCEPTS) {
    console.log(`\n📋 Searching for: "${conceptName}"`);
    console.log("─".repeat(60));

    // Extract key terms
    const terms = conceptName
      .toLowerCase()
      .replace(/[()]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["is", "an", "the", "and", "vs", "to", "of"].includes(w));

    // Search for each term
    for (const term of terms.slice(0, 3)) {
      const matches = await prisma.conceptCard.findMany({
        where: {
          OR: [
            { concept: { contains: term, mode: "insensitive" } },
            { definition: { contains: term, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          concept: true,
          domain: true,
          category: true,
        },
        take: 5,
      });

      if (matches.length > 0) {
        console.log(`\n  Term: "${term}"`);
        matches.forEach((m) => {
          console.log(`    ✓ ${m.concept} (${m.domain} / ${m.category})`);
        });
      }
    }
  }

  console.log("\n✨ Search complete!");
}

findConcepts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

