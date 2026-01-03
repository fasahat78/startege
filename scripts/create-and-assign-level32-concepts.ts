/**
 * Create missing concepts for Level 32 and assign them
 * 
 * This script:
 * 1. Creates ConceptCard records for missing concepts with placeholder definitions
 * 2. Assigns all concepts (existing + newly created) to Level 32
 * 3. Sets up LevelCategoryCoverage for Level 32
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";

// Level 32 concepts with metadata
const LEVEL_32_CONCEPTS = [
  {
    name: "Principles of Effective AI Governance Frameworks",
    domain: "Domain 1",
    category: "Governance Framework Design",
    difficulty: "expert",
    notes: "Establishes design criteria",
  },
  {
    name: "Designing Governance from First Principles",
    domain: "Domain 1",
    category: "Governance Framework Design",
    difficulty: "expert",
    notes: "Avoids checkbox frameworks",
  },
  {
    name: "Scoping Frameworks to Organisational Context",
    domain: "Domain 1",
    category: "Governance Framework Design",
    difficulty: "expert",
    notes: "Prevents over- or under-governance",
  },
  {
    name: "Mapping Risks to Framework Components",
    domain: "Domain 1",
    category: "Governance Framework Design",
    difficulty: "expert",
    notes: "Ensures risk-driven design",
  },
  {
    name: "Balancing Flexibility and Control in Framework Design",
    domain: "Domain 1",
    category: "Governance Framework Design",
    difficulty: "expert",
    notes: "Addresses rigidity vs chaos",
  },
  {
    name: "Embedding Accountability into Framework Design",
    domain: "Domain 1",
    category: "Governance Framework Design",
    difficulty: "expert",
    notes: "Makes responsibility explicit",
  },
  {
    name: "Designing Controls That Are Auditable and Defensible",
    domain: "Domain 1",
    category: "Compliance Frameworks",
    difficulty: "expert",
    notes: "Links design to assurance",
  },
  {
    name: "Aligning Framework Design with Operating Models",
    domain: "Domain 1",
    category: "Governance Models & Operating Structures",
    difficulty: "expert",
    notes: "Prevents structural mismatch",
  },
  {
    name: "Designing Frameworks for Risk Tolerance and Escalation",
    domain: "Domain 3",
    category: "Advanced Risk Management & Tolerance",
    difficulty: "expert",
    notes: "Integrates risk appetite",
  },
  {
    name: "Adapting Frameworks Under Stress and Change",
    domain: "Domain 4",
    category: "Advanced Governance Scenarios",
    difficulty: "expert",
    notes: "Tests framework durability",
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
  console.log("🚀 Setting up Level 32: Framework Design\n");

  const levelNumber = 32;
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

  for (const conceptData of LEVEL_32_CONCEPTS) {
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
  console.log("🔗 Assigning concepts to Level 32...");
  await (prisma as any).challenge.update({
    where: { levelNumber },
    data: {
      concepts: conceptIds,
    },
  });
  console.log(`✅ Assigned ${conceptIds.length} concepts to Level 32\n`);

  // 4. Set up LevelCategoryCoverage
  console.log("📊 Setting up LevelCategoryCoverage...");

  // INTRODUCED categories
  const introducedCategories = [
    "Governance Framework Design", // Domain 1
  ];

  // PRACTICED categories
  const practicedCategories = [
    "Expert Synthesis & Integrative Governance", // Domain 1
    "Compliance Frameworks", // Domain 1
    "Governance Models & Operating Structures", // Domain 1
    "Advanced Risk Management & Tolerance", // Domain 3
    "Advanced Governance Scenarios", // Domain 4
  ];

  // Get all domains
  const domains = await (prisma as any).domain.findMany({
    orderBy: { order: "asc" },
  });

  const domainMap = new Map(domains.map((d: any) => [d.name, d.id]));

  // Process INTRODUCED categories
  for (const categoryName of introducedCategories) {
    // Find domain for this category (need to determine from category name or use a mapping)
    let domainId: string | undefined;
    
    // Try to find category first to get its domain
    const category = await (prisma as any).category.findFirst({
      where: { name: categoryName },
    });

    if (category) {
      domainId = category.domainId;
    } else {
      // Default to Domain 1 for Governance Framework Design
      domainId = domainMap.get("Domain 1");
    }

    if (!domainId) {
      console.warn(`⚠️  Could not find domain for category: ${categoryName}`);
      continue;
    }

    const categoryRecord = await findOrCreateCategory(
      Array.from(domainMap.entries()).find(([_, id]) => id === domainId)?.[0] || "Domain 1",
      categoryName
    );

    // Check if coverage already exists
    const existing = await (prisma as any).levelCategoryCoverage.findFirst({
      where: {
        levelNumber,
        categoryId: categoryRecord.id,
        coverageType: "INTRODUCED",
      },
    });

    if (!existing) {
      await (prisma as any).levelCategoryCoverage.create({
        data: {
          levelNumber,
          categoryId: categoryRecord.id,
          coverageType: "INTRODUCED",
        },
      });
      console.log(`  ✅ INTRODUCED: ${categoryName}`);
    } else {
      console.log(`  ✓ Already exists: INTRODUCED ${categoryName}`);
    }
  }

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

  console.log("\n✨ Level 32 setup complete!");
  console.log(`\n📋 Summary:`);
  console.log(`   - Challenge: ${challenge.title}`);
  console.log(`   - Concepts: ${conceptIds.length}`);
  console.log(`   - INTRODUCED categories: ${introducedCategories.length}`);
  console.log(`   - PRACTICED categories: ${practicedCategories.length}`);
}

main()
  .then(() => {
    console.log("\n🎉 Level 32 setup successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error setting up Level 32:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

