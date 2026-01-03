/**
 * Create missing concepts for Level 39 and assign them
 * 
 * This script:
 * 1. Creates ConceptCard records for missing concepts with placeholder definitions
 * 2. Assigns all concepts (existing + newly created) to Level 39
 * 3. Sets up LevelCategoryCoverage for Level 39 (PRACTICED only - no INTRODUCED)
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";

// Level 39 concepts with metadata
const LEVEL_39_CONCEPTS = [
  {
    name: "Articulating a Coherent AI Governance Philosophy",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Defines final governance worldview",
  },
  {
    name: "Maintaining Internal Consistency Across Governance Decisions",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Prevents situational governance",
  },
  {
    name: "Justifying Governance Trade-Offs Under Extreme Constraints",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Tests integrity under pressure",
  },
  {
    name: "Aligning Governance Decisions Across Time Horizons",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Ensures durability",
  },
  {
    name: "Defending Governance Positions to External Scrutiny",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Ultimate accountability test",
  },
  {
    name: "Owning the Long-Term Consequences of Governance Decisions",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Anchors responsibility",
  },
  {
    name: "Integrating Ethics Law Risk and Strategy Seamlessly",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Full-spectrum synthesis",
  },
  {
    name: "Maintaining Governance Integrity During Crisis and Change",
    domain: "Domain 4",
    category: "Enforcement Oversight & Remedies",
    difficulty: "expert",
    notes: "Integrity under stress",
  },
  {
    name: "Ensuring Defensibility Across Jurisdictions and Domains",
    domain: "Domain 2",
    category: "Multi-Jurisdictional Governance",
    difficulty: "expert",
    notes: "Global defensibility",
  },
  {
    name: "Preparing Governance for Scrutiny You Cannot Predict",
    domain: "Domain 4",
    category: "Enforcement Oversight & Remedies",
    difficulty: "expert",
    notes: "Anticipatory accountability",
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

  // Check if category already exists
  let category = await (prisma as any).category.findFirst({
    where: {
      domainId: domain.id,
      name: categoryName,
    },
  });

  if (category) {
    return category;
  }

  // Find max order for this domain
  const maxOrder = await (prisma as any).category.findFirst({
    where: { domainId: domain.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const nextOrder = (maxOrder?.order || 0) + 1;

  // Create category
  category = await (prisma as any).category.create({
    data: {
      domainId: domain.id,
      name: categoryName,
      order: nextOrder,
      examSystemPrompt: `Generate exam questions for ${categoryName}.`,
    },
  });

  return category;
}

async function main() {
  console.log("🚀 Setting up Level 39: Expert Synthesis (Final Integration)\n");

  const levelNumber = 39;
  const levelConfig = LEVEL_CONFIGS.find((c) => c.level === levelNumber);

  if (!levelConfig) {
    throw new Error(`Level ${levelNumber} config not found`);
  }

  // 1. Create or update Challenge
  console.log(`📝 Creating/updating Challenge for Level ${levelNumber}...`);
  const challenge = await (prisma as any).challenge.upsert({
    where: { levelNumber },
    update: {
      title: levelConfig.title,
      description: levelConfig.description,
      questionCount: levelConfig.questionCount,
      timeLimit: levelConfig.timeLimit,
      passingScore: levelConfig.passingScore,
      superLevelGroup: "MASTERY",
      isBoss: false,
    },
    create: {
      levelNumber,
      level: levelNumber, // Legacy field
      title: levelConfig.title,
      description: levelConfig.description,
      questionCount: levelConfig.questionCount,
      timeLimit: levelConfig.timeLimit,
      passingScore: levelConfig.passingScore,
      superLevelGroup: "MASTERY",
      isBoss: false,
      concepts: [],
      examSystemPrompt: `Generate exam questions for Level ${levelNumber}: ${levelConfig.title}.`,
    },
  });
  console.log(`✅ Challenge created/updated: ${challenge.title}\n`);

  // 2. Create concepts and find existing ones
  console.log("📚 Processing concepts...");
  const conceptIds: string[] = [];

  for (const conceptData of LEVEL_39_CONCEPTS) {
    // Find or create category
    const category = await findOrCreateCategory(conceptData.domain, conceptData.category);
    console.log(`  Category: ${category.name} (${category.id})`);

    // Check if concept exists by name
    let concept = await (prisma as any).conceptCard.findFirst({
      where: {
        name: conceptData.name,
      },
    });

    if (!concept) {
      // Create concept
      concept = await (prisma as any).conceptCard.create({
        data: {
          name: conceptData.name,
          concept: conceptData.name,
          definition: PLACEHOLDER_DEFINITION,
          domain: conceptData.domain,
          category: conceptData.category,
          categoryId: category.id,
          difficulty: conceptData.difficulty,
          importance: "high",
        },
      });
      console.log(`  ✅ Created concept: ${conceptData.name}`);
    } else {
      // Update category if needed
      if (!concept.categoryId || concept.categoryId !== category.id) {
        await (prisma as any).conceptCard.update({
          where: { id: concept.id },
          data: { categoryId: category.id },
        });
        console.log(`  🔄 Updated concept category: ${conceptData.name}`);
      } else {
        console.log(`  ✓ Found existing concept: ${conceptData.name}`);
      }
    }

    conceptIds.push(concept.id);
  }

  console.log(`\n✅ Processed ${conceptIds.length} concepts\n`);

  // 3. Assign concepts to challenge
  console.log("🔗 Assigning concepts to Level 39...");
  await (prisma as any).challenge.update({
    where: { levelNumber },
    data: {
      concepts: conceptIds,
    },
  });
  console.log(`✅ Assigned ${conceptIds.length} concepts to Level 39\n`);

  // 4. Set up LevelCategoryCoverage
  // NOTE: Level 39 has NO INTRODUCED categories - it's purely PRACTICED (all-capstone integration)
  console.log("📊 Setting up LevelCategoryCoverage (PRACTICED only - no INTRODUCED)...");

  // PRACTICED categories (all-capstone integration)
  const practicedCategories = [
    "Expert Synthesis & Integrative Governance", // Domain 1
    "Advanced Governance Framework Evolution", // Domain 1
    "Strategic Governance Planning", // Domain 1
    "Advanced Risk Management & Tolerance", // Domain 3
    "Multi-Domain Governance Integration", // Domain 1
    "Multi-Jurisdictional Governance", // Domain 2
    "Ethical Frameworks", // Domain 1 (or wherever it exists)
    "Enforcement Oversight & Remedies", // Domain 4
  ];

  // Get all domains
  const domains = await (prisma as any).domain.findMany({
    orderBy: { order: "asc" },
  });

  const domainMap = new Map(domains.map((d: any) => [d.name, d.id]));

  // Process PRACTICED categories
  for (const categoryName of practicedCategories) {
    // Find category to get its domain
    const category = await (prisma as any).category.findFirst({
      where: { name: categoryName },
      include: { domain: true },
    });

    if (!category) {
      console.warn(`⚠️  Category not found: ${categoryName}, skipping...`);
      continue;
    }

    const domainName = category.domain.name;

    const categoryRecord = await findOrCreateCategory(domainName, categoryName);

    // Check if coverage already exists
    const existing = await (prisma as any).levelCategoryCoverage.findFirst({
      where: {
        levelNumber,
        categoryId: categoryRecord.id,
        coverageType: "PRACTICED",
      },
    });

    if (!existing) {
      await (prisma as any).levelCategoryCoverage.create({
        data: {
          levelNumber,
          categoryId: categoryRecord.id,
          coverageType: "PRACTICED",
        },
      });
      console.log(`  ✅ PRACTICED: ${categoryName}`);
    } else {
      console.log(`  ✓ Already exists: PRACTICED ${categoryName}`);
    }
  }

  console.log("\n✨ Level 39 setup complete!");
  console.log(`\n📋 Summary:`);
  console.log(`   - Challenge: ${challenge.title}`);
  console.log(`   - Concepts: ${conceptIds.length}`);
  console.log(`   - INTRODUCED categories: 0 (by design - pure synthesis)`);
  console.log(`   - PRACTICED categories: ${practicedCategories.length}`);
}

main()
  .then(() => {
    console.log("\n🎉 Level 39 setup successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error setting up Level 39:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

