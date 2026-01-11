import { PrismaClient } from "@prisma/client";
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

// Production credentials from your connection string
// Format: postgresql://startege-db:Zoya%4057Bruce@localhost/startege?host=/cloudsql/...
// Password decoded: Zoya@57Bruce
const PROD_PASSWORD = process.env.DATABASE_PASSWORD || "Zoya@57Bruce";
const PROD_USER = "startege-db";
const PROD_DB = "startege";
const PROXY_PORT = process.env.PROXY_PORT || "5436"; // Default to 5436

// Create connection string for Cloud SQL Proxy
const PROD_DATABASE_URL = `postgresql://${PROD_USER}:${encodeURIComponent(PROD_PASSWORD)}@127.0.0.1:${PROXY_PORT}/${PROD_DB}`;

// Override DATABASE_URL to ensure Prisma uses production connection
process.env.DATABASE_URL = PROD_DATABASE_URL;

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DATABASE_URL,
    },
  },
});

interface CSVRow {
  Domain: string;
  Category: string;
  Concept: string;
  'Definition / Key Idea': string;
  'Examples / Notes': string;
  'Scenario Question': string;
  A: string;
  B: string;
  C: string;
  D: string;
  'Correct Answer': string;
  Rationale: string;
  difficulty: string;
  estimated_read_time: string;
  domain_classification: string;
  overview: string;
  governance_context: string;
  ethical_and_societal_implications: string;
  key_takeaways: string;
  version: string;
  generated_at: string;
}

async function importConceptsToProd() {
  try {
    console.log('🔗 Connecting to production database...');
    console.log(`   Database: ${PROD_DB}`);
    console.log(`   User: ${PROD_USER}`);
    console.log(`   Port: ${PROXY_PORT}`);
    
    // Test connection
    await prodPrisma.$connect();
    console.log('✅ Connected to production database\n');

    console.log('📖 Reading CSV file...');
    const csvFilePath = join(process.cwd(), 'AIGP_concepts_wix_clean.csv');
    const fileContent = readFileSync(csvFilePath, 'utf-8');

    console.log('📊 Parsing CSV data...');
    const records: CSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`✅ Found ${records.length} concept cards to import\n`);

    // Check existing count
    const existingCount = await prodPrisma.conceptCard.count();
    console.log(`📊 Current ConceptCard count in production: ${existingCount}`);

    if (existingCount > 0) {
      console.log('⚠️  WARNING: ConceptCard records already exist in production.');
      console.log('   This script will DELETE all existing records and re-import.');
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Clear existing data
    console.log('🗑️  Clearing existing concept cards...');
    const deleted = await prodPrisma.conceptCard.deleteMany({});
    console.log(`✅ Deleted ${deleted.count} existing records\n`);

    // Import records
    console.log('📥 Importing concept cards...');
    let imported = 0;
    let errors = 0;

    for (const record of records) {
      try {
        await prodPrisma.conceptCard.create({
          data: {
            domain: record.Domain || 'Unknown',
            category: record.Category || 'General',
            concept: record.Concept || 'Untitled Concept',
            definition: record['Definition / Key Idea'] || '',
            examples: record['Examples / Notes'] || null,
            scenarioQuestion: record['Scenario Question'] || null,
            optionA: record.A || null,
            optionB: record.B || null,
            optionC: record.C || null,
            optionD: record.D || null,
            correctAnswer: record['Correct Answer'] || null,
            rationale: record.Rationale || null,
            difficulty: record.difficulty?.toLowerCase() || 'intermediate',
            estimatedReadTime: parseInt(record.estimated_read_time) || 5,
            domainClassification: record.domain_classification || null,
            overview: record.overview || null,
            governanceContext: record.governance_context || null,
            ethicalImplications: record.ethical_and_societal_implications || null,
            keyTakeaways: record.key_takeaways || null,
            version: record.version || '1.0.0',
          },
        });
        imported++;
        if (imported % 50 === 0) {
          console.log(`  ✅ Imported ${imported}/${records.length} cards...`);
        }
      } catch (error: any) {
        errors++;
        console.error(`  ❌ Error importing concept "${record.Concept}":`, error.message);
      }
    }

    console.log('\n✨ Import complete!');
    console.log(`   ✅ Successfully imported: ${imported} concept cards`);
    console.log(`   ❌ Errors: ${errors}`);

    // Show summary by domain
    const domainCounts = await prodPrisma.conceptCard.groupBy({
      by: ['domain'],
      _count: true,
    });

    console.log('\n📊 Summary by Domain:');
    domainCounts.forEach(({ domain, _count }) => {
      console.log(`   ${domain}: ${_count} cards`);
    });

    // Verify import
    const finalCount = await prodPrisma.conceptCard.count();
    console.log(`\n✅ Final ConceptCard count: ${finalCount}`);

  } catch (error: any) {
    console.error('❌ Import failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prodPrisma.$disconnect();
    console.log('\n🔌 Disconnected from production database');
  }
}

// Run the import
importConceptsToProd();

