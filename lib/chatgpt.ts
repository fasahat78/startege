/**
 * ChatGPT API Integration for Exam Generation
 * 
 * This module handles communication with OpenAI's ChatGPT API
 * for generating exam questions dynamically.
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY,
});

export interface ExamGenerationRequest {
  systemPrompt: string;
  questionCount: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert" | "intermediate-advanced";
  isBoss?: boolean;
  minMultiConceptRatio?: number;
  minMultiConceptCount?: number;
  minCrossCategoryRatio?: number;
  minCrossCategoryCount?: number;
  // Gap A: Strict concept scope enforcement
  allowedConceptIds?: string[]; // Only these concept IDs are allowed
  // Gap B: Canonical category IDs
  categoryIdMap?: Record<string, string>; // categoryId -> categoryName mapping
  requiredCategoryIds?: string[]; // Categories that must appear in exam
}

export interface ExamQuestion {
  id: string;
  stem: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  rationale: {
    correct: string;
    incorrect: Record<string, string>;
  };
}

export interface ExamGenerationResponse {
  questions: ExamQuestion[];
}

/**
 * Generate exam questions using ChatGPT
 * 
 * @param request - Exam generation request with prompt and parameters
 * @returns Generated exam questions in the expected format
 */
export async function generateExamQuestions(
  request: ExamGenerationRequest
): Promise<ExamGenerationResponse> {
  if (!process.env.OPENAI_API_KEY && !process.env.CHATGPT_API_KEY) {
    throw new Error("OpenAI API key not found in environment variables");
  }

  // Build user prompt based on exam type
  let userPrompt: string;
  
  if ((request as any).isBoss) {
    // Boss exam prompt with strict requirements
    const bossReq = (request as any);
    
    // Gap A: Build allowed concept IDs list
    let conceptScopeText = "";
    if (request.allowedConceptIds && request.allowedConceptIds.length > 0) {
      // Check if IDs look like ConceptCard IDs (start with "cmj" and are long) vs format like "L5-C01"
      const areConceptCardIds = request.allowedConceptIds[0]?.startsWith("cmj") || request.allowedConceptIds[0]?.length > 20;
      
      if (areConceptCardIds) {
        conceptScopeText = `
CRITICAL CONCEPT SCOPE RESTRICTION (MANDATORY):
You MUST use ONLY these exact ConceptCard database IDs (NOT format like "L5-C01"):
${request.allowedConceptIds.map((cid: string, idx: number) => `${idx + 1}. ${cid}`).join("\n")}

DO NOT invent conceptIds like "L5-C01", "L10-C10", etc. Use ONLY the exact IDs listed above.
These are database IDs (e.g., "cmj4621ir00010an4f0j6i7p0") - copy them exactly.`;
      } else {
        conceptScopeText = `
CRITICAL CONCEPT SCOPE RESTRICTION (MANDATORY):
You may ONLY use conceptIds from this exact list:
${request.allowedConceptIds.map((cid: string, idx: number) => `${idx + 1}. ${cid}`).join("\n")}

DO NOT use any conceptId outside this list. If you see conceptIds like "L10-C01", "L11-C02", etc., they are FORBIDDEN.
Only conceptIds from Levels 1-9 are allowed (L1-C01 through L9-C10).`;
      }
    }

    // Gap B: Build category ID mapping
    let categoryMappingText = "";
    if (request.categoryIdMap && Object.keys(request.categoryIdMap).length > 0) {
      const categoryEntries = Object.entries(request.categoryIdMap)
        .map(([id, name]) => `  "${id}": "${name}"`)
        .join(",\n");
      categoryMappingText = `
CRITICAL CATEGORY ID MAPPING (MANDATORY):
You MUST use these exact categoryIds (database IDs) in your questions:
{
${categoryEntries}
}

DO NOT use placeholder IDs like "cat_privacy", "cat_compliance", etc.
You MUST use the exact categoryIds from the mapping above.`;
    }

    userPrompt = `Generate exactly ${request.questionCount} multiple-choice exam questions for a BOSS EXAM.

Difficulty Level: ${request.difficulty}

BOSS EXAM REQUIREMENTS (MANDATORY):
- Multi-concept questions: ≥${bossReq.minMultiConceptRatio * 100}% (≥${bossReq.minMultiConceptCount} questions) must involve 2-3 concepts
- Cross-category questions: ≥${bossReq.minCrossCategoryRatio * 100}% (≥${bossReq.minCrossCategoryCount} questions) must span 2+ categories
- Scenario-based questions: ≥70% (≥${Math.ceil(request.questionCount * 0.7)} questions) must be scenario-based, not definition recall
- Framed from: enterprise governance, risk owner, accountable executive, governance committee context
- No single concept should appear in more than 3 questions
${conceptScopeText}
${categoryMappingText}

Return ONLY valid JSON matching this exact schema:
{
  "questions": [
    {
      "id": "Q1",
      "stem": "Scenario-based question text here",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "B",
      "conceptIds": ["L1-C01", "L2-C03"],
      "categoryIds": ["${request.categoryIdMap ? Object.keys(request.categoryIdMap)[0] : "cat_xxx"}", "${request.categoryIdMap ? Object.keys(request.categoryIdMap)[1] || Object.keys(request.categoryIdMap)[0] : "cat_yyy"}"],
      "difficultyTag": "judgement",
      "rationale": {
        "correct": "Why this option is correct",
        "incorrect": {
          "A": "Why option A is incorrect",
          "C": "Why option C is incorrect",
          "D": "Why option D is incorrect"
        }
      }
    }
  ]
}

CRITICAL REQUIREMENTS:
- Each question MUST include "conceptIds" array (2+ for multi-concept questions)${request.allowedConceptIds ? " - ONLY from the allowed list above" : ""}
- Each question MUST include "categoryIds" array (2+ for cross-category questions)${request.categoryIdMap ? " - ONLY from the categoryId mapping above" : ""}
- Each question MUST include "difficultyTag" ("recall", "apply", or "judgement")
- Multi-concept questions must test integration across concepts
- Cross-category questions must require reasoning across categories
- Scenario questions must be realistic governance situations

Do not include any markdown, commentary, or text outside the JSON payload.`;
  } else {
    // Standard exam prompt
    userPrompt = `Generate exactly ${request.questionCount} multiple-choice exam questions.

Difficulty Level: ${request.difficulty}

Return ONLY valid JSON matching this exact schema:
{
  "questions": [
    {
      "id": "Q1",
      "stem": "Question text here",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "B",
      "conceptIds": ["L1-C01", "L1-C02"],
      "categoryId": "cat_xxx",
      "difficultyTag": "apply|recall|judgement",
      "rationale": {
        "correct": "Why this option is correct",
        "incorrect": {
          "A": "Why option A is incorrect",
          "C": "Why option C is incorrect",
          "D": "Why option D is incorrect"
        }
      }
    }
  ]
}

CRITICAL REQUIREMENTS:
- Each question MUST include "conceptIds" array with concept IDs/names tested by this question
- Each question MUST include "categoryId" matching the category being tested
- Each question MUST include "difficultyTag" (one of: "recall", "apply", "judgement")

Do not include any markdown, commentary, or text outside the JSON payload.`;
  }

  try {
    const apiStartTime = Date.now();
    console.log(`[ChatGPT API] Starting request (prompt length: ${request.systemPrompt.length} chars, user prompt: ${userPrompt.length} chars)`);
    
    // Log full prompts for Level 30 boss exams (for debugging)
    if ((request as any).isBoss && request.questionCount === 20) {
      console.log("\n=== LEVEL 30 BOSS EXAM PROMPT DEBUG ===");
      console.log("\n--- SYSTEM PROMPT (first 2000 chars) ---");
      console.log(request.systemPrompt.substring(0, 2000));
      if (request.systemPrompt.length > 2000) {
        console.log(`\n... (${request.systemPrompt.length - 2000} more characters) ...`);
        console.log("\n--- SYSTEM PROMPT (last 500 chars) ---");
        console.log(request.systemPrompt.substring(request.systemPrompt.length - 500));
      }
      console.log("\n--- USER PROMPT ---");
      console.log(userPrompt);
      console.log("\n--- PROMPT STATS ---");
      console.log(`System prompt: ${request.systemPrompt.length} chars (${Math.round(request.systemPrompt.length / 4)} tokens approx)`);
      console.log(`User prompt: ${userPrompt.length} chars (${Math.round(userPrompt.length / 4)} tokens approx)`);
      console.log(`Total: ${request.systemPrompt.length + userPrompt.length} chars (${Math.round((request.systemPrompt.length + userPrompt.length) / 4)} tokens approx)`);
      
      // Save full prompt to file for easier viewing
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const promptFile = path.join(process.cwd(), "level30-prompt-debug.txt");
        const fullPrompt = `=== LEVEL 30 BOSS EXAM PROMPT ===
Generated at: ${new Date().toISOString()}

--- SYSTEM PROMPT ---
${request.systemPrompt}

--- USER PROMPT ---
${userPrompt}

--- PROMPT STATS ---
System prompt: ${request.systemPrompt.length} chars (${Math.round(request.systemPrompt.length / 4)} tokens approx)
User prompt: ${userPrompt.length} chars (${Math.round(userPrompt.length / 4)} tokens approx)
Total: ${request.systemPrompt.length + userPrompt.length} chars (${Math.round((request.systemPrompt.length + userPrompt.length) / 4)} tokens approx)
`;
        await fs.writeFile(promptFile, fullPrompt, "utf-8");
        console.log(`\n✅ Full prompt saved to: ${promptFile}`);
      } catch (fileError) {
        console.warn("Could not save prompt to file:", fileError);
      }
      
      console.log("=== END LEVEL 30 PROMPT DEBUG ===\n");
    }
    
    const completion = await openai.chat.completions.create(
      {
        model: "gpt-4o", // Using GPT-4o for better JSON output
        messages: [
          {
            role: "system",
            content: request.systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7, // Balance between creativity and consistency
        response_format: { type: "json_object" }, // Force JSON output (OpenAI API constraint)
        // Note: JSON Schema is specified in the system prompt for exact structure validation
      },
      {
        timeout: 120000, // 120 seconds timeout for large prompts (Level 30 boss)
      }
    );
    
    const apiTime = Date.now() - apiStartTime;
    console.log(`[ChatGPT API] Request completed in ${apiTime}ms (${Math.round(apiTime / 1000)}s)`);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from ChatGPT");
    }

    // Parse JSON response
    let parsed: ExamGenerationResponse;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error(`Failed to parse JSON response: ${parseError}`);
      }
    }

    // Validate response structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response format: missing 'questions' array");
    }

    // Validate each question
    for (let i = 0; i < parsed.questions.length; i++) {
      const q = parsed.questions[i];
      if (!q.id || !q.stem || !q.options || !q.correctOptionId || !q.rationale) {
        throw new Error(`Invalid question structure at index ${i}`);
      }
      if (q.options.length !== 4) {
        throw new Error(`Question ${q.id} must have exactly 4 options`);
      }
      const optionIds = q.options.map((opt) => opt.id);
      if (!optionIds.includes(q.correctOptionId)) {
        throw new Error(`Question ${q.id} has invalid correctOptionId: ${q.correctOptionId}`);
      }
    }

    // Ensure we have the requested number of questions
    if (parsed.questions.length !== request.questionCount) {
      console.warn(
        `Requested ${request.questionCount} questions but received ${parsed.questions.length}`
      );
      // Truncate or pad as needed (prefer truncate)
      if (parsed.questions.length > request.questionCount) {
        parsed.questions = parsed.questions.slice(0, request.questionCount);
      }
    }

    return parsed;
  } catch (error: any) {
    console.error("ChatGPT API error:", error);
    throw new Error(`Failed to generate exam questions: ${error.message}`);
  }
}

/**
 * Test ChatGPT connection
 */
export async function testChatGPTConnection(): Promise<boolean> {
  try {
    await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: "Say 'OK' if you can read this.",
        },
      ],
      max_tokens: 10,
    });
    return true;
  } catch (error) {
    console.error("ChatGPT connection test failed:", error);
    return false;
  }
}

