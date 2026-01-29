import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { generateResponse as generateGeminiResponse, isGeminiConfigured, ChatMessage } from "@/lib/gemini";
import { generateResponse as generateOpenAIResponse, isOpenAIConfigured } from "@/lib/openai";
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
    const allCitations = generateCitations(ragContext);
    console.log(`[STARTEGIZER_CHAT] Generated ${allCitations.length} citations`);
    if (allCitations.length > 0) {
      console.log(`[STARTEGIZER_CHAT] Sample citation: ${allCitations[0].title} from ${allCitations[0].source}`);
    }
    
    // Generate response using AI (Gemini, OpenAI, or fallback to mock)
    let responseText: string;
    let creditsDeducted = false;
    let aiProvider = "none";

    const geminiConfigured = isGeminiConfigured();
    const openAIConfigured = isOpenAIConfigured();
    
    console.log("[STARTEGIZER_CHAT] AI Providers configured:", {
      gemini: geminiConfigured,
      openai: openAIConfigured,
      geminiProjectId: process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_GCP_PROJECT_ID || "NOT SET",
    });
    
    // Try Gemini first, then OpenAI, then fallback to mock
    if (geminiConfigured) {
      try {
        console.log("[STARTEGIZER_CHAT] Calling Gemini API...");
        aiProvider = "gemini";
        const geminiResponse = await generateGeminiResponse(fullPrompt, conversationHistory);
        responseText = geminiResponse.text;
        console.log("[STARTEGIZER_CHAT] Gemini response received, length:", responseText.length);
        console.log("[STARTEGIZER_CHAT] Response preview:", responseText.substring(0, 200));
        
        // Deduct fixed credits per API call (always deduct if API call succeeded)
        console.log("[STARTEGIZER_CHAT] Deducting credits:", CREDITS_PER_CALL, "credits");
        const deductionResult = await deductCredits(user.id, CREDITS_PER_CALL);
        console.log("[STARTEGIZER_CHAT] Deduction result:", JSON.stringify(deductionResult, null, 2));
        
        if (!deductionResult.success) {
          console.error("[CREDIT_DEDUCTION_FAILED]", deductionResult.error);
          console.error("[CREDIT_DEDUCTION_FAILED] Error details:", {
            userId: user.id,
            creditsToDeduct: CREDITS_PER_CALL,
            error: deductionResult.error,
            remainingBalance: deductionResult.remainingBalance,
          });
          // Still mark as deducted if API call succeeded (deduction failure is a separate issue)
          creditsDeducted = true;
          console.warn("[CREDIT_DEDUCTION_FAILED] Marking credits as deducted despite deduction failure - API call was successful");
        } else {
          creditsDeducted = true;
          console.log(`[CREDITS_DEDUCTED] ✅ User ${user.id}: ${CREDITS_PER_CALL} credits deducted. Remaining: ${deductionResult.remainingBalance}`);
        }
      } catch (error: any) {
        console.error("[GEMINI_ERROR]", error);
        console.error("[GEMINI_ERROR] Error details:", {
          message: error.message,
          stack: error.stack?.substring(0, 500),
          name: error.name,
        });
        // Try OpenAI as fallback if Gemini fails
        // Re-check OpenAI configuration in case it wasn't available during initial check
        const openAIConfiguredNow = isOpenAIConfigured();
        console.log("[STARTEGIZER_CHAT] Checking OpenAI fallback:", {
          openAIConfiguredInitially: openAIConfigured,
          openAIConfiguredNow: openAIConfiguredNow,
          openAIKeyPresent: !!process.env.OPENAI_API_KEY,
        });
        
        if (openAIConfiguredNow) {
          console.log("[STARTEGIZER_CHAT] Gemini failed (429 quota), trying OpenAI as fallback...");
          try {
            aiProvider = "openai";
            const openAIResponse = await generateOpenAIResponse(fullPrompt, conversationHistory);
            responseText = openAIResponse.text;
            console.log("[STARTEGIZER_CHAT] OpenAI response received, length:", responseText.length);
            console.log("[STARTEGIZER_CHAT] Response preview:", responseText.substring(0, 200));
            
            // Deduct credits for OpenAI call
            console.log("[STARTEGIZER_CHAT] Deducting credits:", CREDITS_PER_CALL, "credits");
            const deductionResult = await deductCredits(user.id, CREDITS_PER_CALL);
            
            if (!deductionResult.success) {
              console.error("[CREDIT_DEDUCTION_FAILED]", deductionResult.error);
              creditsDeducted = true; // Still mark as deducted
            } else {
              creditsDeducted = true;
              console.log(`[CREDITS_DEDUCTED] ✅ User ${user.id}: ${CREDITS_PER_CALL} credits deducted. Remaining: ${deductionResult.remainingBalance}`);
            }
          } catch (openAIError: any) {
            console.error("[OPENAI_ERROR]", openAIError);
            console.error("[OPENAI_ERROR] Error details:", {
              message: openAIError.message,
              stack: openAIError.stack?.substring(0, 500),
              name: openAIError.name,
            });
            console.warn("[OPENAI_FALLBACK] OpenAI also failed, falling back to mock response");
            responseText = generateMockResponse(message, promptTemplateId);
            creditsDeducted = false;
          }
        } else {
          // Fallback to mock response if no AI provider available
          console.warn("[GEMINI_FALLBACK] Falling back to mock response (OpenAI not configured)");
          console.warn("[GEMINI_FALLBACK] OpenAI check:", {
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
          });
          responseText = generateMockResponse(message, promptTemplateId);
          creditsDeducted = false;
        }
      }
    } else if (openAIConfigured) {
      // Use OpenAI if Gemini is not configured
      try {
        console.log("[STARTEGIZER_CHAT] Calling OpenAI API...");
        aiProvider = "openai";
        const openAIResponse = await generateOpenAIResponse(fullPrompt, conversationHistory);
        responseText = openAIResponse.text;
        console.log("[STARTEGIZER_CHAT] OpenAI response received, length:", responseText.length);
        console.log("[STARTEGIZER_CHAT] Response preview:", responseText.substring(0, 200));
        
        // Deduct credits for OpenAI call
        console.log("[STARTEGIZER_CHAT] Deducting credits:", CREDITS_PER_CALL, "credits");
        const deductionResult = await deductCredits(user.id, CREDITS_PER_CALL);
        
        if (!deductionResult.success) {
          console.error("[CREDIT_DEDUCTION_FAILED]", deductionResult.error);
          creditsDeducted = true; // Still mark as deducted
        } else {
          creditsDeducted = true;
          console.log(`[CREDITS_DEDUCTED] ✅ User ${user.id}: ${CREDITS_PER_CALL} credits deducted. Remaining: ${deductionResult.remainingBalance}`);
        }
      } catch (error: any) {
        console.error("[OPENAI_ERROR]", error);
        console.error("[OPENAI_ERROR] Error details:", {
          message: error.message,
          stack: error.stack?.substring(0, 500),
          name: error.name,
        });
        // Fallback to mock response if OpenAI fails
        console.warn("[OPENAI_FALLBACK] Falling back to mock response");
        responseText = generateMockResponse(message, promptTemplateId);
        creditsDeducted = false;
      }
    } else {
      // Fallback to mock response if no AI provider is configured
      console.warn("[AI_NOT_CONFIGURED] No AI provider configured. Using mock response.");
      console.warn("[AI_NOT_CONFIGURED] To enable AI, set one of:");
      console.warn("[AI_NOT_CONFIGURED]   - GCP_PROJECT_ID (for Gemini)");
      console.warn("[AI_NOT_CONFIGURED]   - OPENAI_API_KEY (for OpenAI)");
      responseText = generateMockResponse(message, promptTemplateId);
      creditsDeducted = false;
    }
    
    console.log(`[STARTEGIZER_CHAT] Using AI provider: ${aiProvider}`);
    
    // Extract citations that were actually referenced in the response
    const referencedCitations = extractReferencedCitations(responseText, allCitations);
    console.log(`[STARTEGIZER_CHAT] Extracted ${referencedCitations.length} referenced citations from response`);
    
    // Only include citations that were actually referenced (or all if none were explicitly referenced)
    const sources = referencedCitations.length > 0 
      ? referencedCitations.map(citation => ({
          title: citation.title,
          source: citation.source,
          url: citation.url || undefined,
          type: citation.type === 'market_scan' ? 'Article' : citation.type === 'standard' ? 'Standard' : 'Framework',
        }))
      : allCitations.map(citation => ({
          title: citation.title,
          source: citation.source,
          url: citation.url || undefined,
          type: citation.type === 'market_scan' ? 'Article' : citation.type === 'standard' ? 'Standard' : 'Framework',
        }));
    console.log(`[STARTEGIZER_CHAT] Formatted ${sources.length} sources for response`);
    
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
      aiProvider: aiProvider,
      geminiConfigured: isGeminiConfigured(),
      openAIConfigured: isOpenAIConfigured(),
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
 * Extract citations that were actually referenced in the LLM response
 * Looks for citation patterns like [1], [2], [[1]], etc.
 */
