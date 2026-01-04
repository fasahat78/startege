/**
 * Gemini AI Service Wrapper
 * 
 * Provides a clean interface for interacting with Google's Gemini AI via Vertex AI.
 * Used by Startegizer for AI governance expert assistance.
 */

import { VertexAI } from "@google-cloud/vertexai";

// Lazy initialization to ensure env vars are loaded
let vertexAIInstance: VertexAI | null = null;
let geminiModelInstance: any = null;

function getVertexAI(): VertexAI {
  if (!vertexAIInstance) {
    const projectId = process.env.GCP_PROJECT_ID || process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION || process.env.NEXT_PUBLIC_GCP_LOCATION || "us-central1";
    
    if (!projectId) {
      throw new Error("GCP_PROJECT_ID environment variable is not set");
    }
    
    vertexAIInstance = new VertexAI({
      project: projectId,
      location: location,
    });
  }
  return vertexAIInstance;
}

function getGeminiModel() {
  if (!geminiModelInstance) {
    const vertexAI = getVertexAI();
    // Model availability varies by region and SDK vs Studio
    // Studio shows preview models (gemini-3-pro-preview) that may not be in SDK
    // Try these in order: gemini-2.0-flash-exp, gemini-2.5-flash-lite, gemini-1.5-flash, gemini-pro
    // Note: SDK requires specific region (us-central1), even if Studio shows "global"
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
    geminiModelInstance = vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3, // Lower temperature for more focused, factual responses
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192, // Increased from 2048 to allow comprehensive responses
      },
    });
  }
  return geminiModelInstance;
}

export const geminiModel = {
  get model() {
    return getGeminiModel();
  },
  async generateContent(params: any) {
    return getGeminiModel().generateContent(params);
  },
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string; // e.g., "MAX_TOKENS", "STOP", etc.
  wasTruncated?: boolean; // True if response was cut off due to token limit
}

/**
 * Generate a response from Gemini AI
 */
export async function generateResponse(
  prompt: string,
  conversationHistory: ChatMessage[] = []
): Promise<GeminiResponse> {
  try {
    // Build conversation history
    const contents = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Add current prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    // Generate response
    const result = await geminiModel.generateContent({
      contents,
    });

    const response = result.response;
    
    // Extract finish reason to detect truncation
    let finishReason: string | undefined;
    let wasTruncated = false;
    
    if (response.candidates && response.candidates[0]) {
      finishReason = response.candidates[0].finishReason;
      // Check if response was truncated due to token limit
      if (finishReason === 'MAX_TOKENS' || finishReason === 'OTHER') {
        wasTruncated = true;
        console.warn(`[GEMINI] Response truncated - finishReason: ${finishReason}`);
      }
    }
    
    // Handle different response formats and extract all text parts
    let text: string;
    if (typeof response.text === 'function') {
      text = response.text();
    } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      // Alternative response format - extract all parts
      const content = response.candidates[0].content;
      if (content.parts && Array.isArray(content.parts)) {
        // Concatenate all text parts (in case there are multiple)
        text = content.parts
          .map((part: any) => part.text || '')
          .filter((t: string) => t.length > 0)
          .join('');
      } else if (content.parts && content.parts[0] && content.parts[0].text) {
        text = content.parts[0].text;
      } else if (typeof content === 'string') {
        text = content;
      } else {
        text = JSON.stringify(content);
      }
    } else {
      // Fallback: try to extract text from response
      text = response.text || JSON.stringify(response);
    }
    
    // Ensure we have valid text
    if (!text || typeof text !== 'string') {
      console.error('[GEMINI] Invalid response format:', response);
      throw new Error('Invalid response format from Gemini API');
    }

    // If response was truncated, append a note
    if (wasTruncated && text && !text.includes("[Response truncated]")) {
      text += "\n\n*[Note: Response was truncated due to length. Please ask me to continue if you need more information.]";
    }

    // Extract usage information if available
    const usageMetadata = response.usageMetadata || result.response?.usageMetadata;
    const usage = usageMetadata
      ? {
          promptTokens: usageMetadata.promptTokenCount,
          candidatesTokens: usageMetadata.candidatesTokenCount,
          totalTokens: usageMetadata.totalTokenCount,
        }
      : undefined;

    // Log response details for debugging
    console.log(`[GEMINI] Response generated:`, {
      textLength: text.length,
      finishReason,
      wasTruncated,
      usage,
    });

    return {
      text,
      usage,
      finishReason,
      wasTruncated,
    };
  } catch (error: any) {
    console.error("[GEMINI_ERROR]", error);
    throw new Error(`Gemini AI error: ${error.message || "Unknown error"}`);
  }
}

/**
 * Generate embeddings for text (for future RAG implementation)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Note: This will be implemented when we add RAG in Phase 7
    // For now, this is a placeholder
    throw new Error("Embeddings not yet implemented - coming in Phase 7");
  } catch (error: any) {
    console.error("[EMBEDDING_ERROR]", error);
    throw error;
  }
}

/**
 * Check if Gemini is properly configured
 */
export function isGeminiConfigured(): boolean {
  return !!(
    process.env.GCP_PROJECT_ID ||
    process.env.NEXT_PUBLIC_GCP_PROJECT_ID
  );
}

