import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://fasahatferoze@localhost:5433/startege',
    },
  },
});

async function exportDevDatabase() {
  console.log('📤 Exporting dev database...\n');

  try {
    // Export all tables
    const concepts = await prisma.conceptCard.findMany();
    const challenges = await prisma.challenge.findMany();
    const domains = await prisma.domain.findMany();
    const categories = await prisma.category.findMany();
    const badges = await prisma.badge.findMany();
    const agentConversations = await prisma.agentConversation.findMany().catch(() => []);
    
    const exportData = {
      timestamp: new Date().toISOString(),
      concepts: concepts.length,
      challenges: challenges.length,
      domains: domains.length,
      categories: categories.length,
      badges: badges.length,
      agentConversations: agentConversations.length,
      data: {
        concepts,
        challenges,
        domains,
        categories,
        badges,
        agentConversations,
      },
    };

    fs.writeFileSync('/tmp/dev-database-export.json', JSON.stringify(exportData, null, 2));
    
    console.log('✅ Dev database exported:');
    console.log(`   - Concepts: ${concepts.length}`);
    console.log(`   - Challenges: ${challenges.length}`);
    console.log(`   - Domains: ${domains.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Badges: ${badges.length}`);
    console.log(`   - AgentConversations: ${agentConversations.length}`);
    console.log('\n📁 Export saved to: /tmp/dev-database-export.json');
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportDevDatabase();

