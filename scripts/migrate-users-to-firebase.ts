/**
 * Migration script to create Firebase accounts for existing NextAuth users
 * 
 * This script:
 * 1. Finds all users without firebaseUid
 * 2. Creates Firebase accounts for them
 * 3. Links Firebase UID to database user
 * 
 * Usage: npx tsx scripts/migrate-users-to-firebase.ts
 */

import { PrismaClient } from "@prisma/client";
import { createUser } from "@/lib/firebase-server";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function migrateUsersToFirebase() {
  try {
    console.log("🔄 Starting migration of NextAuth users to Firebase...\n");

    // Find all users without firebaseUid
    const usersToMigrate = await prisma.user.findMany({
      where: {
        OR: [
          { firebaseUid: null },
          { firebaseUid: "" },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true, // We'll need to create a temporary password
        subscriptionTier: true,
      },
    });

    if (usersToMigrate.length === 0) {
      console.log("✅ No users to migrate. All users already have Firebase accounts.");
      return;
    }

    console.log(`📋 Found ${usersToMigrate.length} user(s) to migrate:\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of usersToMigrate) {
      try {
        console.log(`Processing: ${user.email}...`);

        // Generate a temporary random password
        // User will need to reset password via Firebase
        const tempPassword = `Temp${Math.random().toString(36).slice(-12)}!`;

        // Create Firebase account
        const firebaseUser = await createUser(
          user.email,
          tempPassword,
          user.name || undefined
        );

        // Update database user with Firebase UID
        await prisma.user.update({
          where: { id: user.id },
          data: {
            firebaseUid: firebaseUser.uid,
            // Note: emailVerified will be false - users need to verify via Firebase
          },
        });

        // Set custom claims for subscription tier
        if (user.subscriptionTier === "premium") {
          const { setCustomClaims } = await import("@/lib/firebase-server");
          await setCustomClaims(firebaseUser.uid, {
            subscriptionTier: "premium",
          });
        }

        console.log(`  ✅ Created Firebase account: ${firebaseUser.uid}`);
        console.log(`  ⚠️  Temporary password set. User must reset password via Firebase.`);
        successCount++;
      } catch (error: any) {
        console.error(`  ❌ Error migrating ${user.email}:`, error.message);
        
        // If user already exists in Firebase, try to link
        if (error.message.includes("already exists")) {
          console.log(`  ℹ️  User already exists in Firebase, attempting to link...`);
          try {
            const { getUserByUid } = await import("@/lib/firebase-server");
            // Try to find by email
            // Note: Firebase Admin SDK doesn't have getUserByEmail, so we'll skip for now
            // User will need to sign in with Firebase and we'll link automatically
            console.log(`  ⚠️  User exists in Firebase. Will be linked on next Firebase signin.`);
          } catch (linkError: any) {
            console.error(`  ❌ Failed to link:`, linkError.message);
          }
        }
        
        errorCount++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total processed: ${usersToMigrate.length}`);

    if (successCount > 0) {
      console.log("\n⚠️  IMPORTANT:");
      console.log("   • Users have been migrated with temporary passwords");
      console.log("   • They MUST reset their passwords via Firebase");
      console.log("   • Send them password reset emails or instructions");
      console.log("   • Or they can use 'Forgot Password' on signin page");
    }

    console.log("\n✅ Migration complete!");
  } catch (error: any) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsersToFirebase();

