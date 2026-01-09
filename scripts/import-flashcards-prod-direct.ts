import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { join } from "path";

// Override DATABASE_URL with production connection string
const PROD_DATABASE_URL = "postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db";

// Create a new Prisma client with production URL
import { PrismaClient } from "@prisma/client";

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
  batchId: string;
  version: string;
  updatedAt: string;
  cards: Flashcard[];
}

async function importFlashcardsToProduction() {
  console.log("🚀 Starting PRODUCTION flashcard import...");
  console.log("📡 Using production database connection");
  console.log("");

  try {
    // Test connection
    console.log("🔌 Testing database connection...");
    await prodPrisma.$connect();
    console.log("✅ Connected to production database\n");

    // Determine flashcards directory
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
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const batchFile of batchFiles) {
      try {
        console.log(`📂 Processing ${batchFile}...`);
        const filePath = join(flashcardsDir, batchFile);
        const fileContent = await readFile(filePath, "utf-8");
        const batch: FlashcardBatch = JSON.parse(fileContent);

        // Only import ACTIVE cards
        const activeCards = batch.cards.filter(card => card.status === "ACTIVE");
        console.log(`   Found ${activeCards.length} active cards in ${batchFile}`);

        for (const card of activeCards) {
          try {
            // Check if flashcard already exists
            const existing = await prodPrisma.aIGPFlashcard.findUnique({
              where: { flashcardId: card.id },
            });

            if (existing) {
              // Update existing card
              await prodPrisma.aIGPFlashcard.update({
                where: { flashcardId: card.id },
                data: {
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
                  sourceFramework: card.source.framework,
                  sourcePointer: card.source.pointer,
                  batchId: batch.batchId,
                  version: batch.version,
                },
              });
              totalSkipped++;
            } else {
              // Create new card
              await prodPrisma.aIGPFlashcard.create({
                data: {
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
                  sourceFramework: card.source.framework,
                  sourcePointer: card.source.pointer,
                  batchId: batch.batchId,
                  version: batch.version,
                },
              });
              totalImported++;
            }
          } catch (error: any) {
            console.error(`   ❌ Error importing card ${card.id}:`, error.message);
            totalErrors++;
          }
        }

        console.log(`   ✅ Completed ${batchFile}\n`);
      } catch (error: any) {
        console.error(`   ❌ Error processing ${batchFile}:`, error.message);
        totalErrors++;
      }
    }

    console.log("\n✨ Import complete!");
    console.log(`   ✅ New flashcards imported: ${totalImported}`);
    console.log(`   🔄 Existing flashcards updated: ${totalSkipped}`);
    console.log(`   ❌ Errors: ${totalErrors}`);

    // Show summary
    const totalInDb = await prodPrisma.aIGPFlashcard.count();
    const byDomain = await prodPrisma.aIGPFlashcard.groupBy({
      by: ['domain'],
      _count: true,
    });
    const byType = await prodPrisma.aIGPFlashcard.groupBy({
      by: ['cardType'],
      _count: true,
    });

    console.log("\n📊 Production Database Summary:");
    console.log(`   Total flashcards in database: ${totalInDb}`);
    console.log("\n   By Domain:");
    byDomain.forEach(({ domain, _count }) => {
      console.log(`     Domain ${domain}: ${_count} cards`);
    });
    console.log("\n   By Type:");
    byType.forEach(({ cardType, _count }) => {
      console.log(`     ${cardType}: ${_count} cards`);
    });

  } catch (error: any) {
    console.error("❌ Import failed:", error);
    throw error;
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run if called directly
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

