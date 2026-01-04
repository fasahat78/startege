#!/usr/bin/env tsx
/**
 * Production Seeding Script
 * 
 * Seeds all required data for production:
 * 1. Domains and Categories
 * 2. Concept Cards (from CSV)
 * 3. Levels/Challenges
 * 4. Badges
 * 5. AIGP Exams
 * 6. Onboarding data
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." tsx scripts/seed-production.ts
 */

import { prisma } from '../lib/db';

async function seedProduction() {
  console.log('🌱 Starting production seeding...\n');

  try {
    // Step 1: Seed Domains and Categories
    console.log('📚 Step 1: Seeding domains and categories...');
    const { seedDomainsCategories } = await import('./seed-domains-categories');
    await seedDomainsCategories();
    console.log('✅ Domains and categories seeded\n');

    // Step 2: Import Concepts from CSV
    console.log('📖 Step 2: Importing concepts from CSV...');
    const { importConcepts } = await import('./import-concepts');
    await importConcepts();
    console.log('✅ Concepts imported\n');

    // Step 3: Create Levels/Challenges
    console.log('🎮 Step 3: Creating levels/challenges...');
    const { createLevels } = await import('./create-levels');
    await createLevels();
    console.log('✅ Levels created\n');

    // Step 4: Create Badges
    console.log('🏆 Step 4: Creating badges...');
    const { createBadges } = await import('./create-badges');
    await createBadges();
    console.log('✅ Badges created\n');

    // Step 5: Seed Challenges (assign concepts to levels)
    console.log('🔗 Step 5: Seeding challenges (assigning concepts to levels)...');
    const { seedChallenges } = await import('./seed-challenges');
    await seedChallenges();
    console.log('✅ Challenges seeded\n');

    // Step 6: Import AIGP Exams
    console.log('📝 Step 6: Importing AIGP exams...');
    const { ingestAigpExams } = await import('./ingest-aigp-exams');
    await ingestAigpExams();
    console.log('✅ AIGP exams imported\n');

    // Step 7: Seed Onboarding data
    console.log('🎯 Step 7: Seeding onboarding data...');
    const { seedInterestsAndGoals } = await import('./seed-interests-and-goals');
    await seedInterestsAndGoals();
    
    const { seedOnboardingScenarios } = await import('./seed-onboarding-scenarios');
    await seedOnboardingScenarios();
    console.log('✅ Onboarding data seeded\n');

    // Step 8: Seed Level-Category Coverage
    console.log('📊 Step 8: Seeding level-category coverage...');
    const { seedLevelCategoryCoverage } = await import('./seed-level-category-coverage');
    await seedLevelCategoryCoverage();
    console.log('✅ Level-category coverage seeded\n');

    // Summary
    console.log('\n✨ Production seeding complete!\n');
    
    const conceptCount = await prisma.conceptCard.count();
    const levelCount = await prisma.challenge.count();
    const badgeCount = await prisma.badge.count();
    const examCount = await prisma.aigpExam.count();
    
    console.log('📊 Summary:');
    console.log(`   Concepts: ${conceptCount}`);
    console.log(`   Levels: ${levelCount}`);
    console.log(`   Badges: ${badgeCount}`);
    console.log(`   AIGP Exams: ${examCount}`);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  seedProduction()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { seedProduction };

