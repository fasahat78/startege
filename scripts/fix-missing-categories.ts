/**
 * Fix Missing Category IDs
 * 
 * This script:
 * 1. Finds all concepts with null categoryId
 * 2. Attempts to match them to existing categories by name/definition
 * 3. Assigns remaining to "Unclassified" category bucket
 */

import { prisma } from "../lib/db";

async function fixMissingCategories() {
  console.log("🔍 Finding concepts with missing categoryId...\n");

  // Find all concepts with null categoryId
  const conceptsWithNullCategory = await (prisma as any).conceptCard.findMany({
    where: {
      OR: [
        { categoryId: null },
        { category: "Unknown" },
      ],
    },
    select: {
      id: true,
      concept: true,
      name: true,
      definition: true,
      category: true, // Legacy field
      categoryId: true,
    },
  });

  console.log(`Found ${conceptsWithNullCategory.length} concepts with missing categoryId\n`);

  if (conceptsWithNullCategory.length === 0) {
    console.log("✅ All concepts have valid categoryId!");
    process.exit(0);
  }

  // Get all categories for matching
  const allCategories = await (prisma as any).category.findMany({
    select: {
      id: true,
      name: true,
      domain: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log(`Available categories: ${allCategories.length}\n`);

  // Create "Unclassified" category if it doesn't exist
  let unclassifiedCategory = await (prisma as any).category.findFirst({
    where: {
      name: "Unclassified",
    },
  });

  if (!unclassifiedCategory) {
    // Get Domain 1 (or first domain) for Unclassified
    const firstDomain = await (prisma as any).domain.findFirst({
      orderBy: { order: "asc" },
    });

    if (!firstDomain) {
      console.error("❌ No domains found. Cannot create Unclassified category.");
      process.exit(1);
    }

    unclassifiedCategory = await (prisma as any).category.create({
      data: {
        name: "Unclassified",
        domainId: firstDomain.id,
        order: 999, // High order number
        description: "Concepts that could not be automatically categorized",
        examSystemPrompt: "Generate exam questions for unclassified concepts.",
      },
    });

    console.log(`✅ Created "Unclassified" category: ${unclassifiedCategory.id}\n`);
  }

  let matched = 0;
  let assignedToUnclassified = 0;
  const updates: Array<{ id: string; concept: string; categoryId: string; reason: string }> = [];

  // Try to match concepts to categories
  for (const concept of conceptsWithNullCategory) {
    let matchedCategory = null;
    let matchReason = "";

    // Strategy 1: Match by legacy category field
    if (concept.category && concept.category !== "Unknown") {
      matchedCategory = allCategories.find(
        (cat: any) => cat.name.toLowerCase() === concept.category.toLowerCase()
      );
      if (matchedCategory) {
        matchReason = `Matched by legacy category field: "${concept.category}"`;
      }
    }

    // Strategy 2: Match by concept name keywords
    if (!matchedCategory) {
      const conceptLower = (concept.name || concept.concept || "").toLowerCase();
      for (const cat of allCategories) {
        const catNameLower = cat.name.toLowerCase();
        // Check if category name appears in concept name
        if (conceptLower.includes(catNameLower) || catNameLower.includes(conceptLower)) {
          matchedCategory = cat;
          matchReason = `Matched by keyword: "${cat.name}"`;
          break;
        }
      }
    }

    // Strategy 3: Match by definition keywords
    if (!matchedCategory && concept.definition) {
      const definitionLower = concept.definition.toLowerCase();
      for (const cat of allCategories) {
        const catNameLower = cat.name.toLowerCase();
        if (definitionLower.includes(catNameLower)) {
          matchedCategory = cat;
          matchReason = `Matched by definition keyword: "${cat.name}"`;
          break;
        }
      }
    }

    // Assign category
    const categoryId = matchedCategory?.id || unclassifiedCategory.id;
    const reason = matchReason || "Assigned to Unclassified (no match found)";

    await (prisma as any).conceptCard.update({
      where: { id: concept.id },
      data: { categoryId },
    });

    updates.push({
      id: concept.id,
      concept: concept.name || concept.concept,
      categoryId,
      reason,
    });

    if (matchedCategory) {
      matched++;
    } else {
      assignedToUnclassified++;
    }
  }

  // Print results
  console.log("=" .repeat(80));
  console.log("📊 CATEGORY ASSIGNMENT RESULTS");
  console.log("=" .repeat(80));
  console.log(`\nTotal concepts processed: ${conceptsWithNullCategory.length}`);
  console.log(`✅ Matched to existing categories: ${matched}`);
  console.log(`⚠️  Assigned to Unclassified: ${assignedToUnclassified}\n`);

  if (matched > 0) {
    console.log("✅ Successfully Matched:\n");
    updates
      .filter((u) => u.reason.startsWith("Matched"))
      .forEach((u) => {
        console.log(`  - ${u.concept}`);
        console.log(`    ${u.reason}`);
      });
    console.log();
  }

  if (assignedToUnclassified > 0) {
    console.log("⚠️  Assigned to Unclassified:\n");
    updates
      .filter((u) => u.reason.includes("Unclassified"))
      .forEach((u) => {
        console.log(`  - ${u.concept}`);
      });
    console.log();
  }

  // Verify all concepts now have categoryId
  const remainingNull = await (prisma as any).conceptCard.count({
    where: { categoryId: null },
  });

  if (remainingNull === 0) {
    console.log("✅ All concepts now have valid categoryId!\n");
  } else {
    console.log(`⚠️  Warning: ${remainingNull} concepts still have null categoryId\n`);
  }

  console.log("=" .repeat(80));
  console.log("💡 NEXT STEPS");
  console.log("=" .repeat(80));
  console.log(`
1. Review concepts assigned to "Unclassified"
2. Manually assign them to proper categories if needed
3. Re-run extract script to update levels-concepts-mapping.json:
   npx tsx scripts/extract-level-concepts.ts > levels-concepts-mapping.json
4. Verify boss level generation can proceed
`);

  process.exit(0);
}

fixMissingCategories().catch((error) => {
  console.error("❌ Error fixing categories:", error);
  process.exit(1);
});

