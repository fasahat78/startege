/**
 * OpenAI Service Wrapper
 * 
 * Provides a clean interface for interacting with OpenAI's API.
 * Used as an alternative to Gemini AI for Startegizer.
 */

import OpenAI from "openai";

// Lazy initialization to ensure env vars are loaded
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    
    openaiInstance = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiInstance;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OpenAIResponse {
  text: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
  wasTruncated?: boolean;
}

/**
 * Generate a response from OpenAI
 */
export async function generateResponse(
  prompt: string,
  conversationHistory: ChatMessage[] = []
): Promise<OpenAIResponse> {
  try {
    const openai = getOpenAI();
    
    // Build conversation history
    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
    
    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    });

    // Add current prompt
    messages.push({
      role: "user",
      content: prompt,
    });

    // Generate response using GPT-4 or GPT-3.5-turbo
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"; // Default to cost-effective model
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages as any,
      temperature: 0.3, // Lower temperature for more focused, factual responses
      max_tokens: 8192, // Increased to allow comprehensive responses
    });

    const choice = response.choices[0];
    if (!choice || !choice.message) {
      throw new Error("Invalid response format from OpenAI API");
    }

    const text = choice.message.content || "";
    const finishReason = choice.finish_reason;
    const wasTruncated = finishReason === "length" || finishReason === "content_filter";

    // Extract usage information
    const usage = response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined;

    // Log response details for debugging
    console.log(`[OPENAI] Response generated:`, {
      textLength: text.length,
      finishReason,
      wasTruncated,
      usage,
      model,
    });

    // If response was truncated, append a note
    if (wasTruncated && text && !text.includes("[Response truncated]")) {
      return {
        text: text + "\n\n*[Note: Response was truncated due to length. Please ask me to continue if you need more information.]",
        usage,
        finishReason,
        wasTruncated,
      };
    }

    return {
      text,
      usage,
      finishReason,
      wasTruncated,
    };
  } catch (error: any) {
    console.error("[OPENAI_ERROR]", error);
    throw new Error(`OpenAI API error: ${error.message || "Unknown error"}`);
  }
}

/**
 * Check if OpenAI is properly configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
