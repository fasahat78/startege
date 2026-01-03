/**
 * Exam Option Shuffling Utility
 * 
 * Shuffles exam question options to prevent answer bias and pattern recognition.
 * Tracks the shuffled order so answers can be correctly evaluated.
 */

interface Question {
  id: string;
  stem: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  rationale?: any;
  [key: string]: any;
}

interface ShuffledQuestion extends Question {
  shuffledOptions: Array<{ id: string; text: string }>;
  optionMapping: Record<string, string>; // Maps original option ID to shuffled position
  reverseMapping: Record<string, string>; // Maps shuffled position back to original option ID
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle options for a single question
 * Returns the question with shuffled options and mapping information
 */
export function shuffleQuestionOptions(question: Question): ShuffledQuestion {
  // Create a copy of the options array
  const originalOptions = [...question.options];
  
  // Shuffle the options
  const shuffledOptions = shuffleArray(originalOptions);
  
  // Create mapping: original option ID -> new position (A, B, C, D)
  const optionMapping: Record<string, string> = {};
  const reverseMapping: Record<string, string> = {};
  
  shuffledOptions.forEach((option, index) => {
    const newPosition = ['A', 'B', 'C', 'D'][index];
    optionMapping[option.id] = newPosition;
    reverseMapping[newPosition] = option.id;
  });
  
  // Update option IDs to reflect new positions
  const shuffledOptionsWithNewIds = shuffledOptions.map((option, index) => ({
    ...option,
    id: ['A', 'B', 'C', 'D'][index],
  }));
  
  // Find the new position of the correct answer
  const originalCorrectId = question.correctOptionId;
  const shuffledCorrectId = optionMapping[originalCorrectId];
  
  return {
    ...question,
    options: shuffledOptionsWithNewIds,
    shuffledOptions: shuffledOptionsWithNewIds,
    correctOptionId: shuffledCorrectId,
    optionMapping,
    reverseMapping,
  };
}

/**
 * Shuffle options for all questions in an exam
 * This ensures balanced answer distribution across all options
 */
export function shuffleExamOptions(questions: Question[]): ShuffledQuestion[] {
  return questions.map((question) => shuffleQuestionOptions(question));
}

/**
 * Map a user's selected answer from shuffled position back to original position
 * This is used when submitting answers to ensure correct evaluation
 */
export function mapAnswerToOriginal(
  selectedOptionId: string,
  reverseMapping: Record<string, string>
): string {
  return reverseMapping[selectedOptionId] || selectedOptionId;
}

/**
 * Analyze answer distribution in generated questions
 * Returns a report showing how many correct answers are in each position
 */
export function analyzeAnswerDistribution(questions: Question[]): {
  distribution: Record<string, number>;
  isBalanced: boolean;
  recommendation: string;
} {
  const distribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  
  questions.forEach((q) => {
    const correctId = q.correctOptionId;
    if (correctId in distribution) {
      distribution[correctId]++;
    }
  });
  
  const total = questions.length;
  const expected = total / 4;
  const variance = Object.values(distribution).reduce((sum, count) => {
    return sum + Math.abs(count - expected);
  }, 0);
  
  const isBalanced = variance < total * 0.2; // Allow 20% variance
  
  let recommendation = '';
  if (!isBalanced) {
    const maxOption = Object.entries(distribution).reduce((a, b) => 
      distribution[a[0]] > distribution[b[0]] ? a : b
    )[0];
    const maxCount = distribution[maxOption];
    const percentage = ((maxCount / total) * 100).toFixed(1);
    recommendation = `Warning: ${percentage}% of answers are option ${maxOption}. Consider regenerating with more balanced distribution.`;
  } else {
    recommendation = 'Answer distribution is balanced.';
  }
  
  return {
    distribution,
    isBalanced,
    recommendation,
  };
}

