import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma Client with connection pooling configuration
 * 
 * Connection pooling is configured via DATABASE_URL connection string parameters:
 * - ?connection_limit=10 - Maximum number of connections in the pool
 * - ?pool_timeout=20 - Connection timeout in seconds
 * 
 * For production, consider using a connection pooler like PgBouncer or
 * Google Cloud SQL Proxy which handles pooling at the infrastructure level.
 */
// Log DATABASE_URL format for debugging (without exposing password)
// Only log at runtime, not during build (when DATABASE_URL may not be available)
// Check if we're in a build context by looking for build-time indicators
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    process.env.NEXT_PHASE === 'phase-development-build' ||
                    !process.env.DATABASE_URL; // If DATABASE_URL is missing, we're likely in build

if (typeof window === 'undefined' && !isBuildTime) {
  const dbUrl = process.env.DATABASE_URL;
  console.log("[PRISMA] ===== DATABASE_URL CHECK =====");
  console.log("[PRISMA] DATABASE_URL present:", !!dbUrl);
  console.log("[PRISMA] DATABASE_URL type:", typeof dbUrl);
  console.log("[PRISMA] DATABASE_URL length:", dbUrl?.length || 0);

  if (dbUrl) {
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":***@");
    console.log("[PRISMA] DATABASE_URL starts with:", dbUrl.substring(0, 30));
    console.log("[PRISMA] DATABASE_URL ends with:", dbUrl.substring(Math.max(0, dbUrl.length - 50)));
    console.log("[PRISMA] Has /cloudsql/:", dbUrl.includes("/cloudsql/"));
    console.log("[PRISMA] Has empty host (@/):", dbUrl.includes("@/"));
    console.log("[PRISMA] Has host parameter:", dbUrl.includes("?host="));
    console.log("[PRISMA] Full masked URL:", maskedUrl);
    
    // Check for common issues
    if (!dbUrl.includes("/cloudsql/")) {
      console.error("[PRISMA] ⚠️ WARNING: Missing /cloudsql/ in connection string!");
    }
    if (!dbUrl.includes("?host=")) {
      console.error("[PRISMA] ⚠️ WARNING: Missing ?host= parameter!");
    }
    // Note: @localhost is REQUIRED for Unix sockets according to Prisma docs
    // The localhost value is ignored when host parameter specifies Unix socket path
    if (dbUrl.includes("@localhost") && dbUrl.includes("?host=/cloudsql/")) {
      console.log("[PRISMA] ✅ Correct format: localhost with Unix socket host parameter");
    }
  }
  console.log("[PRISMA] =================================");
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"],
  // Connection pool configuration
  // Note: These are set via DATABASE_URL query parameters, not here
  // Example DATABASE_URL: postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

