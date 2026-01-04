import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to handle Firebase authentication
 * Verifies Firebase ID tokens and sets user context
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/", // Landing page - public
    "/auth/signin",
    "/auth/signup",
    "/auth/reset-password",
    "/auth/signin-firebase",
    "/auth/signup-firebase",
    "/pricing", // Pricing page - public
    "/legal", // Legal pages (disclosure, privacy, terms) - public
    "/images", // Static images - public
    "/api/auth", // All /api/auth/* routes (including /api/auth/firebase/verify)
    "/api/stripe/webhook", // Stripe webhook endpoint (no auth required - uses signature verification)
    "/api/onboarding", // All /api/onboarding/* routes
    "/api/debug", // Debug API endpoints
    "/api/health", // Health check endpoint
    "/debug", // Debug pages
    "/test-redirect", // Test route for debugging
  ];

  // Check if route is public
  // Special handling for root path "/" - must be exact match
  const isPublicRoute = pathname === "/" || publicRoutes.some((route) => {
    if (route === "/") return false; // Already handled above
    return pathname.startsWith(route);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get Firebase session cookie (not ID token - session cookies are long-lived)
  const sessionCookie = request.cookies.get("firebase-session")?.value;
  
  // Log for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    const allCookies = request.cookies.getAll();
    console.log("[MIDDLEWARE] ===== REQUEST =====");
    console.log("[MIDDLEWARE] Path:", pathname);
    console.log("[MIDDLEWARE] Method:", request.method);
    console.log("[MIDDLEWARE] All cookies:", allCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`).join(", "));
    console.log("[MIDDLEWARE] firebase-session present:", !!sessionCookie);
    if (sessionCookie) {
      console.log("[MIDDLEWARE] Session cookie length:", sessionCookie.length);
      console.log("[MIDDLEWARE] Session cookie preview:", sessionCookie.substring(0, 20) + "...");
    } else {
      console.log("[MIDDLEWARE] ⚠️ NO SESSION COOKIE FOUND");
    }
  }

  // If no session cookie and route requires auth, redirect to Firebase signin
  if (!sessionCookie && !isPublicRoute) {
    console.log("[MIDDLEWARE] No session cookie, redirecting to signin");
    const signInUrl = new URL("/auth/signin-firebase", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Don't verify session for auth API routes, webhooks, onboarding, or startegizer (they handle their own auth)
  if (pathname.startsWith("/api/auth") || 
      pathname.startsWith("/api/stripe/webhook") || 
      pathname.startsWith("/api/onboarding") ||
      pathname.startsWith("/api/startegizer")) {
    return NextResponse.next();
  }

  // Check if session cookie exists (don't verify in middleware - Edge Runtime doesn't support Firebase Admin SDK)
  // Actual verification happens in API routes/server components where Node.js runtime is available
  if (sessionCookie) {
    // Cookie exists - allow request through
    // Verification will happen in API routes/server components using Node.js runtime
    console.log("[MIDDLEWARE] Session cookie present, allowing request (verification in API routes)");
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (all auth API routes including Firebase)
     * - api/onboarding (onboarding API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - test-redirect (test route for debugging)
     */
    "/((?!api/auth|api/stripe/webhook|api/onboarding|api/startegizer|_next/static|_next/image|favicon.ico|test-redirect).*)",
  ],
};

// Add logging to verify middleware is not interfering
if (process.env.NODE_ENV === "development") {
  console.log("[MIDDLEWARE] Middleware loaded, matcher excludes /api/auth/*");
}

