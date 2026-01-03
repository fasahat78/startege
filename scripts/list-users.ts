/**
 * List all users in the database
 */

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        subscription: {
          select: {
            status: true,
            planType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`\n📋 Found ${users.length} user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Tier: ${user.subscriptionTier}`);
      console.log(`   Subscription: ${user.subscription?.status || "None"} (${user.subscription?.planType || "N/A"})`);
      console.log("");
    });

    if (users.length > 0) {
      console.log("💡 To switch a user to free plan, run:");
      console.log(`   npx tsx scripts/switch-to-free-plan.ts <userId>`);
      console.log(`\n   Example:`);
      console.log(`   npx tsx scripts/switch-to-free-plan.ts ${users[0].id}`);
    }
  } catch (error: any) {
    console.error("❌ Error listing users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();

