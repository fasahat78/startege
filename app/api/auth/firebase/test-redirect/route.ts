/**
 * MINIMAL TEST: Does NextResponse.redirect with cookie work?
 * This will help us isolate if the issue is with redirects or Firebase
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log("[TEST-REDIRECT] ===== TEST ROUTE CALLED =====");
  console.log("[TEST-REDIRECT] Method:", request.method);
  console.log("[TEST-REDIRECT] URL:", request.url);
  
  try {
    // Build redirect URL - use /debug/auth so middleware doesn't block it
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const redirectUrl = `${baseUrl}/debug/auth`;
    
    console.log("[TEST-REDIRECT] Redirect URL:", redirectUrl);
    console.log("[TEST-REDIRECT] Creating redirect response...");
    
    const redirectResponse = NextResponse.redirect(redirectUrl, { status: 303 });
    
    // Set a test cookie
    redirectResponse.cookies.set("test-session", "test-value-12345", {
      maxAge: 60 * 60, // 1 hour
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    
    console.log("[TEST-REDIRECT] Cookie set, returning redirect...");
    console.log("[TEST-REDIRECT] Response status:", 303);
    
    return redirectResponse;
  } catch (error: any) {
    console.error("[TEST-REDIRECT] ERROR:", error);
    return NextResponse.json(
      { error: error.message, test: "failed" },
      { status: 500 }
    );
  }
}

