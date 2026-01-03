/**
 * Create missing concepts for Levels 11-12 and assign them to levels
 * 
 * This script:
 * 1. Creates ConceptCard records for missing concepts with placeholder definitions
 * 2. Assigns all concepts (existing + newly created) to their respective levels
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";

// Level 11 concepts with metadata from CSV
const LEVEL_11_CONCEPTS = [
  {
    name: "What Is an AI Use Case (Governance Perspective)",
    domain: "Domain 3",
    category: "Use Case Definition & Scoping",
    difficulty: "intermediate",
    notes: "Frames AI use cases as governable units",
  },
  {
    name: "Business Objective vs AI Capability",
    domain: "Domain 3",
    category: "Use Case Definition & Scoping",
    difficulty: "intermediate",
    notes: "Prevents solution-first thinking",
  },
  {
    name: "Defining Intended Purpose of an AI System",
    domain: "Domain 3",
    category: "Use Case Definition & Scoping",
    difficulty: "intermediate",
    notes: "Foundation for risk classification and compliance",
  },
  {
    name: "Users Subjects and Affected Stakeholders",
    domain: "Domain 3",
    category: "Use Case Definition & Scoping",
    difficulty: "intermediate",
    notes: "Introduces stakeholder impact awareness",
  },
  {
    name: "In-Scope vs Out-of-Scope Decisions",
    domain: "Domain 3",
    category: "Use Case Definition & Scoping",
    difficulty: "intermediate",
    notes: "Controls scope creep and governance bypass",
  },
  {
    name: "Assumptions and Constraints in AI Use Cases",
    domain: "Domain 3",
    category: "Use Case Definition & Scoping",
    difficulty: "intermediate",
    notes: "Makes implicit risks explicit",
  },
  {
    name: "Who Owns an AI Use Case",
    domain: "Domain 1",
    category: "Governance Structures & Roles",
    difficulty: "intermediate",
    notes: "Establishes accountable ownership at initiation",
  },
  {
    name: "Early Risk Signals During Use Case Design",
    domain: "Domain 3",
    category: "Risk Identification & Assessment",
    difficulty: "intermediate",
    notes: "Shifts risk identification left",
  },
  {
    name: "When a Use Case Should Be Stopped or Redesigned",
    domain: "Domain 3",
    category: "Risk Identification & Assessment",
    difficulty: "intermediate",
    notes: "Introduces early termination decisions",
  },
  {
    name: "Mapping Use Cases to the AI Lifecycle",
    domain: "Domain 1",
    category: "AI Lifecycle Governance",
    difficulty: "intermediate",
    notes: "Connects use case design to lifecycle controls",
  },
];

// Level 12 concepts with metadata from CSV
const LEVEL_12_CONCEPTS = [
  {
    name: "What Cross-Border AI Means in Practice",
    domain: "Domain 2",
    category: "Cross-Border Data & Jurisdiction",
    difficulty: "intermediate",
    notes: "Frames cross-border AI beyond simple data transfer",
  },
  {
    name: "Jurisdiction vs Location vs Citizenship",
    domain: "Domain 2",
    category: "Cross-Border Data & Jurisdiction",
    difficulty: "intermediate",
    notes: "Clarifies core legal and governance distinctions",
  },
  {
    name: "Where AI Decisions Are Made vs Where Data Is Stored",
    domain: "Domain 2",
    category: "Cross-Border Data & Jurisdiction",
    difficulty: "intermediate",
    notes: "Introduces distributed AI governance reality",
  },
  {
    name: "Applicable Law in Cross-Border AI Systems",
    domain: "Domain 2",
    category: "Cross-Border Data & Jurisdiction",
    difficulty: "intermediate",
    notes: "Explains multi-law applicability",
  },
  {
    name: "Data Flow Mapping for AI Use Cases",
    domain: "Domain 2",
    category: "Cross-Border Data & Jurisdiction",
    difficulty: "intermediate",
    notes: "Makes cross-border risk visible",
  },
  {
    name: "Why Cross-Border Context Increases Governance Risk",
    domain: "Domain 2",
    category: "Cross-Border Data & Jurisdiction",
    difficulty: "intermediate",
    notes: "Links geography to accountability exposure",
  },
  {
    name: "Personal Data in Cross-Border AI Systems",
    domain: "Domain 2",
    category: "Data Protection & Privacy Law",
    difficulty: "intermediate",
    notes: "Reinforces privacy amplification in global AI",
  },
  {
    name: "Cross-Border Consent and User Expectations",
    domain: "Domain 2",
    category: "Data Protection & Privacy Law",
    difficulty: "intermediate",
    notes: "Introduces expectation mismatch risk",
  },
  {
    name: "Designing AI Use Cases for Multi-Jurisdiction Deployment",
    domain: "Domain 3",
    category: "Use Case Definition & Scoping",
    difficulty: "intermediate",
    notes: "Applies Level 11 concepts globally",
  },
  {
    name: "Early Cross-Border Risk Indicators",
    domain: "Domain 3",
    category: "Risk Identification & Assessment",
    difficulty: "intermediate",
    notes: "Helps identify scaling risks early",
  },
];

async function createConceptIfMissing(conceptData: {
  name: string;
  domain: string;
  category: string;
  difficulty: string;
  notes: string;
}): Promise<string> {
  // Check if concept already exists
  const existing = await (prisma as any).conceptCard.findFirst({
    where: {
      OR: [
        { concept: { equals: conceptData.name, mode: "insensitive" } },
        { name: { equals: conceptData.name, mode: "insensitive" } },
      ],
    },
  });

  if (existing) {
    console.log(`   ✅ Already exists: ${conceptData.name}`);
    return existing.id;
  }

  // Create new concept with placeholder definition
  const placeholderDefinition = `TBD - Definition to be added.\n\n${conceptData.notes ? `Note: ${conceptData.notes}` : ""}`;

  const newConcept = await (prisma as any).conceptCard.create({
    data: {
      concept: conceptData.name,
      name: conceptData.name, // Also set name field for easier matching
      definition: placeholderDefinition,
      domain: conceptData.domain,
      category: conceptData.category,
      difficulty: conceptData.difficulty,
      importance: "high", // Default for level-specific concepts
      estimatedReadTime: 5, // Default read time
      version: "1.0.0",
      source: "manual",
    },
  });

  console.log(`   ✨ Created: ${conceptData.name} (ID: ${newConcept.id})`);
  return newConcept.id;
}

async function assignConceptsToLevel(levelNumber: number, conceptNames: string[]) {
  console.log(`\n📋 Level ${levelNumber}: Assigning concepts...`);

  const conceptIds: string[] = [];

  // Find or create each concept
  for (const conceptName of conceptNames) {
    // First try to find existing concept
    let concept = await (prisma as any).conceptCard.findFirst({
      where: {
        OR: [
          { concept: { equals: conceptName, mode: "insensitive" } },
          { name: { equals: conceptName, mode: "insensitive" } },
        ],
      },
    });

    if (!concept) {
      // Find concept data from our arrays
      const allConcepts = [...LEVEL_11_CONCEPTS, ...LEVEL_12_CONCEPTS];
      const conceptData = allConcepts.find((c) => c.name === conceptName);

      if (conceptData) {
        const id = await createConceptIfMissing(conceptData);
        conceptIds.push(id);
      } else {
        console.log(`   ⚠️  No data found for: ${conceptName}`);
      }
    } else {
      conceptIds.push(concept.id);
      console.log(`   ✅ Found: ${concept.concept}`);
    }
  }

  // Update challenge with concept IDs
  const challenge = await (prisma as any).challenge.findFirst({
    where: { levelNumber },
  });

  if (!challenge) {
    console.log(`   ❌ Challenge not found for Level ${levelNumber}`);
    return;
  }

  // Remove duplicates
  const uniqueConceptIds = Array.from(new Set(conceptIds));

  await (prisma as any).challenge.update({
    where: { id: challenge.id },
    data: {
      concepts: uniqueConceptIds,
    },
  });

  console.log(`   ✅ Assigned ${uniqueConceptIds.length} concepts to Level ${levelNumber}`);
}

async function main() {
  console.log("🚀 Creating and assigning concepts for Levels 11-12...\n");

  // Process Level 11
  console.log("=".repeat(60));
  console.log("LEVEL 11 - Intermediate Applications");
  console.log("=".repeat(60));
  await assignConceptsToLevel(
    11,
    LEVEL_11_CONCEPTS.map((c) => c.name)
  );

  // Process Level 12
  console.log("\n" + "=".repeat(60));
  console.log("LEVEL 12 - Cross-Border Data & Context");
  console.log("=".repeat(60));
  await assignConceptsToLevel(
    12,
    LEVEL_12_CONCEPTS.map((c) => c.name)
  );

  // Verify final state
  console.log("\n" + "=".repeat(60));
  console.log("VERIFICATION");
  console.log("=".repeat(60));

  for (const levelNumber of [11, 12]) {
    const challenge = await (prisma as any).challenge.findFirst({
      where: { levelNumber },
      select: {
        levelNumber: true,
        title: true,
        concepts: true,
      },
    });

    if (challenge) {
      const concepts = await (prisma as any).conceptCard.findMany({
        where: {
          id: { in: challenge.concepts },
        },
        select: {
          concept: true,
          definition: true,
        },
      });

      console.log(`\nLevel ${levelNumber} (${challenge.title}):`);
      console.log(`  Concepts assigned: ${challenge.concepts.length}`);
      console.log(`  Concepts found in DB: ${concepts.length}`);
      
      const hasPlaceholders = concepts.some((c: any) => 
        c.definition?.includes("TBD - Definition to be added")
      );
      
      if (hasPlaceholders) {
        console.log(`  ⚠️  Some concepts have placeholder definitions`);
      } else {
        console.log(`  ✅ All concepts have definitions`);
      }
    }
  }

  console.log("\n✨ Process complete!");
}

main()
  .then(() => {
    console.log("\n🎉 Success!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

