import { prisma } from "../lib/db";

const badges = [
  {
    name: "First Steps",
    description: "Complete your first concept card",
    badgeType: "learning",
    rarity: "common",
  },
  {
    name: "Getting Started",
    description: "Complete 10 concept cards",
    badgeType: "learning",
    rarity: "common",
  },
  {
    name: "Dedicated Learner",
    description: "Complete 25 concept cards",
    badgeType: "learning",
    rarity: "uncommon",
  },
  {
    name: "Knowledge Seeker",
    description: "Complete 50 concept cards",
    badgeType: "learning",
    rarity: "uncommon",
  },
  {
    name: "Domain Master",
    description: "Complete 100 concept cards",
    badgeType: "learning",
    rarity: "rare",
  },
  {
    name: "AI Governance Expert",
    description: "Complete 200 concept cards",
    badgeType: "learning",
    rarity: "epic",
  },
  {
    name: "Perfect Week",
    description: "Maintain a 7-day streak",
    badgeType: "streak",
    rarity: "uncommon",
  },
  {
    name: "Consistency Champion",
    description: "Maintain a 30-day streak",
    badgeType: "streak",
    rarity: "rare",
  },
  {
    name: "Point Collector",
    description: "Earn 500 points",
    badgeType: "learning",
    rarity: "uncommon",
  },
  {
    name: "Point Master",
    description: "Earn 1,000 points",
    badgeType: "learning",
    rarity: "rare",
  },
  {
    name: "Point Legend",
    description: "Earn 5,000 points",
    badgeType: "learning",
    rarity: "epic",
  },
  {
    name: "Early Bird",
    description: "Complete your first concept within 24 hours of registration",
    badgeType: "social",
    rarity: "common",
  },
];

async function createBadges() {
  console.log("🏅 Creating badges...");

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    });
  }

  console.log(`✅ Created ${badges.length} badges`);
}

createBadges()
  .then(() => {
    console.log("✨ Badge creation complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error creating badges:", error);
    process.exit(1);
  });

