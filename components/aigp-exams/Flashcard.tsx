"use client";

import { useState, useEffect } from "react";

export interface FlashcardData {
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

interface FlashcardProps {
  card: FlashcardData;
  isFlipped: boolean;
  onFlip: () => void;
  onMark: (status: "REVIEWING" | "MASTERED") => void;
  currentStatus?: string;
}

const cardTypeColors = {
  TRIGGER: "bg-blue-500/10 border-blue-500/30 text-blue-600",
  DIFFERENTIATION: "bg-purple-500/10 border-purple-500/30 text-purple-600",
  PROCESS: "bg-green-500/10 border-green-500/30 text-green-600",
  DEFINITION: "bg-orange-500/10 border-orange-500/30 text-orange-600",
};

const domainNames: Record<string, string> = {
  A: "Governance Foundations",
  B: "Risk Management & Controls",
  C: "AI Lifecycle & Data",
  D: "Privacy & Regulation",
  E: "Security, Robustness & Safety",
  F: "Users, Transparency & Remedies",
};

export default function Flashcard({
  card,
  isFlipped,
  onFlip,
  onMark,
  currentStatus,
}: FlashcardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isFlipped) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isFlipped]);

  const handleFlip = () => {
    if (!isAnimating) {
      onFlip();
    }
  };

  const cardTypeColor = cardTypeColors[card.cardType] || cardTypeColors.DEFINITION;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card Type Badge */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cardTypeColor}`}>
            {card.cardType}
          </span>
          <span className="text-sm text-muted-foreground">
            {domainNames[card.domain]} • {card.subDomain}
          </span>
        </div>
        {currentStatus === "MASTERED" && (
          <span className="text-xs text-status-success font-medium">✓ Mastered</span>
        )}
      </div>

      {/* Flashcard */}
      <div
        className="relative w-full h-[400px] cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full preserve-3d transition-transform duration-600 ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front Side */}
          <div
            className="absolute w-full h-full bg-card rounded-lg border-2 border-border shadow-card p-8 flex flex-col justify-center items-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">Question</p>
              <p className="text-xl md:text-2xl font-medium text-card-foreground leading-relaxed">
                {card.front.prompt}
              </p>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              Click to reveal answer
            </div>
          </div>

          {/* Back Side */}
          <div
            className="absolute w-full h-full bg-card rounded-lg border-2 border-border shadow-card p-8 flex flex-col justify-start overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="mb-6">
              <p className="text-lg text-muted-foreground mb-2">Answer</p>
              <p className="text-xl md:text-2xl font-medium text-card-foreground leading-relaxed mb-6">
                {card.back.answer}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <p className="text-sm font-semibold text-accent mb-1">💡 Exam Cue</p>
                <p className="text-sm text-card-foreground">{card.back.examCue}</p>
              </div>

              <div className="bg-status-warning/10 rounded-lg p-4 border border-status-warning/20">
                <p className="text-sm font-semibold text-status-warning mb-1">⚠️ Common Trap</p>
                <p className="text-sm text-card-foreground">{card.back.commonTrap}</p>
              </div>
            </div>

            <div className="mt-6 text-xs text-muted-foreground">
              Source: {card.source.framework} • {card.source.pointer}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (only show when flipped) */}
      {isFlipped && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMark("REVIEWING");
            }}
            className="px-6 py-2 rounded-lg bg-muted text-card-foreground hover:bg-muted/80 transition font-medium text-sm"
          >
            Need Review
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMark("MASTERED");
            }}
            className="px-6 py-2 rounded-lg bg-status-success text-white hover:bg-status-success/90 transition font-medium text-sm"
          >
            Got It!
          </button>
        </div>
      )}
    </div>
  );
}

