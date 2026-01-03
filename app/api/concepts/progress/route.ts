/**
 * Get User Concept Progress
 * 
 * Returns concept-level progress including weak areas and mastery scores
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { getAllConceptProgress, getWeakAreas } from "@/lib/concept-progress";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeWeakAreas = searchParams.get("weakAreas") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");

    const allProgress = await getAllConceptProgress(user.id);
    const weakAreas = includeWeakAreas
      ? await getWeakAreas(user.id, limit)
      : [];

    return NextResponse.json({
      success: true,
      progress: allProgress,
      weakAreas,
      totalConcepts: allProgress.length,
      weakAreaCount: weakAreas.length,
    });
  } catch (error) {
    console.error("Error fetching concept progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

