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

    // Only initialize if we have the required config (runtime check)
    if (!firebaseConfig.apiKey) {
      throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set in environment variables");
    }

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
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

