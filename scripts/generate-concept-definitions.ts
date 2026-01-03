/**
 * Generate Concept Definitions and Scenarios Script (Batch Processing)
 * 
 * This script generates accurate definitions and scenario examples for all 360 curriculum concepts
 * using ChatGPT API in batches to avoid timeouts.
 * 
 * Features:
 * - Batch processing (configurable batch size)
 * - Delays between batches
 * - Resumable (skips concepts that already have proper definitions)
 * - Progress tracking
 * - Error handling (continues on failure)
 * 
 * Run with: npx tsx scripts/generate-concept-definitions.ts
 */

import { prisma } from "../lib/db";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY,
});

// Configuration
const BATCH_SIZE = 10; // Number of concepts to process per batch
const DELAY_BETWEEN_BATCHES_MS = 30000; // 30 seconds delay between batches
const DELAY_BETWEEN_CONCEPTS_MS = 2000; // 2 seconds delay between concepts in a batch

interface ConceptGenerationResult {
  conceptId: string;
  conceptName: string;
  success: boolean;
  error?: string;
  hasDefinition?: boolean;
  hasScenario?: boolean;
}

/**
 * Check if concept already has proper content
 * We'll regenerate all concepts to ensure consistency
 */
function hasProperContent(concept: any): boolean {
  // Always regenerate to ensure consistency and proper format
  return false;
}

/**
 * Generate definition and scenario for a single concept
 */
async function generateConceptContent(
  concept: any
): Promise<ConceptGenerationResult> {
  const result: ConceptGenerationResult = {
    conceptId: concept.id,
    conceptName: concept.concept || concept.name || "Unknown",
    success: false,
  };

  try {
    // Build system prompt
    const systemPrompt = `You are an expert in AI Governance. Your task is to provide accurate, concise definitions with importance and implications explained through scenarios.

CRITICAL REQUIREMENTS:
1. ACCURACY FIRST: Only provide factual, accurate information. Do not invent or speculate.
2. BE CONCISE: Keep it sharp and to the point. Definition should be 80-150 words maximum.
3. AI GOVERNANCE FOCUS: Always explain importance and implications in the context of AI governance.
4. SCENARIO-BASED: Use a realistic scenario to illustrate the concept's importance and implications.
5. NO FALSE INFORMATION: If you're uncertain about any detail, state it clearly or omit it.

Output format: JSON with the following structure:
{
  "definition": "Clear, concise definition (80-150 words) that explains what the concept is, its importance in AI governance, and key implications.",
  "scenarioQuestion": "A realistic AI governance scenario (100-150 words) that illustrates why this concept matters, what happens when it's violated or properly implemented, and its practical implications."
}`;

    // Build user prompt
    const userPrompt = `Generate a concise definition and scenario for this AI Governance concept:

CONCEPT NAME: ${concept.concept || concept.name}
DOMAIN: ${concept.domain || "Not specified"}
CATEGORY: ${concept.category || "Not specified"}
DIFFICULTY: ${concept.difficulty || "Not specified"}

Please provide:
1. DEFINITION (80-150 words): What this concept is, why it matters in AI governance, and its key implications. Be sharp and to the point.
2. SCENARIO (100-150 words): A realistic AI governance scenario that illustrates the concept's importance, what happens when it's violated or properly implemented, and practical implications.

Format: Return JSON with "definition" and "scenarioQuestion" fields only.
Remember: Be accurate, concise, and focused on AI governance context. No false information.`;

    console.log(`  🔄 Generating content for: ${result.conceptName}`);

    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for cost efficiency, can switch to gpt-4o if needed
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more factual, consistent output
      response_format: { type: "json_object" },
    });

    const apiTime = Date.now() - startTime;
    console.log(`  ⏱️  API call completed in ${apiTime}ms`);

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response content from ChatGPT");
    }

    const parsed = JSON.parse(responseContent);

    // Validate response structure
    if (!parsed.definition || parsed.definition.length < 50) {
      throw new Error("Invalid definition: too short or missing");
    }

    if (!parsed.scenarioQuestion || parsed.scenarioQuestion.length < 50) {
      throw new Error("Invalid scenario: too short or missing");
    }

    // Update concept in database
    await prisma.conceptCard.update({
      where: { id: concept.id },
      data: {
        definition: parsed.definition.trim(),
        scenarioQuestion: parsed.scenarioQuestion.trim(),
        examples: null, // Not using examples field for this format
        lastUpdated: new Date(),
      },
    });

    result.success = true;
    result.hasDefinition = true;
    result.hasScenario = true;
    console.log(`  ✅ Successfully generated content (definition: ${parsed.definition.length} chars, scenario: ${parsed.scenarioQuestion.length} chars)`);

    return result;
  } catch (error: any) {
    result.error = error.message || String(error);
    console.error(`  ❌ Error: ${result.error}`);
    return result;
  }
}

