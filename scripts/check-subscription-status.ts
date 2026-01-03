/**
 * Script to check and fix subscription status
 * Usage: npx tsx scripts/check-subscription-status.ts <email>
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env.local") });

import { prisma } from "../lib/db";
import { stripe } from "../lib/stripe";

async function checkAndFixSubscription(email: string) {
  try {
    console.log(`Checking subscription for: ${email}\n`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        subscription: {
          select: {
            stripeCustomerId: true,
            stripeSubscriptionId: true,
            status: true,
            planType: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    console.log("Current Database Status:");
    console.log(`  User ID: ${user.id}`);
    console.log(`  Subscription Tier: ${user.subscriptionTier}`);
    console.log(`  DB Subscription Status: ${user.subscription?.status || "none"}`);
    console.log(`  Stripe Customer ID: ${user.subscription?.stripeCustomerId || "none"}`);
    console.log(`  Stripe Subscription ID: ${user.subscription?.stripeSubscriptionId || "none"}\n`);

    // Check Stripe if we have customer ID
    if (user.subscription?.stripeCustomerId) {
      console.log("Checking Stripe...");
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.subscription.stripeCustomerId,
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const stripeSub = subscriptions.data[0];
          console.log(`  Stripe Subscription Status: ${stripeSub.status}`);
          console.log(`  Stripe Subscription ID: ${stripeSub.id}`);
          console.log(`  Current Period End: ${new Date(stripeSub.current_period_end * 1000).toISOString()}\n`);

          const isActive = stripeSub.status === "active" || stripeSub.status === "trialing";

          if (isActive && user.subscriptionTier !== "premium") {
            console.log("⚠️  User should be premium but isn't. Fixing...\n");

            // Update subscription record
            await prisma.subscription.update({
              where: { userId: user.id },
              data: {
                status: stripeSub.status,
                stripeSubscriptionId: stripeSub.id,
                currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                planType: stripeSub.items.data[0]?.price.recurring?.interval || "monthly",
              },
            });

            // Update user to premium
            await prisma.user.update({
              where: { id: user.id },
              data: { subscriptionTier: "premium" },
            });

            // Allocate credits
            const { allocateMonthlyCredits } = await import("../lib/ai-credits");
            const subscription = await prisma.subscription.findUnique({
              where: { userId: user.id },
            });
            if (subscription) {
              await allocateMonthlyCredits(user.id, subscription.id);
            }

            console.log("✅ Fixed! User is now premium.");
          } else if (isActive) {
            console.log("✅ User is already premium. Status is correct.");
          } else {
            console.log(`⚠️  Stripe subscription status is: ${stripeSub.status}`);
          }
        } else {
          console.log("⚠️  No subscriptions found in Stripe for this customer.");
        }
      } catch (error: any) {
        console.error(`❌ Error checking Stripe:`, error.message);
      }
    } else {
      console.log("⚠️  No Stripe customer ID found. User needs to complete checkout.");
    }
  } catch (error: any) {
    console.error(`❌ Error:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx scripts/check-subscription-status.ts <email>");
  console.error("Example: npx tsx scripts/check-subscription-status.ts fasahat@gmail.com");
  process.exit(1);
}

checkAndFixSubscription(email);

