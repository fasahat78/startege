"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
  questionId: string;
  questionOrder: number;
  question: string;
  options: Array<{ key: string; text: string }>;
  domain: string;
  topic: string;
  difficulty: string;
  isCaseStudy: boolean;
  estimatedTimeSec: number;
  jurisdiction: string;
  sourceRefs: string[];
  selectedAnswer: string | null;
  isFlagged: boolean;
  timeSpentSec: number;
}

interface ExamSimulatorProps {
  attemptId: string;
  examId: string;
}

export default function ExamSimulator({ attemptId, examId }: ExamSimulatorProps) {
  const router = useRouter();
  const [currentQuestionOrder, setCurrentQuestionOrder] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFlagged, setIsFlagged] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(100);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  // Load question
  const loadQuestion = useCallback(async (order: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/aigp-exams/attempts/${attemptId}/questions/${order}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to load question");
      }
      
      const data = await response.json();
      setQuestion(data);
      setSelectedAnswer(data.selectedAnswer);
      setIsFlagged(data.isFlagged);
      
      // Update answered questions set
      if (data.selectedAnswer) {
        setAnsweredQuestions((prev) => new Set(prev).add(order));
      }
      if (data.isFlagged) {
        setFlaggedQuestions((prev) => new Set(prev).add(order));
      }
    } catch (error) {
      console.error("Error loading question:", error);
      alert("Failed to load question");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  // Load attempt info to get total questions and time
  useEffect(() => {
    const loadAttemptInfo = async () => {
      try {
        const response = await fetch(`/api/aigp-exams/attempts/${attemptId}`);
        if (response.ok) {
          const data = await response.json();
          setTotalQuestions(data.totalQuestions || 100);
          if (data.isTimed && data.timeRemainingSec !== null) {
            setTimeRemaining(data.timeRemainingSec);
          }
          if (data.pausedAt && !data.resumedAt) {
            setIsPaused(true);
          }
        }
      } catch (error) {
        console.error("Error loading attempt info:", error);
      }
    };
    
    loadAttemptInfo();
  }, [attemptId]);

  // Load initial question
  useEffect(() => {
    loadQuestion(currentQuestionOrder);
  }, [currentQuestionOrder, loadQuestion]);

  // Timer effect
  useEffect(() => {
    if (isPaused || timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPaused, timeRemaining]);

  // Save answer
  const saveAnswer = useCallback(async (answer: string | null, flagged: boolean) => {
    if (!question) return;
    
    try {
      setSaving(true);
      const response = await fetch(
        `/api/aigp-exams/attempts/${attemptId}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.questionId,
            selectedAnswer: answer,
            isFlagged: flagged,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to save answer");
      }
      
      // Update answered questions set
      if (answer) {
        setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionOrder));
      } else {
        setAnsweredQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentQuestionOrder);
          return newSet;
        });
      }
      
      // Update flagged questions set
      if (flagged) {
        setFlaggedQuestions((prev) => new Set(prev).add(currentQuestionOrder));
      } else {
        setFlaggedQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentQuestionOrder);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      alert("Failed to save answer");
    } finally {
      setSaving(false);
    }
  }, [attemptId, question, currentQuestionOrder]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    saveAnswer(answer, isFlagged);
  };

  const handleFlagToggle = () => {
    const newFlagged = !isFlagged;
    setIsFlagged(newFlagged);
    saveAnswer(selectedAnswer, newFlagged);
  };

  const handlePrevious = () => {
    if (currentQuestionOrder > 1) {
      setCurrentQuestionOrder(currentQuestionOrder - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionOrder < totalQuestions) {
      setCurrentQuestionOrder(currentQuestionOrder + 1);
    }
  };

  const handleJumpToQuestion = (order: number) => {
    if (order >= 1 && order <= totalQuestions) {
      setCurrentQuestionOrder(order);
      setShowQuestionNav(false);
    }
  };

  const handlePause = async () => {
    try {
      const response = await fetch(
        `/api/aigp-exams/attempts/${attemptId}/pause`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeRemainingSec: timeRemaining }),
        }
      );
      
      if (response.ok) {
        setIsPaused(true);
      }
    } catch (error) {
      console.error("Error pausing exam:", error);
    }
  };

  const handleResume = async () => {
    try {
      const response = await fetch(
        `/api/aigp-exams/attempts/${attemptId}/resume`,
        {
          method: "POST",
        }
      );
      
      if (response.ok) {
        setIsPaused(false);
      }
    } catch (error) {
      console.error("Error resuming exam:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `/api/aigp-exams/attempts/${attemptId}/submit`,
        {
          method: "POST",
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to submit exam");
      }
      
      router.push(`/aigp-exams/${examId}/attempt/${attemptId}/review`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Failed to submit exam");
    }
  };

  const progressPercentage = (answeredQuestions.size / totalQuestions) * 100;

  if (loading || !question) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Link
                href="/aigp-exams"
                className="text-sm text-muted-foreground hover:text-card-foreground transition"
              >
                ← Back to Exams
              </Link>
              <div>
                <h1 className="text-lg font-bold text-card-foreground">
                  AIGP Practice Exam
                </h1>
                <p className="text-xs text-muted-foreground">
                  Question {currentQuestionOrder} of {totalQuestions}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {timeRemaining !== null && (
                <div className={`px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
                  timeRemaining < 300 ? "bg-status-error/10 text-status-error" : "bg-muted text-card-foreground"
                }`}>
                  {Math.floor(timeRemaining / 60)}:
                  {String(timeRemaining % 60).padStart(2, "0")}
                </div>
              )}
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="px-4 py-2 bg-status-success text-white rounded-lg hover:bg-status-success/90 transition text-sm font-medium"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm font-medium"
                >
                  Pause
                </button>
              )}
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-4 py-2 bg-status-error text-white rounded-lg hover:bg-status-error/90 transition text-sm font-medium"
              >
                Submit
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{answeredQuestions.size} answered</span>
            <span>{flaggedQuestions.size} flagged</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-card-foreground">Questions</h3>
                <button
                  onClick={() => setShowQuestionNav(!showQuestionNav)}
                  className="text-xs text-muted-foreground hover:text-card-foreground"
                >
                  {showQuestionNav ? "Hide" : "Show All"}
                </button>
              </div>
              
              {/* Compact Progress View */}
              {!showQuestionNav && (
                <div className="space-y-2">
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: Math.min(50, totalQuestions) }, (_, i) => i + 1).map((order) => (
                      <button
                        key={order}
                        onClick={() => handleJumpToQuestion(order)}
                        className={`h-6 w-full rounded text-xs font-medium transition ${
                          order === currentQuestionOrder
                            ? "bg-primary text-white"
                            : answeredQuestions.has(order)
                            ? "bg-status-success/20 text-status-success border border-status-success/30"
                            : flaggedQuestions.has(order)
                            ? "bg-status-warning/20 text-status-warning border border-status-warning/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        title={`Question ${order}`}
                      >
                        {order}
                      </button>
                    ))}
                  </div>
                  {totalQuestions > 50 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Showing first 50. Click "Show All" to see all questions.
                    </p>
                  )}
                </div>
              )}
              
              {/* Full Question List */}
              {showQuestionNav && (
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((order) => (
                      <button
                        key={order}
                        onClick={() => handleJumpToQuestion(order)}
                        className={`h-8 w-full rounded text-xs font-medium transition ${
                          order === currentQuestionOrder
                            ? "bg-primary text-white ring-2 ring-primary/50"
                            : answeredQuestions.has(order)
                            ? "bg-status-success/20 text-status-success border border-status-success/30"
                            : flaggedQuestions.has(order)
                            ? "bg-status-warning/20 text-status-warning border border-status-warning/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        title={`Question ${order}`}
                      >
                        {order}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            {/* Question Info Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                Domain {question.domain}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                question.difficulty === 'easy' ? 'bg-status-success/10 text-status-success' :
                question.difficulty === 'medium' ? 'bg-status-warning/10 text-status-warning' :
                'bg-status-error/10 text-status-error'
              }`}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </span>
              {question.isCaseStudy && (
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  Case Study
                </span>
              )}
              <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                {question.jurisdiction}
              </span>
            </div>

            {/* Question Card */}
            <div className="bg-card rounded-lg border border-border shadow-card p-8 mb-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-card-foreground leading-relaxed">
                  {question.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleAnswerSelect(option.key)}
                    disabled={saving}
                    className={`w-full text-left p-5 rounded-lg border-2 transition-all ${
                      selectedAnswer === option.key
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center font-semibold ${
                          selectedAnswer === option.key
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {option.key}
                      </div>
                      <div className="flex-1 pt-1">
                        <span className="text-card-foreground leading-relaxed">{option.text}</span>
                      </div>
                      {selectedAnswer === option.key && (
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionOrder === 1 || saving}
                className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleFlagToggle}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg transition font-medium ${
                    isFlagged
                      ? "bg-status-warning text-white hover:bg-status-warning/90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {isFlagged ? (
                    <>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Flagged
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Flag for Review
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleNext}
                disabled={currentQuestionOrder === totalQuestions || saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Next
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-2xl">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-card-foreground mb-2">
                Submit Exam?
              </h3>
              <p className="text-muted-foreground">
                You have answered <span className="font-semibold text-card-foreground">{answeredQuestions.size}</span> of <span className="font-semibold text-card-foreground">{totalQuestions}</span> questions.
                {flaggedQuestions.size > 0 && (
                  <span className="block mt-2">
                    You have <span className="font-semibold text-card-foreground">{flaggedQuestions.size}</span> flagged question(s) for review.
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Are you sure you want to submit? You won't be able to change your answers after submission.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmit();
                }}
                className="flex-1 px-4 py-3 bg-status-error text-white rounded-lg hover:bg-status-error/90 transition font-medium"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
