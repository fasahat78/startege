"use client";

import { useState, useEffect, useMemo } from "react";
import Flashcard, { FlashcardData } from "./Flashcard";
import { toast } from "@/components/ui/Toast";

interface FlashcardProgress {
  flashcardId: string;
  status: string;
  timesViewed: number;
  timesCorrect: number;
  lastViewedAt: string | null;
  masteredAt: string | null;
}

interface FlashcardStats {
  total: number;
  notStarted: number;
  reviewing: number;
  mastered: number;
  totalViewed: number;
}

export default function FlashcardsTab() {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [progress, setProgress] = useState<Record<string, FlashcardProgress>>({});
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Filters
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedCardType, setSelectedCardType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [shuffle, setShuffle] = useState(false);
  const [studyMode, setStudyMode] = useState<"all" | "reviewing" | "notMastered">("all");

  // Load flashcards and progress
  useEffect(() => {
    async function loadData() {
      try {
        const [flashcardsRes, progressRes, statsRes] = await Promise.all([
          fetch("/api/aigp-exams/flashcards"),
          fetch("/api/aigp-exams/flashcards/progress"),
          fetch("/api/aigp-exams/flashcards/stats"),
        ]);

        if (flashcardsRes.ok) {
          const flashcardsData = await flashcardsRes.json();
          setFlashcards(flashcardsData.flashcards || []);
        }

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData.progress || {});
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats || null);
        }
      } catch (error) {
        console.error("Error loading flashcards:", error);
        toast("Failed to load flashcards", "error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter flashcards
  const filteredFlashcards = useMemo(() => {
    let filtered = [...flashcards];

    // Filter by domain
    if (selectedDomain !== "all") {
      filtered = filtered.filter(card => card.domain === selectedDomain);
    }

    // Filter by card type
    if (selectedCardType !== "all") {
      filtered = filtered.filter(card => card.cardType === selectedCardType);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter(card => card.priority === selectedPriority);
    }

    // Filter by study mode
    if (studyMode === "reviewing") {
      filtered = filtered.filter(card => {
        const cardProgress = progress[card.id];
        return cardProgress?.status === "REVIEWING";
      });
    } else if (studyMode === "notMastered") {
      filtered = filtered.filter(card => {
        const cardProgress = progress[card.id];
        return !cardProgress || cardProgress.status !== "MASTERED";
      });
    }

    // Shuffle if enabled
    if (shuffle) {
      filtered = [...filtered].sort(() => Math.random() - 0.5);
    }

    return filtered;
  }, [flashcards, selectedDomain, selectedCardType, selectedPriority, studyMode, shuffle, progress]);

  // Reset to first card when filters change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filteredFlashcards]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (loading || filteredFlashcards.length === 0) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
      } else if (e.key === "ArrowRight" && currentIndex < filteredFlashcards.length - 1) {
        e.preventDefault();
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, isFlipped, filteredFlashcards, loading]);

  const currentCard = filteredFlashcards[currentIndex];
  const currentCardProgress = currentCard ? progress[currentCard.id] : undefined;

  const handleMark = async (status: "REVIEWING" | "MASTERED") => {
    if (!currentCard) return;

    try {
      const response = await fetch("/api/aigp-exams/flashcards/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcardId: currentCard.id,
          status,
          timesViewed: (currentCardProgress?.timesViewed || 0) + 1,
          timesCorrect: status === "MASTERED" ? (currentCardProgress?.timesCorrect || 0) + 1 : currentCardProgress?.timesCorrect || 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(prev => ({
          ...prev,
          [currentCard.id]: data.progress,
        }));

        // Refresh stats
        const statsRes = await fetch("/api/aigp-exams/flashcards/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats || null);
        }

        toast(status === "MASTERED" ? "Marked as mastered!" : "Marked for review", "success");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast("Failed to update progress", "error");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading flashcards...</div>
      </div>
    );
  }

  if (filteredFlashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No flashcards found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      {stats && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{stats.total}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mastered: </span>
              <span className="font-semibold text-status-success">{stats.mastered}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reviewing: </span>
              <span className="font-semibold text-status-warning">{stats.reviewing}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Not Started: </span>
              <span className="font-semibold">{stats.notStarted}</span>
            </div>
            <div className="ml-auto">
              <span className="text-muted-foreground">Progress: </span>
              <span className="font-semibold">
                {Math.round((stats.mastered / stats.total) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Domain Filter */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground text-sm"
            >
              <option value="all">All Domains</option>
              <option value="A">A - Governance Foundations</option>
              <option value="B">B - Risk Management</option>
              <option value="C">C - AI Lifecycle & Data</option>
              <option value="D">D - Privacy & Regulation</option>
              <option value="E">E - Security & Robustness</option>
              <option value="F">F - Users & Transparency</option>
            </select>
          </div>

          {/* Card Type Filter */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Card Type
            </label>
            <select
              value={selectedCardType}
              onChange={(e) => setSelectedCardType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground text-sm"
            >
              <option value="all">All Types</option>
              <option value="TRIGGER">Trigger</option>
              <option value="DIFFERENTIATION">Differentiation</option>
              <option value="PROCESS">Process</option>
              <option value="DEFINITION">Definition</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Study Mode */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Study Mode
            </label>
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-card-foreground text-sm"
            >
              <option value="all">All Cards</option>
              <option value="notMastered">Not Mastered</option>
              <option value="reviewing">Need Review</option>
            </select>
          </div>

          {/* Shuffle Toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-card-foreground">Shuffle</span>
            </label>
          </div>
        </div>
      </div>

      {/* Card Counter */}
      <div className="text-center text-sm text-muted-foreground">
        Card {currentIndex + 1} of {filteredFlashcards.length}
      </div>

      {/* Flashcard */}
      {currentCard && (
        <Flashcard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          onMark={handleMark}
          currentStatus={currentCardProgress?.status}
        />
      )}

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-6 py-2 rounded-lg bg-muted text-card-foreground hover:bg-muted/80 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition font-medium"
        >
          {isFlipped ? "Show Question" : "Flip Card"}
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === filteredFlashcards.length - 1}
          className="px-6 py-2 rounded-lg bg-muted text-card-foreground hover:bg-muted/80 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Keyboard shortcuts: Space/Enter to flip • ← → to navigate</p>
      </div>
    </div>
  );
}