function extractReferencedCitations(
  responseText: string,
  allCitations: Array<{ number: number; title: string; source: string; url?: string | null; type: string }>
): Array<{ number: number; title: string; source: string; url?: string | null; type: string }> {
  // Find all citation references in the response (e.g., [1], [2], [[1]], etc.)
  const citationPattern = /\[\[?(\d+)\]\]?/g;
  const matches = responseText.matchAll(citationPattern);
  const referencedNumbers = new Set<number>();
  
  for (const match of matches) {
    const citationNumber = parseInt(match[1], 10);
    // Only include if the citation number exists in our list
    if (citationNumber >= 1 && citationNumber <= allCitations.length) {
      referencedNumbers.add(citationNumber);
    }
  }
  
  // Return only citations that were referenced
  const referencedCitations = allCitations.filter(citation => 
    referencedNumbers.has(citation.number)
  );
  
  // If no citations were found but we have RAG context, include all (LLM might have used them without explicit citation)
  // But if citations were explicitly referenced, only return those
  if (referencedNumbers.size > 0) {
    console.log(`[CITATION_EXTRACTION] Found ${referencedNumbers.size} referenced citations: [${Array.from(referencedNumbers).join(', ')}]`);
    return referencedCitations;
  }
  
  // If no explicit citations found, return all (they might have been used implicitly)
  console.log(`[CITATION_EXTRACTION] No explicit citations found, returning all ${allCitations.length} citations`);
  return allCitations;
}

/**
 * Generate mock response based on user message
 * Fallback used when Gemini AI is not configured or fails
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

  // Default response - only used as fallback when no AI provider is available
  return `I apologize, but I'm currently unable to process your request. Startegizer requires an AI provider to be configured.

**To enable full functionality, configure one of the following:**

**Option 1: Google Gemini (Vertex AI)**
- Set GCP_PROJECT_ID in your environment variables
- Verify that Vertex AI API is enabled in your GCP project
- Check that your service account has the necessary permissions

**Option 2: OpenAI**
- Set OPENAI_API_KEY in your environment variables
- Ensure you have an active OpenAI API account

**In the meantime**, you can:
- Review our knowledge base articles
- Check the Market Scan for latest updates
- Browse AI governance standards and frameworks

If this issue persists, please contact support.`;
}

