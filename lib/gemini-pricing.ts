/**
 * Gemini API Pricing Calculator
 * Based on Google Vertex AI Gemini pricing (as of 2024)
 * 
 * Pricing Model:
 * - Input tokens: ~$0.000125 per 1K tokens (gemini-1.5-pro)
 * - Output tokens: ~$0.000375 per 1K tokens (gemini-1.5-pro)
 * - Input tokens: ~$0.000075 per 1K tokens (gemini-1.5-flash)
 * - Output tokens: ~$0.0003 per 1K tokens (gemini-1.5-flash)
 */

export const GEMINI_PRICING = {
  // Gemini 1.5 Pro (default for Startegizer)
  PRO: {
    input: 0.000125,  // $0.000125 per 1K tokens
    output: 0.000375, // $0.000375 per 1K tokens
  },
  // Gemini 1.5 Flash (for faster/cheaper operations)
  FLASH: {
    input: 0.000075,  // $0.000075 per 1K tokens
    output: 0.0003,   // $0.0003 per 1K tokens
  },
} as const;

export type GeminiModel = "pro" | "flash";

/**
 * Calculate API cost in cents based on token usage
 * @param inputTokens Number of input tokens
 * @param outputTokens Number of output tokens
 * @param model Gemini model type (default: "pro")
 * @returns Cost in cents (rounded to nearest cent)
 */
export function calculateGeminiCost(
  inputTokens: number,
  outputTokens: number,
  model: GeminiModel = "pro"
): number {
  const pricing = GEMINI_PRICING[model.toUpperCase() as keyof typeof GEMINI_PRICING];
  
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  const totalCostUSD = inputCost + outputCost;
  
  // Convert to cents and round to nearest cent
  return Math.round(totalCostUSD * 100);
}

/**
 * Calculate API cost from token counts object
 * @param tokens Object with inputTokens and outputTokens
 * @param model Gemini model type (default: "pro")
 * @returns Cost in cents
 */
export function calculateCostFromTokens(
  tokens: { inputTokens: number; outputTokens: number },
  model: GeminiModel = "pro"
): number {
  return calculateGeminiCost(tokens.inputTokens, tokens.outputTokens, model);
}

/**
 * Estimate tokens from text (rough approximation)
 * 1 token ≈ 4 characters for English text
 * @param text Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate maximum API calls possible with given credits
 * @param creditsInCents Credits available in cents
 * @param avgInputTokens Average input tokens per call
 * @param avgOutputTokens Average output tokens per call
 * @param model Gemini model type (default: "pro")
 * @returns Maximum number of API calls
 */
export function calculateMaxApiCalls(
  creditsInCents: number,
  avgInputTokens: number = 2000,
  avgOutputTokens: number = 1000,
  model: GeminiModel = "pro"
): number {
  const costPerCall = calculateGeminiCost(avgInputTokens, avgOutputTokens, model);
  if (costPerCall === 0) return Infinity;
  return Math.floor(creditsInCents / costPerCall);
}

/**
 * Credit allocation model: Fixed pricing
 * - Startegizer: 10 credits per API call (premium AI tutor)
 * - $5 = 250 credits = 25 API calls
 * - Base rate: 50 credits per dollar
 * - Bundles may include bonuses
 * 
 * @param purchasePriceInCents Purchase price in cents
 * @returns API usage credits (base: 50 credits per dollar, bundles may have bonuses)
 */
export function calculateApiUsageCredits(purchasePriceInCents: number): number {
  // Check if it matches a bundle (which may have bonuses)
  const bundle = getCreditBundleByPrice(purchasePriceInCents);
  if (bundle) {
    return bundle.apiUsageCredits;
  }
  
  // Default: 50 credits per dollar (base rate)
  return Math.floor(purchasePriceInCents * 0.5); // 50 credits per dollar
}

/**
 * Credit bundle configurations
 * Fixed cost: 10 credits per API call (Startegizer premium AI tutor)
 * Purchase price → Credits → API calls
 */
export const CREDIT_BUNDLES = {
  SMALL: {
    purchasePrice: 500,      // $5.00
    apiUsageCredits: 250,    // 250 credits = 25 API calls
    label: "Small Top-Up",
  },
  STANDARD: {
    purchasePrice: 1000,     // $10.00
    apiUsageCredits: 550,    // 550 credits = 55 API calls (10% bonus)
    label: "Standard Top-Up",
  },
  LARGE: {
    purchasePrice: 2500,      // $25.00
    apiUsageCredits: 1500,   // 1500 credits = 150 API calls (20% bonus)
    label: "Large Top-Up",
  },
} as const;

/**
 * Get credit bundle by purchase price
 */
export function getCreditBundleByPrice(purchasePriceInCents: number): typeof CREDIT_BUNDLES[keyof typeof CREDIT_BUNDLES] | null {
  const bundle = Object.values(CREDIT_BUNDLES).find(
    (b) => b.purchasePrice === purchasePriceInCents
  );
  return bundle || null;
}

