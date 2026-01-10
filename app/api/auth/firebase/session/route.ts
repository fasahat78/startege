/**
 * API Route to check current Firebase session
 * Returns user info if authenticated via server-side session cookie
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("[SESSION API] Error:", error);
    return NextResponse.json(
      { user: null, error: error.message },
      { status: 500 }
    );
  }
}

