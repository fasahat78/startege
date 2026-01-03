"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ExamResultsProps {
  results: {
    attempt: {
      id: string;
      challengeId: string;
      score: number;
      percentage: number;
      timeSpent: number;
      passed: boolean;
      isFirstAttempt: boolean;
    };
    results: {
      correctCount: number;
      totalQuestions: number;
      percentage: number;
      passed: boolean;
      answerResults: Array<{
        questionId: string;
        selectedAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        rationale: string;
      }>;
    };
  };
  attemptId: string;
  level: number;
}

export default function ExamResults({ results, attemptId, level }: ExamResultsProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const { attempt, results: examResults } = results;
  const passed = examResults.passed;
  const percentage = Math.round(examResults.percentage * 100) / 100;
  const timeSpentMinutes = Math.floor(attempt.timeSpent / 60);
  const timeSpentSeconds = attempt.timeSpent % 60;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Result Summary */}
        <div
          className={`bg-card rounded-lg shadow-card p-8 mb-6 ${
            passed ? "border-4 border-status-success" : "border-4 border-status-error"
          }`}
        >
          <div className="text-center mb-6">
            {passed ? (
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-status-success/10 rounded-full mb-4">
                  <svg
                    className="w-12 h-12 text-status-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-status-success mb-2">
                  Congratulations! You Passed! 🎉
                </h1>
                <p className="text-muted-foreground">
                  Level {level} Challenge Complete
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-status-error/10 rounded-full mb-4">
                  <svg
                    className="w-12 h-12 text-status-error"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-status-error mb-2">
                  Not Quite There Yet
                </h1>
                <p className="text-muted-foreground">
                  Keep practicing to improve your score
                </p>
              </div>
            )}
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-accent mb-1">Score</div>
              <div className="text-3xl font-bold text-card-foreground">
                {examResults.correctCount}/{examResults.totalQuestions}
              </div>
            </div>
            <div className="bg-status-success/10 border border-status-success/20 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-status-success mb-1">Percentage</div>
              <div className="text-3xl font-bold text-card-foreground">{percentage}%</div>
            </div>
            <div className="bg-status-warning/10 border border-status-warning/20 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-status-warning mb-1">Time Spent</div>
              <div className="text-3xl font-bold text-card-foreground">
                {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 px-6 py-3 border border-border text-card-foreground hover:bg-muted rounded-lg font-medium transition"
            >
              {showDetails ? "Hide" : "Show"} Detailed Results
            </button>
            {!passed && (
              <Link
                href={`/challenges/${level}`}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium text-center transition"
              >
                Retake Challenge
              </Link>
            )}
            {passed && level < 40 && (
              <Link
                href={`/challenges/${level + 1}`}
                className="flex-1 px-6 py-3 bg-status-success hover:bg-status-success/90 text-white rounded-lg font-medium text-center transition"
              >
                Next Level
              </Link>
            )}
            <Link
              href="/challenges"
              className="flex-1 px-6 py-3 border border-border text-card-foreground hover:bg-muted rounded-lg font-medium text-center transition"
            >
              Back to Challenges
            </Link>
          </div>
        </div>

        {/* Detailed Results */}
        {showDetails && (
          <div className="bg-card rounded-lg shadow-card p-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-6">
              Question Review
            </h2>
            <div className="space-y-6">
              {examResults.answerResults.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`border-2 rounded-lg p-6 ${
                    result.isCorrect
                      ? "border-status-success/20 bg-status-success/10"
                      : "border-status-error/20 bg-status-error/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-semibold text-card-foreground">
                        Question {index + 1}
                      </span>
                      {result.isCorrect ? (
                        <span className="px-2 py-1 bg-status-success/20 text-status-success text-sm font-medium rounded border border-status-success/20">
                          Correct ✓
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-status-error/20 text-status-error text-sm font-medium rounded border border-status-error/20">
                          Incorrect ✗
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="font-medium text-card-foreground">Your Answer: </span>
                      <span
                        className={
                          result.isCorrect ? "text-status-success" : "text-status-error"
                        }
                      >
                        {result.selectedAnswer || "Not answered"}
                      </span>
                    </div>
                    {!result.isCorrect && (
                      <div>
                        <span className="font-medium text-card-foreground">
                          Correct Answer:{" "}
                        </span>
                        <span className="text-status-success">{result.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <div className="text-sm font-medium text-card-foreground mb-2">
                      Explanation:
                    </div>
                    <p className="text-muted-foreground">{result.rationale}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

