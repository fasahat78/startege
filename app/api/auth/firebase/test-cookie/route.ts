/**
 * Test endpoint to verify cookie setting works
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const testToken = "test-token-" + Date.now();
  
  const response = NextResponse.json({
    success: true,
    message: "Test cookie set",
    token: testToken,
  });
  
  // Set test cookie (using firebase-session name for consistency)
  response.cookies.set("firebase-session", testToken, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    httpOnly: true, // httpOnly for security
    secure: process.env.NODE_ENV === "production",
  });
  
  console.log("[TEST COOKIE] Set test cookie:", testToken);
  
  return response;
}

