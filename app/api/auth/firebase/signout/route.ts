/**
 * API Route to sign out Firebase user
 * Clears the firebase-session cookie
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear the firebase-session cookie with the same domain settings as when it was set
    // This ensures the cookie is properly cleared in production
    const isProduction = process.env.NODE_ENV === "production";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    let domain: string | undefined = undefined;
    
    if (isProduction && appUrl) {
      try {
        const url = new URL(appUrl);
        const hostname = url.hostname;
        
        // Only set domain for custom domains (not Cloud Run or other platform subdomains)
        const isCloudRun = hostname.includes('.run.app') || hostname.includes('.cloudfunctions.net');
        const isPlatformSubdomain = hostname.includes('.vercel.app') || hostname.includes('.netlify.app');
        
        if (!isCloudRun && !isPlatformSubdomain) {
          // Custom domain - extract base domain (remove www. prefix)
          const cleanHostname = hostname.replace(/^www\./, '');
          // Only set domain if it's a simple custom domain
          if (cleanHostname.split('.').length === 2) {
            domain = cleanHostname;
          }
        }
      } catch (e) {
        console.warn("[SIGNOUT ROUTE] Failed to parse appUrl for domain extraction:", e);
        domain = undefined;
      }
    }
    
    // Delete cookie with same attributes as when it was set
    response.cookies.set("firebase-session", "", {
      maxAge: 0, // Expire immediately
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: isProduction,
      ...(domain && { domain: domain }), // Only set domain for custom domains
    });
    
    console.log("[SIGNOUT ROUTE] Session cookie cleared", {
      domain: domain || "not set",
      secure: isProduction,
    });
    
    return response;
  } catch (error: any) {
    console.error("[SIGNOUT ROUTE] Error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}

