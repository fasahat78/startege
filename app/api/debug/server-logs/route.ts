/**
 * Debug endpoint to check recent server logs
 * This helps when server is running in background
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return NextResponse.json({
    message: "Server logs are only visible in the terminal where 'npm run dev' is running.",
    instructions: [
      "1. Open a terminal window",
      "2. Run: cd /Users/fasahatferoze/Desktop/Startege && npm run dev",
      "3. Keep that terminal visible",
      "4. Sign in and watch for [VERIFY ROUTE] logs",
    ],
    note: "If server is already running, check the terminal/console where you started it.",
  });
}

