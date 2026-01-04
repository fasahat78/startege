/**
 * Test DATABASE_URL format parsing
 * 
 * Tests if Prisma can parse the Cloud SQL Unix socket connection string format
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local file
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const dbUrl = process.env.DATABASE_URL;

console.log("🔍 Testing DATABASE_URL Format\n");
console.log("=" .repeat(60));

if (!dbUrl) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

console.log("✅ DATABASE_URL is set");
console.log(`   Length: ${dbUrl.length} characters`);
console.log(`   Preview: ${dbUrl.substring(0, 50)}...${dbUrl.substring(dbUrl.length - 30)}`);
console.log("");

// Check format
console.log("🔍 Checking format...");
const hasPostgresql = dbUrl.startsWith("postgresql://");
const hasUnixSocket = dbUrl.includes("/cloudsql/");
const hasEmptyHost = dbUrl.includes("@/");
const hasHostParam = dbUrl.includes("?host=");

console.log(`   Starts with postgresql://: ${hasPostgresql ? "✅" : "❌"}`);
console.log(`   Contains /cloudsql/: ${hasUnixSocket ? "✅" : "❌"}`);
console.log(`   Has empty host (@/): ${hasEmptyHost ? "✅" : "❌"}`);
console.log(`   Has host parameter: ${hasHostParam ? "✅" : "❌"}`);
console.log("");

// Try to parse with standard URL parser
console.log("🔍 Testing standard URL parsing...");
try {
  const testUrl = dbUrl.replace(/^postgresql:\/\//, "http://");
  const url = new URL(testUrl);
  console.log("✅ Standard URL parsing works");
  console.log(`   Username: ${url.username}`);
  console.log(`   Password: ${url.password ? "***" : "(none)"}`);
  console.log(`   Hostname: ${url.hostname || "(empty - Unix socket)"}`);
  console.log(`   Pathname: ${url.pathname}`);
  console.log(`   Unix socket: ${url.searchParams.get("host") || "(none)"}`);
} catch (error: any) {
  console.error(`❌ Standard URL parsing failed: ${error.message}`);
}
console.log("");

// Try to parse with Prisma
console.log("🔍 Testing Prisma Client initialization...");
try {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
  
  console.log("✅ Prisma Client created successfully");
  console.log("   Testing connection...");
  
  // Try a simple query
  prisma.$queryRaw`SELECT 1`.then(() => {
    console.log("✅ Database connection successful!");
    prisma.$disconnect();
    process.exit(0);
  }).catch((error: any) => {
    console.error(`❌ Database connection failed: ${error.message}`);
    prisma.$disconnect();
    process.exit(1);
  });
} catch (error: any) {
  console.error(`❌ Prisma Client creation failed: ${error.message}`);
  console.error(`   Error details:`, error);
  process.exit(1);
}

