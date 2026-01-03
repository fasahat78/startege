/**
 * Create missing concepts for Level 18 and assign them
 * 
 * This script:
 * 1. Creates ConceptCard records for missing concepts with placeholder definitions
 * 2. Assigns all concepts (existing + newly created) to Level 18
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";

// Level 18 concepts with metadata from CSV
const LEVEL_18_CONCEPTS = [
  {
    name: "What Enforcement Means in AI Governance",
    domain: "Domain 4",
    category: "Enforcement Oversight & Remedies",
    difficulty: "advanced",
    notes: "Frames enforcement beyond penalties",
  },
  {
    name: "Supervisory Authorities and Oversight Bodies",
    domain: "Domain 4",
    category: "Enforcement Oversight & Remedies",
    difficulty: "advanced",
    notes: "Introduces enforcement actors",
  },
  {
    name: "Triggers for Regulatory Intervention",
    domain: "Domain 4",
    category: "Enforcement Oversight & Remedies",
    difficulty: "advanced",
    notes: "Clarifies escalation conditions",
  },
  {
    name: "Corrective Actions and Remediation Measures",
    domain: "Domain 4",
    category: "Enforcement Oversight & Remedies",
    difficulty: "advanced",
    notes: "Makes enforcement constructive",
  },
  {
    name: "Suspension Withdrawal and Use Restrictions",
    domain: "Domain 4",
    category: "Enforcement Oversight & Remedies",
    difficulty: "advanced",
    notes: "Introduces operational consequences",
  },
  {
    name: "Remedies for Affected Individuals and Groups",
    domain: "Domain 4",
    category: "Enforcement Oversight & Remedies",
    difficulty: "advanced",
    notes: "Centers human impact",
  },
  {
    name: "Responding to AI Governance Breaches",
    domain: "Domain 4",
    category: "Incident & Issue Management",
    difficulty: "advanced",
    notes: "Connects enforcement to incident response",
  },
  {
    name: "Using Assurance Evidence During Investigations",
    domain: "Domain 1",
    category: "Algorithmic Accountability & Assurance",
    difficulty: "advanced",
    notes: "Leverages assurance artefacts",
  },
  {
    name: "Internal Escalation During Enforcement Events",
    domain: "Domain 1",
    category: "Governance Structures & Roles",
    difficulty: "advanced",
    notes: "Reinforces accountability chains",
  },
  {
    name: "Communicating with Regulators and Stakeholders",
    domain: "Domain 1",
    category: "Transparency & Communication",
    difficulty: "advanced",
    notes: "Governs disclosure and trust",
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
    
    // Find the highest order number for this domain to avoid conflicts
    const maxOrder = await (prisma as any).category.findFirst({
      where: { domainId: domain.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    
    const newOrder = (maxOrder?.order || 0) + 1;
    
    category = await (prisma as any).category.create({
      data: {
        domainId: domain.id,
        name: categoryName,
        order: newOrder,
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

async function setupLevel18() {
  console.log(`\n🎮 Setting up Level 18...`);
  console.log("=" .repeat(60));

  // Step 1: Create missing concepts
  console.log(`\n📝 Creating concepts...`);
  const conceptIds: string[] = [];

  for (const conceptData of LEVEL_18_CONCEPTS) {
    try {
      const conceptId = await createConcept(conceptData);
      conceptIds.push(conceptId);
    } catch (error) {
      console.error(`  ❌ Error creating "${conceptData.name}":`, error);
    }
  }

  console.log(`\n✅ Created/found ${conceptIds.length} concepts`);

  // Step 2: Find or create Challenge record
  const levelConfig = LEVEL_CONFIGS.find((c) => c.level === 18);
  if (!levelConfig) {
    throw new Error(`Level 18 config not found`);
  }

  let challenge = await (prisma as any).challenge.findFirst({
    where: { levelNumber: 18 },
  });

  if (!challenge) {
    challenge = await (prisma as any).challenge.create({
      data: {
        levelNumber: 18,
        level: 18,
        title: levelConfig.title,
        description: levelConfig.description,
        questionCount: levelConfig.questionCount,
        timeLimit: levelConfig.timeLimit,
        passingScore: levelConfig.passingScore,
        superLevelGroup: "BUILDING",
        concepts: [],
      },
    });
  }

  // Step 3: Assign concepts to level
  console.log(`\n💾 Assigning concepts to Level 18...`);
  await (prisma as any).challenge.update({
    where: { id: challenge.id },
    data: {
      concepts: conceptIds,
      title: levelConfig.title,
      description: levelConfig.description,
      questionCount: levelConfig.questionCount,
      timeLimit: levelConfig.timeLimit,
      passingScore: levelConfig.passingScore,
      superLevelGroup: "BUILDING",
    },
  });

  console.log(`✅ Assigned ${conceptIds.length} concepts to Level 18`);

  // Step 4: Set up LevelCategoryCoverage
  console.log(`\n📊 Setting up LevelCategoryCoverage...`);

  const categoryCoverage = [
    { categoryName: "Enforcement Oversight & Remedies", domainName: "Domain 4", coverageType: "INTRODUCED" },
    { categoryName: "AI Act Obligations & Requirements", domainName: "Domain 2", coverageType: "PRACTICED" },
    { categoryName: "Algorithmic Accountability & Assurance", domainName: "Domain 1", coverageType: "PRACTICED" },
    { categoryName: "Incident & Issue Management", domainName: "Domain 4", coverageType: "PRACTICED" },
    { categoryName: "Governance Structures & Roles", domainName: "Domain 1", coverageType: "PRACTICED" },
    { categoryName: "Transparency & Communication", domainName: "Domain 1", coverageType: "PRACTICED" },
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
            levelNumber: 18,
            categoryId: category.id,
            coverageType: coverage.coverageType,
          },
        },
        update: { weight: 1.0 },
        create: {
          levelNumber: 18,
          categoryId: category.id,
          coverageType: coverage.coverageType,
          weight: 1.0,
        },
      });
      console.log(`   ✅ ${coverage.coverageType}: ${coverage.categoryName}`);
    } else {
      console.log(`   ⚠️  Category not found: ${coverage.categoryName} (${coverage.domainName})`);
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

  console.log(`\n📋 Level 18 Summary:`);
  console.log(`   Challenge ID: ${updated.id}`);
  console.log(`   Title: ${updated.title}`);
  console.log(`   Concepts Assigned: ${conceptIds.length}`);
  console.log(`\n   Concepts:`);
  conceptDetails.forEach((c: any, idx: number) => {
    console.log(`   ${idx + 1}. ${c.concept} (${c.domain} / ${c.category})`);
  });
}

async function main() {
  console.log("🚀 Creating and assigning concepts for Level 18\n");

  try {
    await setupLevel18();

    console.log("\n✨ All done!");
    console.log("\n📝 Next steps:");
    console.log("   - Concepts have been created with placeholder definitions");
    console.log("   - You can now update the definitions with full content");
    console.log("   - Level 18 is ready for testing");
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

