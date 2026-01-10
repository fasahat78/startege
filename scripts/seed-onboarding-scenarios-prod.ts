/**
 * Seed Onboarding Scenarios to Production
 * 
 * Uses Cloud SQL Proxy to connect to production database
 * Run with: npx tsx scripts/seed-onboarding-scenarios-prod.ts
 * 
 * Make sure Cloud SQL Proxy is running:
 * cloud-sql-proxy startege:us-central1:startege-db --port=5436
 */

import { PrismaClient } from "@prisma/client";
import { PersonaType } from "@prisma/client";

// Production credentials from your connection string
// Original: postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db
// For local execution via Cloud SQL Proxy, we use TCP connection
const PROD_PASSWORD = "Zoya@57Bruce";
const PROD_USER = "postgres"; // Using postgres user as per your connection string
const PROD_DB = "startege";
const PROXY_PORT = process.env.PROXY_PORT || "5436"; // Default to 5436

// Create connection string for Cloud SQL Proxy (TCP connection)
// When running locally, use TCP via proxy port
// When running in Cloud Run, use Unix socket format: ?host=/cloudsql/startege:us-central1:startege-db
const PROD_DATABASE_URL = `postgresql://${PROD_USER}:${encodeURIComponent(PROD_PASSWORD)}@127.0.0.1:${PROXY_PORT}/${PROD_DB}`;

// Temporarily override DATABASE_URL to ensure production connection
const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = PROD_DATABASE_URL;

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

interface ScenarioData {
  personaType: PersonaType;
  questionOrder: number;
  scenario: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

// Import scenarios from the main seed file
import { scenarios } from "./seed-onboarding-scenarios";

async function seedOnboardingScenarios() {
  console.log("🌱 Seeding Onboarding Scenarios to Production...\n");
  console.log(`📡 Connecting to: ${PROD_DB} database as ${PROD_USER} via proxy port ${PROXY_PORT}\n`);

  try {
    // Test connection
    await prodPrisma.$connect();
    console.log("✅ Connected to database\n");
    
    // Verify we're connected to the correct database
    const dbInfo = await prodPrisma.$queryRaw<Array<{ current_database: string }>>`
      SELECT current_database();
    `;
    const dbName = dbInfo[0]?.current_database;
    console.log(`📊 Connected to database: ${dbName}`);
    if (dbName !== PROD_DB) {
      console.warn(`⚠️  WARNING: Expected database '${PROD_DB}' but connected to '${dbName}'`);
    } else {
      console.log(`✅ Confirmed: Connected to production database '${PROD_DB}'\n`);
    }

    // Clear existing scenarios
    const deletedCount = await prodPrisma.onboardingScenario.deleteMany({});
    console.log(`✅ Cleared ${deletedCount.count} existing scenarios`);

    // Create all scenarios using createMany for better performance
    await prodPrisma.onboardingScenario.createMany({
      data: scenarios,
      skipDuplicates: true, // Skip if duplicates exist (shouldn't happen after delete)
    });

    console.log(`✅ Created ${scenarios.length} onboarding scenarios`);
    
    // Verify by persona
    const countsByPersona = await prodPrisma.onboardingScenario.groupBy({
      by: ["personaType"],
      _count: true,
    });

    console.log("\n📊 Scenarios by Persona:");
    countsByPersona.forEach(({ personaType, _count }) => {
      console.log(`   ${personaType}: ${_count} questions`);
    });

    // Verify correct answer distribution
    const answerDistribution = scenarios.reduce((acc, s) => {
      acc[s.correctAnswer] = (acc[s.correctAnswer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("\n📊 Correct Answer Distribution:");
    Object.entries(answerDistribution).sort().forEach(([answer, count]) => {
      console.log(`   ${answer}: ${count} questions`);
    });

    console.log("\n✅ Onboarding scenarios seeded successfully to production!\n");
  } catch (error) {
    console.error("❌ Error seeding scenarios:", error);
    throw error;
  } finally {
    await prodPrisma.$disconnect();
    // Restore original DATABASE_URL if it existed
    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
  }
}

seedOnboardingScenarios()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });

