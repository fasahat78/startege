import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import StartegizerClient from "@/components/startegizer/StartegizerClient";

// Mark as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

export default async function StartegizerPage() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/auth/signin-firebase?redirect=/startegizer");
    }

    // Check premium status
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionTier: true,
      },
    });

    if (dbUser?.subscriptionTier !== "premium") {
      redirect("/pricing?feature=startegizer");
    }

    // Check profile completion
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: {
        onboardingStatus: true,
        personaType: true,
        customPersona: true,
        knowledgeLevel: true,
        interests: {
          select: {
            interest: true,
          },
        },
        goals: {
          select: {
            goal: true,
          },
        },
      },
    });

    if (!profile || profile.onboardingStatus !== "COMPLETED") {
      redirect("/onboarding/persona?redirect=/startegizer");
    }

    // Fetch user's conversation history
    // Wrap in try-catch to handle missing table gracefully
    let conversations = [];
    try {
      conversations = await prisma.agentConversation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 50, // Limit to 50 most recent conversations
        select: {
          id: true,
          title: true,
          messages: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error: any) {
      console.error("[STARTEGIZER] Error fetching conversations:", error);
      // If table doesn't exist, use empty array
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.warn("[STARTEGIZER] AgentConversation table not found, using empty conversations");
        conversations = [];
      } else {
        throw error; // Re-throw other errors
      }
    }

    // Format persona (use personaType or customPersona)
    const persona = profile.personaType 
      ? profile.personaType === "OTHER" 
        ? profile.customPersona || null
        : profile.personaType
      : null;

    return (
      <StartegizerClient
        userId={user.id}
        userProfile={{
          persona,
          knowledgeLevel: profile.knowledgeLevel || null,
          interests: profile.interests.map((i) => i.interest),
          goals: profile.goals.map((g) => g.goal),
        }}
        initialConversations={conversations.map((conv) => ({
          id: conv.id,
          title: conv.title || "Untitled Conversation",
          messages: (conv.messages as any[]).map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            sources: msg.sources,
          })),
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        }))}
      />
    );
  } catch (error: any) {
    console.error("[STARTEGIZER] Fatal error:", error);
    console.error("[STARTEGIZER] Error code:", error?.code);
    console.error("[STARTEGIZER] Error message:", error?.message);
    console.error("[STARTEGIZER] Error stack:", error?.stack);
    throw error; // Re-throw to show error page
  }
}

