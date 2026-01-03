import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
  };

  // Check environment variables first (no imports needed)
  diagnostics.checks.env = {
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ Missing",
  };

  // Check Prisma import
  try {
    const { prisma } = await import("@/lib/db");
    diagnostics.checks.prismaImport = "✅ Prisma imported";
    
    // Check database connection
    try {
      await prisma.$connect();
      diagnostics.checks.database = "✅ Connected";
      
      // Try a simple query
      const userCount = await prisma.user.count();
      diagnostics.checks.databaseQuery = `✅ User count: ${userCount}`;
    } catch (error: any) {
      diagnostics.checks.database = `❌ Error: ${error.message}`;
      diagnostics.errors.push(`Database error: ${error.message}`);
    }
  } catch (error: any) {
    diagnostics.checks.prismaImport = `❌ Error importing Prisma: ${error.message}`;
    diagnostics.errors.push(`Prisma import error: ${error.message}`);
  }

  // Check NextAuth import
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    diagnostics.checks.nextAuthImport = "✅ NextAuth imported";
    
    // Check NextAuth session
    try {
      const session = await getServerSession(authOptions);
      diagnostics.checks.nextAuth = session ? "✅ Session exists" : "✅ No session (expected)";
    } catch (error: any) {
      diagnostics.checks.nextAuth = `❌ Error: ${error.message}`;
      diagnostics.errors.push(`NextAuth error: ${error.message}`);
    }
  } catch (error: any) {
    diagnostics.checks.nextAuthImport = `❌ Error importing NextAuth: ${error.message}`;
    diagnostics.errors.push(`NextAuth import error: ${error.message}`);
  }

  return NextResponse.json(diagnostics, { status: 200 });
}

