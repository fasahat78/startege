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
    
    // Clear the firebase-session cookie
    response.cookies.delete("firebase-session");
    
    console.log("[SIGNOUT ROUTE] Session cookie cleared");
    
    return response;
  } catch (error: any) {
    console.error("[SIGNOUT ROUTE] Error:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}

