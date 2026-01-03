/**
 * Setup Level 11 - Intermediate Applications
 * 
 * Assigns the 10 Level 11 concepts to the Challenge record
 */

import { prisma } from "../lib/db";
import { LEVEL_CONFIGS } from "../lib/levels";

const LEVEL_11_CONCEPTS = [
  "What Is an AI Use Case (Governance Perspective)",
  "Business Objective vs AI Capability",
  "Defining Intended Purpose of an AI System",
  "Users Subjects and Affected Stakeholders", // Note: CSV has "Users Subjects" (no comma)
  "In-Scope vs Out-of-Scope Decisions",
  "Assumptions and Constraints in AI Use Cases",
  "Who Owns an AI Use Case",
  "Early Risk Signals During Use Case Design",
  "When a Use Case Should Be Stopped or Redesigned",
  "Mapping Use Cases to the AI Lifecycle",
];

async function setupLevel11() {
  console.log("🎮 Setting up Level 11 - Intermediate Applications...\n");

  // Step 1: Ensure Challenge record exists
  const levelConfig = LEVEL_CONFIGS.find((c) => c.level === 11);
  if (!levelConfig) {
    throw new Error("Level 11 config not found in LEVEL_CONFIGS");
  }

  console.log("📋 Level 11 Config:");
  console.log(`   Title: ${levelConfig.title}`);
  console.log(`   Description: ${levelConfig.description}`);
  console.log(`   Questions: ${levelConfig.questionCount}`);
  console.log(`   Time Limit: ${levelConfig.timeLimit} min`);
  console.log(`   Passing Score: ${levelConfig.passingScore}%\n`);

  // Find or create Challenge record
  let challenge = await (prisma as any).challenge.findFirst({
    where: { levelNumber: 11 },
  });

  if (!challenge) {
    console.log("⚠️  Challenge record not found, creating...");
    challenge = await (prisma as any).challenge.create({
      data: {
        levelNumber: 11,
        level: 11, // Legacy field
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

  for (const conceptName of LEVEL_11_CONCEPTS) {
    // Try exact match first
    let concept = await (prisma as any).conceptCard.findFirst({
      where: {
        OR: [
          { concept: { equals: conceptName, mode: "insensitive" } },
          { name: { equals: conceptName, mode: "insensitive" } },
        ],
      },
    });

    // Try partial match for "Users Subjects" -> "Users, Subjects" or "Users, Subjects, and Affected Stakeholders"
    if (!concept && conceptName.includes("Users Subjects")) {
      const variations = [
        "Users, Subjects",
        "Users, Subjects, and Affected Stakeholders",
        "Users Subjects and Affected Stakeholders",
        "Users and Subjects",
      ];
      
      for (const variant of variations) {
        concept = await (prisma as any).conceptCard.findFirst({
          where: {
            OR: [
              { concept: { contains: variant, mode: "insensitive" } },
              { concept: { contains: "Affected Stakeholders", mode: "insensitive" } },
            ],
          },
        });
        if (concept) break;
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

    // Try searching for similar concepts by removing common words
    if (!concept) {
      const searchTerms = conceptName
        .replace(/\b(What|Is|an|AI|Use|Case|Governance|Perspective|Business|Objective|vs|Capability|Defining|Intended|Purpose|of|System|Users|Subjects|and|Affected|Stakeholders|In-Scope|Out-of-Scope|Decisions|Assumptions|Constraints|Who|Owns|Early|Risk|Signals|During|Design|When|Should|Be|Stopped|Redesigned|Mapping|Lifecycle)\b/gi, "")
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 3);
      
      if (searchTerms.length > 0) {
        concept = await (prisma as any).conceptCard.findFirst({
          where: {
            concept: {
              contains: searchTerms[0],
              mode: "insensitive",
            },
          },
        });
      }
    }

    if (concept) {
      foundConcepts.push(concept.id);
      conceptMap.set(conceptName, concept);
      console.log(`   ✅ Found: ${concept.concept} (ID: ${concept.id})`);
    } else {
      missingConcepts.push(conceptName);
      console.log(`   ❌ Missing: ${conceptName}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Found: ${foundConcepts.length}/${LEVEL_11_CONCEPTS.length}`);
  console.log(`   Missing: ${missingConcepts.length}/${LEVEL_11_CONCEPTS.length}\n`);

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

  console.log(`✅ Assigned ${foundConcepts.length} concepts to Level 11\n`);

  // Step 4: Set up LevelCategoryCoverage
  console.log("📊 Setting up LevelCategoryCoverage...");
  
  // Level 11 category coverage:
  // INTRODUCED: D3 — Use Case Definition & Scoping
  // PRACTICED: D1 — Governance Structures & Roles, D3 — Risk Identification & Assessment, D1 — AI Lifecycle Governance
  
  const categoryCoverage = [
    { categoryName: "Use Case Definition & Scoping", domainName: "Domain 3", coverageType: "INTRODUCED" },
    { categoryName: "Governance Structures & Roles", domainName: "Domain 1", coverageType: "PRACTICED" },
    { categoryName: "Risk Identification & Assessment", domainName: "Domain 3", coverageType: "PRACTICED" },
    { categoryName: "AI Lifecycle Governance", domainName: "Domain 1", coverageType: "PRACTICED" },
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
            levelNumber: 11,
            categoryId: category.id,
            coverageType: coverage.coverageType,
          },
        },
        update: {
          weight: 1.0,
        },
        create: {
          levelNumber: 11,
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

  console.log("📋 Level 11 Challenge Summary:");
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

  console.log("\n✨ Level 11 setup complete!");
}

setupLevel11()
  .then(() => {
    console.log("\n🎉 Success!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

