/**
 * Create missing concepts for Levels 11-12 and assign them
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

const PLACEHOLDER_DEFINITION = "TBD - Definition to be added. This concept will be populated with full content later.";

async function findOrCreateCategory(domainName: string, categoryName: string) {
  // Find domain
  const domain = await (prisma as any).domain.findFirst({
    where: { name: domainName },
  });

  if (!domain) {
    throw new Error(`Domain not found: ${domainName}`);
  }

  // Find or create category
  let category = await (prisma as any).category.findFirst({
    where: {
      domainId: domain.id,
      name: categoryName,
    },
  });

  if (!category) {
    console.log(`  ⚠️  Category "${categoryName}" not found in ${domainName}, creating...`);
    category = await (prisma as any).category.create({
      data: {
        domainId: domain.id,
        name: categoryName,
        order: 99, // Temporary order
        description: `${categoryName} category in ${domainName}`,
        examSystemPrompt: `PLACEHOLDER: Category exam prompt for ${categoryName}`,
      },
    });
  }

  return { domain, category };
}

async function createConcept(conceptData: {
  name: string;
  domain: string;
  category: string;
  difficulty: string;
  notes: string;
}) {
  const { domain, category } = await findOrCreateCategory(conceptData.domain, conceptData.category);

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
    console.log(`  ✅ Already exists: ${conceptData.name}`);
    return existing.id;
  }

  // Create new concept
  const concept = await (prisma as any).conceptCard.create({
    data: {
      concept: conceptData.name,
      name: conceptData.name,
      definition: PLACEHOLDER_DEFINITION,
      domain: conceptData.domain,
      category: conceptData.category,
      categoryId: category.id,
      difficulty: conceptData.difficulty,
      importance: "high",
      estimatedReadTime: 5,
      overview: conceptData.notes ? `Note: ${conceptData.notes}` : null,
      version: "1.0.0",
      source: "manual",
    },
  });

  console.log(`  ✅ Created: ${conceptData.name}`);
  return concept.id;
}

async function setupLevel(levelNumber: number, concepts: typeof LEVEL_11_CONCEPTS) {
  console.log(`\n🎮 Setting up Level ${levelNumber}...`);
  console.log("=" .repeat(60));

  // Step 1: Create missing concepts
  console.log(`\n📝 Creating concepts...`);
  const conceptIds: string[] = [];

  for (const conceptData of concepts) {
    try {
      const conceptId = await createConcept(conceptData);
      conceptIds.push(conceptId);
    } catch (error) {
      console.error(`  ❌ Error creating "${conceptData.name}":`, error);
    }
  }

  console.log(`\n✅ Created/found ${conceptIds.length} concepts`);

  // Step 2: Find or create Challenge record
  const levelConfig = LEVEL_CONFIGS.find((c) => c.level === levelNumber);
  if (!levelConfig) {
    throw new Error(`Level ${levelNumber} config not found`);
  }

  let challenge = await (prisma as any).challenge.findFirst({
    where: { levelNumber },
  });

  if (!challenge) {
    challenge = await (prisma as any).challenge.create({
      data: {
        levelNumber,
        level: levelNumber,
        title: levelConfig.title,
        description: levelConfig.description,
        questionCount: levelConfig.questionCount,
        timeLimit: levelConfig.timeLimit,
        passingScore: levelConfig.passingScore,
        superLevelGroup: levelNumber <= 10 ? "FOUNDATION" : levelNumber <= 20 ? "BUILDING" : levelNumber <= 30 ? "ADVANCED" : "MASTERY",
        concepts: [],
      },
    });
  }

  // Step 3: Assign concepts to level
  console.log(`\n💾 Assigning concepts to Level ${levelNumber}...`);
  await (prisma as any).challenge.update({
    where: { id: challenge.id },
    data: {
      concepts: conceptIds,
      title: levelConfig.title,
      description: levelConfig.description,
      questionCount: levelConfig.questionCount,
      timeLimit: levelConfig.timeLimit,
      passingScore: levelConfig.passingScore,
      superLevelGroup: levelNumber <= 10 ? "FOUNDATION" : levelNumber <= 20 ? "BUILDING" : levelNumber <= 30 ? "ADVANCED" : "MASTERY",
    },
  });

  console.log(`✅ Assigned ${conceptIds.length} concepts to Level ${levelNumber}`);

  // Step 4: Set up LevelCategoryCoverage
  console.log(`\n📊 Setting up LevelCategoryCoverage...`);

  if (levelNumber === 11) {
    const categoryCoverage = [
      { categoryName: "Use Case Definition & Scoping", domainName: "Domain 3", coverageType: "INTRODUCED" },
      { categoryName: "Governance Structures & Roles", domainName: "Domain 1", coverageType: "PRACTICED" },
      { categoryName: "Risk Identification & Assessment", domainName: "Domain 3", coverageType: "PRACTICED" },
      { categoryName: "AI Lifecycle Governance", domainName: "Domain 1", coverageType: "PRACTICED" },
    ];

    const categories = await (prisma as any).category.findMany({
      include: { domain: true },
    });

    for (const coverage of categoryCoverage) {
      const category = categories.find(
        (c: any) => c.name === coverage.categoryName && c.domain.name === coverage.domainName
      );

      if (category) {
        await (prisma as any).levelCategoryCoverage.upsert({
          where: {
            levelNumber_categoryId_coverageType: {
              levelNumber: 11,
              categoryId: category.id,
              coverageType: coverage.coverageType,
            },
          },
          update: { weight: 1.0 },
          create: {
            levelNumber: 11,
            categoryId: category.id,
            coverageType: coverage.coverageType,
            weight: 1.0,
          },
        });
        console.log(`   ✅ ${coverage.coverageType}: ${coverage.categoryName}`);
      }
    }
  } else if (levelNumber === 12) {
    const categoryCoverage = [
      { categoryName: "Cross-Border Data & Jurisdiction", domainName: "Domain 2", coverageType: "INTRODUCED" },
      { categoryName: "Data Protection & Privacy Law", domainName: "Domain 2", coverageType: "PRACTICED" },
      { categoryName: "Use Case Definition & Scoping", domainName: "Domain 3", coverageType: "PRACTICED" },
      { categoryName: "Risk Identification & Assessment", domainName: "Domain 3", coverageType: "PRACTICED" },
    ];

    const categories = await (prisma as any).category.findMany({
      include: { domain: true },
    });

    for (const coverage of categoryCoverage) {
      const category = categories.find(
        (c: any) => c.name === coverage.categoryName && c.domain.name === coverage.domainName
      );

      if (category) {
        await (prisma as any).levelCategoryCoverage.upsert({
          where: {
            levelNumber_categoryId_coverageType: {
              levelNumber: 12,
              categoryId: category.id,
              coverageType: coverage.coverageType,
            },
          },
          update: { weight: 1.0 },
          create: {
            levelNumber: 12,
            categoryId: category.id,
            coverageType: coverage.coverageType,
            weight: 1.0,
          },
        });
        console.log(`   ✅ ${coverage.coverageType}: ${coverage.categoryName}`);
      }
    }
  }

  // Step 5: Verify
  const updated = await (prisma as any).challenge.findUnique({
    where: { id: challenge.id },
  });

  const conceptDetails = await (prisma as any).conceptCard.findMany({
    where: { id: { in: conceptIds } },
    select: {
      id: true,
      concept: true,
      domain: true,
      category: true,
    },
  });

  console.log(`\n📋 Level ${levelNumber} Summary:`);
  console.log(`   Challenge ID: ${updated.id}`);
  console.log(`   Title: ${updated.title}`);
  console.log(`   Concepts Assigned: ${conceptIds.length}`);
  console.log(`\n   Concepts:`);
  conceptDetails.forEach((c: any, idx: number) => {
    console.log(`   ${idx + 1}. ${c.concept} (${c.domain} / ${c.category})`);
  });
}

async function main() {
  console.log("🚀 Creating and assigning concepts for Levels 11-12\n");

  try {
    await setupLevel(11, LEVEL_11_CONCEPTS);
    await setupLevel(12, LEVEL_12_CONCEPTS);

    console.log("\n✨ All done!");
    console.log("\n📝 Next steps:");
    console.log("   - Concepts have been created with placeholder definitions");
    console.log("   - You can now update the definitions with full content");
    console.log("   - Levels 11-12 are ready for testing");
  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n🎉 Success!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });

