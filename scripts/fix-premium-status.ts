/**
 * Manual script to fix premium status
 * Run this if webhook didn't process correctly
 * 
 * Usage: npx tsx scripts/fix-premium-status.ts <userId>
 */

import { prisma } from "../lib/db";

async function fixPremiumStatus(userId: string) {
  try {
    console.log(`Updating user ${userId} to premium...`);

    // Update user subscription tier
    const user = await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: "premium" },
      select: { id: true, email: true, subscriptionTier: true },
    });

    console.log(`✅ User updated to premium:`, user);

    // Check if subscription record exists
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      console.log(`⚠️  No subscription record found. Creating one...`);
      // You may need to create subscription record manually with Stripe customer ID
      console.log(`Please create subscription record manually with Stripe customer ID`);
    } else {
      console.log(`✅ Subscription record exists:`, subscription);
    }

    // Allocate monthly credits
    try {
      const { allocateMonthlyCredits } = await import("../lib/ai-credits");
      await allocateMonthlyCredits(userId, subscription?.id);
      console.log(`✅ Monthly credits allocated`);
    } catch (error) {
      console.error(`⚠️  Error allocating credits:`, error);
    }

    console.log(`\n✅ Premium status fixed! User can now access premium features.`);
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get userId from command line args
const userId = process.argv[2];

if (!userId) {
  console.error("Usage: npx tsx scripts/fix-premium-status.ts <userId>");
  console.error("\nTo find your userId:");
  console.error("  SELECT id, email FROM \"User\" WHERE email='your-email@example.com';");
  process.exit(1);
}

fixPremiumStatus(userId);

