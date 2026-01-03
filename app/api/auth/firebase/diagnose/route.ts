/**
 * Diagnostic endpoint to check Firebase auth state and cookie status
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("firebase-session")?.value;
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      cookie: {
        present: !!sessionCookie,
        length: sessionCookie?.length || 0,
        preview: sessionCookie ? `${sessionCookie.substring(0, 20)}...` : null,
      },
      headers: {
        cookie: request.headers.get("cookie") || "none",
        authorization: request.headers.get("authorization") || "none",
        "x-user-id": request.headers.get("x-user-id") || "none",
        "x-user-email": request.headers.get("x-user-email") || "none",
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasFirebaseConfig: !!(process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
        hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      },
    };
    
    // Try to verify session cookie if present
    if (sessionCookie) {
      try {
        const { verifySessionCookie } = await import("@/lib/firebase-server");
        const decodedToken = await verifySessionCookie(sessionCookie, true);
        diagnostics.token = {
          valid: true,
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
        };
      } catch (error: any) {
        diagnostics.token = {
          valid: false,
          error: error.message,
        };
      }
    } else {
      diagnostics.token = {
        valid: false,
        error: "No session cookie present",
      };
    }
    
    return NextResponse.json(diagnostics, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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

