/**
 * Firebase Server-Side Utilities
 * For API routes and server components
 */

import { getAdminAuth } from "./firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

/**
 * Verify Firebase ID token from request headers
 */
export async function verifyIdToken(
  idToken: string
): Promise<DecodedIdToken> {
  console.log("[FIREBASE-SERVER] verifyIdToken called");
  try {
    console.log("[FIREBASE-SERVER] Getting Admin Auth...");
    const adminAuth = getAdminAuth();
    console.log("[FIREBASE-SERVER] Admin Auth obtained, verifying token...");
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    console.log("[FIREBASE-SERVER] Token verified successfully, UID:", decodedToken.uid);
    return decodedToken;
  } catch (error: any) {
    console.error("[FIREBASE-SERVER] Token verification failed:", error.message);
    console.error("[FIREBASE-SERVER] Error stack:", error.stack);
    // Provide more helpful error messages
    if (error.message?.includes("not configured") || error.message?.includes("not initialized")) {
      throw new Error("Firebase Admin SDK not configured. Please check your .env.local file and restart the dev server.");
    }
    throw new Error(`Invalid token: ${error.message}`);
  }
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid: string) {
  const adminAuth = getAdminAuth();
  return adminAuth.getUser(uid);
}

/**
 * Set custom claims for a user (e.g., subscription tier)
 */
export async function setCustomClaims(
  uid: string,
  claims: Record<string, any>
): Promise<void> {
  const adminAuth = getAdminAuth();
  await adminAuth.setCustomUserClaims(uid, claims);
}

/**
 * Get custom claims for a user
 */
export async function getCustomClaims(uid: string): Promise<Record<string, any> | undefined> {
  const adminAuth = getAdminAuth();
  const user = await adminAuth.getUser(uid);
  return user.customClaims;
}

/**
 * Create a user in Firebase Auth
 */
export async function createUser(
  email: string,
  password: string,
  displayName?: string
) {
  const adminAuth = getAdminAuth();
  return adminAuth.createUser({
    email,
    password,
    displayName,
    emailVerified: false,
  });
}

/**
 * Update user email
 */
export async function updateUserEmail(uid: string, email: string) {
  const adminAuth = getAdminAuth();
  return adminAuth.updateUser(uid, { email });
}

/**
 * Delete a user
 */
export async function deleteUser(uid: string) {
  const adminAuth = getAdminAuth();
  return adminAuth.deleteUser(uid);
}

/**
 * Create a Firebase Admin session cookie from an ID token
 * Session cookies are long-lived and suitable for SSR/middleware
 * 
 * @param idToken - Firebase ID token from client
 * @param expiresIn - Expiry time in SECONDS (not milliseconds!)
 */
export async function createSessionCookie(
  idToken: string,
  expiresInSeconds: number = 7 * 24 * 60 * 60 // 7 days in seconds
): Promise<string> {
  console.log("[FIREBASE-SERVER] createSessionCookie called");
  console.log("[FIREBASE-SERVER] Expires in (seconds):", expiresInSeconds);
  try {
    const adminAuth = getAdminAuth();
    // Firebase Admin expects expiresIn in SECONDS, not milliseconds
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { 
      expiresIn: expiresInSeconds 
    });
    console.log("[FIREBASE-SERVER] Session cookie created successfully, length:", sessionCookie.length);
    return sessionCookie;
  } catch (error: any) {
    console.error("[FIREBASE-SERVER] Failed to create session cookie:", error.message);
    console.error("[FIREBASE-SERVER] Error stack:", error.stack);
    throw error;
  }
}

/**
 * Verify a Firebase Admin session cookie
 * Returns decoded token claims
 */
export async function verifySessionCookie(
  sessionCookie: string,
  checkRevoked: boolean = true
): Promise<DecodedIdToken> {
  const adminAuth = getAdminAuth();
  return adminAuth.verifySessionCookie(sessionCookie, checkRevoked);
}

