/**
 * Script to switch a user back to free plan for testing
 * Usage: npx tsx scripts/switch-to-free-plan.ts [userId]
 */

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function switchToFreePlan(userId?: string) {
  try {
    let targetUserId: string;

    if (userId) {
      targetUserId = userId;
    } else {
      // Get the first user (or you can modify this to get by email)
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true },
      });

      if (!firstUser) {
        console.error("❌ No users found in database");
        process.exit(1);
      }

      targetUserId = firstUser.id;
      console.log(`📧 Found user: ${firstUser.email}`);
    }

    console.log(`\n🔄 Switching user ${targetUserId} to free plan...\n`);

    // Update user subscription tier
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        subscriptionTier: "free",
      },
    });

    // Update or delete subscription record
    const subscription = await prisma.subscription.findUnique({
      where: { userId: targetUserId },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { userId: targetUserId },
        data: {
          status: "canceled",
          planType: null,
        },
      });
      console.log("✅ Updated subscription record to canceled");
    } else {
      console.log("ℹ️  No subscription record found (already free)");
    }

    console.log("\n✅ Successfully switched user to free plan!");
    console.log("\n📋 User Status:");
    const updatedUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        email: true,
        subscriptionTier: true,
        subscription: {
          select: {
            status: true,
            planType: true,
          },
        },
      },
    });

    console.log(`   Email: ${updatedUser?.email}`);
    console.log(`   Subscription Tier: ${updatedUser?.subscriptionTier}`);
    console.log(`   Subscription Status: ${updatedUser?.subscription?.status || "N/A"}`);
    console.log(`   Plan Type: ${updatedUser?.subscription?.planType || "N/A"}`);

    console.log("\n🎯 You can now test the upgrade flow!");
  } catch (error: any) {
    console.error("❌ Error switching to free plan:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get userId from command line args or use first user
const userId = process.argv[2];

switchToFreePlan(userId);

