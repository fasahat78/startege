/**
 * Simple test route to verify API routes work
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  console.log("[TEST ROUTE] Test route called");
  return NextResponse.json(
    { 
      success: true, 
      message: "API route is working",
      timestamp: new Date().toISOString()
    },
    { headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(request: Request) {
  console.log("[TEST ROUTE] POST test route called");
  try {
    const body = await request.json();
    return NextResponse.json(
      { 
        success: true, 
        message: "POST request received",
        received: body,
        timestamp: new Date().toISOString()
      },
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

