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
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":***@");
  console.log("[PRISMA] DATABASE_URL present:", {
    length: dbUrl.length,
    startsWith: dbUrl.substring(0, 20),
    hasCloudSql: dbUrl.includes("/cloudsql/"),
    hasEmptyHost: dbUrl.includes("@/"),
    masked: maskedUrl.substring(0, 50) + "..." + maskedUrl.substring(maskedUrl.length - 30),
  });
} else {
  console.error("[PRISMA] ❌ DATABASE_URL is not set!");
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

