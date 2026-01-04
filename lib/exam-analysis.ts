/**
 * ChatGPT Exam Analysis Integration
 * 
 * This module handles ChatGPT analysis of exam attempts to provide
 * personalized feedback, identify learning gaps, and suggest improvements.
 */

import OpenAI from "openai";

// Lazy initialization to prevent build-time errors
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not found in environment variables");
    }
    openaiInstance = new OpenAI({
      apiKey,
    });
  }
  return openaiInstance;
}

// Export a proxy that lazily initializes OpenAI
const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return getOpenAI()[prop as keyof OpenAI];
  },
});

export interface ExamAnalysisRequest {
  questions: Array<{
    id: string;
    stem: string;
    options: Array<{ id: string; text: string }>;
    correctOptionId: string;
    conceptIds?: string[];
    categoryId?: string;
    difficultyTag?: string;
    rationale?: {
      correct?: string;
      incorrect?: Record<string, string>;
    };
  }>;
  userAnswers: Array<{
    questionId: string;
    selectedOptionId: string;
    timeSpent?: number;
  }>;
  score: number;
  percentage: number;
  pass: boolean;
  examType: "LEVEL" | "CATEGORY";
  levelNumber?: number;
  categoryId?: string;
}

export interface ExamAnalysisResult {
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  conceptSpecificFeedback: Array<{
    conceptId: string;
    feedback: string;
    suggestions: string[];
  }>;
  studyPlan: {
    priorityConcepts: string[];
    reviewSuggestions: string[];
    nextSteps: string[];
  };
}

/**
 * Analyze exam attempt using ChatGPT
 * 
 * @param request - Exam analysis request with questions, answers, and results
 * @returns ChatGPT-generated analysis with feedback and recommendations
 */
export async function analyzeExamAttempt(
  request: ExamAnalysisRequest
): Promise<ExamAnalysisResult> {
  if (!process.env.OPENAI_API_KEY && !process.env.CHATGPT_API_KEY) {
    throw new Error("OpenAI API key not found in environment variables");
  }

  // Load analysis prompt from config file
  let systemPrompt: string;
  try {
    const { loadExamAnalysisPrompt } = await import("./prompt-loader");
    systemPrompt = loadExamAnalysisPrompt();
  } catch (error) {
    console.warn("Failed to load exam analysis prompt from file, using hardcoded fallback:", error);
    // Fallback to original hardcoded prompt
    systemPrompt = `You are an expert AI Governance tutor analyzing a student's exam performance. 
Your role is to provide constructive feedback, identify learning gaps, and suggest personalized study recommendations.

Focus on:
- Celebrating strengths and correct understanding
- Identifying specific knowledge gaps
- Providing actionable recommendations
- Creating a personalized study plan`;
  }

  // Build question-answer pairs for analysis
  const qaPairs = request.questions.map((q) => {
    const userAnswer = request.userAnswers.find((a) => a.questionId === q.id);
    const isCorrect = userAnswer?.selectedOptionId === q.correctOptionId;
    const selectedOption = q.options.find((opt) => opt.id === userAnswer?.selectedOptionId);
    const correctOption = q.options.find((opt) => opt.id === q.correctOptionId);

    return {
      questionId: q.id,
      question: q.stem,
      userAnswer: selectedOption?.text || "Not answered",
      correctAnswer: correctOption?.text || "",
      isCorrect,
      concepts: q.conceptIds || [],
      category: q.categoryId || "",
      difficulty: q.difficultyTag || "unknown",
      rationale: q.rationale?.correct || "",
      timeSpent: userAnswer?.timeSpent || 0,
    };
  });

  const userPrompt = `Analyze this exam attempt and provide comprehensive feedback.

EXAM DETAILS:
- Type: ${request.examType}
- ${request.levelNumber ? `Level: ${request.levelNumber}` : `Category: ${request.categoryId}`}
- Score: ${request.score}/${request.questions.length} (${request.percentage.toFixed(1)}%)
- Result: ${request.pass ? "PASSED ✓" : "FAILED ✗"}

QUESTION-BY-QUESTION ANALYSIS:
${qaPairs.map((qa, idx) => `
Question ${idx + 1} (ID: ${qa.questionId}):
- Question: ${qa.question}
- User's Answer: ${qa.userAnswer} ${qa.isCorrect ? "✓ CORRECT" : "✗ INCORRECT"}
- Correct Answer: ${qa.correctAnswer}
- Concepts Tested: ${qa.concepts.join(", ") || "N/A"}
- Category: ${qa.category || "N/A"}
- Difficulty: ${qa.difficulty}
- Rationale: ${qa.rationale}
- Time Spent: ${qa.timeSpent}s
`).join("\n")}

PERFORMANCE SUMMARY:
- Correct: ${qaPairs.filter((qa) => qa.isCorrect).length}/${qaPairs.length}
- Incorrect: ${qaPairs.filter((qa) => !qa.isCorrect).length}/${qaPairs.length}
- Concepts with errors: ${[...new Set(qaPairs.filter((qa) => !qa.isCorrect).flatMap((qa) => qa.concepts))].join(", ") || "None"}

Provide your analysis in this JSON format:
{
  "overallFeedback": "A comprehensive 2-3 sentence summary of the student's performance, highlighting key strengths and areas for improvement.",
  "strengths": ["List 3-5 specific strengths based on correct answers", "e.g., 'Strong understanding of GDPR principles'"],
  "weaknesses": ["List 3-5 specific weaknesses based on incorrect answers", "e.g., 'Confusion between GDPR and AI Act requirements'"],
  "recommendations": ["List 3-5 actionable recommendations", "e.g., 'Review GDPR Article 9 special category data requirements'"],
  "conceptSpecificFeedback": [
    {
      "conceptId": "concept_id_here",
      "feedback": "Specific feedback about this concept based on performance",
      "suggestions": ["Actionable suggestions for improving understanding"]
    }
  ],
  "studyPlan": {
    "priorityConcepts": ["List concept IDs that need the most review"],
    "reviewSuggestions": ["Specific review activities", "e.g., 'Re-read concept cards for GDPR principles'"],
    "nextSteps": ["Immediate next steps", "e.g., 'Complete Level 5 concept cards before retaking exam'"]
  }
}

Be specific, constructive, and encouraging. Focus on actionable insights.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from ChatGPT");
    }

    // Parse JSON response
    let parsed: ExamAnalysisResult;
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
    if (!parsed.overallFeedback || !parsed.strengths || !parsed.weaknesses) {
      throw new Error("Invalid analysis response format");
    }

    return parsed;
  } catch (error: any) {
    console.error("ChatGPT analysis error:", error);
    throw new Error(`Failed to analyze exam attempt: ${error.message}`);
  }
}

