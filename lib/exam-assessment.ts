/**
 * Deterministic Exam Assessment Logic
 * 
 * This module handles server-side scoring of exams.
 * ChatGPT is NEVER used for scoring - only for question generation.
 * 
 * Assessment Rules:
 * - Compare user answers with correctOptionId
 * - Compute score deterministically
 * - Determine pass/fail based on passMark
 * - Store immutable ExamAttempt records
 */

export interface ExamQuestion {
  id: string;
  stem: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  conceptIds?: string[]; // Concept IDs tested by this question
  categoryId?: string; // Category being tested
  difficultyTag?: "recall" | "apply" | "judgement"; // Question difficulty type
  rationale?: {
    correct?: string;
    incorrect?: Record<string, string>;
  };
}

export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  timeSpent?: number; // seconds
}

export interface AssessmentResult {
  score: number; // Raw score (number of correct answers)
  percentage: number; // Percentage score (0-100)
  pass: boolean;
  totalQuestions: number;
  correctCount: number;
  weakConceptIds: string[]; // Concepts where user got questions wrong
  answerFeedback: Array<{
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    rationale?: string;
  }>;
}

export interface AssessmentConfig {
  questionCount: number;
  passMark: number; // Percentage (0-100)
  scoringMethod: "binary"; // Currently only binary supported
  isBoss?: boolean; // Whether this is a boss exam
  bossWeighting?: {
    multiConcept?: number; // Weight for multi-concept questions (default 1.2)
  };
}

/**
 * Assess an exam attempt deterministically
 * 
 * @param questions - Array of exam questions with correct answers
 * @param userAnswers - Array of user's answers
 * @param config - Assessment configuration (passMark, etc.)
 * @returns Assessment result with score, pass/fail, and feedback
 */
export function assessExam(
  questions: ExamQuestion[],
  userAnswers: UserAnswer[],
  config: AssessmentConfig
): AssessmentResult {
  const totalQuestions = questions.length;
  let correctCount = 0;
  const answerFeedback: AssessmentResult["answerFeedback"] = [];

  // Create a map of user answers by questionId for quick lookup
  const answerMap = new Map<string, UserAnswer>();
  userAnswers.forEach((answer) => {
    answerMap.set(answer.questionId, answer);
  });

  // Score each question
  for (const question of questions) {
    const userAnswer = answerMap.get(question.id);
    
    if (!userAnswer) {
      // Question not answered - count as incorrect
      answerFeedback.push({
        questionId: question.id,
        selectedOptionId: "",
        correctOptionId: question.correctOptionId,
        isCorrect: false,
        rationale: question.rationale?.correct || "Question not answered",
      });
      continue;
    }

    const isCorrect = userAnswer.selectedOptionId === question.correctOptionId;
    
    if (isCorrect) {
      correctCount++;
    }

    // Get rationale for feedback
    let rationale: string | undefined;
    if (isCorrect) {
      rationale = question.rationale?.correct;
    } else {
      rationale = question.rationale?.incorrect?.[userAnswer.selectedOptionId] 
        || question.rationale?.correct; // Fallback to correct rationale
    }

    answerFeedback.push({
      questionId: question.id,
      selectedOptionId: userAnswer.selectedOptionId,
      correctOptionId: question.correctOptionId,
      isCorrect,
      rationale,
    });
  }

  // Calculate percentage score
  let percentage: number;
  
  if (config.isBoss && config.bossWeighting?.multiConcept) {
    // Boss exam with weighted scoring
    let totalWeight = 0;
    let weightedScore = 0;
    
    for (const question of questions) {
      const userAnswer = answerMap.get(question.id);
      const isCorrect = userAnswer?.selectedOptionId === question.correctOptionId;
      
      // Determine weight: multi-concept questions get higher weight
      const isMultiConcept = (question.conceptIds?.length || 0) >= 2;
      const weight = isMultiConcept ? (config.bossWeighting.multiConcept || 1.2) : 1.0;
      
      totalWeight += weight;
      if (isCorrect) {
        weightedScore += weight;
      }
    }
    
    percentage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
  } else {
    // Standard binary scoring
    percentage = totalQuestions > 0 
      ? (correctCount / totalQuestions) * 100 
      : 0;
  }

  // Determine pass/fail
  const pass = percentage >= config.passMark;

  // Compute weak concepts (concepts where user got questions wrong)
  const weakConceptIds = new Set<string>();
  answerFeedback.forEach((feedback) => {
    if (!feedback.isCorrect) {
      const question = questions.find((q) => q.id === feedback.questionId);
      if (question?.conceptIds) {
        question.conceptIds.forEach((cid) => weakConceptIds.add(cid));
      }
    }
  });

  return {
    score: correctCount,
    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    pass,
    totalQuestions,
    correctCount,
    answerFeedback,
    weakConceptIds: Array.from(weakConceptIds),
  };
}

/**
 * Get next attempt number for a user and exam
 * 
 * @param examId - Exam ID
 * @param userId - User ID
 * @param existingAttempts - Array of existing ExamAttempt records
 * @returns Next attempt number
 */
export function getNextAttemptNumber(
  examId: string,
  userId: string,
  existingAttempts: Array<{ userId: string; attemptNumber: number }>
): number {
  const userAttempts = existingAttempts
    .filter((a) => a.userId === userId)
    .map((a) => a.attemptNumber)
    .sort((a, b) => b - a); // Sort descending

  return userAttempts.length > 0 ? userAttempts[0] + 1 : 1;
}

