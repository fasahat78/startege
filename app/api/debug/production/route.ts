import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.checks.database_connection = "✅ Connected";

    // Check critical tables
    const tables = [
      "ConceptCard",
      "Challenge",
      "AgentConversation",
      "UserProfile",
      "User",
    ];

    for (const table of tables) {
      try {
        const count = await (prisma as any)[table].count();
        diagnostics.checks[`table_${table}`] = `✅ Exists (${count} rows)`;
      } catch (error: any) {
        diagnostics.checks[`table_${table}`] = `❌ Error: ${error.message || error.code || 'Unknown'}`;
      }
    }

    // Check concepts query logic
    try {
      const challenges = await prisma.challenge.findMany({
        where: { levelNumber: { lte: 40 } },
        select: { concepts: true },
      });

      const assignedConceptIds = new Set<string>();
      challenges.forEach((challenge) => {
        if (Array.isArray(challenge.concepts)) {
          challenge.concepts.forEach((id: string) => assignedConceptIds.add(id));
        }
      });

      const conceptCount = await prisma.conceptCard.count();
      const assignedCount = assignedConceptIds.size;

      diagnostics.checks.concepts = {
        total: conceptCount,
        assigned_to_challenges: assignedCount,
        will_show: assignedCount > 0 ? assignedCount : conceptCount,
        logic: assignedCount > 0 ? "Filtered by assignments" : "Show all (no assignments)",
      };
    } catch (error: any) {
      diagnostics.checks.concepts = `❌ Error: ${error.message || error.code || 'Unknown'}`;
    }

    // Check AgentConversation query
    try {
      const convCount = await prisma.agentConversation.count();
      diagnostics.checks.agent_conversations = `✅ Query works (${convCount} rows)`;
    } catch (error: any) {
      diagnostics.checks.agent_conversations = `❌ Error: ${error.message || error.code || 'Unknown'}`;
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error: any) {
    diagnostics.error = {
      message: error.message,
      code: error.code,
      stack: error.stack,
    };
    return NextResponse.json(diagnostics, { status: 500 });
  }
}

