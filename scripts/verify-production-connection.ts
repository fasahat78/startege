import { PrismaClient } from "@prisma/client";

// Production connection via Cloud SQL Proxy
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

async function verifyConnection() {
  console.log("🔍 Verifying production database connection...");
  console.log(`📡 Connection: ${PROD_DATABASE_URL.replace(PROD_PASSWORD, "***")}`);
  console.log("");

  try {
    await prodPrisma.$connect();
    
    // Get database name
    const dbResult = await prodPrisma.$queryRaw<Array<{current_database: string}>>`
      SELECT current_database() as current_database;
    `;
    const dbName = dbResult[0]?.current_database;
    
    // Get PostgreSQL version (to confirm it's Cloud SQL)
    const versionResult = await prodPrisma.$queryRaw<Array<{version: string}>>`
      SELECT version();
    `;
    const version = versionResult[0]?.version;
    
    // Check if it's Cloud SQL (will contain "Cloud SQL" in version string)
    const isCloudSQL = version?.includes("Cloud SQL") || version?.includes("Google");
    
    console.log("✅ Connection successful!");
    console.log(`📊 Database name: ${dbName}`);
    console.log(`📊 PostgreSQL version: ${version?.substring(0, 50)}...`);
    console.log(`📊 Is Cloud SQL: ${isCloudSQL ? "✅ YES" : "❌ NO"}`);
    console.log("");
    
    if (dbName !== 'startege') {
      console.error(`❌ ERROR: Wrong database! Expected 'startege', got '${dbName}'`);
      process.exit(1);
    }
    
    if (!isCloudSQL) {
      console.warn("⚠️  WARNING: This doesn't appear to be Cloud SQL!");
      console.warn("   You might be connected to a local database instead.");
    } else {
      console.log("✅ Confirmed: Connected to Cloud SQL production instance");
    }
    
    // Check flashcards
    const flashcardCount = await prodPrisma.aIGPFlashcard.count({
      where: { status: "ACTIVE" },
    });
    
    console.log(`\n📚 Flashcards in database: ${flashcardCount}`);
    
    if (flashcardCount === 133) {
      console.log("✅ Correct number of flashcards!");
    } else {
      console.log(`⚠️  Expected 133 flashcards, found ${flashcardCount}`);
    }
    
  } catch (error: any) {
    console.error("\n❌ Connection failed:", error.message);
    if (error.code === 'P1001') {
      console.error("\n💡 Make sure Cloud SQL Proxy is running:");
      console.error(`   cloud-sql-proxy startege:us-central1:startege-db --port=${PROXY_PORT}`);
    }
    throw error;
  } finally {
    await prodPrisma.$disconnect();
  }
}

if (require.main === module) {
  verifyConnection()
    .then(() => {
      console.log("\n✅ Verification complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Verification failed:", error);
      process.exit(1);
    });
}

export default verifyConnection;

