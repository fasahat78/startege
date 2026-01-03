/**
 * Setup Level 12 - Cross-Border Data & Context
 * 
 * Assigns the 10 Level 12 concepts to the Challenge record
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";

const LEVEL_12_CONCEPTS = [
  "What Cross-Border AI Means in Practice",
  "Jurisdiction vs Location vs Citizenship",
  "Where AI Decisions Are Made vs Where Data Is Stored",
  "Applicable Law in Cross-Border AI Systems",
  "Data Flow Mapping for AI Use Cases",
  "Why Cross-Border Context Increases Governance Risk",
  "Personal Data in Cross-Border AI Systems",
  "Cross-Border Consent and User Expectations",
  "Designing AI Use Cases for Multi-Jurisdiction Deployment",
  "Early Cross-Border Risk Indicators",
];

async function setupLevel12() {
  console.log("🎮 Setting up Level 12 - Cross-Border Data & Context...\n");

  // Step 1: Ensure Challenge record exists
  const levelConfig = LEVEL_CONFIGS.find((c) => c.level === 12);
  if (!levelConfig) {
    throw new Error("Level 12 config not found in LEVEL_CONFIGS");
  }

  console.log("📋 Level 12 Config:");
  console.log(`   Title: ${levelConfig.title}`);
  console.log(`   Description: ${levelConfig.description}`);
  console.log(`   Questions: ${levelConfig.questionCount}`);
  console.log(`   Time Limit: ${levelConfig.timeLimit} min`);
  console.log(`   Passing Score: ${levelConfig.passingScore}%\n`);

  // Find or create Challenge record
  let challenge = await (prisma as any).challenge.findFirst({
    where: { levelNumber: 12 },
  });

  if (!challenge) {
    console.log("⚠️  Challenge record not found, creating...");
    challenge = await (prisma as any).challenge.create({
      data: {
        levelNumber: 12,
        level: 12, // Legacy field
        title: levelConfig.title,
        description: levelConfig.description,
        questionCount: levelConfig.questionCount,
        timeLimit: levelConfig.timeLimit,
        passingScore: levelConfig.passingScore,
        superLevelGroup: "BUILDING",
        concepts: [],
      },
    });
    console.log("✅ Created Challenge record\n");
  } else {
    console.log("✅ Found existing Challenge record\n");
  }

  // Step 2: Find concepts by name
  console.log("🔍 Finding concepts...");
  const foundConcepts: string[] = [];
  const missingConcepts: string[] = [];
  const conceptMap = new Map<string, any>(); // conceptName -> concept object

  for (const conceptName of LEVEL_12_CONCEPTS) {
    // Try exact match first
    let concept = await (prisma as any).conceptCard.findFirst({
      where: {
        OR: [
          { concept: { equals: conceptName, mode: "insensitive" } },
          { name: { equals: conceptName, mode: "insensitive" } },
        ],
      },
    });

    // Try partial match for multi-word concepts
    if (!concept) {
      const keywords = conceptName
        .split(/\s+(?:vs|and|in|for|to|are|is)\s+/i)
        .flatMap(part => part.split(/\s+/))
        .filter(w => w.length > 3 && !["What", "Where", "Why", "Cross", "Border"].includes(w));
      
      if (keywords.length > 0) {
        // Try first significant keyword
        concept = await (prisma as any).conceptCard.findFirst({
          where: {
            concept: {
              contains: keywords[0],
              mode: "insensitive",
            },
          },
        });
      }
    }

    // Try searching for key phrases
    if (!concept) {
      const phrases = [
        "Cross-Border",
        "Jurisdiction",
        "Location",
        "Citizenship",
        "AI Decisions",
        "Data Is Stored",
        "Applicable Law",
        "Data Flow Mapping",
        "Governance Risk",
        "Personal Data",
        "Consent",
        "User Expectations",
        "Multi-Jurisdiction",
        "Risk Indicators",
      ];

      for (const phrase of phrases) {
        if (conceptName.includes(phrase)) {
          concept = await (prisma as any).conceptCard.findFirst({
            where: {
              OR: [
                { concept: { contains: phrase, mode: "insensitive" } },
                { definition: { contains: phrase, mode: "insensitive" } },
              ],
            },
          });
          if (concept) break;
        }
      }
    }

    // Try fuzzy matching - search for key words
    if (!concept) {
      const keywords = conceptName.split(" ").filter(w => w.length > 3);
      if (keywords.length > 0) {
        // Try each keyword
        for (const keyword of keywords.slice(0, 2)) { // Try first 2 keywords
          concept = await (prisma as any).conceptCard.findFirst({
            where: {
              concept: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          });
          if (concept) break;
        }
      }
    }

    if (concept) {
      // Avoid duplicates
      if (!foundConcepts.includes(concept.id)) {
        foundConcepts.push(concept.id);
        conceptMap.set(conceptName, concept);
        console.log(`   ✅ Found: ${concept.concept} (ID: ${concept.id})`);
      } else {
        console.log(`   ⚠️  Duplicate: ${concept.concept} (already assigned, skipping)`);
      }
    } else {
      missingConcepts.push(conceptName);
      console.log(`   ❌ Missing: ${conceptName}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Found: ${foundConcepts.length}/${LEVEL_12_CONCEPTS.length}`);
  console.log(`   Missing: ${missingConcepts.length}/${LEVEL_12_CONCEPTS.length}\n`);

  if (missingConcepts.length > 0) {
    console.log("⚠️  Missing concepts:");
    missingConcepts.forEach((name) => console.log(`   - ${name}`));
    console.log("\n💡 These concepts may need to be created in the database first.\n");
  }

  if (foundConcepts.length === 0) {
    console.log("❌ No concepts found. Cannot proceed.");
    process.exit(1);
  }

  // Step 3: Update Challenge with concepts
  console.log("💾 Updating Challenge record with concepts...");
  await (prisma as any).challenge.update({
    where: { id: challenge.id },
    data: {
      concepts: foundConcepts,
      title: levelConfig.title,
      description: levelConfig.description,
      questionCount: levelConfig.questionCount,
      timeLimit: levelConfig.timeLimit,
      passingScore: levelConfig.passingScore,
      superLevelGroup: "BUILDING",
    },
  });

  console.log(`✅ Assigned ${foundConcepts.length} concepts to Level 12\n`);

  // Step 4: Set up LevelCategoryCoverage
  console.log("📊 Setting up LevelCategoryCoverage...");
  
  // Level 12 category coverage:
  // INTRODUCED: D2 — Cross-Border Data & Jurisdiction
  // PRACTICED: D2 — Data Protection & Privacy Law, D3 — Use Case Definition & Scoping, D3 — Risk Identification & Assessment
  
  const categoryCoverage = [
    { categoryName: "Cross-Border Data & Jurisdiction", domainName: "Domain 2", coverageType: "INTRODUCED" },
    { categoryName: "Data Protection & Privacy Law", domainName: "Domain 2", coverageType: "PRACTICED" },
    { categoryName: "Use Case Definition & Scoping", domainName: "Domain 3", coverageType: "PRACTICED" },
    { categoryName: "Risk Identification & Assessment", domainName: "Domain 3", coverageType: "PRACTICED" },
  ];

  // Find categories
  const categories = await (prisma as any).category.findMany({
    include: { domain: true },
  });

  for (const coverage of categoryCoverage) {
    const category = categories.find(
      (c: any) =>
        c.name === coverage.categoryName &&
        c.domain.name === coverage.domainName
    );

    if (category) {
      // Upsert LevelCategoryCoverage
      await (prisma as any).levelCategoryCoverage.upsert({
        where: {
          levelNumber_categoryId_coverageType: {
            levelNumber: 12,
            categoryId: category.id,
            coverageType: coverage.coverageType,
          },
        },
        update: {
          weight: 1.0,
        },
        create: {
          levelNumber: 12,
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

  console.log("");

  // Step 5: Verify
  const updated = await (prisma as any).challenge.findUnique({
    where: { id: challenge.id },
  });

  // Fetch concept details separately
  const conceptDetails = await (prisma as any).conceptCard.findMany({
    where: {
      id: { in: foundConcepts },
    },
    select: {
      id: true,
      concept: true,
      domain: true,
      category: true,
    },
  });

  console.log("📋 Level 12 Challenge Summary:");
  console.log(`   Challenge ID: ${updated.id}`);
  console.log(`   Level Number: ${updated.levelNumber}`);
  console.log(`   Title: ${updated.title}`);
  console.log(`   Concepts Assigned: ${foundConcepts.length}`);
  console.log("\n   Concepts:");
  conceptDetails.forEach((c: any, idx: number) => {
    console.log(`   ${idx + 1}. ${c.concept} (${c.domain} / ${c.category})`);
  });

  if (missingConcepts.length > 0) {
    console.log("\n⚠️  Missing Concepts (need to be created):");
    missingConcepts.forEach((name, idx) => {
      console.log(`   ${idx + 1}. ${name}`);
    });
    console.log("\n💡 You may need to create these concepts in the database first.");
  }

  console.log("\n✨ Level 12 setup complete!");
}

setupLevel12()
  .then(() => {
    console.log("\n🎉 Success!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

