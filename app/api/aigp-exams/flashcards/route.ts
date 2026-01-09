import { NextResponse } from "next/server";
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

interface FlashcardBatch {
  batchId: string;
  version: string;
  updatedAt: string;
  cards: Flashcard[];
}

export async function GET() {
  try {
    const flashcardsDir = join(process.cwd(), "AIGP Flash Cards");
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
        const batch: FlashcardBatch = JSON.parse(fileContent);
        
        // Only include ACTIVE cards
        const activeCards = batch.cards.filter(card => card.status === "ACTIVE");
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
    });
  } catch (error: any) {
    console.error("[FLASHCARDS API] Error loading flashcards:", error);
    return NextResponse.json(
      { error: "Failed to load flashcards", details: error.message },
      { status: 500 }
    );
  }
}

