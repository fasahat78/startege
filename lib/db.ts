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

