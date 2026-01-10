/**
 * Content Verifier for Market Scan
 * Uses AI to verify article relevance and extract metadata
 */

import { generateResponse } from '@/lib/gemini';

export interface VerificationResult {
  isVerified: boolean;
  relevanceScore: number; // 0-1
  keyTopics: string[];
  affectedFrameworks: string[];
  riskAreas: string[];
  complianceImpact?: 'High' | 'Medium' | 'Low';
  summary?: string;
  reason?: string;
  
  // Enhanced metadata
  sentiment?: 'positive' | 'negative' | 'neutral';
  urgency?: 'breaking' | 'high' | 'medium' | 'low';
  impactScope?: 'global' | 'regional' | 'local' | 'industry_specific';
  affectedIndustries?: string[];
  regulatoryBodies?: string[];
  relatedRegulations?: string[];
  actionItems?: string[];
  timeline?: string;
  geographicRegions?: string[];
  mentionedEntities?: string[];
  enforcementActions?: string[];
  readingTimeMinutes?: number;
  complexityLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language?: string;
  author?: string;
  publisher?: string;
}

/**
 * Verify article relevance and extract metadata
 */
export async function verifyArticle(
  title: string,
  content: string,
  source: string
): Promise<VerificationResult> {
  console.log(`[MARKET_SCAN_VERIFIER] Verifying article: ${title.substring(0, 50)}...`);
  
  // Truncate content for prompt (keep first 2000 chars)
  const truncatedContent = content.substring(0, 2000);
  
  // Calculate reading time estimate (average 200 words per minute)
  const wordCount = content.split(/\s+/).length;
  const estimatedReadingTime = Math.ceil(wordCount / 200);

  const prompt = `Analyze this article for relevance to AI governance, compliance, and regulation. Extract comprehensive metadata to help users filter, search, and understand the content.

Title: ${title}
Source: ${source}
Content: ${truncatedContent}${content.length > 2000 ? '...' : ''}

Provide a JSON response with the following structure:
{
  "isVerified": boolean, // Is this relevant to AI governance?
  "relevanceScore": number, // 0-1 score of relevance
  "keyTopics": string[], // Array of key topics (e.g., ["Data Protection", "Algorithmic Bias", "Transparency"])
  "affectedFrameworks": string[], // Array of affected frameworks (e.g., ["GDPR", "AI Act", "ISO 42001"])
  "riskAreas": string[], // Array of risk areas (e.g., ["Data Protection", "Bias", "Transparency"])
  "complianceImpact": "High" | "Medium" | "Low" | null, // Compliance impact level
  "summary": string, // 2-3 sentence summary
  "reason": string, // Brief reason for verification decision
  
  // Enhanced metadata fields:
  "sentiment": "positive" | "negative" | "neutral" | null, // Overall sentiment of the article
  "urgency": "breaking" | "high" | "medium" | "low" | null, // Urgency/priority level
  "impactScope": "global" | "regional" | "local" | "industry_specific" | null, // Geographic/scope impact (use underscore, not hyphen)
  "affectedIndustries": string[], // Industries affected (e.g., ["Healthcare", "Finance", "Technology", "Education"])
  "regulatoryBodies": string[], // Specific regulatory bodies mentioned (e.g., ["EU Commission", "ICO", "FTC", "NIST"])
  "relatedRegulations": string[], // Specific regulations, laws, or standards mentioned (more detailed than affectedFrameworks)
  "actionItems": string[], // What users should do or be aware of (e.g., ["Review data processing agreements", "Update privacy policies"])
  "timeline": string | null, // Deadlines, effective dates, timelines mentioned (e.g., "Effective January 2025", "Deadline: March 31, 2024")
  "geographicRegions": string[], // Specific geographic regions mentioned (e.g., ["California", "New York", "Texas", "EU Member States"])
  "mentionedEntities": string[], // Companies, organizations, or people mentioned (e.g., ["OpenAI", "Google", "Meta", "European Data Protection Board"])
  "enforcementActions": string[], // Fines, penalties, warnings, sanctions mentioned (e.g., ["€20M fine", "Warning issued", "Compliance order"])
  "complexityLevel": "beginner" | "intermediate" | "advanced" | "expert" | null, // Content complexity level
  "language": string | null, // Language code if not English (e.g., "es", "fr", "de")
  "author": string | null, // Article author if mentioned
  "publisher": string | null // Publisher name if different from source
}

Only return valid JSON, no markdown formatting. Be thorough in extracting metadata - this helps users filter and find relevant content.`;

  try {
    const geminiResponse = await generateResponse(prompt);
    const response = geminiResponse.text;
    
    // Parse JSON response
    let result: VerificationResult;
    try {
      // Try to extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                       response.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, response];
      const jsonText = jsonMatch[1] || response;
      result = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('[MARKET_SCAN_VERIFIER] Failed to parse JSON response:', response);
      // Return default rejection
      return {
        isVerified: false,
        relevanceScore: 0,
        keyTopics: [],
        affectedFrameworks: [],
        riskAreas: [],
        reason: 'Failed to parse verification response',
        readingTimeMinutes: Math.ceil(content.split(/\s+/).length / 200),
      };
    }

    // Calculate reading time if not provided
    if (!result.readingTimeMinutes) {
      const wordCount = content.split(/\s+/).length;
      result.readingTimeMinutes = Math.ceil(wordCount / 200);
    }

    // Validate result structure
    if (typeof result.isVerified !== 'boolean' || typeof result.relevanceScore !== 'number') {
      console.warn('[MARKET_SCAN_VERIFIER] Invalid verification result structure');
      return {
        isVerified: false,
        relevanceScore: 0,
        keyTopics: result.keyTopics || [],
        affectedFrameworks: result.affectedFrameworks || [],
        riskAreas: result.riskAreas || [],
        reason: 'Invalid verification result',
        readingTimeMinutes: result.readingTimeMinutes || Math.ceil(content.split(/\s+/).length / 200),
      };
    }

    console.log(`[MARKET_SCAN_VERIFIER] Verification result: verified=${result.isVerified}, score=${result.relevanceScore}`);
    return result;
  } catch (error: any) {
    console.error('[MARKET_SCAN_VERIFIER] Error during verification:', error.message);
    // Return default rejection on error
      return {
        isVerified: false,
        relevanceScore: 0,
        keyTopics: [],
        affectedFrameworks: [],
        riskAreas: [],
        reason: `Verification error: ${error.message}`,
        readingTimeMinutes: Math.ceil(content.split(/\s+/).length / 200),
      };
  }
}

