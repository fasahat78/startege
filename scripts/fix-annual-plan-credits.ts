/**
 * Fix Annual Plan Credits
 * 
 * This script manually updates credits for users who switched to annual plan
 * but didn't get their credits updated properly.
 * 
 * Usage:
 *   npx tsx scripts/fix-annual-plan-credits.ts [email]
 * 
 * If email is provided, fixes that specific user.
 * Otherwise, fixes all users with annual subscriptions.
 */

import { prisma } from "../lib/db";
import { updatePlanType } from "../lib/ai-credits";

async function main() {
  // Get email from command line or use default
  const userEmail = process.argv[2] || null;
  
  let annualSubscriptions;
  
  if (userEmail) {
    // Find specific user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    
    if (!user) {
      console.error(`❌ User not found: ${userEmail}`);
      process.exit(1);
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        aiCredit: true,
      },
    });
    
    if (!subscription) {
      console.error(`❌ No subscription found for user: ${userEmail}`);
      process.exit(1);
    }
    
    annualSubscriptions = [subscription];
  } else {
    // Find all users with annual subscriptions
    annualSubscriptions = await prisma.subscription.findMany({
      where: {
        planType: { in: ["annual", "year"] }, // Handle both formats
        status: "active",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        aiCredit: true,
      },
    });
  }

  console.log(`Found ${annualSubscriptions.length} annual subscription(s)\n`);

  for (const subscription of annualSubscriptions) {
    const userId = subscription.userId;
    const userEmail = subscription.user.email || "unknown";
    
    console.log(`\n${"=".repeat(80)}`);
    console.log(`Processing: ${userEmail} (${userId})`);
    console.log(`${"=".repeat(80)}`);

    // Get current credit state
    const creditBefore = await prisma.aICredit.findUnique({
      where: { userId },
    });

    if (!creditBefore) {
      console.log(`  ⚠️  No credit account found. Creating one...`);
      // Create credit account
      const { allocateMonthlyCredits } = await import("../lib/ai-credits");
      await allocateMonthlyCredits(userId, subscription.id);
      console.log(`  ✅ Created credit account with annual allowance`);
      continue;
    }

    console.log(`\n📊 BEFORE:`);
    console.log(`  Monthly Allowance: ${creditBefore.monthlyAllowance}`);
    console.log(`  Current Balance: ${creditBefore.currentBalance}`);
    console.log(`  Purchased Credits: ${creditBefore.purchasedCredits || 0}`);
    console.log(`  Credits Used This Cycle: ${creditBefore.creditsUsedThisCycle}`);

    // Check if allowance is correct for annual plan
    const expectedAllowance = 1250;
    const isAllowanceCorrect = creditBefore.monthlyAllowance === expectedAllowance;

    // Calculate expected balance if switching from monthly
    // If they had monthly plan before, they should have:
    // remainingMonthlyCredits + purchasedCredits + newAnnualAllowance
    let expectedBalance = creditBefore.currentBalance;
    
    if (!isAllowanceCorrect && creditBefore.monthlyAllowance === 1000) {
      // They were on monthly plan, switching to annual
      const purchasedCredits = creditBefore.purchasedCredits || 0;
      const remainingMonthlyCredits = Math.max(0, creditBefore.currentBalance - purchasedCredits);
      expectedBalance = remainingMonthlyCredits + purchasedCredits + expectedAllowance;
      console.log(`\n  🔄 Switching from monthly to annual:`);
      console.log(`    Remaining Monthly: ${remainingMonthlyCredits}`);
      console.log(`    Purchased: ${purchasedCredits}`);
      console.log(`    New Annual Allowance: ${expectedAllowance}`);
      console.log(`    Expected New Balance: ${expectedBalance}`);
    } else if (isAllowanceCorrect) {
      console.log(`\n  ✅ Allowance already correct for annual plan`);
      console.log(`  Current balance: ${creditBefore.currentBalance}`);
      
      // Check if balance seems low (might need update)
      if (creditBefore.currentBalance < expectedAllowance) {
        console.log(`  ⚠️  Balance seems low. Checking if update needed...`);
        // If balance is less than allowance, they might have switched but credits weren't updated
        const purchasedCredits = creditBefore.purchasedCredits || 0;
        const remainingMonthlyCredits = Math.max(0, creditBefore.currentBalance - purchasedCredits);
        if (remainingMonthlyCredits < expectedAllowance) {
          expectedBalance = remainingMonthlyCredits + purchasedCredits + expectedAllowance;
          console.log(`    Recalculating: ${remainingMonthlyCredits} + ${purchasedCredits} + ${expectedAllowance} = ${expectedBalance}`);
        } else {
          console.log(`    Balance looks correct. Skipping.`);
          continue;
        }
      } else {
        console.log(`    Balance looks correct. Skipping.`);
        continue;
      }
    }

    // Update plan type
    try {
      await updatePlanType(userId, subscription.id, true);
      
      // Get updated state
      const creditAfter = await prisma.aICredit.findUnique({
        where: { userId },
      });

      console.log(`\n📊 AFTER:`);
      console.log(`  Monthly Allowance: ${creditAfter?.monthlyAllowance}`);
      console.log(`  Current Balance: ${creditAfter?.currentBalance}`);
      console.log(`  Purchased Credits: ${creditAfter?.purchasedCredits || 0}`);

      if (creditAfter?.currentBalance === expectedBalance) {
        console.log(`\n  ✅ Successfully updated!`);
      } else {
        console.log(`\n  ⚠️  Balance mismatch:`);
        console.log(`    Expected: ${expectedBalance}`);
        console.log(`    Actual: ${creditAfter?.currentBalance}`);
      }
    } catch (error: any) {
      console.error(`\n  ❌ Error: ${error.message}`);
      console.error(error.stack);
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log(`✅ Processing complete`);
  console.log(`${"=".repeat(80)}\n`);
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
