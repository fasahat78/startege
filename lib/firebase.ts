/**
 * Firebase Client SDK Configuration
 * For client-side authentication
 * 
 * Lazy initialization to prevent build-time errors when env vars are not set
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // Enhanced error logging
    if (!firebaseConfig.apiKey) {
      const error = new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set in environment variables");
      console.error("[FIREBASE] Configuration Error:", error.message);
      console.error("[FIREBASE] Available env vars:", {
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        nodeEnv: process.env.NODE_ENV,
      });
      throw error;
    }

    // Validate API key format
    if (!firebaseConfig.apiKey.startsWith("AIza")) {
      const error = new Error(
        `Invalid Firebase API key format. Expected to start with "AIza" but got "${firebaseConfig.apiKey.substring(0, 4)}". ` +
        `Full key (first 10 chars): ${firebaseConfig.apiKey.substring(0, 10)}...`
      );
      console.error("[FIREBASE] API Key Format Error:", error.message);
      throw error;
    }

    try {
      if (getApps().length === 0) {
        console.log("[FIREBASE] Initializing Firebase app...");
        console.log("[FIREBASE] Config:", {
          apiKey: `${firebaseConfig.apiKey.substring(0, 10)}...`,
          authDomain: firebaseConfig.authDomain,
          projectId: firebaseConfig.projectId,
        });
        app = initializeApp(firebaseConfig);
        console.log("[FIREBASE] Firebase initialized successfully");
      } else {
        app = getApps()[0];
        console.log("[FIREBASE] Using existing Firebase app");
      }
    } catch (error: any) {
      console.error("[FIREBASE] Initialization Error:", error.message);
      console.error("[FIREBASE] Error Details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
  return app;
}

function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

// Export lazy-initialized auth
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAuthInstance();
    const value = instance[prop as keyof Auth];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
}) as Auth;

// Export lazy-initialized app
export default new Proxy({} as FirebaseApp, {
  get(_target, prop) {
    const instance = getFirebaseApp();
    return instance[prop as keyof FirebaseApp];
  },
}) as FirebaseApp;

