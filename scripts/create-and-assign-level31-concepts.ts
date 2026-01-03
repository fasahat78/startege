/**
 * Create missing concepts for Level 31 and assign them
 * 
 * This script:
 * 1. Creates ConceptCard records for missing concepts with placeholder definitions
 * 2. Assigns all concepts (existing + newly created) to Level 31
 * 3. Sets up LevelCategoryCoverage for Level 31
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";

// Level 31 concepts with metadata
const LEVEL_31_CONCEPTS = [
  {
    name: "What Expert-Level AI Governance Looks Like",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Sets the mastery benchmark",
  },
  {
    name: "Integrating Law Ethics Risk and Strategy",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Makes synthesis explicit",
  },
  {
    name: "Balancing Short-Term Pressure with Long-Term Accountability",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Reflects executive reality",
  },
  {
    name: "Consistency of Governance Decisions Across Contexts",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Prevents ad hoc reasoning",
  },
  {
    name: "Defensibility of Governance Decisions Over Time",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Introduces durability as a metric",
  },
  {
    name: "Governance Coherence Across the AI Portfolio",
    domain: "Domain 1",
    category: "Expert Synthesis & Integrative Governance",
    difficulty: "expert",
    notes: "Avoids fragmented governance",
  },
  {
    name: "Making Trade-Offs with No Acceptable Option",
    domain: "Domain 4",
    category: "Advanced Governance Scenarios",
    difficulty: "expert",
    notes: "True mastery scenario",
  },
  {
    name: "Aligning Governance Decisions with Organisational Purpose",
    domain: "Domain 1",
    category: "Strategic Compliance & Governance Alignment",
    difficulty: "expert",
    notes: "Elevates compliance to mission alignment",
  },
  {
    name: "Ethical Consistency Across Complex Decisions",
    domain: "Domain 1",
    category: "Ethical Frameworks",
    difficulty: "expert",
    notes: "Prevents selective ethics",
  },
  {
    name: "Maintaining Coherent Governance Across Jurisdictions",
    domain: "Domain 2",
    category: "Multi-Jurisdictional Governance",
    difficulty: "expert",
    notes: "Tests global integration",
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
  console.log("🚀 Setting up Level 31: Expert Synthesis\n");

  const levelNumber = 31;
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

  for (const conceptData of LEVEL_31_CONCEPTS) {
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
  console.log("🔗 Assigning concepts to Level 31...");
  await (prisma as any).challenge.update({
    where: { levelNumber },
    data: {
      concepts: conceptIds,
    },
  });
  console.log(`✅ Assigned ${conceptIds.length} concepts to Level 31\n`);

  // 4. Set up LevelCategoryCoverage
  console.log("📊 Setting up LevelCategoryCoverage...");

  // INTRODUCED categories
  const introducedCategories = [
    "Expert Synthesis & Integrative Governance", // Domain 1
  ];

  // PRACTICED categories
  const practicedCategories = [
    "Strategic Compliance & Governance Alignment", // Domain 1
    "Advanced Risk Management & Tolerance", // Domain 3
    "Advanced Governance Scenarios", // Domain 4
    "Ethical Frameworks", // Domain 1
    "Multi-Jurisdictional Governance", // Domain 2
    "Enforcement Oversight & Remedies", // Domain 4
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
      // Default to Domain 1 for Expert Synthesis
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

  console.log("\n✨ Level 31 setup complete!");
  console.log(`\n📋 Summary:`);
  console.log(`   - Challenge: ${challenge.title}`);
  console.log(`   - Concepts: ${conceptIds.length}`);
  console.log(`   - INTRODUCED categories: ${introducedCategories.length}`);
  console.log(`   - PRACTICED categories: ${practicedCategories.length}`);
}

main()
  .then(() => {
    console.log("\n🎉 Level 31 setup successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error setting up Level 31:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

