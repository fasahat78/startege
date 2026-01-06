import { prisma } from "@/lib/db";

/**
 * Find user ID by email
 * Usage: tsx scripts/find-user-id.ts <email>
 */

async function findUserId() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: tsx scripts/find-user-id.ts <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, subscriptionTier: true },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Subscription: ${user.subscriptionTier}`);
    console.log(`\nTo allocate credits, run:`);
    console.log(`   tsx scripts/allocate-credits-to-user.ts ${user.id}`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

findUserId();

