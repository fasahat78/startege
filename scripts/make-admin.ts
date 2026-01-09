import { prisma } from "../lib/db";

async function makeAdmin(email: string) {
  try {
    console.log(`Making ${email} an admin...`);
    
    const user = await prisma.user.update({
      where: { email },
      data: {
        isAdmin: true,
        role: "ADMIN",
      },
      select: {
        email: true,
        isAdmin: true,
        role: true,
      },
    });

    console.log("✅ User updated successfully:");
    console.log(`   Email: ${user.email}`);
    console.log(`   isAdmin: ${user.isAdmin}`);
    console.log(`   role: ${user.role}`);
  } catch (error: any) {
    if (error.code === "P2025") {
      console.error(`❌ User with email "${email}" not found.`);
    } else {
      console.error("❌ Error updating user:", error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2] || "fasahat@gmail.com";
makeAdmin(email);
