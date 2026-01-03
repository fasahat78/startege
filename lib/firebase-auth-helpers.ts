/**
 * Helper functions for Firebase authentication in server components
 */

import { cookies } from "next/headers";
import { verifyIdToken } from "./firebase-server";
import { prisma } from "./db";

/**
 * Get the current user from Firebase session cookie
 * Returns null if not authenticated
 * Uses session cookies (long-lived) instead of ID tokens (short-lived)
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("firebase-session")?.value;

    console.log("[FIREBASE AUTH HELPER] ===== getCurrentUser called =====");
    console.log("[FIREBASE AUTH HELPER] Session cookie present:", !!sessionCookie);
    console.log("[FIREBASE AUTH HELPER] Session cookie length:", sessionCookie?.length || 0);
    
    if (!sessionCookie) {
      console.log("[FIREBASE AUTH HELPER] ⚠️ NO SESSION COOKIE - returning null");
      return null;
    }

    console.log("[FIREBASE AUTH HELPER] Verifying session cookie...");
    const { verifySessionCookie } = await import("./firebase-server");
    const decodedToken = await verifySessionCookie(sessionCookie, true);
    console.log("[FIREBASE AUTH HELPER] Session cookie verified, UID:", decodedToken.uid);
    
    console.log("[FIREBASE AUTH HELPER] Looking up user in DB...");
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
      },
    });

    if (user) {
      console.log("[FIREBASE AUTH HELPER] ✅ User found:", user.email);
    } else {
      console.log("[FIREBASE AUTH HELPER] ⚠️ User not found in DB for UID:", decodedToken.uid);
    }

    return user;
  } catch (error: any) {
    // Handle expired session cookies gracefully (don't log as error)
    if (error.code === "auth/session-cookie-expired" || error.message?.includes("session-cookie-expired")) {
      console.log("[FIREBASE AUTH HELPER] ⚠️ Session cookie expired - returning null (user needs to refresh)");
      return null;
    }
    // Log other errors
    console.error("[FIREBASE AUTH HELPER] ❌ Error getting user:", error.message);
    console.error("[FIREBASE AUTH HELPER] Error stack:", error.stack);
    return null;
  }
}

/**
 * Require authentication - redirects to signin if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return user;
}

