/**
 * API Route to get current user's subscription tier
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/firebase-server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("firebase-session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { subscriptionTier: "free" },
        { status: 200 }
      );
    }

    try {
      const decodedToken = await verifySessionCookie(sessionCookie);
      
      // Get user from database to get subscription tier
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        select: { subscriptionTier: true },
      });

      return NextResponse.json({
        subscriptionTier: user?.subscriptionTier || "free",
      });
    } catch (error: any) {
      console.error("[SUBSCRIPTION TIER] Error:", error);
      return NextResponse.json(
        { subscriptionTier: "free" },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("[SUBSCRIPTION TIER] Error:", error);
    return NextResponse.json(
      { subscriptionTier: "free" },
      { status: 200 }
    );
  }
}

