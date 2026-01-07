/**
 * Auto-assign early adopter tiers based on signup order
 * 
 * Usage: tsx scripts/auto-assign-early-adopters.ts
 */

import { prisma } from "@/lib/db";
import { EarlyAdopterTier } from "@prisma/client";

async function autoAssignEarlyAdopters() {
  console.log("🚀 Starting early adopter tier assignment...");

  try {
    // Get all users ordered by creation date
    const users = await prisma.user.findMany({
      where: {
        isEarlyAdopter: false, // Only assign to users not already assigned
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    console.log(`📊 Found ${users.length} users to process`);

    let foundingMemberCount = 0;
    let earlyAdopterCount = 0;
    let launchUserCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      let tier: EarlyAdopterTier | null = null;

      // First 100 users = Founding Members
      if (i < 100) {
        tier = EarlyAdopterTier.FOUNDING_MEMBER;
        foundingMemberCount++;
      }
      // Next 400 users = Early Adopters
      else if (i < 500) {
        tier = EarlyAdopterTier.EARLY_ADOPTER;
        earlyAdopterCount++;
      }
      // Next 500+ users = Launch Users
      else if (i < 1000) {
        tier = EarlyAdopterTier.LAUNCH_USER;
        launchUserCount++;
      }

      if (tier) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isEarlyAdopter: true,
            earlyAdopterTier: tier,
            earlyAdopterStartDate: new Date(),
          },
        });

        console.log(`✅ Assigned ${tier} to ${user.email} (${i + 1}/${users.length})`);
      }
    }

    console.log("\n📈 Summary:");
    console.log(`   Founding Members: ${foundingMemberCount}`);
    console.log(`   Early Adopters: ${earlyAdopterCount}`);
    console.log(`   Launch Users: ${launchUserCount}`);
    console.log(`   Total Assigned: ${foundingMemberCount + earlyAdopterCount + launchUserCount}`);

    console.log("\n✅ Early adopter assignment complete!");
  } catch (error) {
    console.error("❌ Error assigning early adopter tiers:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

autoAssignEarlyAdopters();

