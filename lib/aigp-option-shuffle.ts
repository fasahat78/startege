/**
 * AIGP Exam Option Shuffling Utility
 * 
 * Shuffles AIGP exam question options to prevent answer bias.
 * AIGP questions use format: Array<{ key: string; text: string }>
 * where key is "A", "B", "C", "D"
 */

interface AIGPOption {
  key: string;
  text: string;
}

interface AIGPQuestion {
  questionId: string;
  options: AIGPOption[];
  correctAnswer: string; // Original key like "A", "B", "C", "D"
  [key: string]: any;
}

interface ShuffledAIGPQuestion extends AIGPQuestion {
  shuffledOptions: AIGPOption[];
  reverseMapping: Record<string, string>; // Maps shuffled key back to original key
}

/**
 * Shuffle an array using Fisher-Yates algorithm with crypto.getRandomValues for better randomness
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  // Use crypto.getRandomValues for cryptographically secure randomness
  const randomValues = new Uint32Array(shuffled.length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < shuffled.length; i++) {
      randomValues[i] = Math.floor(Math.random() * 0xFFFFFFFF);
    }
  }
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Use modulo to get a value between 0 and i
    const j = randomValues[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Shuffle options for a single AIGP question
 * Returns the question with shuffled options and mapping information
 */
export function shuffleAIGPQuestionOptions(question: AIGPQuestion): ShuffledAIGPQuestion {
  // Create a copy of the options array
  const originalOptions = [...question.options];
  
  // Shuffle the options
  const shuffledOptions = shuffleArray(originalOptions);
  
  // Create reverse mapping: shuffled key -> original key
  const reverseMapping: Record<string, string> = {};
  
  shuffledOptions.forEach((option, index) => {
    const shuffledKey = ['A', 'B', 'C', 'D'][index];
    const originalKey = option.key;
    reverseMapping[shuffledKey] = originalKey;
  });
  
  // Update option keys to reflect new positions (A, B, C, D)
  const shuffledOptionsWithNewKeys = shuffledOptions.map((option, index) => ({
    ...option,
    key: ['A', 'B', 'C', 'D'][index],
  }));
  
  return {
    ...question,
    options: shuffledOptionsWithNewKeys,
    shuffledOptions: shuffledOptionsWithNewKeys,
    reverseMapping,
  };
}

/**
 * Map a user's selected answer from shuffled key back to original key
 * This is used when submitting answers to ensure correct evaluation
 */
export function mapAIGPAnswerToOriginal(
  selectedKey: string,
  reverseMapping: Record<string, string>
): string {
  return reverseMapping[selectedKey] || selectedKey;
}

