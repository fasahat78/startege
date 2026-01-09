import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { FlashcardStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[FLASHCARD STATS] User ID:", user.id);
    console.log("[FLASHCARD STATS] Attempting to query aIGPFlashcardProgress...");

    let progress;
    try {
      progress = await prisma.aIGPFlashcardProgress.findMany({
        where: { userId: user.id },
        select: {
          status: true,
          timesViewed: true,
        },
      });
      console.log("[FLASHCARD STATS] Query successful, found", progress.length, "records");
    } catch (dbError: any) {
      console.error("[FLASHCARD STATS] Database error:", dbError);
      console.error("[FLASHCARD STATS] Error code:", dbError?.code);
      console.error("[FLASHCARD STATS] Error message:", dbError?.message);
      throw dbError;
    }

    const totalCards = 132; // Total flashcards from batch files

    // Calculate stats - handle case where user has no progress yet
    const totalProgress = progress.length;
    const stats = {
      total: totalCards,
      notStarted: totalCards - totalProgress + progress.filter(p => p.status === FlashcardStatus.NOT_STARTED).length,
      reviewing: progress.filter(p => p.status === FlashcardStatus.REVIEWING).length,
      mastered: progress.filter(p => p.status === FlashcardStatus.MASTERED).length,
      totalViewed: progress.reduce((sum, p) => sum + p.timesViewed, 0),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error("[FLASHCARD STATS] ========== ERROR ==========");
    console.error("[FLASHCARD STATS] Error name:", error?.name);
    console.error("[FLASHCARD STATS] Error code:", error?.code);
    console.error("[FLASHCARD STATS] Error message:", error?.message);
    console.error("[FLASHCARD STATS] Error meta:", JSON.stringify(error?.meta, null, 2));
    console.error("[FLASHCARD STATS] Error stack:", error?.stack);
    console.error("[FLASHCARD STATS] ==========================");
    return NextResponse.json(
      { 
        error: "Failed to fetch stats", 
        details: error.message,
        code: error?.code,
        name: error?.name,
        meta: error?.meta,
      },
      { status: 500 }
    );
  }
}

