import { assignConceptsToLevels, validateCoverage } from "../lib/concept-assignment";

async function main() {
  try {
    console.log("🚀 Starting concept-to-level assignment process...\n");

    // Assign concepts to levels
    const coverage = await assignConceptsToLevels();

    // Display results
    console.log("\n📊 Coverage Report:");
    console.log("=" .repeat(50));
    console.log(`Total Concepts: ${coverage.totalConcepts}`);
    console.log(`Assigned Concepts: ${coverage.assignedConcepts}`);
    console.log(`Unassigned Concepts: ${coverage.unassignedConcepts.length}`);
    console.log(`Coverage: ${coverage.coveragePercentage.toFixed(2)}%`);

    if (coverage.unassignedConcepts.length > 0) {
      console.log("\n⚠️  Unassigned Concepts:");
      coverage.unassignedConcepts.forEach((id) => {
        console.log(`  - ${id}`);
      });
    } else {
      console.log("\n✅ 100% Coverage Achieved!");
    }

    console.log("\n📈 Domain Distribution:");
    Object.entries(coverage.domainDistribution).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count} assignments`);
    });

    console.log("\n📊 Level Distribution:");
    Object.entries(coverage.levelDistribution)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([level, count]) => {
        console.log(`  Level ${level}: ${count} concepts`);
      });

    console.log("\n🔄 Spiral Learning:");
    const spiralCount = Object.keys(coverage.spiralLearning).filter(
      (id) => coverage.spiralLearning[id].length > 1
    ).length;
    console.log(`  Concepts with spiral learning: ${spiralCount}`);

    console.log("\n✨ Assignment complete!");
  } catch (error) {
    console.error("❌ Error assigning concepts:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();

