import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import StartegizerClient from "@/components/startegizer/StartegizerClient";

export default async function StartegizerPage() {
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
  const conversations = await prisma.agentConversation.findMany({
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
}

