/**
 * Test Gemini AI Integration
 * 
 * Run: npx tsx scripts/test-gemini.ts
 */

// Load environment variables from .env.local
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { generateResponse, isGeminiConfigured } from "../lib/gemini";

async function testGemini() {
  console.log("🧪 Testing Gemini AI Integration...\n");

  // Check configuration
  if (!isGeminiConfigured()) {
    console.error("❌ Gemini is not configured!");
    console.log("\nPlease ensure .env.local has:");
    console.log("  GCP_PROJECT_ID=startege");
    console.log("  GCP_LOCATION=us-central1");
    console.log("  GOOGLE_APPLICATION_CREDENTIALS=./.secrets/gcp-service-account.json");
    process.exit(1);
  }

  console.log("✅ Configuration check passed\n");

  // Test simple query
  const testPrompt = "What is the EU AI Act? Provide a brief 2-sentence summary.";
  console.log(`📝 Test Query: "${testPrompt}"\n`);
  console.log("⏳ Calling Gemini AI...\n");

  try {
    const response = await generateResponse(testPrompt);
    
    console.log("✅ Success!\n");
    console.log("📄 Response:");
    console.log("─".repeat(60));
    console.log(response.text);
    console.log("─".repeat(60));
    
    if (response.usage) {
      console.log("\n📊 Token Usage:");
      console.log(`  Input tokens: ${response.usage.promptTokens || "N/A"}`);
      console.log(`  Output tokens: ${response.usage.candidatesTokens || "N/A"}`);
      console.log(`  Total tokens: ${response.usage.totalTokens || "N/A"}`);
    }
    
    console.log("\n🎉 Gemini AI integration is working!");
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Verify Vertex AI API is enabled in GCP Console");
    console.error("2. Check service account has 'Vertex AI User' role");
    console.error("3. Verify GOOGLE_APPLICATION_CREDENTIALS path is correct");
    console.error("4. Check GCP project ID matches service account project");
    process.exit(1);
  }
}

testGemini();

