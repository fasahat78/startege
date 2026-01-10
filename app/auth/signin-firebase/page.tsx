"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, getIdToken, signInWithGoogle, signInWithApple } from "@/lib/firebase-auth";
import { setCookie } from "@/lib/cookies";
import { PersistentLogger } from "@/lib/persistent-logger";
import { toast } from "@/components/ui/Toast";

// Initialize persistent logger
if (typeof window !== "undefined") {
  PersistentLogger.init();
}

function SignInFirebaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signIn(email, password);

      // Check if email is verified (optional - Firebase allows unverified signins by default)
      // But we can show a warning if not verified
      if (userCredential.user && !userCredential.user.emailVerified) {
        console.warn("Email not verified. User can still sign in, but verification is recommended.");
        toast("Email not verified. Please verify your email for better security.", "warning", 5000);
      } else {
        toast("Signing in...", "info", 2000);
      }

      // Get ID token
      const idToken = await getIdToken();

      if (!idToken) {
        throw new Error("Failed to get ID token");
      }

      // Don't set cookie client-side - let the verify route set it server-side
      // This ensures the cookie is properly set and persists across navigations
      console.log("[CLIENT] Skipping client-side cookie set - will be set by verify route");

      // Use fetch to handle redirect and errors better
      console.log("[CLIENT] Submitting to verify route...");
      const targetRedirect = redirect || "/dashboard";
      
      PersistentLogger.log("===== STARTING VERIFY =====");
      PersistentLogger.log("Target redirect", targetRedirect);
      PersistentLogger.log("ID Token length", idToken.length);
      
      console.log("[CLIENT] ===== STARTING VERIFY =====");
      console.log("[CLIENT] Target redirect:", targetRedirect);
      console.log("[CLIENT] ID Token length:", idToken.length);
      
      const formData = new FormData();
      formData.append("idToken", idToken);
      formData.append("redirect", targetRedirect);
      
      try {
        console.log("[CLIENT] Submitting to verify route via fetch...");
        const response = await fetch("/api/auth/firebase/verify", {
          method: "POST",
          body: formData,
          credentials: "include",
          redirect: "manual", // Don't follow redirects automatically - handle manually
        });

        // Handle redirect manually to avoid CORS issues
        if (response.status === 303 || response.status === 302 || response.status === 301) {
          const redirectUrl = response.headers.get("Location") || targetRedirect;
          console.log("[CLIENT] Verify successful, redirecting to:", redirectUrl);
          // CRITICAL: Always use current origin to avoid CORS issues with www vs non-www
          const currentOrigin = window.location.origin || window.location.protocol + "//" + window.location.host;
          let finalRedirectUrl: string;
          if (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://")) {
            // If redirect URL is absolute, normalize it to use current origin
            try {
              const redirectUrlObj = new URL(redirectUrl);
              // Extract pathname and search params, but use current origin
              const pathAndQuery = redirectUrlObj.pathname + redirectUrlObj.search + redirectUrlObj.hash;
              finalRedirectUrl = `${currentOrigin}${pathAndQuery}`;
              console.log("[CLIENT] Normalized redirect URL from", redirectUrl, "to", finalRedirectUrl);
            } catch (e) {
              // If URL parsing fails, use redirect URL as-is (fallback)
              console.warn("[CLIENT] Could not parse redirect URL, using as-is:", redirectUrl);
              finalRedirectUrl = redirectUrl;
            }
          } else {
            // Relative URL - prepend current origin
            finalRedirectUrl = `${currentOrigin}${redirectUrl.startsWith("/") ? "" : "/"}${redirectUrl}`;
          }
          console.log("[CLIENT] Final redirect URL (using current origin):", finalRedirectUrl);
          window.location.href = finalRedirectUrl;
          return;
        } else if (response.ok) {
          // Success but no redirect header - use target redirect
          console.log("[CLIENT] Verify successful, redirecting to:", targetRedirect);
          window.location.href = targetRedirect;
          return;
        } else {
          // Error - show to user
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || "Failed to verify session");
        }
      } catch (fetchError: any) {
        PersistentLogger.error("Fetch error", fetchError);
        console.error("[CLIENT] Fetch error:", fetchError);
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = "Failed to sign in";
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast(errorMessage, "error");
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setError("");
    setOauthLoading(provider);
    
    try {
      let userCredential: any;
      
      if (provider === "google") {
        userCredential = await signInWithGoogle();
      } else if (provider === "apple") {
        userCredential = await signInWithApple();
      } else {
        throw new Error("Unsupported provider");
      }

      // Get ID token from the userCredential (more reliable than getIdToken())
      if (!userCredential?.user) {
        throw new Error("Failed to get user from OAuth sign-in");
      }

      const idToken = await userCredential.user.getIdToken();

      if (!idToken) {
        throw new Error("Failed to get ID token");
      }

      // Use fetch to handle redirect and errors better
      const targetRedirect = redirect || "/dashboard";
      
      PersistentLogger.log("===== STARTING OAUTH VERIFY =====");
      PersistentLogger.log("Provider:", provider);
      PersistentLogger.log("Target redirect", targetRedirect);
      PersistentLogger.log("ID Token length", idToken.length);
      
      console.log("[CLIENT] ===== STARTING OAUTH VERIFY =====");
      console.log("[CLIENT] Provider:", provider);
      console.log("[CLIENT] Target redirect:", targetRedirect);
      console.log("[CLIENT] ID Token length:", idToken.length);
      
      const formData = new FormData();
      formData.append("idToken", idToken);
      formData.append("redirect", targetRedirect);
      
      // Add name if available from OAuth provider
      if (userCredential.user?.displayName) {
        formData.append("name", userCredential.user.displayName);
      }
      
      try {
        console.log("[CLIENT] Submitting OAuth verify via fetch...");
        const response = await fetch("/api/auth/firebase/verify", {
          method: "POST",
          body: formData,
          credentials: "include",
          redirect: "manual", // Don't follow redirects automatically - handle manually
        });

        console.log("[CLIENT] Verify response status:", response.status);
        console.log("[CLIENT] Verify response headers:", {
          location: response.headers.get("Location"),
          contentType: response.headers.get("Content-Type"),
        });

        // Handle redirect manually to avoid CORS issues
        if (response.status === 303 || response.status === 302 || response.status === 301) {
          const redirectUrl = response.headers.get("Location") || targetRedirect;
          console.log("[CLIENT] OAuth verify successful, redirecting to:", redirectUrl);
          // CRITICAL: Always use current origin to avoid CORS issues with www vs non-www
          const currentOrigin = window.location.origin || window.location.protocol + "//" + window.location.host;
          let finalRedirectUrl: string;
          if (redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://")) {
            // If redirect URL is absolute, normalize it to use current origin
            try {
              const redirectUrlObj = new URL(redirectUrl);
              // Extract pathname and search params, but use current origin
              const pathAndQuery = redirectUrlObj.pathname + redirectUrlObj.search + redirectUrlObj.hash;
              finalRedirectUrl = `${currentOrigin}${pathAndQuery}`;
              console.log("[CLIENT] Normalized redirect URL from", redirectUrl, "to", finalRedirectUrl);
            } catch (e) {
              // If URL parsing fails, use redirect URL as-is (fallback)
              console.warn("[CLIENT] Could not parse redirect URL, using as-is:", redirectUrl);
              finalRedirectUrl = redirectUrl;
            }
          } else {
            // Relative URL - prepend current origin
            finalRedirectUrl = `${currentOrigin}${redirectUrl.startsWith("/") ? "" : "/"}${redirectUrl}`;
          }
          console.log("[CLIENT] Final redirect URL (using current origin):", finalRedirectUrl);
          window.location.href = finalRedirectUrl;
          return;
        } else if (response.ok) {
          // Success but no redirect header - use target redirect
          console.log("[CLIENT] OAuth verify successful, redirecting to:", targetRedirect);
          window.location.href = targetRedirect;
          return;
        } else {
          // Error - try to get error details
          let errorMessage = "Failed to verify session";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            console.error("[CLIENT] Verify API error:", errorData);
          } catch (jsonError) {
            // If JSON parsing fails, try to get text
            try {
              const errorText = await response.text();
              console.error("[CLIENT] Verify API error (text):", errorText);
              errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
            } catch (textError) {
              console.error("[CLIENT] Could not parse error response:", textError);
              errorMessage = `HTTP ${response.status}: ${response.statusText || "Unknown error"}`;
            }
          }
          throw new Error(errorMessage);
        }
      } catch (fetchError: any) {
        PersistentLogger.error("OAuth fetch error", fetchError);
        console.error("[CLIENT] OAuth fetch error:", fetchError);
        console.error("[CLIENT] OAuth fetch error details:", {
          message: fetchError.message,
          name: fetchError.name,
          stack: fetchError.stack,
        });
        throw fetchError;
      }
    } catch (error: any) {
      console.error("OAuth sign in error:", error);
      
      let errorMessage = `Failed to sign in with ${provider === "google" ? "Google" : "Apple"}`;
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup was closed. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast(errorMessage, "error");
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-card p-8 border-2 border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2">
            Sign In
          </h1>
          <p className="text-muted-foreground">
            Sign in to your Startege account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-error/10 border border-status-error rounded-lg">
            <p className="text-sm text-status-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Email
            </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                    placeholder="you@example.com"
                  />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Password
            </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
                    placeholder="••••••••"
                  />
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/reset-password"
              className="text-sm text-accent hover:text-accent/80"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !!oauthLoading}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={loading || !!oauthLoading}
              className="flex items-center justify-center px-4 py-2 border-2 border-border rounded-lg font-medium hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === "google" ? (
                <span className="text-sm">Loading...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm">Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn("apple")}
              disabled={loading || !!oauthLoading}
              className="flex items-center justify-center px-4 py-2 border-2 border-border rounded-lg font-medium hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading === "apple" ? (
                <span className="text-sm">Loading...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span className="text-sm">Apple</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup-firebase" className="text-accent hover:text-accent/80 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInFirebasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-card p-8 border-2 border-border">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-card-foreground mb-2">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <SignInFirebaseContent />
    </Suspense>
  );
}

