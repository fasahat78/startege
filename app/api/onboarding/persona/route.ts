import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { PersonaType, OnboardingStatus } from "@prisma/client";
import { getNextOnboardingStatus } from "@/lib/onboarding-helpers";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { personaType, customPersona } = body;

    if (!personaType) {
      return NextResponse.json(
        { error: "Persona type is required" },
        { status: 400 }
      );
    }

    // Validate persona type
    if (!Object.values(PersonaType).includes(personaType)) {
      return NextResponse.json(
        { error: "Invalid persona type" },
        { status: 400 }
      );
    }

    // If OTHER persona, customPersona is required
    if (personaType === PersonaType.OTHER && !customPersona) {
      return NextResponse.json(
        { error: "Custom persona description is required for 'Other' persona" },
        { status: 400 }
      );
    }

    // Create or update user profile
    // @ts-ignore - Prisma types not fully recognized by TypeScript yet
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        personaType: personaType as PersonaType,
        customPersona: personaType === PersonaType.OTHER ? customPersona : null,
        onboardingStatus: OnboardingStatus.PERSONA_SELECTED,
      },
      create: {
        userId: user.id,
        personaType: personaType as PersonaType,
        customPersona: personaType === PersonaType.OTHER ? customPersona : null,
        onboardingStatus: OnboardingStatus.PERSONA_SELECTED,
      },
    });

    return NextResponse.json({
      success: true,
      profile,
      nextStep: "knowledge", // Next step in onboarding
    });
  } catch (error) {
    console.error("Persona selection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

