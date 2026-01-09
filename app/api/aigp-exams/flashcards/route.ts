import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = 'force-dynamic';

interface Flashcard {
  id: string;
  status: string;
  cardType: "TRIGGER" | "DIFFERENTIATION" | "PROCESS" | "DEFINITION";
  domain: "A" | "B" | "C" | "D" | "E" | "F";
  subDomain: string;
  topics: string[];
  priority: "HIGH" | "MEDIUM" | "LOW";
  front: {
    prompt: string;
  };
  back: {
    answer: string;
    examCue: string;
    commonTrap: string;
  };
  source: {
    framework: string;
    pointer: string;
  };
}

export async function GET() {
  try {
    // Try to load from database first
    try {
      const dbFlashcards = await prisma.aIGPFlashcard.findMany({
        where: {
          status: "ACTIVE",
        },
        orderBy: [
          { domain: "asc" },
          { subDomain: "asc" },
          { priority: "desc" },
        ],
      });

      if (dbFlashcards.length > 0) {
        console.log(`[FLASHCARDS API] Loaded ${dbFlashcards.length} flashcards from database`);
        
        // Transform database format to API format
        const flashcards: Flashcard[] = dbFlashcards.map((card) => ({
          id: card.flashcardId,
          status: card.status,
          cardType: card.cardType as Flashcard["cardType"],
          domain: card.domain as Flashcard["domain"],
          subDomain: card.subDomain,
          topics: card.topics,
          priority: card.priority as Flashcard["priority"],
          front: {
            prompt: card.frontPrompt,
          },
          back: {
            answer: card.backAnswer,
            examCue: card.examCue,
            commonTrap: card.commonTrap,
          },
          source: {
            framework: card.sourceFramework || "",
            pointer: card.sourcePointer || "",
          },
        }));

        return NextResponse.json({
          success: true,
          count: flashcards.length,
          flashcards,
          source: "database",
        });
      }
    } catch (dbError: any) {
      console.error("[FLASHCARDS API] Database query failed:", dbError);
      console.error("[FLASHCARDS API] Error details:", {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
      });
      // Don't fall back silently - return error details in development
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json(
          { 
            error: "Database query failed", 
            details: dbError.message,
            code: dbError.code,
            fallback: "Attempting JSON files..."
          },
          { status: 500 }
        );
      }
      // In production, continue to fallback but log the error
      console.warn("[FLASHCARDS API] Falling back to JSON files due to database error");
    }

    // Fallback to JSON files if database is empty or fails
    console.log("[FLASHCARDS API] Loading from JSON files (fallback)...");
    const flashcardsDir = process.env.NODE_ENV === 'production' 
      ? join(process.cwd(), "flashcards")
      : join(process.cwd(), "AIGP Flash Cards");
    
    const batchFiles = [
      "batch01.json",
      "batch02.json",
      "batch03.json",
      "batch04.json",
      "batch05.json",
      "batch06.json",
      "batch07.json",
      "batch08.json",
      "batch09.json",
      "batch10.json",
      "batch11.json",
    ];

    const allCards: Flashcard[] = [];

    for (const batchFile of batchFiles) {
      try {
        const filePath = join(flashcardsDir, batchFile);
        const fileContent = await readFile(filePath, "utf-8");
        const batch = JSON.parse(fileContent);
        
        // Only include ACTIVE cards
        const activeCards = batch.cards.filter((card: Flashcard) => card.status === "ACTIVE");
        allCards.push(...activeCards);
      } catch (error: any) {
        console.error(`[FLASHCARDS API] Error loading ${batchFile}:`, error.message);
        // Continue loading other batches even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      count: allCards.length,
      flashcards: allCards,
      source: "json",
    });
  } catch (error: any) {
    console.error("[FLASHCARDS API] Error loading flashcards:", error);
    return NextResponse.json(
      { error: "Failed to load flashcards", details: error.message },
      { status: 500 }
    );
  }
}