/**
 * Process a batch of concepts
 */
async function processBatch(concepts: any[]): Promise<ConceptGenerationResult[]> {
  const results: ConceptGenerationResult[] = [];

  for (const concept of concepts) {
    const result = await generateConceptContent(concept);
    results.push(result);

    // Delay between concepts
    if (concepts.indexOf(concept) < concepts.length - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_BETWEEN_CONCEPTS_MS)
      );
    }
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Starting Concept Definition Generation\n");

  if (!process.env.OPENAI_API_KEY && !process.env.CHATGPT_API_KEY) {
    console.error("❌ Error: OPENAI_API_KEY or CHATGPT_API_KEY not found in environment");
    process.exit(1);
  }

  // Fetch all concepts assigned to levels 1-40
  const challenges = await prisma.challenge.findMany({
    where: { levelNumber: { lte: 40 } },
    select: { concepts: true },
  });

  const assignedConceptIds = new Set<string>();
  challenges.forEach((challenge) => {
    if (Array.isArray(challenge.concepts)) {
      challenge.concepts.forEach((id: string) => assignedConceptIds.add(id));
    }
  });

  // Fetch all concepts
  const allConcepts = await prisma.conceptCard.findMany({
    where: {
      id: { in: Array.from(assignedConceptIds) },
    },
    select: {
      id: true,
      concept: true,
      name: true,
      definition: true,
      scenarioQuestion: true,
      examples: true,
      domain: true,
      category: true,
      difficulty: true,
    },
    orderBy: {
      concept: "asc",
    },
  });

  console.log(`📊 Found ${allConcepts.length} curriculum concepts\n`);

  // Process all concepts to ensure consistency
  const conceptsToProcess = allConcepts;
  console.log(`📝 Processing all ${conceptsToProcess.length} concepts for consistent format\n`);

  // Process in batches
  const batches: any[][] = [];
  for (let i = 0; i < conceptsToProcess.length; i += BATCH_SIZE) {
    batches.push(conceptsToProcess.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Processing ${conceptsToProcess.length} concepts in ${batches.length} batches\n`);

  const allResults: ConceptGenerationResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `\n${"=".repeat(60)}\n📦 Processing Batch ${i + 1}/${batches.length} (${batch.length} concepts)\n${"=".repeat(60)}`
    );

    const batchResults = await processBatch(batch);
    allResults.push(...batchResults);

    const batchSuccess = batchResults.filter((r) => r.success).length;
    const batchFailures = batchResults.filter((r) => !r.success).length;
    successCount += batchSuccess;
    failureCount += batchFailures;

    console.log(
      `\n✅ Batch ${i + 1} complete: ${batchSuccess} succeeded, ${batchFailures} failed`
    );

    // Delay between batches (except for last batch)
    if (i < batches.length - 1) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`);
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS)
      );
    }
  }

  // Final summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total concepts processed: ${allResults.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📈 Success rate: ${((successCount / allResults.length) * 100).toFixed(1)}%`);

  if (failureCount > 0) {
    console.log("\n❌ Failed concepts:");
    allResults
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.conceptName}: ${r.error}`);
      });
  }

  console.log("\n🎉 Concept definition generation complete!");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

