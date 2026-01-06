import { prisma } from "@/lib/db";
import { allocateMonthlyCredits } from "@/lib/ai-credits";

/**
 * Allocate initial credits to a user
 * Usage: tsx scripts/allocate-credits-to-user.ts <userId>
 */

async function allocateCredits() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("Usage: tsx scripts/allocate-credits-to-user.ts <userId>");
    console.error("\nTo find your userId:");
    console.error("1. Check the User table in Cloud SQL Studio");
    console.error("2. Or check the browser console for your user ID");
    process.exit(1);
  }

  try {
    console.log(`Allocating credits to user: ${userId}...`);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, subscriptionTier: true },
    });

    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.email} (${user.subscriptionTier})`);

    // Check if user has a subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      select: { id: true, planType: true },
    });

    if (subscription) {
      console.log(`✅ Subscription found: ${subscription.planType}`);
      const creditAccount = await allocateMonthlyCredits(userId, subscription.id);
      console.log(`✅ Credits allocated: ${creditAccount.currentBalance} credits`);
      console.log(`   Monthly allowance: ${creditAccount.monthlyAllowance} credits`);
      console.log(`   Billing cycle ends: ${creditAccount.billingCycleEnd}`);
    } else {
      console.log(`⚠️  No subscription found, allocating default monthly credits...`);
      const creditAccount = await allocateMonthlyCredits(userId);
      console.log(`✅ Credits allocated: ${creditAccount.currentBalance} credits`);
      console.log(`   Monthly allowance: ${creditAccount.monthlyAllowance} credits`);
      console.log(`   Billing cycle ends: ${creditAccount.billingCycleEnd}`);
    }

    console.log("\n🎉 Credits allocated successfully!");
  } catch (error: any) {
    console.error("❌ Error allocating credits:", error.message);
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.error("\n⚠️  AICredit table doesn't exist!");
      console.error("Please run scripts/create-aicredit-tables.sql in Cloud SQL Studio first.");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

allocateCredits();

