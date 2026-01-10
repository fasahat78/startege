/**
 * API Route to verify Firebase ID token and sync with database
 * Wrapped in top-level try-catch to ensure JSON is always returned
 */

import { NextResponse } from "next/server";
import { rateLimiters } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Handle OPTIONS for CORS
export async function OPTIONS(request: Request) {
  // Get origin from request to allow CORS for custom domain
  const origin = request.headers.get('origin');
  
  // Allow both www and non-www domains, plus localhost for development
  let allowedOrigin = "*";
  if (process.env.NODE_ENV === "production") {
    if (origin) {
      // Check if origin is one of our domains
      if (origin.includes('startege.com') || origin.includes('localhost')) {
        allowedOrigin = origin; // Echo back the exact origin (preserves www vs non-www)
      } else {
        // Fallback to default domain
        allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://startege.com";
      }
    } else {
      // No origin header - use default
      allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://startege.com";
    }
  }
  
  console.log("[VERIFY OPTIONS] Origin:", origin, "Allowed:", allowedOrigin);
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
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
    // Get origin for CORS
    const origin = request.headers.get('origin');
    const allowedOrigin = process.env.NODE_ENV === "production"
      ? (origin && (origin.includes('startege.com') || origin.includes('localhost')) ? origin : process.env.NEXT_PUBLIC_APP_URL || "https://startege.com")
      : "*";
    
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
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Credentials": "true",
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
    
    const { idToken, name, redirect, referralCode: referralCodeFromRequest } = body;
    console.log("[VERIFY ROUTE] idToken present:", !!idToken, "name:", name || "not provided", "redirect:", redirect || "not provided", "referralCode:", referralCodeFromRequest || "none");

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
      
      // Determine early adopter tier based on user count
      const userCount = await prisma.user.count();
      let earlyAdopterTier: "FOUNDING_MEMBER" | "EARLY_ADOPTER" | "LAUNCH_USER" | null = null;
      let isEarlyAdopter = false;

      if (userCount < 100) {
        earlyAdopterTier = "FOUNDING_MEMBER";
        isEarlyAdopter = true;
      } else if (userCount < 500) {
        earlyAdopterTier = "EARLY_ADOPTER";
        isEarlyAdopter = true;
      } else if (userCount < 1000) {
        earlyAdopterTier = "LAUNCH_USER";
        isEarlyAdopter = true;
      }

      // Generate referral code - prefer name over email for better UX
      // Try name first, then email, then fallback to UID
      let base: string;
      if (userName) {
        // Use name: "Fasahat Feroze" -> "FASAHA"
        base = userName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      } else if (email) {
        // Use email prefix: "info@konfidence.ai" -> "INFO"
        base = email.split("@")[0].toUpperCase().slice(0, 6);
      } else {
        // Fallback to UID
        base = uid.slice(0, 6).toUpperCase();
      }
      
      // Ensure base is at least 3 characters
      if (base.length < 3) {
        base = (email?.split("@")[0] || uid).toUpperCase().slice(0, 6);
      }
      
      let referralCode = base;
      let counter = 1;

      // Ensure uniqueness
      while (await prisma.user.findFirst({ where: { referralCode } })) {
        referralCode = `${base}${counter}`;
        counter++;
      }

      // Process referral code if provided
      let referredByUserId: string | null = null;
      if (referralCodeFromRequest) {
        try {
          // Find the referrer by their referral code
          const referrer = await prisma.user.findUnique({
            where: { referralCode: referralCodeFromRequest.toUpperCase() },
            select: { id: true, email: true },
          });
          
          if (referrer && referrer.id !== uid) { // Don't refer yourself
            referredByUserId = referrer.id;
            console.log(`[VERIFY ROUTE] ✅ Referral code found! Referrer: ${referrer.email} (${referrer.id})`);
          } else if (referrer) {
            console.log(`[VERIFY ROUTE] ⚠️ Cannot refer yourself, ignoring referral code`);
          } else {
            console.log(`[VERIFY ROUTE] ⚠️ Referral code "${referralCodeFromRequest}" not found, ignoring`);
          }
        } catch (error: any) {
          console.error(`[VERIFY ROUTE] Error processing referral code:`, error.message);
          // Don't fail user creation if referral processing fails
        }
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: userName,
          firebaseUid: uid,
          emailVerified: email_verified || false,
          emailVerifiedAt: email_verified ? new Date() : null,
          subscriptionTier: subscriptionTier as "free" | "premium",
          isEarlyAdopter,
          earlyAdopterTier,
          earlyAdopterStartDate: isEarlyAdopter ? new Date() : null,
          referralCode,
          referredByUserId,
        },
        include: {
          subscription: true,
        },
      });
      console.log("[VERIFY ROUTE] User created successfully, ID:", user.id);
      
      // Create referral record and update referrer stats if referral was processed
      if (referredByUserId && referralCodeFromRequest) {
        try {
          await prisma.referral.create({
            data: {
              referrerId: referredByUserId,
              refereeId: user.id,
              referralCode: referralCodeFromRequest.toUpperCase(),
              status: "pending",
            },
          });
          
          // Increment referrer's referral count
          await prisma.user.update({
            where: { id: referredByUserId },
            data: {
              referralCount: {
                increment: 1,
              },
            },
          });
          
          console.log(`[VERIFY ROUTE] ✅ Referral record created and referrer count updated for user ${referredByUserId}`);
        } catch (error: any) {
          console.error(`[VERIFY ROUTE] Error creating referral record:`, error.message);
          // Don't fail if referral record creation fails
        }
      }
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
    // CRITICAL: Always prioritize request origin/URL to preserve www vs non-www
    // This prevents CORS errors when redirecting between www and non-www domains
    let baseUrl: string | undefined = undefined;
    
    // Priority 1: Request origin header (most reliable for CORS)
    const requestOriginHeader = request.headers.get('origin');
    if (requestOriginHeader) {
      try {
        const originUrl = new URL(requestOriginHeader);
        baseUrl = originUrl.origin; // This preserves protocol and exact host (www vs non-www)
        console.log("[VERIFY ROUTE] ✅ Using request origin (preserves www/non-www):", baseUrl);
      } catch (e) {
        console.log("[VERIFY ROUTE] Invalid origin URL:", requestOriginHeader);
      }
    }
    
    // Priority 2: Try to extract from request URL itself (if available)
    // Note: In Next.js, request.url might be relative, so we need to construct full URL
    if (!baseUrl && request.url) {
      try {
        // If request.url is absolute, use it directly
        if (request.url.startsWith('http://') || request.url.startsWith('https://')) {
          const requestUrl = new URL(request.url);
          baseUrl = requestUrl.origin;
          console.log("[VERIFY ROUTE] ✅ Using request URL origin (absolute):", baseUrl);
        } else {
          // If relative, construct from headers
          const host = request.headers.get('host');
          const protocol = request.headers.get('x-forwarded-proto') || 'https';
          if (host) {
            baseUrl = `${protocol}://${host}`;
            console.log("[VERIFY ROUTE] ✅ Using request URL origin (constructed from headers):", baseUrl);
          }
        }
      } catch (e) {
        console.log("[VERIFY ROUTE] Could not parse request URL:", request.url, e);
      }
    }
    
    // Priority 3: Try referer header (contains the page URL)
    if (!baseUrl) {
      const referer = request.headers.get('referer');
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          baseUrl = refererUrl.origin;
          console.log("[VERIFY ROUTE] ✅ Using referer origin:", baseUrl);
        } catch (e) {
          console.log("[VERIFY ROUTE] Invalid referer URL:", referer);
        }
      }
    }
    
    // Priority 4: Try NEXT_PUBLIC_APP_URL (only if no origin detected)
    if (!baseUrl) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (appUrl && !appUrl.includes('0.0.0.0')) {
        baseUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
        console.log("[VERIFY ROUTE] ⚠️ Using NEXT_PUBLIC_APP_URL (may not match request origin):", baseUrl);
      } else {
        // Fallback: Use request headers - prioritize origin for CORS compatibility
        // For form POSTs, origin header is most reliable and matches the request origin
        // Note: origin was already checked above, but check again if baseUrl still not set
          const fallbackOrigin = request.headers.get('origin');
        const host = request.headers.get('host');
        const forwardedHost = request.headers.get('x-forwarded-host');
        const referer = request.headers.get('referer');
        
        // Determine host - prioritize origin for form POSTs (matches CORS origin)
        // CRITICAL: Must match the exact origin (including www vs non-www) to avoid CORS errors
        let finalHost: string | null = null;
        if (fallbackOrigin) {
          try {
            const originUrl = new URL(fallbackOrigin);
            finalHost = originUrl.host; // This preserves www vs non-www
            console.log("[VERIFY ROUTE] Using fallback origin header:", finalHost);
          } catch (e) {
            console.log("[VERIFY ROUTE] Invalid fallback origin URL:", fallbackOrigin);
          }
        } else if (host && !host.includes('0.0.0.0') && host !== 'localhost:8080') {
          finalHost = host;
          console.log("[VERIFY ROUTE] Using host header:", finalHost);
        } else if (forwardedHost && !forwardedHost.includes('0.0.0.0')) {
          finalHost = forwardedHost;
          console.log("[VERIFY ROUTE] Using x-forwarded-host:", finalHost);
        } else if (referer) {
          try {
            const refererUrl = new URL(referer);
            finalHost = refererUrl.host;
            console.log("[VERIFY ROUTE] Using referer header:", finalHost);
          } catch (e) {
            console.log("[VERIFY ROUTE] Invalid referer URL:", referer);
          }
        }
        
        // Determine protocol - ensure it includes ://
        let protocol = request.headers.get('x-forwarded-proto') || 
                       (finalHost?.includes('localhost') ? 'http' : 'https');
        
        // Ensure protocol has :// (remove any existing :// to avoid double slashes)
        protocol = protocol.replace(/:\/\/$/, '').replace(/\/\/$/, '');
        if (!protocol.includes('://')) {
          protocol = protocol + '://';
        }
        
        if (finalHost) {
          baseUrl = `${protocol}${finalHost}`;
          console.log("[VERIFY ROUTE] Using headers - baseUrl:", baseUrl);
        } else {
          // Last resort: use localhost:3000 for development
          // In production, ALWAYS use custom domain to prevent CORS issues
          if (process.env.NODE_ENV === 'development') {
            baseUrl = 'http://localhost:3000';
            console.warn("[VERIFY ROUTE] Could not determine baseUrl, using localhost:3000 for development");
          } else {
            // In production, ALWAYS prefer custom domain over Cloud Run URL
            // This prevents CORS issues when custom domain is mapped
            // Priority: NEXT_PUBLIC_APP_URL > hardcoded startege.com > origin from request
            const customDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://startege.com';
            baseUrl = customDomain.endsWith('/') ? customDomain.slice(0, -1) : customDomain;
            console.warn("[VERIFY ROUTE] Could not determine baseUrl from headers, using custom domain:", baseUrl);
            console.warn("[VERIFY ROUTE] NOTE: Set NEXT_PUBLIC_APP_URL env var for best results");
          }
        }
      }
    }
    
    // Ensure baseUrl is set - this is critical for CORS
    if (!baseUrl) {
      console.error("[VERIFY ROUTE] ❌ CRITICAL: baseUrl is not set! This will cause CORS errors.");
      console.error("[VERIFY ROUTE] Request origin:", request.headers.get('origin'));
      console.error("[VERIFY ROUTE] Request host:", request.headers.get('host'));
      console.error("[VERIFY ROUTE] Request URL:", request.url);
      // Last resort: use origin from request if available
      const lastResortOrigin = request.headers.get('origin');
      if (lastResortOrigin) {
        baseUrl = lastResortOrigin;
        console.warn("[VERIFY ROUTE] ⚠️ Using origin as last resort:", baseUrl);
      } else {
        baseUrl = 'https://startege.com'; // Fallback - but this might cause CORS issues
        console.error("[VERIFY ROUTE] ❌ Using hardcoded fallback - CORS errors may occur:", baseUrl);
      }
    }
    
    let redirectUrlFull = redirectUrl.startsWith("http") 
      ? redirectUrl 
      : `${baseUrl}${redirectUrl}`;
    
    // CRITICAL: Verify redirect URL matches request origin to prevent CORS
    // Even with redirect: "manual", browsers may still check CORS on redirect URLs
    const requestOrigin = request.headers.get('origin');
    if (requestOrigin) {
      try {
        const originUrl = new URL(requestOrigin);
        const redirectUrlObj = new URL(redirectUrlFull);
        if (originUrl.origin !== redirectUrlObj.origin) {
          console.warn("[VERIFY ROUTE] ⚠️ WARNING: Redirect origin doesn't match request origin!");
          console.warn("[VERIFY ROUTE] Request origin:", originUrl.origin);
          console.warn("[VERIFY ROUTE] Redirect origin:", redirectUrlObj.origin);
          // Fix it by using request origin
          const pathAndQuery = redirectUrlObj.pathname + redirectUrlObj.search + redirectUrlObj.hash;
          redirectUrlFull = `${originUrl.origin}${pathAndQuery}`;
          console.warn("[VERIFY ROUTE] ✅ Corrected redirect URL to match request origin:", redirectUrlFull);
        } else {
          console.log("[VERIFY ROUTE] ✅ Redirect origin matches request origin:", originUrl.origin);
        }
      } catch (e) {
        console.error("[VERIFY ROUTE] Error comparing origins:", e);
      }
    }
    
    console.log("[VERIFY ROUTE] Redirect URL (full):", redirectUrlFull);
    console.log("[VERIFY ROUTE] Request origin was:", requestOrigin);
    console.log("[VERIFY ROUTE] baseUrl used:", baseUrl);
    console.log("[VERIFY ROUTE] Creating redirect response with 303 status...");
    
    const redirectResponse = NextResponse.redirect(redirectUrlFull, { status: 303 });
    
    // Set session cookie with proper attributes
    // httpOnly: true is correct - server components CAN read httpOnly cookies
    // sameSite: "lax" allows cookies to be sent on top-level navigations (like Stripe redirects)
    // Domain attribute: Only set for custom domains, NOT for Cloud Run (each service has unique subdomain)
    const isProduction = process.env.NODE_ENV === "production";
    // Get appUrl for domain cookie setting
    const appUrlForCookie = process.env.NEXT_PUBLIC_APP_URL;
    let domain: string | undefined = undefined;
    
    if (isProduction && appUrlForCookie) {
      try {
        const url = new URL(appUrlForCookie);
        const hostname = url.hostname;
        
        // Only set domain for custom domains (not Cloud Run or other platform subdomains)
        // Cloud Run URLs are like: startege-785373873454.us-central1.run.app
        // Custom domains would be like: app.example.com or example.com
        const isCloudRun = hostname.includes('.run.app') || hostname.includes('.cloudfunctions.net');
        const isPlatformSubdomain = hostname.includes('.vercel.app') || hostname.includes('.netlify.app');
        
        if (!isCloudRun && !isPlatformSubdomain) {
          // Custom domain - extract base domain (remove www. prefix)
          domain = hostname.replace(/^www\./, '');
          // For custom domains, we might want to set domain to the base domain
          // But for now, let's not set it to avoid cookie sharing issues
          // Only set domain if it's a clear custom domain pattern
          if (hostname.split('.').length <= 3) {
            // Simple domain like example.com or app.example.com
            const parts = hostname.split('.');
            if (parts.length === 2) {
              // example.com - set domain to the base domain
              domain = hostname;
            } else if (parts.length === 3 && parts[0] !== 'www') {
              // app.example.com - don't set domain (cookie should be scoped to exact hostname)
              domain = undefined;
            }
          } else {
            // Complex subdomain - don't set domain
            domain = undefined;
          }
        }
      } catch (e) {
        console.warn("[VERIFY ROUTE] Failed to parse appUrl for domain extraction:", e);
        domain = undefined;
      }
    }
    
    redirectResponse.cookies.set("firebase-session", sessionCookie, {
      maxAge: expiresInSeconds, // Already in seconds
      path: "/",
      sameSite: "lax", // Allows cookies on top-level navigations (Stripe redirects)
      httpOnly: true, // Server components CAN read httpOnly cookies (this is correct!)
      secure: isProduction, // HTTPS only in production
      // Don't set domain for Cloud Run - let browser use exact hostname
      // Only set domain for simple custom domains (like example.com)
      ...(domain && { domain: domain }),
    });
    
    console.log("[VERIFY ROUTE] Cookie set in response:", {
      name: "firebase-session",
      maxAge: expiresInSeconds,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      domain: domain || "not set (using exact hostname)",
      path: "/",
    });
    
    // Add CORS headers to redirect response to prevent CORS errors
    const corsOrigin = request.headers.get('origin');
    const allowedOrigin = process.env.NODE_ENV === "production"
      ? (corsOrigin && (corsOrigin.includes('startege.com') || corsOrigin.includes('localhost')) ? corsOrigin : process.env.NEXT_PUBLIC_APP_URL || "https://startege.com")
      : "*";
    
    redirectResponse.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    redirectResponse.headers.set("Access-Control-Allow-Credentials", "true");
    
    console.log("[VERIFY ROUTE] ===== SUCCESS =====");
    console.log("[VERIFY ROUTE] User ID:", user.id);
    console.log("[VERIFY ROUTE] User Email:", user.email);
    console.log("[VERIFY ROUTE] Redirect URL:", redirectUrlFull);
    console.log("[VERIFY ROUTE] Session Cookie set:", !!sessionCookie);
    console.log("[VERIFY ROUTE] Session Cookie length:", sessionCookie.length);
    console.log("[VERIFY ROUTE] Using server-side redirect (303)");
    console.log("[VERIFY ROUTE] CORS Origin:", allowedOrigin);
    
    return redirectResponse;
  } catch (error: any) {
    // Catch ANY error, including top-level errors
    console.error("[VERIFY ROUTE] TOP-LEVEL ERROR:", error);
    console.error("[VERIFY ROUTE] Error name:", error.name);
    console.error("[VERIFY ROUTE] Error message:", error.message);
    console.error("[VERIFY ROUTE] Error stack:", error.stack);
    
    // Get origin for CORS
    const errorCorsOrigin = request.headers.get('origin');
    const allowedOrigin = process.env.NODE_ENV === "production"
      ? (errorCorsOrigin && (errorCorsOrigin.includes('startege.com') || errorCorsOrigin.includes('localhost')) ? errorCorsOrigin : process.env.NEXT_PUBLIC_APP_URL || "https://startege.com")
      : "*";
    
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
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  }
}
