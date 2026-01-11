/**
 * Verify that all expected standards are ingested in production database
 * Usage: tsx scripts/verify-standards-prod.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { KEY_STANDARDS } from '../lib/knowledge-base/standards';

// Production database connection via Cloud SQL Proxy
// Using postgres user as per production connection string pattern
const PROD_USER = 'postgres';
const PROD_PASSWORD = 'Zoya@57Bruce';
const PROD_DB = 'startege';
const PROXY_PORT = process.env.PROXY_PORT || '5436';

// Create connection string for Cloud SQL Proxy (TCP connection via proxy)
// When running locally via proxy, use TCP connection (127.0.0.1:port)
const prodDatabaseUrl = `postgresql://${PROD_USER}:${encodeURIComponent(PROD_PASSWORD)}@127.0.0.1:${PROXY_PORT}/${PROD_DB}`;

console.log(`[VERIFY] Connecting to production database...`);
console.log(`[VERIFY] Database: ${PROD_DB}`);
console.log(`[VERIFY] User: ${PROD_USER}`);
console.log(`[VERIFY] Proxy Port: ${PROXY_PORT}`);
console.log(`[VERIFY] Connection URL: postgresql://${PROD_USER}:***@127.0.0.1:${PROXY_PORT}/${PROD_DB}`);
console.log(`[VERIFY] Make sure Cloud SQL Proxy is running: cloud-sql-proxy startege:us-central1:startege-db --port=${PROXY_PORT}\n`);

// Temporarily override DATABASE_URL to ensure production connection
const originalDatabaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = prodDatabaseUrl;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDatabaseUrl,
    },
  },
});

async function verifyStandards() {
  console.log('🔍 Verifying Standards in Production Database...\n');
  console.log(`Expected Standards: ${KEY_STANDARDS.length}\n`);

  try {
    // Query all standards from production database
    const standardsInDb = await prisma.marketScanArticle.findMany({
      where: {
        sourceType: 'STANDARD',
      },
      select: {
        id: true,
        title: true,
        source: true,
        sourceUrl: true,
        summary: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        title: 'asc',
      },
    });

    console.log(`📊 Found ${standardsInDb.length} standards in production database\n`);

    // Create a map of expected standards by name (for matching)
    const expectedStandardsMap = new Map(
      KEY_STANDARDS.map(s => [s.name.toLowerCase().trim(), s])
    );

    // Create a map of standards in DB by title
    const dbStandardsMap = new Map(
      standardsInDb.map(s => [s.title.toLowerCase().trim(), s])
    );

    // Check which expected standards are present
    const foundStandards: Array<{ expected: typeof KEY_STANDARDS[0]; found: typeof standardsInDb[0] | null }> = [];
    const missingStandards: typeof KEY_STANDARDS = [];

    for (const expected of KEY_STANDARDS) {
      const expectedNameLower = expected.name.toLowerCase().trim();
      const found = dbStandardsMap.get(expectedNameLower);

      if (found) {
        foundStandards.push({ expected, found });
      } else {
        missingStandards.push(expected);
      }
    }

    // Display results
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ FOUND STANDARDS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (foundStandards.length === 0) {
      console.log('❌ No expected standards found in database!\n');
    } else {
      foundStandards.forEach(({ expected, found }, index) => {
        console.log(`${index + 1}. ${expected.name}`);
        console.log(`   Type: ${expected.type}`);
        console.log(`   Organization: ${expected.organization}`);
        console.log(`   Jurisdiction: ${expected.jurisdiction}`);
        if (found) {
          console.log(`   ✅ Found in DB: ${found.title}`);
          console.log(`   Source URL: ${found.sourceUrl || 'N/A'}`);
          console.log(`   Content Length: ${found.content?.length || 0} chars`);
          console.log(`   Created: ${found.createdAt.toISOString()}`);
        }
        console.log('');
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ MISSING STANDARDS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (missingStandards.length === 0) {
      console.log('✅ All expected standards are present!\n');
    } else {
      missingStandards.forEach((standard, index) => {
        console.log(`${index + 1}. ${standard.name}`);
        console.log(`   Type: ${standard.type}`);
        console.log(`   Organization: ${standard.organization}`);
        console.log(`   URL: ${standard.url}`);
        console.log(`   ID: ${standard.id}`);
        console.log('');
      });
    }

    // Check for unexpected standards in DB
    const unexpectedStandards = standardsInDb.filter(
      dbStandard => !expectedStandardsMap.has(dbStandard.title.toLowerCase().trim())
    );

    if (unexpectedStandards.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  UNEXPECTED STANDARDS IN DATABASE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      unexpectedStandards.forEach((standard, index) => {
        console.log(`${index + 1}. ${standard.title}`);
        console.log(`   Source: ${standard.source}`);
        console.log(`   URL: ${standard.sourceUrl || 'N/A'}`);
        console.log('');
      });
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Expected Standards: ${KEY_STANDARDS.length}`);
    console.log(`Found in DB: ${foundStandards.length}`);
    console.log(`Missing: ${missingStandards.length}`);
    console.log(`Unexpected: ${unexpectedStandards.length}`);
    console.log(`Total in DB: ${standardsInDb.length}\n`);

    if (missingStandards.length === 0 && unexpectedStandards.length === 0) {
      console.log('✅ VERIFICATION PASSED: All expected standards are present!\n');
      process.exit(0);
    } else {
      console.log('⚠️  VERIFICATION FAILED: Some standards are missing or unexpected\n');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error verifying standards:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    // Restore original DATABASE_URL
    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  }
}

verifyStandards();

