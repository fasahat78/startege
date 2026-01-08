/**
 * Make a user an admin
 * 
 * Usage: tsx scripts/make-admin.ts <email>
 */

import { prisma } from "@/lib/db";

async function makeAdmin(email: string) {
  if (!email) {
    console.error("Please provide an email address.");
    process.exit(1);
  }

  try {
    // First, add the columns if they don't exist
    console.log("Checking/adding admin columns...");
    
    try {
      // Add isAdmin column if it doesn't exist
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'User' AND column_name = 'isAdmin') THEN
            ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN DEFAULT false;
          END IF;
        END $$;
      `;
      console.log("✅ isAdmin column ready");
    } catch (error: any) {
      console.log("⚠️ Error adding isAdmin column:", error.message);
    }

    try {
      // Add role column if it doesn't exist
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'User' AND column_name = 'role') THEN
            ALTER TABLE "User" ADD COLUMN role TEXT DEFAULT 'USER';
          END IF;
        END $$;
      `;
      console.log("✅ role column ready");
    } catch (error: any) {
      console.log("⚠️ Error adding role column:", error.message);
    }

    // Check if user exists
    const user = await prisma.$queryRaw<Array<{ id: string; email: string; name: string | null }>>`
      SELECT id, email, name
      FROM "User" 
      WHERE email = ${email}
      LIMIT 1
    `;

    if (!user || user.length === 0) {
      console.log(`❌ User with email "${email}" not found.`);
      process.exit(1);
    }

    const userData = user[0];
    console.log(`Found user: ${userData.email} (${userData.name || 'No name'})`);

    // Update using raw SQL
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "isAdmin" = true 
      WHERE email = ${email}
    `;

    // Try to update role column
    try {
      await prisma.$executeRaw`
        UPDATE "User" 
        SET role = 'ADMIN' 
        WHERE email = ${email}
      `;
    } catch (error: any) {
      console.log(`⚠️ Could not update role column: ${error.message}`);
    }

    console.log(`✅ Successfully made ${email} an admin!`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.name || "N/A"}`);
    console.log(`   Role: ADMIN`);
    console.log(`   Is Admin: true`);
  } catch (error) {
    console.error("Error making user admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin(process.argv[2] || "fasahat@gmail.com");

