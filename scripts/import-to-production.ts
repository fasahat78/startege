import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5435/startege',
    },
  },
});

async function importToProduction() {
  console.log('📥 Importing dev database to production...\n');

  if (!fs.existsSync('/tmp/dev-database-export.json')) {
    throw new Error('Export file not found. Run export-dev-database.ts first.');
  }

  const exportData = JSON.parse(fs.readFileSync('/tmp/dev-database-export.json', 'utf-8'));

  try {
    console.log('Clearing production database...');
    // Delete in correct order (respecting foreign keys)
    await prisma.agentConversation.deleteMany().catch(() => {});
    await prisma.challenge.deleteMany();
    await prisma.conceptCard.deleteMany();
    await prisma.category.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.badge.deleteMany();

    console.log('Importing domains...');
    for (const domain of exportData.data.domains) {
      await prisma.domain.upsert({
        where: { id: domain.id },
        update: domain,
        create: domain,
      });
    }

    console.log('Importing categories...');
    for (const category of exportData.data.categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category,
      });
    }

    console.log('Importing concepts...');
    for (const concept of exportData.data.concepts) {
      await prisma.conceptCard.upsert({
        where: { id: concept.id },
        update: concept,
        create: concept,
      });
    }

    console.log('Importing challenges...');
    for (const challenge of exportData.data.challenges) {
      await prisma.challenge.upsert({
        where: { levelNumber: challenge.levelNumber },
        update: challenge,
        create: challenge,
      });
    }

    console.log('Importing badges...');
    for (const badge of exportData.data.badges) {
      await prisma.badge.upsert({
        where: { id: badge.id },
        update: badge,
        create: badge,
      });
    }

    if (exportData.data.agentConversations.length > 0) {
      console.log('Importing agent conversations...');
      for (const conv of exportData.data.agentConversations) {
        await prisma.agentConversation.upsert({
          where: { id: conv.id },
          update: conv,
          create: conv,
        });
      }
    }

    console.log('\n✅ Production database imported successfully!');
    console.log(`   - Concepts: ${exportData.data.concepts.length}`);
    console.log(`   - Challenges: ${exportData.data.challenges.length}`);
    console.log(`   - Domains: ${exportData.data.domains.length}`);
    console.log(`   - Categories: ${exportData.data.categories.length}`);
    console.log(`   - Badges: ${exportData.data.badges.length}`);
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importToProduction();

