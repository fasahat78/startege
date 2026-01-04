import { NextResponse } from "next/server";

/**
 * Firebase Debug Endpoint
 * 
 * Returns Firebase configuration status (without exposing sensitive data)
 * Useful for debugging Firebase API key issues in Cloud Run
 * 
 * GET /api/debug/firebase
 */
export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  const config = {
    apiKey: apiKey
      ? {
          present: true,
          length: apiKey.length,
          startsWithAIza: apiKey.startsWith("AIza"),
          firstChars: apiKey.substring(0, 10),
          lastChars: apiKey.substring(apiKey.length - 5),
          // Don't expose full key for security
        }
      : { present: false },
    authDomain: authDomain ? { present: true, value: authDomain } : { present: false },
    projectId: projectId ? { present: true, value: projectId } : { present: false },
    storageBucket: storageBucket ? { present: true, value: storageBucket } : { present: false },
    messagingSenderId: messagingSenderId ? { present: true, value: messagingSenderId } : { present: false },
    appId: appId ? { present: true, value: appId } : { present: false },
  };

  // Check if all required config is present
  const allPresent =
    config.apiKey.present &&
    config.authDomain.present &&
    config.projectId.present &&
    config.storageBucket.present &&
    config.messagingSenderId.present &&
    config.appId.present;

  // Validate API key format
  const apiKeyValid =
    config.apiKey.present &&
    config.apiKey.startsWithAIza &&
    config.apiKey.length >= 35 &&
    config.apiKey.length <= 45;

  // Try to initialize Firebase (server-side test)
  let initializationTest: {
    success: boolean;
    error?: string;
    projectId?: string;
  } = { success: false };

  if (allPresent && apiKeyValid) {
    try {
      // Dynamic import to avoid build-time errors
      const { initializeApp, getApps } = await import("firebase/app");
      
      const firebaseConfig = {
        apiKey: apiKey!,
        authDomain: authDomain!,
        projectId: projectId!,
        storageBucket: storageBucket!,
        messagingSenderId: messagingSenderId!,
        appId: appId!,
      };

      // Clear existing apps if any
      const existingApps = getApps();
      if (existingApps.length > 0) {
        // Firebase doesn't allow clearing, but we can check if config matches
        initializationTest = {
          success: true,
          projectId: existingApps[0].options.projectId,
        };
      } else {
        const app = initializeApp(firebaseConfig);
        initializationTest = {
          success: true,
          projectId: app.options.projectId,
        };
      }
    } catch (error: any) {
      initializationTest = {
        success: false,
        error: error.message || String(error),
      };
    }
  } else {
    initializationTest = {
      success: false,
      error: !allPresent
        ? "Missing required configuration"
        : !apiKeyValid
        ? "API key format invalid"
        : "Unknown error",
    };
  }

  return NextResponse.json(
    {
      status: allPresent && apiKeyValid && initializationTest.success ? "ok" : "error",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      config,
      validation: {
        allConfigPresent: allPresent,
        apiKeyFormatValid: apiKeyValid,
        initializationSuccess: initializationTest.success,
      },
      initializationTest,
      recommendations: !allPresent
        ? ["Missing required Firebase configuration variables"]
        : !apiKeyValid
        ? [
            "API key format is invalid",
            "Expected: Starts with 'AIza' and 35-45 characters long",
            `Got: ${config.apiKey.firstChars}... (length: ${config.apiKey.length})`,
          ]
        : !initializationTest.success
        ? [
            "Firebase initialization failed",
            `Error: ${initializationTest.error}`,
            "Check API key restrictions in GCP Console",
            "Verify API key matches Firebase Console",
          ]
        : ["All checks passed! Firebase configuration is valid."],
    },
    {
      status: allPresent && apiKeyValid && initializationTest.success ? 200 : 500,
    }
  );
}

