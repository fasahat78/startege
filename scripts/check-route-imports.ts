// Check if route file imports work
console.log("Testing route file imports...");

try {
  console.log("1. Testing NextResponse import...");
  const { NextResponse } = await import("next/server");
  console.log("✅ NextResponse imported");
  
  console.log("2. Testing firebase-server import...");
  const { verifyIdToken } = await import("../lib/firebase-server");
  console.log("✅ firebase-server imported");
  
  console.log("3. Testing db import...");
  const { prisma } = await import("../lib/db");
  console.log("✅ db imported");
  
  console.log("✅ All imports successful!");
} catch (error: any) {
  console.error("❌ Import error:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
}
