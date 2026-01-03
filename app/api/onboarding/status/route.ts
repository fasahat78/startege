import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  console.log("[ONBOARDING STATUS] Route called");
  
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      // No authentication - return default values
      return NextResponse.json(
        { 
          hasProfile: false,
          onboardingStatus: "NOT_STARTED",
          profile: null,
        },
        { 
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: {
        interests: true,
        goals: true,
      },
    });

    return NextResponse.json({
      hasProfile: !!profile,
      onboardingStatus: profile?.onboardingStatus || "NOT_STARTED",
      profile: profile || null,
    }, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("[ONBOARDING STATUS] Error:", error);
    console.error("[ONBOARDING STATUS] Error stack:", error.stack);
    
    // Always return JSON
    return NextResponse.json(
      { 
        hasProfile: false,
        onboardingStatus: "NOT_STARTED",
        profile: null,
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { 
        status: 200, // Return 200 with default values
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
