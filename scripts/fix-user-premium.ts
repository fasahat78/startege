/**
 * Quick fix: Update user to premium based on Stripe subscription ID
 * Usage: npx tsx scripts/fix-user-premium.ts <userId> <stripeSubscriptionId>
 * 
 * From Stripe event: subscription = "sub_1SjhlTBEA7DCjdkmF2xFnfIv"
 * User ID from metadata: "cmj2xzjc600000a92a36spfu2"
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env.local") });

import { prisma } from "../lib/db";

async function fixUserPremium(userId: string, stripeSubscriptionId: string) {
  try {
    console.log(`Fixing premium status for user: ${userId}`);
    console.log(`Stripe Subscription ID: ${stripeSubscriptionId}\n`);

    // Update subscription record
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId,
        status: "active",
        planType: "monthly",
        currentPeriodStart: new Date(), // Will be updated by webhook later
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // ~30 days
      },
      create: {
        userId,
        stripeCustomerId: "cus_Th5ouJ4tK6B8t6", // From Stripe event
        stripeSubscriptionId,
        status: "active",
        planType: "monthly",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    console.log("✅ Subscription record updated:", subscription.id);

    // Update user to premium
    const user = await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: "premium" },
      select: { id: true, email: true, subscriptionTier: true },
    });

    console.log("✅ User updated to premium:", user);

    // Allocate monthly credits
    try {
      const { allocateMonthlyCredits } = await import("../lib/ai-credits");
      await allocateMonthlyCredits(userId, subscription.id);
      console.log("✅ Monthly credits allocated");
    } catch (error: any) {
      console.error("⚠️  Error allocating credits:", error.message);
    }

    console.log("\n✅ Premium status fixed! Refresh your dashboard to see changes.");
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const userId = process.argv[2];
const stripeSubscriptionId = process.argv[3] || "sub_1SjhlTBEA7DCjdkmF2xFnfIv"; // Default from your event

if (!userId) {
  console.error("Usage: npx tsx scripts/fix-user-premium.ts <userId> [stripeSubscriptionId]");
  console.error("\nExample:");
  console.error("  npx tsx scripts/fix-user-premium.ts cmj2xzjc600000a92a36spfu2");
  process.exit(1);
}

fixUserPremium(userId, stripeSubscriptionId);

