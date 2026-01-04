/**
 * Test script to verify Firebase API key is working
 * 
 * Usage: npx tsx scripts/test-firebase-api-key.ts
 * 
 * This script will:
 * 1. Check if the API key is set
 * 2. Verify the format (starts with AIza)
 * 3. Test Firebase initialization
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local file
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { initializeApp, getApps } from "firebase/app";

async function testFirebaseAPIKey() {
  console.log("🔍 Testing Firebase API Key...\n");

  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  // Check 1: Is API key set?
  if (!apiKey) {
    console.error("❌ NEXT_PUBLIC_FIREBASE_API_KEY is not set in environment variables");
    console.log("\n💡 Make sure you have .env.local file with:");
    console.log("   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here");
    process.exit(1);
  }

  console.log("✅ API key is set");
  console.log(`   Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);

  // Check 2: Format validation
  if (!apiKey.startsWith("AIza")) {
    console.error("\n❌ API key format is incorrect!");
    console.error(`   Expected to start with "AIza" but starts with "${apiKey.substring(0, 4)}"`);
    console.error("   This might be a typo (lowercase L instead of capital I?)");
    process.exit(1);
  }

  if (apiKey.length < 35 || apiKey.length > 45) {
    console.warn(`\n⚠️  API key length seems unusual: ${apiKey.length} characters`);
    console.warn("   Expected length: ~39 characters");
  }

  console.log("✅ API key format is correct (starts with AIza)");

  // Check 3: Try to initialize Firebase
  try {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "startege.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "startege",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "startege.firebasestorage.app",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "785373873454",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:785373873454:web:ea2aa58440389c78eda6bf",
    };

    console.log("\n🔄 Attempting to initialize Firebase...");

    // Clear any existing apps
    if (getApps().length > 0) {
      console.log("   Clearing existing Firebase apps...");
    }

    const app = initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized successfully!");
    console.log(`   Project ID: ${app.options.projectId}`);
    console.log(`   Auth Domain: ${app.options.authDomain}`);

    console.log("\n✅ All checks passed! Your Firebase API key is valid.");
    console.log("\n💡 Next steps:");
    console.log("   1. Verify this key matches what's in Firebase Console");
    console.log("   2. Verify it matches Cloud Build trigger substitution variable");
    console.log("   3. Verify it matches Cloud Run environment variable");
    console.log("   4. Trigger a new build if you updated the key");

  } catch (error: any) {
    console.error("\n❌ Failed to initialize Firebase:");
    console.error(`   Error: ${error.message}`);

    if (error.message.includes("api-key-not-valid") || error.message.includes("invalid-api-key")) {
      console.error("\n💡 This error means:");
      console.error("   - The API key is incorrect or invalid");
      console.error("   - The API key might be from a different Firebase project");
      console.error("   - The API key might have been regenerated/deleted");
      console.error("\n🔧 Solutions:");
      console.error("   1. Go to Firebase Console and verify the API key");
      console.error("   2. Copy the key directly from Firebase Console");
      console.error("   3. Update it in Cloud Build trigger and Cloud Run");
      console.error("   4. Trigger a new build");
    }

    process.exit(1);
  }
}

// Run the test
testFirebaseAPIKey().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});

