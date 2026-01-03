import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Health Check Endpoint
 * 
 * Returns the health status of the application and its dependencies.
 * Used by monitoring services, load balancers, and deployment platforms.
 * 
 * GET /api/health
 */
export async function GET() {
  const checks: Record<string, { status: "healthy" | "unhealthy"; message?: string; latency?: number }> = {};
  const startTime = Date.now();

  // 1. Application health
  checks.application = {
    status: "healthy",
    message: "Application is running",
  };

  // 2. Database connectivity check
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStartTime;
    
    checks.database = {
      status: "healthy",
      message: "Database connection successful",
      latency: dbLatency,
    };
  } catch (error: any) {
    checks.database = {
      status: "unhealthy",
      message: `Database connection failed: ${error.message}`,
    };
  }

  // 3. Environment check
  checks.environment = {
    status: process.env.NODE_ENV === "production" ? "healthy" : "healthy",
    message: `Running in ${process.env.NODE_ENV || "unknown"} mode`,
  };

  // Determine overall health
  const allHealthy = Object.values(checks).every((check) => check.status === "healthy");
  const overallStatus = allHealthy ? "healthy" : "unhealthy";
  const statusCode = allHealthy ? 200 : 503;

  const totalLatency = Date.now() - startTime;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
      latency: {
        total: totalLatency,
        database: checks.database.latency,
      },
    },
    { status: statusCode }
  );
}

