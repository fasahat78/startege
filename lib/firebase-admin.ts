/**
 * Firebase Admin SDK Configuration
 * For server-side operations (verifying tokens, setting custom claims, etc.)
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

// Initialize Firebase Admin lazily to avoid import-time errors
let adminAppInstance: App | null = null;
let adminAuthInstance: Auth | null = null;
let initializationError: Error | null = null;

function initializeFirebaseAdmin() {
  // Return cached instances if already initialized
  if (adminAppInstance && adminAuthInstance) {
    return { adminApp: adminAppInstance, adminAuth: adminAuthInstance };
  }

  // Return error if initialization previously failed
  if (initializationError) {
    throw initializationError;
  }

  try {
    if (getApps().length === 0) {
      // Check if we have service account credentials
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
          // Parse the service account key (it's stored as JSON string in env)
          // Remove surrounding quotes if present (from .env.local)
          let keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
          if ((keyString.startsWith("'") && keyString.endsWith("'")) || 
              (keyString.startsWith('"') && keyString.endsWith('"'))) {
            keyString = keyString.slice(1, -1);
          }
          const serviceAccount = JSON.parse(keyString);
          
          adminAppInstance = initializeApp({
            credential: cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
          });
        } catch (parseError: any) {
          console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", parseError.message);
          console.error("Key length:", process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length);
          throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_KEY format: ${parseError.message}`);
        }
      } else if (process.env.FIREBASE_PROJECT_ID) {
        // Use Application Default Credentials (for GCP environments)
        adminAppInstance = initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      } else {
        const error = new Error(
          "Firebase Admin SDK not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_PROJECT_ID in .env.local"
        );
        console.error(error.message);
        initializationError = error;
        throw error;
      }
    } else {
      adminAppInstance = getApps()[0];
    }

    adminAuthInstance = getAuth(adminAppInstance);
    return { adminApp: adminAppInstance, adminAuth: adminAuthInstance };
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error);
    initializationError = error;
    throw error;
  }
}

// Lazy initialization - don't initialize on import
// Initialize when first accessed

export function getAdminAuth(): Auth {
  console.log("[FIREBASE-ADMIN] getAdminAuth called");
  try {
    const { adminAuth } = initializeFirebaseAdmin();
    if (!adminAuth) {
      console.error("[FIREBASE-ADMIN] adminAuth is null after initialization");
      throw new Error("Firebase Admin Auth not initialized");
    }
    console.log("[FIREBASE-ADMIN] Admin Auth returned successfully");
    return adminAuth;
  } catch (error: any) {
    console.error("[FIREBASE-ADMIN] getAdminAuth error:", error.message);
    console.error("[FIREBASE-ADMIN] Error stack:", error.stack);
    throw error;
  }
}

export function getAdminApp(): App {
  const { adminApp } = initializeFirebaseAdmin();
  if (!adminApp) {
    throw new Error("Firebase Admin App not initialized");
  }
  return adminApp;
}

// Export getters for backward compatibility
export const adminAuth = {
  get value() {
    return getAdminAuth();
  }
};

export const adminApp = {
  get value() {
    return getAdminApp();
  }
};

export default getAdminAuth;
