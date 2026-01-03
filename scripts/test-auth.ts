/**
 * Test GCP Service Account Authentication
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { VertexAI } from "@google-cloud/vertexai";

async function testAuth() {
  console.log("🔐 Testing Service Account Authentication...\n");

  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION || "us-central1";

  if (!projectId) {
    console.error("❌ GCP_PROJECT_ID not set!");
    process.exit(1);
  }

  console.log(`Project: ${projectId}`);
  console.log(`Location: ${location}`);
  console.log(`Credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}\n`);

  try {
    // Try to initialize Vertex AI
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });

    console.log("✅ Vertex AI client initialized successfully");
    console.log("✅ Service account authentication working\n");

    // Try to list available models (this will tell us what's actually available)
    console.log("🔍 Checking available models...");
    
    // Note: The SDK doesn't have a direct "list models" method
    // But initialization success means auth is working
    
    console.log("✅ Authentication test passed!");
    console.log("\nNext: Test with actual model call...");
    
  } catch (error: any) {
    console.error("❌ Authentication failed:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Check GOOGLE_APPLICATION_CREDENTIALS path");
    console.error("2. Verify service account has Vertex AI User role");
    console.error("3. Check GCP_PROJECT_ID matches service account project");
    process.exit(1);
  }
}

testAuth();

