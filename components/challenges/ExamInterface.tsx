"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  stem: string; // New exam format uses 'stem' instead of 'questionText'
  questionText?: string; // Legacy support
  questionType?: string;
  options: Array<{ id: string; text: string }> | Record<string, string>; // Support both formats
  order?: number;
}

interface ExamData {
  attemptId?: string; // Make optional since it might be in the response
  challenge: {
    id: string;
    level: number;
    title: string;
    questionCount: number;
    timeLimit: number;
    passingScore: number;
  };
  exam?: {
    id: string;
    type: string;
    questionCount: number;
  };
  questions: Question[];
  attemptNumber?: number;
}

interface ExamInterfaceProps {
  examData: ExamData;
  attemptId: string;
}

export default function ExamInterface({ examData, attemptId }: ExamInterfaceProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  
  // Safely get timeLimit with fallback
  const timeLimitMinutes = examData?.challenge?.timeLimit || 20; // Default 20 minutes
  const [timeRemaining, setTimeRemaining] = useState(timeLimitMinutes * 60); // seconds
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Validate examData structure
  if (!examData || !examData.challenge || !examData.questions) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="bg-card rounded-lg shadow-card p-8 max-w-md">
          <h2 className="text-xl font-bold text-card-foreground mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">
            Invalid exam data. Please start the challenge again.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 px-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const questionStartTime = Date.now();

  // Normalize question format (support both old and new formats)
  const normalizedQuestion = {
    ...currentQuestion,
    id: currentQuestion.id,
    questionText: currentQuestion.stem || currentQuestion.questionText || "",
    options: Array.isArray(currentQuestion.options) 
      ? currentQuestion.options.reduce((acc: Record<string, string>, opt: any) => {
          acc[opt.id] = opt.text;
          return acc;
        }, {})
      : currentQuestion.options,
    order: currentQuestion.order || currentQuestionIndex + 1,
  };

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      // Auto-submit when time runs out
      const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
      const answersArray = examData.questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] || "", // Updated to match exam API format
        timeSpent: timeSpent[q.id] || 0,
      }));

      // Use exam submit API instead of challenge submit
      const examId = examData.exam?.id;
      if (!examId) {
        alert("Exam ID not found. Please start the challenge again.");
        return;
      }
      fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: answersArray,
          totalTimeSpent,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          sessionStorage.setItem(`exam_result_${attemptId}`, JSON.stringify(result));
          router.push(`/challenges/${examData.challenge.level}/results?attemptId=${attemptId}`);
        });
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, attemptId, examData, answers, timeSpent, startTime, router]);

  // Track time spent on current question
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      setTimeSpent((prev) => ({
        ...prev,
        [normalizedQuestion.id]: elapsed,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion.id, questionStartTime]);

  const handleAnswerSelect = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!autoSubmit && !showConfirmSubmit) {
      setShowConfirmSubmit(true);
      return;
    }

    setIsSubmitting(true);
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Prepare answers array (exam API format)
    const answersArray = examData.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: answers[q.id] || "", // Updated to match exam API format
      timeSpent: timeSpent[q.id] || 0,
    }));

    try {
      // Use exam submit API instead of challenge submit
      const examId = (examData as any).exam?.id;
      if (!examId) {
        throw new Error("Exam ID not found in exam data");
      }

      // Get attemptId from examData (stored when exam was started) or props (from URL)
      // Prioritize examData.attemptId, but fallback to prop attemptId
      let submitAttemptId = (examData as any).attemptId;
      
      // If attemptId from examData is invalid, use prop
      if (!submitAttemptId || submitAttemptId === 'undefined' || submitAttemptId === undefined) {
        submitAttemptId = attemptId;
      }
      
      // Validate attemptId is valid
      if (!submitAttemptId || submitAttemptId === 'undefined' || submitAttemptId === undefined) {
        console.error("Attempt ID missing or invalid:", { 
          examDataAttemptId: (examData as any).attemptId, 
          propAttemptId: attemptId,
          examDataKeys: Object.keys(examData || {}),
          examDataFull: examData,
        });
        alert("Attempt ID not found. Please start the exam again.");
        setIsSubmitting(false);
        setShowConfirmSubmit(false);
        return;
      }

      console.log("Submitting exam:", {
        examId,
        attemptId: submitAttemptId,
        answersCount: answersArray.length,
        url: `/api/exams/${examId}/submit`,
      });

      const response = await fetch(
        `/api/exams/${examId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attemptId: submitAttemptId,
            answers: answersArray, // Exam API expects answers as an array directly
            timeSpent: totalTimeSpent, // Optional: total time spent in seconds
          }),
        }
      );

      console.log("Submit response status:", response.status);
      console.log("Submit response ok:", response.ok);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to submit exam" }));
        alert(error.error || "Failed to submit exam");
        setIsSubmitting(false);
        setShowConfirmSubmit(false);
        return;
      }

      const result = await response.json();
      
      // Store results and redirect to results page
      sessionStorage.setItem(`exam_result_${attemptId}`, JSON.stringify(result));
      
      // Small delay to show success state before redirect
      setTimeout(() => {
        router.push(`/challenges/${examData.challenge.level}/results?attemptId=${attemptId}`);
      }, 500);
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert("Failed to submit exam");
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  }, [answers, timeSpent, attemptId, examData, startTime, router, showConfirmSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = examData.questions.length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-card-foreground">
                Level {examData.challenge.level}: {examData.challenge.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm font-medium text-card-foreground">Time Remaining</div>
                <div
                  className={`text-lg font-bold ${
                    timeRemaining < 300 ? "text-status-error" : "text-card-foreground"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <div className="w-32 bg-muted rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question Card */}
        <div className="bg-card rounded-lg shadow-card p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-accent">
                Question {normalizedQuestion.order}
              </span>
              {normalizedQuestion.questionType === "scenario" && (
                <span className="px-2 py-1 bg-accent/10 text-accent border border-accent/20 text-xs font-medium rounded">
                  Scenario-Based
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-card-foreground mb-6">
              {normalizedQuestion.questionText}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {Object.entries(normalizedQuestion.options).map(([key, value]) => (
              <label
                key={key}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                  answers[normalizedQuestion.id] === key
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${normalizedQuestion.id}`}
                  value={key}
                  checked={answers[normalizedQuestion.id] === key}
                  onChange={() => handleAnswerSelect(key)}
                  className="mt-1 mr-3 h-4 w-4 text-accent focus:ring-accent"
                />
                <div className="flex-1">
                  <span className="font-semibold text-card-foreground mr-2">{key}.</span>
                  <span className="text-card-foreground">{value}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-border text-card-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition"
          >
            Previous
          </button>

          <div className="flex items-center gap-4">
            {/* Question Navigation */}
            <div className="flex gap-2 flex-wrap max-w-md justify-center">
              {examData.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded text-sm font-medium transition ${
                    index === currentQuestionIndex
                      ? "bg-primary text-primary-foreground"
                      : answers[q.id]
                      ? "bg-status-success/10 text-status-success border border-status-success/20"
                      : "bg-muted text-card-foreground border border-border hover:bg-muted/80"
                  }`}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {currentQuestionIndex === examData.questions.length - 1 ? (
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-6 py-2 bg-status-success hover:bg-status-success/90 disabled:bg-status-disabled text-white rounded-lg font-medium transition"
            >
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-float p-6 max-w-md mx-4">
            {!isSubmitting ? (
              <>
                <h3 className="text-xl font-bold text-card-foreground mb-4">
                  Confirm Submission
                </h3>
                <p className="text-muted-foreground mb-6">
                  You have answered {answeredCount} out of {totalQuestions} questions.
                  Are you sure you want to submit your exam?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowConfirmSubmit(false);
                      setIsSubmitting(false);
                    }}
                    className="flex-1 px-4 py-2 border border-border text-card-foreground hover:bg-muted rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    className="flex-1 px-4 py-2 bg-status-success hover:bg-status-success/90 text-white rounded-lg font-medium transition"
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-status-success"></div>
                  </div>
                  <h3 className="text-xl font-bold text-card-foreground mb-2">
                    Submitting Your Exam
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Please wait while we process your answers...
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div className="bg-status-success h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This may take a few seconds
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

