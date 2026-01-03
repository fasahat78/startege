/**
 * Remove unassigned concepts (not part of levels 1-40 curriculum)
 * 
 * This script:
 * 1. Identifies concepts not assigned to any level (1-40)
 * 2. Deletes those concepts and their associated UserProgress records
 * 3. Verifies the remaining concepts are all part of the curriculum
 */

import { prisma } from "../lib/db";

async function removeUnassignedConcepts() {
  console.log("🔍 Identifying unassigned concepts...\n");

  // Get all concepts
  const allConcepts = await prisma.conceptCard.findMany({
    select: { id: true, concept: true, name: true },
  });

  // Get all challenges (levels 1-40)
  const allChallenges = await prisma.challenge.findMany({
    where: { levelNumber: { lte: 40 } },
    select: { concepts: true },
  });

  // Build set of assigned concept IDs
  const assignedIds = new Set<string>();
  allChallenges.forEach((challenge) => {
    if (Array.isArray(challenge.concepts)) {
      challenge.concepts.forEach((id: string) => assignedIds.add(id));
    }
  });

  // Find unassigned concepts
  const unassigned = allConcepts.filter((c) => !assignedIds.has(c.id));

  console.log(`📊 Summary:`);
  console.log(`   Total concepts: ${allConcepts.length}`);
  console.log(`   Assigned to levels 1-40: ${assignedIds.size}`);
  console.log(`   Unassigned (to be deleted): ${unassigned.length}\n`);

  if (unassigned.length === 0) {
    console.log("✅ No unassigned concepts found. Nothing to delete.");
    return;
  }

  // Show first 10 unassigned concepts
  console.log("📋 First 10 unassigned concepts to be deleted:");
  unassigned.slice(0, 10).forEach((c) => {
    console.log(`   - ${c.concept || c.name || c.id}`);
  });
  if (unassigned.length > 10) {
    console.log(`   ... and ${unassigned.length - 10} more\n`);
  } else {
    console.log();
  }

  // Check for UserProgress records
  const unassignedIds = unassigned.map((c) => c.id);
  const userProgressCount = await prisma.userProgress.count({
    where: { conceptCardId: { in: unassignedIds } },
  });

  if (userProgressCount > 0) {
    console.log(
      `⚠️  Warning: Found ${userProgressCount} UserProgress records associated with unassigned concepts.`
    );
    console.log("   These will be automatically deleted (CASCADE).\n");
  }

  // Confirm deletion
  console.log("🗑️  Deleting unassigned concepts...");
  
  // Delete in batches to avoid timeout
  const BATCH_SIZE = 50;
  let deleted = 0;
  
  for (let i = 0; i < unassignedIds.length; i += BATCH_SIZE) {
    const batch = unassignedIds.slice(i, i + BATCH_SIZE);
    const result = await prisma.conceptCard.deleteMany({
      where: { id: { in: batch } },
    });
    deleted += result.count;
    console.log(`   Deleted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.count} concepts (${deleted}/${unassignedIds.length})`);
  }

  console.log(`\n✅ Successfully deleted ${deleted} unassigned concepts`);

  // Verify remaining concepts
  const remainingConcepts = await prisma.conceptCard.count();
  console.log(`\n📊 Final count: ${remainingConcepts} concepts remaining (should be ${assignedIds.size})`);

  if (remainingConcepts === assignedIds.size) {
    console.log("✅ Perfect! All remaining concepts are part of the curriculum.");
  } else {
    console.log(
      `⚠️  Warning: Count mismatch. Expected ${assignedIds.size}, got ${remainingConcepts}`
    );
  }
}

main()
  .then(() => {
    console.log("\n🎉 Cleanup complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error removing unassigned concepts:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function main() {
  await removeUnassignedConcepts();
}

