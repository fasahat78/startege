import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { generateResponse, isGeminiConfigured, ChatMessage } from "@/lib/gemini";
import { buildFullPrompt } from "@/lib/startegizer-prompts";
import { deductCredits, checkCreditBalance } from "@/lib/ai-credits";
import { retrieveRAGContext, generateCitations } from "@/lib/startegizer-rag";

/**
 * Startegizer Chat API Route
 * Handles chat messages and returns AI responses
 * 
 * Fixed cost model: 10 credits per API call
 * Strategic value: Startegizer is a premium AI tutor providing personalized,
 * context-aware explanations. Higher credit cost reflects premium positioning
 * and encourages thoughtful usage.
 */
const CREDITS_PER_CALL = 10; // Fixed cost per API call

export async function POST(request: Request) {
  console.log("[STARTEGIZER_CHAT] ===== API CALL STARTED =====");
  try {
    const user = await getCurrentUser();
    console.log("[STARTEGIZER_CHAT] User:", user?.id, user?.email);

    if (!user) {
      console.error("[STARTEGIZER_CHAT] No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check premium status
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true },
    });

    if (dbUser?.subscriptionTier !== "premium") {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    // Check profile completion and get user context
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: {
        onboardingStatus: true,
        personaType: true,
        customPersona: true,
        knowledgeLevel: true,
        interests: { select: { interest: true } },
        goals: { select: { goal: true } },
      },
    });

    if (!profile || profile.onboardingStatus !== "COMPLETED") {
      return NextResponse.json(
        { error: "Profile completion required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { message, conversationId, promptTemplateId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get conversation history if conversationId exists
    let conversationHistory: ChatMessage[] = [];
    if (conversationId) {
      const conversation = await prisma.agentConversation.findUnique({
        where: { id: conversationId, userId: user.id },
        select: { messages: true },
      });
      if (conversation) {
        conversationHistory = (conversation.messages as any[])
          .filter((msg) => msg.role === "user" || msg.role === "assistant")
          .map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));
      }
    }

    // Build user context
    const userContext = {
      persona: profile.personaType === "OTHER" ? profile.customPersona : profile.personaType,
      knowledgeLevel: profile.knowledgeLevel,
      interests: profile.interests.map((i) => i.interest),
      goals: profile.goals.map((g) => g.goal),
    };

    // Retrieve RAG context from Market Scan and Standards
    console.log("[STARTEGIZER_CHAT] Retrieving RAG context...");
    const ragContext = await retrieveRAGContext(message, {
      marketScanTopK: 3,
      standardsTopK: 3,
      minRelevanceScore: 0.1, // Lower threshold to get more results
    });
    console.log(`[STARTEGIZER_CHAT] RAG context retrieved: ${ragContext.documents.length} documents`);
    if (ragContext.documents.length > 0) {
      console.log(`[STARTEGIZER_CHAT] Sample document: ${ragContext.documents[0].title} (${ragContext.documents[0].type})`);
    }

    // Build prompt with user context and RAG context
    const fullPrompt = buildFullPrompt(message, userContext, conversationHistory, {
      ragContext,
      includeCitations: true,
    });
    console.log("[STARTEGIZER_CHAT] Prompt built, length:", fullPrompt.length);
    console.log("[STARTEGIZER_CHAT] Fixed cost per call:", CREDITS_PER_CALL, "credits");

    // Check if user has sufficient credits before making API call
    let currentBalance = 0;
    try {
      currentBalance = await checkCreditBalance(user.id);
      console.log("[STARTEGIZER_CHAT] Current balance:", currentBalance, "credits");
    } catch (error: any) {
      // If AICredit table doesn't exist, allow the call (will be handled later)
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.warn("[STARTEGIZER_CHAT] AICredit table not found, allowing call without credit check");
        currentBalance = 0; // Set to 0 so it will fail credit check, but we'll handle gracefully
      } else {
        throw error;
      }
    }
    
    if (currentBalance < CREDITS_PER_CALL) {
      console.warn("[STARTEGIZER_CHAT] Insufficient credits:", currentBalance, "<", CREDITS_PER_CALL);
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: `You need at least ${CREDITS_PER_CALL} credits to use this feature. Your current balance: ${currentBalance} credits.`,
          currentBalance,
          requiredCredits: CREDITS_PER_CALL,
        },
        { status: 402 } // 402 Payment Required
      );
    }

    // Generate citations from RAG context
    const citations = generateCitations(ragContext);
    console.log(`[STARTEGIZER_CHAT] Generated ${citations.length} citations`);
    if (citations.length > 0) {
      console.log(`[STARTEGIZER_CHAT] Sample citation: ${citations[0].title} from ${citations[0].source}`);
    }
    
    // Generate response using Gemini AI (or fallback to mock if not configured)
    let responseText: string;
    let sources = citations.map(citation => ({
      title: citation.title,
      source: citation.source,
      url: citation.url || undefined,
      type: citation.type === 'market_scan' ? 'Article' : citation.type === 'standard' ? 'Standard' : 'Framework',
    }));
    console.log(`[STARTEGIZER_CHAT] Formatted ${sources.length} sources for response`);
    let creditsDeducted = false;

    const geminiConfigured = isGeminiConfigured();
    console.log("[STARTEGIZER_CHAT] Gemini configured:", geminiConfigured);
    
    if (geminiConfigured) {
      try {
        console.log("[STARTEGIZER_CHAT] Calling Gemini API...");
        const geminiResponse = await generateResponse(fullPrompt, conversationHistory);
        responseText = geminiResponse.text;
        console.log("[STARTEGIZER_CHAT] Gemini response received, length:", responseText.length);
        
        // Deduct fixed credits per API call
        console.log("[STARTEGIZER_CHAT] Deducting credits:", CREDITS_PER_CALL, "credits");
        const deductionResult = await deductCredits(user.id, CREDITS_PER_CALL);
        console.log("[STARTEGIZER_CHAT] Deduction result:", JSON.stringify(deductionResult, null, 2));
        
        if (!deductionResult.success) {
          console.error("[CREDIT_DEDUCTION_FAILED]", deductionResult.error);
          // Still return the response, but log the error
        } else {
          creditsDeducted = true;
          console.log(`[CREDITS_DEDUCTED] ✅ User ${user.id}: ${CREDITS_PER_CALL} credits deducted. Remaining: ${deductionResult.remainingBalance}`);
        }
        
        // Extract sources from response if mentioned (basic implementation)
        // TODO: Phase 7 - Improve source extraction with RAG
      } catch (error: any) {
        console.error("[GEMINI_ERROR]", error);
        // Fallback to mock response if Gemini fails
        console.warn("[GEMINI_FALLBACK] Falling back to mock response");
        responseText = generateMockResponse(message, promptTemplateId);
        // No credits deducted for mock responses
        creditsDeducted = false;
      }
    } else {
      // Fallback to mock response if Gemini is not configured
      console.warn("[GEMINI_NOT_CONFIGURED] Using mock response. Set GCP_PROJECT_ID to enable Gemini.");
      responseText = generateMockResponse(message, promptTemplateId);
      // No credits deducted for mock responses
      creditsDeducted = false;
    }
    
    console.log("[STARTEGIZER_CHAT] Final status:", {
      creditsDeducted,
      creditsPerCall: CREDITS_PER_CALL,
      responseLength: responseText.length,
    });

    // Get or create conversation
    let conversation = null;
    let conversationIdToReturn = conversationId;

    if (conversationId) {
      conversation = await prisma.agentConversation.findUnique({
        where: { id: conversationId, userId: user.id },
      });
    }

    // Prepare messages
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: responseText,
      timestamp: new Date().toISOString(),
      sources,
    };

    const updatedMessages = conversation
      ? [...(conversation.messages as any[]), userMessage, assistantMessage]
      : [userMessage, assistantMessage];

    // Save or update conversation
    if (conversation) {
      await prisma.agentConversation.update({
        where: { id: conversationId },
        data: {
          messages: updatedMessages,
          sourcesCited: sources,
          messageCount: updatedMessages.length,
          updatedAt: new Date(),
        },
      });
      conversationIdToReturn = conversation.id;
    } else {
      const newConversation = await prisma.agentConversation.create({
        data: {
          userId: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
          messages: updatedMessages,
          sourcesCited: sources,
          messageCount: updatedMessages.length,
        },
      });
      conversationIdToReturn = newConversation.id;
    }

    // Get updated credit balance
    const updatedBalance = await checkCreditBalance(user.id);

    console.log(`[STARTEGIZER_CHAT] Response prepared:`, {
      userId: user.id,
      creditsDeducted,
      creditsPerCall: CREDITS_PER_CALL,
      updatedBalance,
      isGeminiConfigured: isGeminiConfigured(),
    });

    return NextResponse.json({
      response: responseText,
      conversationId: conversationIdToReturn,
      sources,
      credits: {
        deducted: creditsDeducted ? CREDITS_PER_CALL : 0,
        balance: updatedBalance,
      },
    });
  } catch (error: any) {
    console.error("[STARTEGIZER_CHAT_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate mock response based on user message
 * This will be replaced with Gemini AI in Phase 6
 */
function generateMockResponse(message: string, promptTemplateId?: string): string {
  const lowerMessage = message.toLowerCase();

  // Simple keyword-based responses for demo
  if (lowerMessage.includes("risk") || lowerMessage.includes("classification")) {
    return `Based on your query about risk classification, here's a comprehensive analysis:

**AI Risk Classification Framework:**

1. **Unacceptable Risk**: AI systems that pose a clear threat to safety, livelihoods, and fundamental rights. These are prohibited (e.g., social scoring by governments).

2. **High Risk**: AI systems used in specific areas like:
   - Critical infrastructure
   - Education and vocational training
   - Employment and worker management
   - Essential private and public services
   - Law enforcement
   - Migration and border control
   - Administration of justice

3. **Limited Risk**: AI systems with transparency obligations (e.g., chatbots must disclose they are AI).

4. **Minimal Risk**: Most AI systems fall into this category with no specific obligations.

**For your specific use case**, I would need more details about:
- The type of AI system
- The data it processes
- The context of deployment
- The potential impact on individuals

Would you like to provide more details so I can give you a more specific risk assessment?`;
  }

  if (lowerMessage.includes("gdpr") || lowerMessage.includes("data protection")) {
    return `Regarding GDPR compliance for AI systems, here are the key considerations:

**GDPR Requirements for AI:**

1. **Lawful Basis**: You need a valid legal basis for processing personal data (e.g., consent, legitimate interest, contract).

2. **Data Minimization**: Only collect and process data that is necessary for your AI system's purpose.

3. **Purpose Limitation**: Use data only for the specified purpose and inform data subjects.

4. **Transparency**: Inform individuals about automated decision-making, including profiling.

5. **Individual Rights**: Ensure data subjects can exercise their rights:
   - Right to access
   - Right to rectification
   - Right to erasure
   - Right to object to processing
   - Right to data portability

6. **Data Protection by Design**: Implement technical and organizational measures to ensure data protection.

7. **Documentation**: Maintain records of processing activities.

**For AI systems specifically**, you should also consider:
- Whether your AI makes automated decisions (Article 22)
- The need for Data Protection Impact Assessments (DPIA)
- Requirements for high-risk processing

Would you like me to help you assess your specific AI system's GDPR compliance?`;
  }

  if (lowerMessage.includes("transparency") || lowerMessage.includes("explainability")) {
    return `Transparency and explainability are crucial for trustworthy AI. Here's what you need to know:

**Transparency Requirements:**

1. **Pre-deployment Transparency**:
   - Inform users that they are interacting with an AI system
   - Explain the system's capabilities and limitations
   - Disclose the purpose and intended use

2. **In-operation Transparency**:
   - Provide explanations for AI decisions when requested
   - Make the decision-making process understandable
   - Offer human oversight options

3. **Post-deployment Transparency**:
   - Document system performance
   - Report on accuracy and fairness metrics
   - Maintain audit trails

**Explainability Techniques:**
- Model-agnostic methods (LIME, SHAP)
- Feature importance analysis
- Counterfactual explanations
- Natural language explanations

**Regulatory Requirements:**
- EU AI Act: Transparency obligations for limited-risk systems
- GDPR: Right to explanation for automated decisions
- Sector-specific requirements may apply

Would you like guidance on implementing transparency for your specific AI system?`;
  }

  // Default response
  return `Thank you for your question about AI governance. I'm Startegizer, your AI Governance Expert Assistant.

I can help you with:
- **Risk Assessment**: Classifying AI systems and identifying risks
- **Compliance**: GDPR, EU AI Act, and other regulatory requirements
- **Best Practices**: Implementing ethical AI governance frameworks
- **Case Studies**: Real-world examples and enforcement actions
- **Technical Guidance**: Specific implementation strategies

**Note**: This is a demo response. In Phase 6, I'll be powered by Gemini AI with access to:
- Real-time regulatory updates
- Comprehensive knowledge base
- Personalized guidance based on your profile
- RAG (Retrieval-Augmented Generation) for accurate, cited responses

Could you provide more details about what specific aspect of AI governance you'd like help with?`;
}

