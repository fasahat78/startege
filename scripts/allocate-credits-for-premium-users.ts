/**
 * Script to allocate credits for existing premium users who don't have credit accounts
 * Usage: npx tsx scripts/allocate-credits-for-premium-users.ts [userId]
 * 
 * If userId is provided, only that user will be processed.
 * Otherwise, all premium users without credit accounts will be processed.
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env.local") });

import { prisma } from "../lib/db";
import { allocateMonthlyCredits } from "../lib/ai-credits";

async function allocateCreditsForPremiumUsers(userId?: string) {
  try {
    if (userId) {
      // Process single user
      console.log(`Processing user: ${userId}\n`);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          subscriptionTier: true,
          subscription: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!user) {
        console.error(`❌ User not found: ${userId}`);
        process.exit(1);
      }

      if (user.subscriptionTier !== "premium") {
        console.error(`❌ User is not premium: ${user.email}`);
        process.exit(1);
      }

      const existingCredit = await prisma.aICredit.findUnique({
        where: { userId: user.id },
      });

      if (existingCredit) {
        console.log(`✅ User already has credit account:`);
        console.log(`   Balance: ${existingCredit.currentBalance} credits`);
        console.log(`   Monthly Allowance: ${existingCredit.monthlyAllowance} credits`);
        return;
      }

      console.log(`Creating credit account for ${user.email}...`);

      const creditAccount = await allocateMonthlyCredits(
        user.id,
        user.subscription?.id
      );

      console.log(`✅ Credit account created:`);
      console.log(`   Balance: ${creditAccount.currentBalance} credits`);
      console.log(`   Monthly Allowance: ${creditAccount.monthlyAllowance} credits`);
      console.log(`   Billing Cycle End: ${creditAccount.billingCycleEnd.toISOString()}`);
    } else {
      // Process all premium users without credit accounts
      console.log("Finding premium users without credit accounts...\n");

      const premiumUsers = await prisma.user.findMany({
        where: {
          subscriptionTier: "premium",
        },
        select: {
          id: true,
          email: true,
          subscription: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      console.log(`Found ${premiumUsers.length} premium user(s)\n`);

      let processed = 0;
      let skipped = 0;
      let errors = 0;

      for (const user of premiumUsers) {
        try {
          // Check if credit account exists
          const existingCredit = await prisma.aICredit.findUnique({
            where: { userId: user.id },
          });

          if (existingCredit) {
            console.log(`⏭️  Skipping ${user.email} - already has credit account`);
            skipped++;
            continue;
          }

          console.log(`Processing ${user.email}...`);

          const creditAccount = await allocateMonthlyCredits(
            user.id,
            user.subscription?.id
          );

          console.log(`✅ Created credit account:`);
          console.log(`   Balance: ${creditAccount.currentBalance} credits`);
          console.log(`   Monthly Allowance: ${creditAccount.monthlyAllowance} credits\n`);

          processed++;
        } catch (error: any) {
          console.error(`❌ Error processing ${user.email}:`, error.message);
          errors++;
        }
      }

      console.log("\n📊 Summary:");
      console.log(`   ✅ Processed: ${processed}`);
      console.log(`   ⏭️  Skipped: ${skipped}`);
      console.log(`   ❌ Errors: ${errors}`);
    }
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const userId = process.argv[2];

allocateCreditsForPremiumUsers(userId);

