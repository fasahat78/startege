/**
 * Production Market Scan Script
 * Run this script to populate the production database with articles
 * 
 * Usage:
 *   - With Cloud SQL Proxy: npm run market-scan:prod
 *   - Direct connection: Set DATABASE_URL environment variable
 */

import { runDailyScan } from '../lib/market-scan/scan';

async function main() {
  console.log('🚀 Starting Market Scan for Production...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
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
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${JSON.stringify(error)}`);
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Market Scan Failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  }
}

main();

