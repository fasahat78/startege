import { NextResponse } from "next/server";

/**
 * Database Debug Endpoint
 * 
 * Returns database connection status and configuration (without exposing sensitive data)
 * Useful for debugging DATABASE_URL issues in Cloud Run
 * 
 * GET /api/debug/database
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  const config = {
    present: !!dbUrl,
    length: dbUrl?.length || 0,
    // Show first and last parts without exposing full connection string
    preview: dbUrl
      ? {
          start: dbUrl.substring(0, 30),
          end: dbUrl.substring(Math.max(0, dbUrl.length - 30)),
          hasCloudSql: dbUrl.includes("/cloudsql/"),
          hasPassword: dbUrl.includes("%40") || dbUrl.includes("@"),
        }
      : null,
  };

  // Try to parse the URL
  let parsed: any = null;
  let parseError: string | null = null;
  let prismaParseError: string | null = null;

  if (dbUrl) {
    try {
      // Parse the connection string (standard URL parsing)
      const url = new URL(dbUrl.replace(/^postgresql:\/\//, "http://"));
      parsed = {
        protocol: url.protocol,
        username: url.username,
        password: url.password ? "***" : null,
        hostname: url.hostname || "(empty - Unix socket)",
        pathname: url.pathname,
        searchParams: Object.fromEntries(url.searchParams),
        unixSocket: url.searchParams.get("host") || null,
      };
    } catch (error: any) {
      parseError = error.message;
    }

    // Try to initialize Prisma to see if it can parse the URL
    try {
      const { PrismaClient } = await import("@prisma/client");
      // Just try to create the client - this will validate the URL
      const testClient = new PrismaClient({
        datasources: {
          db: {
            url: dbUrl,
          },
        },
      });
      await testClient.$disconnect();
    } catch (error: any) {
      prismaParseError = error.message;
    }
  }

  // Try to connect (without exposing errors)
  let connectionTest: {
    success: boolean;
    error?: string;
  } = { success: false };

  if (dbUrl && !parseError) {
    try {
      // Dynamic import to avoid build-time errors
      const { prisma } = await import("@/lib/db");
      await prisma.$queryRaw`SELECT 1`;
      connectionTest = { success: true };
    } catch (error: any) {
      connectionTest = {
        success: false,
        error: error.message || String(error),
      };
    }
  }

  return NextResponse.json(
    {
      status: config.present && connectionTest.success ? "ok" : "error",
      timestamp: new Date().toISOString(),
      config,
      parsed,
      parseError,
      prismaParseError,
      connectionTest,
      recommendations: !config.present
        ? ["DATABASE_URL environment variable is not set"]
        : parseError
        ? [`Failed to parse DATABASE_URL: ${parseError}`]
        : !connectionTest.success
        ? [
            "Database connection failed",
            connectionTest.error,
            "Check Cloud Run logs for more details",
            "Verify Cloud SQL connection is configured",
            "Verify secret permissions",
          ]
        : ["Database connection is working correctly"],
    },
    {
      status: config.present && connectionTest.success ? 200 : 500,
    }
  );
}

