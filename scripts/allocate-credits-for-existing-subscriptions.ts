import { prisma } from "@/lib/db";
import { allocateMonthlyCredits } from "@/lib/ai-credits";

/**
 * Allocate credits for all existing premium subscriptions
 * This fixes the issue where credits weren't allocated during checkout
 */

async function allocateCreditsForSubscriptions() {
  try {
    console.log("Finding all active premium subscriptions...");

    // Find all users with premium subscription tier
    const premiumUsers = await prisma.user.findMany({
      where: {
        subscriptionTier: "premium",
      },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
      },
    });

    console.log(`Found ${premiumUsers.length} premium users`);

    if (premiumUsers.length === 0) {
      console.log("No premium users found. Exiting.");
      return;
    }

    // Find their subscriptions (include all statuses, not just "active")
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: { in: premiumUsers.map((u) => u.id) },
        // Include active, incomplete, trialing, etc. - any subscription record
      },
      select: {
        id: true,
        userId: true,
        planType: true,
        status: true,
      },
    });

    console.log(`Found ${subscriptions.length} active subscriptions`);

    let allocated = 0;
    let errors = 0;

    for (const subscription of subscriptions) {
      try {
        const user = premiumUsers.find((u) => u.id === subscription.userId);
        console.log(`\nProcessing user: ${user?.email || subscription.userId}`);

        // Check if credits already exist
        const existingCredits = await prisma.aICredit.findUnique({
          where: { userId: subscription.userId },
        });

        if (existingCredits) {
          console.log(
            `  ⚠️  Credits already exist: ${existingCredits.currentBalance} credits`
          );
          console.log(`  Monthly allowance: ${existingCredits.monthlyAllowance}`);
          console.log(`  Billing cycle ends: ${existingCredits.billingCycleEnd}`);
          continue;
        }

        // Allocate credits
        console.log(`  Allocating credits for ${subscription.planType} plan...`);
        const creditAccount = await allocateMonthlyCredits(
          subscription.userId,
          subscription.id
        );

        console.log(`  ✅ Allocated ${creditAccount.currentBalance} credits`);
        console.log(`  Monthly allowance: ${creditAccount.monthlyAllowance}`);
        console.log(`  Billing cycle ends: ${creditAccount.billingCycleEnd}`);
        allocated++;
      } catch (error: any) {
        console.error(
          `  ❌ Error allocating credits for user ${subscription.userId}:`,
          error.message
        );
        if (error.code === "P2021" || error.message?.includes("does not exist")) {
          console.error(
            `  ⚠️  AICredit table doesn't exist! Run scripts/create-aicredit-tables.sql first.`
          );
        }
        errors++;
      }
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Total subscriptions: ${subscriptions.length}`);
    console.log(`Credits allocated: ${allocated}`);
    console.log(`Errors: ${errors}`);
    console.log(`Already had credits: ${subscriptions.length - allocated - errors}`);

    if (errors > 0) {
      console.log(
        "\n⚠️  Some errors occurred. Check if AICredit table exists in production."
      );
    }
  } catch (error: any) {
    console.error("Fatal error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

allocateCreditsForSubscriptions();

