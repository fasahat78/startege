import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase-auth-helpers";
import { prisma } from "@/lib/db";
import { FlashcardStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

// GET: Fetch user's flashcard progress
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[FLASHCARD PROGRESS GET] User ID:", user.id);
    console.log("[FLASHCARD PROGRESS GET] Attempting to query aIGPFlashcardProgress...");
    console.log("[FLASHCARD PROGRESS GET] Prisma client has aIGPFlashcardProgress:", typeof prisma.aIGPFlashcardProgress);
    console.log("[FLASHCARD PROGRESS GET] FlashcardStatus enum:", FlashcardStatus);

    let progress;
    try {
      progress = await prisma.aIGPFlashcardProgress.findMany({
        where: { userId: user.id },
        select: {
          flashcardId: true,
          status: true,
          timesViewed: true,
          timesCorrect: true,
          lastViewedAt: true,
          masteredAt: true,
        },
      });
      console.log("[FLASHCARD PROGRESS GET] Query successful, found", progress.length, "records");
    } catch (dbError: any) {
      console.error("[FLASHCARD PROGRESS GET] Database error:", dbError);
      console.error("[FLASHCARD PROGRESS GET] Error code:", dbError?.code);
      console.error("[FLASHCARD PROGRESS GET] Error message:", dbError?.message);
      throw dbError;
    }

    // Convert to map for easy lookup
    const progressMap = new Map(
      progress.map(p => [p.flashcardId, p])
    );

    return NextResponse.json({
      success: true,
      progress: Object.fromEntries(progressMap),
    });
  } catch (error: any) {
    console.error("[FLASHCARD PROGRESS GET] ========== ERROR ==========");
    console.error("[FLASHCARD PROGRESS GET] Error name:", error?.name);
    console.error("[FLASHCARD PROGRESS GET] Error code:", error?.code);
    console.error("[FLASHCARD PROGRESS GET] Error message:", error?.message);
    console.error("[FLASHCARD PROGRESS GET] Error meta:", JSON.stringify(error?.meta, null, 2));
    console.error("[FLASHCARD PROGRESS GET] Error stack:", error?.stack);
    console.error("[FLASHCARD PROGRESS GET] ==========================");
    return NextResponse.json(
      { 
        error: "Failed to fetch progress", 
        details: error.message,
        code: error?.code,
        name: error?.name,
        meta: error?.meta,
      },
      { status: 500 }
    );
  }
}

// POST: Update flashcard progress
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { flashcardId, status, timesViewed, timesCorrect } = body;

    if (!flashcardId) {
      return NextResponse.json(
        { error: "flashcardId is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [FlashcardStatus.NOT_STARTED, FlashcardStatus.REVIEWING, FlashcardStatus.MASTERED];
    if (status && !validStatuses.includes(status as FlashcardStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Build update data (only include defined fields)
    const updateData: any = {
      lastViewedAt: new Date(),
    };

    if (timesViewed !== undefined) {
      updateData.timesViewed = timesViewed;
    }
    if (timesCorrect !== undefined) {
      updateData.timesCorrect = timesCorrect;
    }
    if (status) {
      updateData.status = status as FlashcardStatus;
      if (status === FlashcardStatus.MASTERED) {
        updateData.masteredAt = new Date();
      } else {
        updateData.masteredAt = null; // Clear masteredAt if status is not MASTERED
      }
    }

    console.log("[FLASHCARD PROGRESS POST] User ID:", user.id);
    console.log("[FLASHCARD PROGRESS POST] Flashcard ID:", flashcardId);
    console.log("[FLASHCARD PROGRESS POST] Status:", status);
    console.log("[FLASHCARD PROGRESS POST] Update data:", JSON.stringify(updateData));

    // Use upsert to handle both create and update
    let progress;
    try {
      progress = await prisma.aIGPFlashcardProgress.upsert({
        where: {
          userId_flashcardId: {
            userId: user.id,
            flashcardId,
          },
        },
        update: updateData,
        create: {
          userId: user.id,
          flashcardId,
          status: (status as FlashcardStatus) || FlashcardStatus.NOT_STARTED,
          timesViewed: timesViewed !== undefined ? timesViewed : 0,
          timesCorrect: timesCorrect !== undefined ? timesCorrect : 0,
          lastViewedAt: new Date(),
          masteredAt: status === FlashcardStatus.MASTERED ? new Date() : null,
        },
      });
      console.log("[FLASHCARD PROGRESS POST] Upsert successful");
    } catch (dbError: any) {
      console.error("[FLASHCARD PROGRESS POST] Database error:", dbError);
      console.error("[FLASHCARD PROGRESS POST] Error code:", dbError?.code);
      console.error("[FLASHCARD PROGRESS POST] Error message:", dbError?.message);
      console.error("[FLASHCARD PROGRESS POST] Error meta:", dbError?.meta);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    console.error("[FLASHCARD PROGRESS POST] ========== ERROR ==========");
    console.error("[FLASHCARD PROGRESS POST] Error name:", error?.name);
    console.error("[FLASHCARD PROGRESS POST] Error code:", error?.code);
    console.error("[FLASHCARD PROGRESS POST] Error message:", error?.message);
    console.error("[FLASHCARD PROGRESS POST] Error meta:", JSON.stringify(error?.meta, null, 2));
    console.error("[FLASHCARD PROGRESS POST] Error stack:", error?.stack);
    console.error("[FLASHCARD PROGRESS POST] ==========================");
    return NextResponse.json(
      { 
        error: "Failed to update progress", 
        details: error.message,
        code: error?.code,
        name: error?.name,
        meta: error?.meta,
      },
      { status: 500 }
    );
  }
}

