"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Scenario {
  id: string;
  scenario: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  questionOrder: number;
}

interface KnowledgeAssessmentClientProps {
  scenarios: Scenario[];
}

export default function KnowledgeAssessmentClient({ scenarios }: KnowledgeAssessmentClientProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentScenario = scenarios[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / scenarios.length) * 100;
  const isLastQuestion = currentQuestionIndex === scenarios.length - 1;

  const handleAnswerSelect = (answer: string) => {
    setAnswers({
      ...answers,
      [currentScenario.id]: answer,
    });
    setError("");
  };

  const handleNext = () => {
    if (!answers[currentScenario.id]) {
      setError("Please select an answer");
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setError("");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setError("");
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/interests");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const answerArray = Object.entries(answers).map(([scenarioId, selectedAnswer]) => ({
        scenarioId,
        selectedAnswer,
      }));

      const response = await fetch("/api/onboarding/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerArray }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save answers");
        setLoading(false);
        return;
      }

      // Redirect to interests
      router.push("/onboarding/interests");
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!currentScenario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Knowledge Assessment
          </h1>
          <p className="text-lg text-muted-foreground">
            Help us understand your current knowledge level
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestionIndex + 1} of {scenarios.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Question Card */}
        <div className="bg-card rounded-lg shadow-card p-8 mb-6 border border-border">
          {/* Scenario */}
          <div className="bg-muted rounded-lg p-6 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Scenario
            </h3>
            <p className="text-foreground leading-relaxed">{currentScenario.scenario}</p>
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {currentScenario.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {["A", "B", "C", "D"].map((option) => {
              const optionKey = `option${option}` as keyof Scenario;
              const optionText = currentScenario[optionKey] as string;
              const isSelected = answers[currentScenario.id] === option;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-background hover:border-accent hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-primary-foreground"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-foreground mr-2">
                        {option})
                      </span>
                      <span className="text-foreground">{optionText}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-muted-foreground hover:text-foreground transition"
            >
              Skip Assessment
            </button>
            <button
              onClick={handleNext}
              disabled={loading || !answers[currentScenario.id]}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : isLastQuestion
                ? "Complete Assessment"
                : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

