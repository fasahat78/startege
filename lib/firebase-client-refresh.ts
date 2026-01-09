/**
 * Client-side utility to refresh Firebase session cookie
 * Call this when the user is authenticated on the client but server-side cookie might be expired
 */

import { auth } from "./firebase";
import { getIdToken } from "firebase/auth";

/**
 * Refresh the server-side session cookie using the current Firebase ID token
 * This should be called when the user is authenticated on the client but the server cookie is expired
 */
export async function refreshSessionCookie(redirect?: string): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("[SESSION REFRESH] No authenticated user found");
      return false;
    }

    console.log("[SESSION REFRESH] Getting fresh ID token...");
    const idToken = await getIdToken(user, true); // Force refresh
    
    console.log("[SESSION REFRESH] Refreshing session cookie...");
    const formData = new FormData();
    formData.append("idToken", idToken);
    if (redirect) {
      formData.append("redirect", redirect);
    }

    const response = await fetch("/api/auth/firebase/verify", {
      method: "POST",
      body: formData,
    });

    if (response.ok || response.status === 303) {
      console.log("[SESSION REFRESH] ✅ Session cookie refreshed successfully");
      return true;
    } else {
      // Try to get error details
      const contentType = response.headers.get("content-type");
      let error: any = { error: "Unknown error" };
      
      if (contentType?.includes("application/json")) {
        try {
          error = await response.json();
        } catch (e) {
          console.error("[SESSION REFRESH] Failed to parse JSON error:", e);
          error = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
      } else {
        // Try to read as text if not JSON
        try {
          const text = await response.text();
          error = { error: text || `HTTP ${response.status}: ${response.statusText}` };
        } catch (e) {
          error = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
      }
      
      console.error("[SESSION REFRESH] ❌ Failed to refresh session:", {
        status: response.status,
        statusText: response.statusText,
        contentType,
        error,
      });
      return false;
    }
  } catch (error: any) {
    console.error("[SESSION REFRESH] ❌ Error refreshing session:", error.message);
    return false;
  }
}

