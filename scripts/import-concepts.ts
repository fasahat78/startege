import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';
import { prisma } from '../lib/db';

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

async function importConcepts() {
  try {
    console.log('📖 Reading CSV file...');
    const csvFilePath = join(process.cwd(), 'AIGP_concepts_wix_clean.csv');
    const fileContent = readFileSync(csvFilePath, 'utf-8');

    console.log('📊 Parsing CSV data...');
    const records: CSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`✅ Found ${records.length} concept cards to import`);

    // Clear existing data (optional - comment out if you want to keep existing)
    console.log('🗑️  Clearing existing concept cards...');
    await prisma.conceptCard.deleteMany({});
    console.log('✅ Existing data cleared');

    // Import records
    console.log('📥 Importing concept cards...');
    let imported = 0;
    let errors = 0;

    for (const record of records) {
      try {
        await prisma.conceptCard.create({
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
          console.log(`  ✅ Imported ${imported} cards...`);
        }
      } catch (error) {
        errors++;
        console.error(`  ❌ Error importing concept "${record.Concept}":`, error);
      }
    }

    console.log('\n✨ Import complete!');
    console.log(`   ✅ Successfully imported: ${imported} concept cards`);
    console.log(`   ❌ Errors: ${errors}`);

    // Show summary by domain
    const domainCounts = await prisma.conceptCard.groupBy({
      by: ['domain'],
      _count: true,
    });

    console.log('\n📊 Summary by Domain:');
    domainCounts.forEach(({ domain, _count }) => {
      console.log(`   ${domain}: ${_count} cards`);
    });

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importConcepts();

