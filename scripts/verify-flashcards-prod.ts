import { PrismaClient } from "@prisma/client";

// Production credentials
const PROD_PASSWORD = "Zoya@57Bruce";
const PROD_USER = "postgres";
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

async function verifyFlashcards() {
  console.log("🔍 Verifying flashcards in PRODUCTION database...");
  console.log(`📡 Using Cloud SQL Proxy on port ${PROXY_PORT}`);
  console.log("");

  try {
    await prodPrisma.$connect();
    console.log("✅ Connected to production database\n");

    // Check if table exists
    const tableExists = await prodPrisma.$queryRaw<Array<{exists: boolean}>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'AIGPFlashcard'
      );
    `;

    if (!tableExists[0]?.exists) {
      console.log("❌ ERROR: AIGPFlashcard table does not exist!");
      return;
    }

    console.log("✅ AIGPFlashcard table exists\n");

    // Count total flashcards
    const totalCount = await prodPrisma.aIGPFlashcard.count();
    console.log(`📊 Total flashcards in database: ${totalCount}`);

    if (totalCount === 0) {
      console.log("❌ ERROR: No flashcards found in database!");
      return;
    }

    // Count by status
    const activeCount = await prodPrisma.aIGPFlashcard.count({
      where: { status: "ACTIVE" },
    });
    console.log(`   ✅ Active flashcards: ${activeCount}`);
    console.log(`   ⚠️  Inactive flashcards: ${totalCount - activeCount}\n`);

    // Count by domain
    const domainCounts = await prodPrisma.aIGPFlashcard.groupBy({
      by: ["domain"],
      where: { status: "ACTIVE" },
      _count: true,
    });

    console.log("📊 Flashcards by Domain:");
    domainCounts
      .sort((a, b) => a.domain.localeCompare(b.domain))
      .forEach((d) => {
        console.log(`   Domain ${d.domain}: ${d._count} cards`);
      });

    // Count by type
    const typeCounts = await prodPrisma.aIGPFlashcard.groupBy({
      by: ["cardType"],
      where: { status: "ACTIVE" },
      _count: true,
    });

    console.log("\n📊 Flashcards by Type:");
    typeCounts.forEach((t) => {
      console.log(`   ${t.cardType}: ${t._count} cards`);
    });

    // Sample flashcards
    console.log("\n📝 Sample flashcards (first 5):");
    const samples = await prodPrisma.aIGPFlashcard.findMany({
      where: { status: "ACTIVE" },
      take: 5,
      select: {
        flashcardId: true,
        domain: true,
        cardType: true,
        frontPrompt: true,
      },
    });

    samples.forEach((card, idx) => {
      console.log(`\n   ${idx + 1}. ${card.flashcardId}`);
      console.log(`      Domain: ${card.domain}, Type: ${card.cardType}`);
      console.log(`      Prompt: ${card.frontPrompt.substring(0, 60)}...`);
    });

    console.log("\n✅ Verification complete!");
    console.log("\n💡 Next step: Test the production API:");
    console.log("   curl https://startege-785373873454.us-central1.run.app/api/aigp-exams/flashcards");

  } catch (error: any) {
    console.error("\n❌ Verification failed:", error.message);
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
  verifyFlashcards()
    .then(() => {
      console.log("\n✅ Script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

export default verifyFlashcards;

