import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import { join } from "path";

// Production credentials
const PROD_PASSWORD = "Zoya@57Bruce";
const PROD_USER = "startege-db";
const PROD_DB = "startege";
const PROXY_PORT = process.env.PROXY_PORT || "5436";

const PROD_DATABASE_URL = `postgresql://${PROD_USER}:${encodeURIComponent(PROD_PASSWORD)}@127.0.0.1:${PROXY_PORT}/${PROD_DB}`;

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

async function createFlashcardTable() {
  console.log("🚀 Creating AIGPFlashcard table in production...");
  console.log(`📡 Using Cloud SQL Proxy on port ${PROXY_PORT}`);
  console.log("");

  try {
    await prodPrisma.$connect();
    console.log("✅ Connected to production database\n");

    // Execute statements one by one
    console.log("📝 Creating table...");
    await prodPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AIGPFlashcard" (
        "id" TEXT NOT NULL,
        "flashcardId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "cardType" TEXT NOT NULL,
        "domain" TEXT NOT NULL,
        "subDomain" TEXT NOT NULL,
        "topics" TEXT[] NOT NULL,
        "priority" TEXT NOT NULL,
        "frontPrompt" TEXT NOT NULL,
        "backAnswer" TEXT NOT NULL,
        "examCue" TEXT NOT NULL,
        "commonTrap" TEXT NOT NULL,
        "sourceFramework" TEXT,
        "sourcePointer" TEXT,
        "batchId" TEXT,
        "version" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AIGPFlashcard_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("  ✅ Table created");

    console.log("📝 Creating unique index on flashcardId...");
    try {
      await prodPrisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "AIGPFlashcard_flashcardId_key" ON "AIGPFlashcard"("flashcardId");
      `);
      console.log("  ✅ Unique index created");
    } catch (e: any) {
      if (e.meta?.code !== "42710") throw e;
      console.log("  ⚠️  Index already exists");
    }

    console.log("📝 Creating query indexes...");
    const indexes = [
      { name: "AIGPFlashcard_domain_idx", column: "domain" },
      { name: "AIGPFlashcard_subDomain_idx", column: "subDomain" },
      { name: "AIGPFlashcard_cardType_idx", column: "cardType" },
      { name: "AIGPFlashcard_priority_idx", column: "priority" },
      { name: "AIGPFlashcard_status_idx", column: "status" },
    ];

    for (const idx of indexes) {
      try {
        await prodPrisma.$executeRawUnsafe(`
          CREATE INDEX IF NOT EXISTS "${idx.name}" ON "AIGPFlashcard"("${idx.column}");
        `);
        console.log(`  ✅ Index ${idx.name} created`);
      } catch (e: any) {
        if (e.meta?.code !== "42710") throw e;
        console.log(`  ⚠️  Index ${idx.name} already exists`);
      }
    }

    console.log("\n✅ Table creation complete!");
    
    // Verify table exists
    const tableExists = await prodPrisma.$queryRaw<Array<{exists: boolean}>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'AIGPFlashcard'
      );
    `;

    if (tableExists[0]?.exists) {
      console.log("✅ Verified: AIGPFlashcard table exists");
      
      // Count rows
      const count = await prodPrisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*) as count FROM "AIGPFlashcard";
      `;
      console.log(`📊 Current flashcard count: ${count[0]?.count || 0}`);
    } else {
      console.log("⚠️  Warning: Could not verify table creation");
    }

  } catch (error: any) {
    console.error("\n❌ Failed:", error.message);
    if (error.code === 'P1001') {
      console.error("\n💡 Connection Error - Make sure Cloud SQL Proxy is running:");
      console.error(`   cloud-sql-proxy startege:us-central1:startege-db --port=${PROXY_PORT}`);
    }
    throw error;
  } finally {
    await prodPrisma.$disconnect();
  }
}

if (require.main === module) {
  createFlashcardTable()
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

export default createFlashcardTable;
