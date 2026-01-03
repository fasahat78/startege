// Test script to verify the API route works
import { prisma } from "../lib/db";

async function testRoute() {
  try {
    console.log("Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected");
    
    console.log("Testing Firebase Admin SDK...");
    const { getAdminAuth } = await import("../lib/firebase-admin");
    const auth = getAdminAuth();
    console.log("✅ Firebase Admin SDK initialized");
    
    console.log("✅ All dependencies loaded successfully");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRoute();
