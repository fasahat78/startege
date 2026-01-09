import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import { join } from "path";

// Production connection string (Unix socket format - works in Cloud Run)
// Format: postgresql://startege-db:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db
const PROD_DATABASE_URL = "postgresql://startege-db:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db";

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

interface Flashcard {
  id: string;
  status: string;
  cardType: "TRIGGER" | "DIFFERENTIATION" | "PROCESS" | "DEFINITION";
  domain: "A" | "B" | "C" | "D" | "E" | "F";
  subDomain: string;
  topics: string[];
  priority: "HIGH" | "MEDIUM" | "LOW";
  front: {
    prompt: string;
  };
  back: {
    answer: string;
    examCue: string;
    commonTrap: string;
  };
  source: {
    framework: string;
    pointer: string;
  };
}

interface FlashcardBatch {
  version: string;
  batchId: string;
  cards: Flashcard[];
}

async function importFlashcardsToProduction() {
  console.log("🚀 Starting PRODUCTION flashcard import (Unix socket)...");
  console.log(`📡 Using production Unix socket connection`);
  console.log(`🔗 Database: startege`);
  console.log(`🔗 Instance: startege:us-central1:startege-db`);
  console.log("");

  try {
    await prodPrisma.$connect();
    console.log("✅ Connected to production database\n");

    // Verify we're in the correct database
    const dbName = await prodPrisma.$queryRaw<Array<{current_database: string}>>`SELECT current_database() as current_database`;
    console.log(`📊 Connected to database: ${dbName[0]?.current_database}`);
    
    if (dbName[0]?.current_database !== 'startege') {
      console.error(`❌ ERROR: Connected to wrong database: ${dbName[0]?.current_database}`);
      console.error(`   Expected: startege`);
      process.exit(1);
    }
    console.log("✅ Database name verified: startege\n");

    // Check if table exists
    const tableExists = await prodPrisma.$queryRaw<Array<{exists: boolean}>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'AIGPFlashcard'
      );
    `;

    if (!tableExists[0]?.exists) {
      console.log("❌ AIGPFlashcard table does not exist!");
      console.log("   Please create the table first using:");
      console.log("   npm run create-flashcard-table:prod");
      process.exit(1);
    }

    console.log("✅ AIGPFlashcard table exists\n");

    // Load flashcards from JSON files
    const flashcardsDir = join(process.cwd(), "AIGP Flash Cards");
    const batchFiles = [
      "batch01.json",
      "batch02.json",
      "batch03.json",
      "batch04.json",
      "batch05.json",
      "batch06.json",
      "batch07.json",
      "batch08.json",
      "batch09.json",
      "batch10.json",
      "batch11.json",
    ];

    let totalImported = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const batchFile of batchFiles) {
      console.log(`📂 Processing ${batchFile}...`);
      try {
        const filePath = join(flashcardsDir, batchFile);
        const fileContent = await readFile(filePath, "utf-8");
        const batch: FlashcardBatch = JSON.parse(fileContent);

        const activeCards = batch.cards.filter((card) => card.status === "ACTIVE");
        console.log(`   Found ${activeCards.length} active cards in ${batchFile}`);

        for (const card of activeCards) {
          try {
            await prodPrisma.aIGPFlashcard.upsert({
              where: { flashcardId: card.id },
              update: {
                status: card.status,
                cardType: card.cardType,
                domain: card.domain,
                subDomain: card.subDomain,
                topics: card.topics,
                priority: card.priority,
                frontPrompt: card.front.prompt,
                backAnswer: card.back.answer,
                examCue: card.back.examCue,
                commonTrap: card.back.commonTrap,
                sourceFramework: card.source.framework || null,
                sourcePointer: card.source.pointer || null,
                batchId: batch.batchId,
                version: batch.version,
              },
              create: {
                id: `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                flashcardId: card.id,
                status: card.status,
                cardType: card.cardType,
                domain: card.domain,
                subDomain: card.subDomain,
                topics: card.topics,
                priority: card.priority,
                frontPrompt: card.front.prompt,
                backAnswer: card.back.answer,
                examCue: card.back.examCue,
                commonTrap: card.back.commonTrap,
                sourceFramework: card.source.framework || null,
                sourcePointer: card.source.pointer || null,
                batchId: batch.batchId,
                version: batch.version,
              },
            });
            totalImported++;
          } catch (error: any) {
            console.error(`   ❌ Error importing card ${card.id}: ${error.message}`);
            totalErrors++;
          }
        }
        console.log(`   ✅ Completed ${batchFile}\n`);
      } catch (error: any) {
        console.error(`   ❌ Error loading ${batchFile}: ${error.message}\n`);
        totalErrors++;
      }
    }

    console.log("\n✨ Import complete!");
    console.log(`   ✅ New flashcards imported: ${totalImported - totalUpdated}`);
    console.log(`   🔄 Existing flashcards updated: ${totalUpdated}`);
    console.log(`   ❌ Errors: ${totalErrors}\n`);

    // Show summary
    const totalInDb = await prodPrisma.aIGPFlashcard.count({
      where: { status: "ACTIVE" },
    });

    const domainCounts = await prodPrisma.aIGPFlashcard.groupBy({
      by: ["domain"],
      where: { status: "ACTIVE" },
      _count: true,
    });

    const typeCounts = await prodPrisma.aIGPFlashcard.groupBy({
      by: ["cardType"],
      where: { status: "ACTIVE" },
      _count: true,
    });

    console.log("📊 Production Database Summary:");
    console.log(`   Total flashcards in database: ${totalInDb}\n`);

    console.log("   By Domain:");
    domainCounts
      .sort((a, b) => a.domain.localeCompare(b.domain))
      .forEach((d) => {
        console.log(`     Domain ${d.domain}: ${d._count} cards`);
      });

    console.log("\n   By Type:");
    typeCounts.forEach((t) => {
      console.log(`     ${t.cardType}: ${t._count} cards`);
    });

  } catch (error: any) {
    console.error("\n❌ Import failed:", error.message);
    if (error.code === 'P1001') {
      console.error("\n💡 Connection Error:");
      console.error("   Unix socket format only works in Cloud Run environment.");
      console.error("   For local import, use Cloud SQL Proxy instead:");
      console.error("   npm run import-flashcards:prod");
    }
    throw error;
  } finally {
    await prodPrisma.$disconnect();
  }
}

if (require.main === module) {
  importFlashcardsToProduction()
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

export default importFlashcardsToProduction;

