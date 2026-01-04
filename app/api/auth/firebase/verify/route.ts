/**
 * API Route to verify Firebase ID token and sync with database
 * Wrapped in top-level try-catch to ensure JSON is always returned
 */

import { NextResponse } from "next/server";
import { rateLimiters } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: Request) {
  // Rate limiting: Strict limits for authentication endpoints
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                   request.headers.get("x-real-ip") || 
                   "unknown";
  const rateLimitResult = await rateLimiters.auth.limit(clientIp);
  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
    return NextResponse.json(
      { 
        error: "Too many authentication requests", 
        message: "Please wait before trying again.",
        retryAfter 
      },
      { 
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "Access-Control-Allow-Origin": "*",
        }
      }
    );
  }

  // LOG IMMEDIATELY - even before any imports
  if (process.env.NODE_ENV === "development") {
    console.log("[VERIFY ROUTE] ===== POST HANDLER CALLED =====");
    console.log("[VERIFY ROUTE] Timestamp:", new Date().toISOString());
    console.log("[VERIFY ROUTE] URL:", request.url);
    console.log("[VERIFY ROUTE] Method:", request.method);
  }
  
  // Get the origin URL for building redirect URL
  const origin = request.headers.get("origin") || request.headers.get("referer") || "http://localhost:3000";
  // Top-level error handler to catch ANY error, including import errors
  try {
    // Dynamic imports to catch import errors
    let verifyIdToken: any;
    let prisma: any;
    
    try {
      const firebaseServer = await import("@/lib/firebase-server");
      verifyIdToken = firebaseServer.verifyIdToken;
      console.log("[VERIFY ROUTE] Firebase server imported");
    } catch (importError: any) {
      console.error("[VERIFY ROUTE] Firebase server import error:", importError.message);
      return NextResponse.json(
        { error: `Firebase server import failed: ${importError.message}` },
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    try {
      const db = await import("@/lib/db");
      prisma = db.prisma;
      console.log("[VERIFY ROUTE] Database imported");
    } catch (importError: any) {
      console.error("[VERIFY ROUTE] Database import error:", importError.message);
      return NextResponse.json(
        { error: `Database import failed: ${importError.message}` },
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Log that the route was hit
    console.log("[VERIFY ROUTE] ===== ROUTE CALLED =====");
    console.log("[VERIFY ROUTE] Method:", request.method);
    console.log("[VERIFY ROUTE] URL:", request.url);
    console.log("[VERIFY ROUTE] Content-Type:", request.headers.get("content-type") || "not set");
    
    // Parse request body (can be JSON or form data)
    // form.submit() sends application/x-www-form-urlencoded, but Content-Type might not be set
    console.log("[VERIFY ROUTE] Parsing request body...");
    let body: any = {};
    const contentType = request.headers.get("content-type") || "";
    
    try {
      // Try form data first (most common for form.submit())
      // form.submit() sends form-urlencoded data
      if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data") || !contentType.includes("application/json")) {
        try {
          const formData = await request.formData();
          body.idToken = String(formData.get("idToken") || "");
          body.redirect = String(formData.get("redirect") || "");
          body.name = String(formData.get("name") || "");
          console.log("[VERIFY ROUTE] Request body parsed as form data");
          console.log("[VERIFY ROUTE] idToken length:", body.idToken.length);
          console.log("[VERIFY ROUTE] redirect:", body.redirect);
        } catch (formError: any) {
          console.log("[VERIFY ROUTE] Form data parse failed, trying JSON:", formError.message);
          // Fallback to JSON
          body = await request.json();
          console.log("[VERIFY ROUTE] Request body parsed as JSON (fallback)");
        }
      } else {
        // Content-Type explicitly says JSON
        body = await request.json();
        console.log("[VERIFY ROUTE] Request body parsed as JSON");
      }
      console.log("[VERIFY ROUTE] Request body parsed successfully");
    } catch (parseError: any) {
      console.error("[VERIFY ROUTE] Request body parse error:", parseError.message);
      console.error("[VERIFY ROUTE] Parse error stack:", parseError.stack);
      return NextResponse.json(
        { error: `Invalid request body: ${parseError.message}` },
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    const { idToken, name, redirect } = body;
    console.log("[VERIFY ROUTE] idToken present:", !!idToken, "name:", name || "not provided", "redirect:", redirect || "not provided");

    if (!idToken) {
      console.log("[VERIFY ROUTE] Missing idToken");
      return NextResponse.json(
        { error: "ID token is required" },
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verify Firebase token
    console.log("[VERIFY ROUTE] Verifying Firebase token...");
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
      console.log("[VERIFY ROUTE] Token verified successfully, UID:", decodedToken.uid);
    } catch (error: any) {
      console.error("[VERIFY ROUTE] Token verification error:", error.message);
      console.error("[VERIFY ROUTE] Error stack:", error.stack);
      return NextResponse.json(
        { error: error.message || "Failed to verify token" },
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    const { uid, email, email_verified } = decodedToken;
    console.log("[VERIFY ROUTE] Decoded token - email:", email, "verified:", email_verified);

    if (!email) {
      console.log("[VERIFY ROUTE] Missing email in token");
      return NextResponse.json(
        { error: "Email is required" },
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Get custom claims (subscription tier, etc.)
    const subscriptionTier = decodedToken.subscriptionTier || "free";
    const planType = decodedToken.planType || null;
    console.log("[VERIFY ROUTE] Subscription tier:", subscriptionTier);

    // Find or create user in database
    console.log("[VERIFY ROUTE] Looking up user in database...");
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      console.log("[VERIFY ROUTE] User not found, creating new user...");
      // Get name from various sources (OAuth providers may provide displayName)
      const userName = name || decodedToken.name || decodedToken.display_name || email.split("@")[0];
      
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: userName,
          firebaseUid: uid,
          emailVerified: email_verified || false,
          emailVerifiedAt: email_verified ? new Date() : null,
          subscriptionTier: subscriptionTier as "free" | "premium",
        },
        include: {
          subscription: true,
        },
      });
      console.log("[VERIFY ROUTE] User created successfully, ID:", user.id);
    } else {
      console.log("[VERIFY ROUTE] User found, updating...");
      // Get name from various sources for update
      const userName = name || decodedToken.name || decodedToken.display_name;
      
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firebaseUid: uid,
          emailVerified: email_verified || false,
          // Update name if provided and different
          ...(userName && userName !== user.name && {
            name: userName,
          }),
          // Update subscription tier from custom claims if different
          ...(subscriptionTier !== user.subscriptionTier && {
            subscriptionTier: subscriptionTier as "free" | "premium",
          }),
        },
        include: {
          subscription: true,
        },
      });
      console.log("[VERIFY ROUTE] User updated successfully");
    }

    console.log("[VERIFY ROUTE] Returning success response");
    
    // Check onboarding status to determine redirect URL
    let redirectUrl = body.redirect || "/dashboard";
    
    try {
      const { getOnboardingStatus } = await import("@/lib/onboarding-helpers");
      const onboardingStatus = await getOnboardingStatus(user.id);
      console.log("[VERIFY ROUTE] Onboarding status:", onboardingStatus);
      
      // If onboarding not completed, redirect to persona selection
      if (!onboardingStatus || onboardingStatus !== "COMPLETED") {
        redirectUrl = "/onboarding/persona";
        console.log("[VERIFY ROUTE] Will redirect to onboarding:", redirectUrl);
      } else {
        // Use provided redirect or default to dashboard
        redirectUrl = body.redirect || "/dashboard";
        console.log("[VERIFY ROUTE] Will redirect to:", redirectUrl);
      }
    } catch (onboardingError: any) {
      console.error("[VERIFY ROUTE] Error checking onboarding status:", onboardingError);
      // Default to onboarding if we can't check
      redirectUrl = "/onboarding/persona";
    }
    
    // Create Firebase Admin session cookie (long-lived, suitable for SSR)
    // ID tokens expire in ~1 hour, session cookies can last 7 days
    console.log("[VERIFY ROUTE] Creating session cookie from ID token...");
    let sessionCookie: string;
    const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days in SECONDS (Firebase Admin expects seconds)
    
    try {
      const { createSessionCookie } = await import("@/lib/firebase-server");
      sessionCookie = await createSessionCookie(idToken, expiresInSeconds);
      console.log("[VERIFY ROUTE] Session cookie created successfully, length:", sessionCookie.length);
    } catch (cookieError: any) {
      console.error("[VERIFY ROUTE] Failed to create session cookie:", cookieError.message);
      console.error("[VERIFY ROUTE] Cookie error stack:", cookieError.stack);
      // This is a critical error - return JSON error (can't redirect without cookie)
      return NextResponse.json(
        { 
          error: `Failed to create session cookie: ${cookieError.message}`,
          details: process.env.NODE_ENV === "development" ? cookieError.stack : undefined
        },
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Use server-side redirect (303) for POST → redirect
    // 303 is the correct status for POST redirects (browsers treat it as GET)
    // Build absolute URL for redirect - NextResponse.redirect requires absolute URL
    // Use NEXT_PUBLIC_APP_URL if available, otherwise use request headers
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    let baseUrl: string;
    
    if (appUrl) {
      // Use configured app URL (preferred)
      baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
    } else {
      // Fallback: Use request headers (Cloud Run provides correct host)
      const host = request.headers.get('x-forwarded-host') || 
                   request.headers.get('host') || 
                   'localhost:3000';
      const protocol = request.headers.get('x-forwarded-proto') || 
                       (host.includes('localhost') ? 'http' : 'https');
      baseUrl = `${protocol}://${host}`;
    }
    
    const redirectUrlFull = redirectUrl.startsWith("http") 
      ? redirectUrl 
      : `${baseUrl}${redirectUrl}`;
    
    console.log("[VERIFY ROUTE] Redirect URL (full):", redirectUrlFull);
    console.log("[VERIFY ROUTE] Creating redirect response with 303 status...");
    
    const redirectResponse = NextResponse.redirect(redirectUrlFull, { status: 303 });
    
    // Set session cookie with proper attributes
    // httpOnly: true is correct - server components CAN read httpOnly cookies
    redirectResponse.cookies.set("firebase-session", sessionCookie, {
      maxAge: expiresInSeconds, // Already in seconds
      path: "/",
      sameSite: "lax",
      httpOnly: true, // Server components CAN read httpOnly cookies (this is correct!)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
    });
    
    console.log("[VERIFY ROUTE] Cookie set in response:", {
      name: "firebase-session",
      maxAge: expiresInSeconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    
    console.log("[VERIFY ROUTE] ===== SUCCESS =====");
    console.log("[VERIFY ROUTE] User ID:", user.id);
    console.log("[VERIFY ROUTE] User Email:", user.email);
    console.log("[VERIFY ROUTE] Redirect URL:", redirectUrlFull);
    console.log("[VERIFY ROUTE] Session Cookie set:", !!sessionCookie);
    console.log("[VERIFY ROUTE] Session Cookie length:", sessionCookie.length);
    console.log("[VERIFY ROUTE] Using server-side redirect (303)");
    
    return redirectResponse;
  } catch (error: any) {
    // Catch ANY error, including top-level errors
    console.error("[VERIFY ROUTE] TOP-LEVEL ERROR:", error);
    console.error("[VERIFY ROUTE] Error name:", error.name);
    console.error("[VERIFY ROUTE] Error message:", error.message);
    console.error("[VERIFY ROUTE] Error stack:", error.stack);
    
    // Always return JSON, never HTML
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
