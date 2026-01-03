/**
 * Script to manually run Market Scan
 * Usage: tsx scripts/run-market-scan.ts
 */

import 'dotenv/config';
import { runDailyScan } from '../lib/market-scan/scan';

async function main() {
  console.log('🚀 Starting Market Scan...\n');
  
  try {
    const result = await runDailyScan();
    
    console.log('\n✅ Market Scan Completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Scan Job ID: ${result.scanJobId}`);
    console.log(`Articles Found: ${result.articlesFound}`);
    console.log(`Articles Processed: ${result.articlesProcessed}`);
    console.log(`Articles Added: ${result.articlesAdded}`);
    console.log(`Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      result.errors.forEach((error, idx) => {
        console.log(`  ${idx + 1}. ${JSON.stringify(error)}`);
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error: any) {
    console.error('\n❌ Market Scan Failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();

