/**
 * Seed Interest and Goal Options
 * 
 * This script documents the available interest and goal options.
 * These are not stored in a separate table but are used as string values
 * in UserInterest and UserGoal tables.
 * 
 * This script serves as documentation and validation reference.
 */

import { prisma } from "../lib/db";

const INTEREST_OPTIONS = [
  "Regulatory Compliance",
  "Ethical AI & Fairness",
  "Technical Implementation",
  "Risk Management",
  "Strategic Planning",
  "Legal & Regulatory Analysis",
  "Data Privacy & Protection",
  "Governance Frameworks",
  "Product Development",
  "Research & Academia",
];

const GOAL_OPTIONS = [
  "AIGP Certification Preparation",
  "Career Advancement",
  "Current Role Enhancement",
  "Academic Research",
  "Organizational Implementation",
  "Personal Knowledge",
  "Compliance Requirements",
  "Consulting Practice",
  "Product Development",
  "Teaching & Training",
];

async function validateInterestsAndGoals() {
  console.log("📋 Validating Interest and Goal Options...\n");

  console.log("✅ Interest Options (10):");
  INTEREST_OPTIONS.forEach((interest, index) => {
    console.log(`   ${index + 1}. ${interest}`);
  });

  console.log("\n✅ Goal Options (10):");
  GOAL_OPTIONS.forEach((goal, index) => {
    console.log(`   ${index + 1}. ${goal}`);
  });

  console.log("\n📝 Note: These options are used as string values in UserInterest and UserGoal tables.");
  console.log("   No separate seed table is needed - users select from these options during onboarding.\n");

  // Check if there are any existing user interests/goals with invalid values
  const existingInterests = await prisma.userInterest.findMany({
    select: { interest: true },
    distinct: ["interest"],
  });

  const existingGoals = await prisma.userGoal.findMany({
    select: { goal: true },
    distinct: ["goal"],
  });

  if (existingInterests.length > 0) {
    console.log("📊 Existing User Interests in Database:");
    existingInterests.forEach(({ interest }) => {
      const isValid = INTEREST_OPTIONS.includes(interest);
      console.log(`   ${isValid ? "✅" : "⚠️"} ${interest}`);
    });
  }

  if (existingGoals.length > 0) {
    console.log("\n📊 Existing User Goals in Database:");
    existingGoals.forEach(({ goal }) => {
      const isValid = GOAL_OPTIONS.includes(goal);
      console.log(`   ${isValid ? "✅" : "⚠️"} ${goal}`);
    });
  }

  console.log("\n✅ Validation complete!\n");
}

// Export for use in other scripts
export { INTEREST_OPTIONS, GOAL_OPTIONS };

validateInterestsAndGoals()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Validation failed:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

