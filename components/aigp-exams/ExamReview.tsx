"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StartegizerHelp from "./StartegizerHelp";

interface ReviewQuestion {
  questionId: string;
  questionOrder: number;
  question: string;
  options: Array<{ key: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  domain: string;
  topic: string;
  difficulty: string;
  isCaseStudy: boolean;
  jurisdiction: string;
  sourceRefs: string[];
  selectedAnswer: string | null;
  isCorrect: boolean;
  timeSpentSec: number;
}

interface ReviewData {
  attemptId: string;
  examId: string;
  score: number;
  rawScore: number;
  totalQuestions: number;
  pass: boolean;
  submittedAt: string;
  domainScores: Record<string, any>;
  difficultyScores: Record<string, any>;
  jurisdictionScores: Record<string, any>;
  topicScores: Record<string, any>;
  questions: ReviewQuestion[];
}

interface ExamReviewProps {
  attemptId: string;
  examId: string;
}

export default function ExamReview({ attemptId, examId }: ExamReviewProps) {
  const router = useRouter();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    const loadReview = async () => {
      try {
        const response = await fetch(
          `/api/aigp-exams/attempts/${attemptId}/review`
        );
        
        if (!response.ok) {
          throw new Error("Failed to load review");
        }
        
        const data = await response.json();
        setReviewData(data);
        setSelectedQuestion(1);
      } catch (error) {
        console.error("Error loading review:", error);
        alert("Failed to load review");
      } finally {
        setLoading(false);
      }
    };
    
    loadReview();
  }, [attemptId]);

  if (loading || !reviewData) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading review...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = reviewData.questions.find(
    (q) => q.questionOrder === selectedQuestion
  );

  const correctCount = reviewData.questions.filter(q => q.isCorrect).length;
  const incorrectCount = reviewData.questions.filter(q => q.selectedAnswer && !q.isCorrect).length;
  const unansweredCount = reviewData.questions.filter(q => !q.selectedAnswer).length;

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/aigp-exams"
            className="text-sm text-muted-foreground hover:text-card-foreground mb-4 inline-flex items-center gap-1 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Exams
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Exam Review</h1>
          <p className="text-muted-foreground">
            Review your answers and detailed performance analytics
          </p>
        </div>

        {/* Score Summary Card */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-brand-teal/10 rounded-xl border border-border p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-card-foreground mb-2">
                {reviewData.score.toFixed(1)}%
              </div>
              <p className="text-muted-foreground text-lg">
                {reviewData.rawScore} out of {reviewData.totalQuestions} questions correct
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-success"></div>
                  <span className="text-muted-foreground">{correctCount} Correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-error"></div>
                  <span className="text-muted-foreground">{incorrectCount} Incorrect</span>
                </div>
                {unansweredCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted border border-border"></div>
                    <span className="text-muted-foreground">{unansweredCount} Unanswered</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`px-8 py-6 rounded-xl ${
              reviewData.pass
                ? "bg-status-success/20 border-2 border-status-success"
                : "bg-status-error/20 border-2 border-status-error"
            }`}>
              <div className={`text-2xl font-bold ${
                reviewData.pass ? "text-status-success" : "text-status-error"
              }`}>
                {reviewData.pass ? "PASSED" : "NOT PASSED"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Passing Score: 70%
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Analytics Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Domain Performance */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Domain Performance
              </h3>
              <div className="space-y-4">
                {Object.entries(reviewData.domainScores || {}).map(
                  ([domain, stats]: [string, any]) => (
                    <div key={domain}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-card-foreground">
                          Domain {domain}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            stats.score >= 70 ? "bg-status-success" : "bg-status-error"
                          }`}
                          style={{ width: `${Math.min(stats.score, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stats.score.toFixed(1)}%
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Difficulty Performance */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Difficulty Performance
              </h3>
              <div className="space-y-4">
                {Object.entries(reviewData.difficultyScores || {}).map(
                  ([difficulty, stats]: [string, any]) => (
                    <div key={difficulty}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium capitalize ${
                          difficulty === 'easy' ? 'text-status-success' :
                          difficulty === 'medium' ? 'text-status-warning' :
                          'text-status-error'
                        }`}>
                          {difficulty}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(stats.score, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stats.score.toFixed(1)}%
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Jurisdiction Performance */}
            <div className="bg-card rounded-lg border border-border p-6 shadow-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Jurisdiction Performance
              </h3>
              <div className="space-y-4">
                {Object.entries(reviewData.jurisdictionScores || {}).map(
                  ([jurisdiction, stats]: [string, any]) => (
                    <div key={jurisdiction}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-card-foreground">
                          {jurisdiction}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-accent transition-all"
                          style={{ width: `${Math.min(stats.score, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stats.score.toFixed(1)}%
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="lg:col-span-3">
            {/* Question Navigation */}
            <div className="bg-card rounded-lg border border-border p-4 mb-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-card-foreground">Question Navigator</h3>
                <button
                  onClick={() => setShowAllQuestions(!showAllQuestions)}
                  className="text-xs text-muted-foreground hover:text-card-foreground transition"
                >
                  {showAllQuestions ? "Show Less" : "Show All"}
                </button>
              </div>
              <div className={`grid gap-2 ${showAllQuestions ? 'grid-cols-10' : 'grid-cols-10'} max-h-64 overflow-y-auto`}>
                {reviewData.questions.map((q) => (
                  <button
                    key={q.questionOrder}
                    onClick={() => setSelectedQuestion(q.questionOrder)}
                    className={`h-10 rounded-lg border-2 transition font-medium text-sm ${
                      selectedQuestion === q.questionOrder
                        ? "border-primary bg-primary text-white ring-2 ring-primary/50"
                        : q.isCorrect
                        ? "border-status-success bg-status-success/10 text-status-success hover:bg-status-success/20"
                        : q.selectedAnswer && !q.isCorrect
                        ? "border-status-error bg-status-error/10 text-status-error hover:bg-status-error/20"
                        : "border-border bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    title={`Question ${q.questionOrder}${q.isCorrect ? ' - Correct' : q.selectedAnswer ? ' - Incorrect' : ' - Unanswered'}`}
                  >
                    {q.questionOrder}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <div className="bg-card rounded-lg border border-border p-8 shadow-card">
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    Question {currentQuestion.questionOrder}
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    Domain {currentQuestion.domain}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentQuestion.difficulty === 'easy' ? 'bg-status-success/10 text-status-success' :
                    currentQuestion.difficulty === 'medium' ? 'bg-status-warning/10 text-status-warning' :
                    'bg-status-error/10 text-status-error'
                  }`}>
                    {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                  </span>
                  {currentQuestion.isCaseStudy && (
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                      Case Study
                    </span>
                  )}
                  <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                    {currentQuestion.jurisdiction}
                  </span>
                </div>

                <h3 className="text-2xl font-semibold text-card-foreground mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option) => {
                    const isSelected = option.key === currentQuestion.selectedAnswer;
                    const isCorrect = option.key === currentQuestion.correctAnswer;
                    
                    return (
                      <div
                        key={option.key}
                        className={`p-5 rounded-lg border-2 transition ${
                          isCorrect
                            ? "border-status-success bg-status-success/5"
                            : isSelected
                            ? "border-status-error bg-status-error/5"
                            : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center font-semibold ${
                              isCorrect
                                ? "border-status-success bg-status-success text-white"
                                : isSelected
                                ? "border-status-error bg-status-error text-white"
                                : "border-border bg-muted text-muted-foreground"
                            }`}
                          >
                            {option.key}
                          </div>
                          <div className="flex-1 pt-2">
                            <span className="text-card-foreground leading-relaxed">{option.text}</span>
                            {isCorrect && (
                              <span className="ml-3 inline-flex items-center gap-1 px-2 py-1 bg-status-success/10 text-status-success rounded text-xs font-medium">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Correct Answer
                              </span>
                            )}
                            {isSelected && !isCorrect && (
                              <span className="ml-3 inline-flex items-center gap-1 px-2 py-1 bg-status-error/10 text-status-error rounded text-xs font-medium">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/20 mb-4">
                  <div className="flex items-start gap-3">
                    <svg className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-semibold text-card-foreground mb-2">
                        Explanation
                      </h4>
                      <p className="text-sm text-card-foreground leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Startegizer AI Help */}
                <StartegizerHelp
                  attemptId={attemptId}
                  questionId={currentQuestion.questionId}
                  question={{
                    questionId: currentQuestion.questionId,
                    question: currentQuestion.question,
                    options: currentQuestion.options,
                    correctAnswer: currentQuestion.correctAnswer,
                    explanation: currentQuestion.explanation,
                    domain: currentQuestion.domain,
                    topic: currentQuestion.topic,
                    difficulty: currentQuestion.difficulty,
                    isCaseStudy: currentQuestion.isCaseStudy,
                    jurisdiction: currentQuestion.jurisdiction,
                  }}
                  userAnswer={currentQuestion.selectedAnswer}
                  isCorrect={currentQuestion.isCorrect}
                />

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
                  <button
                    onClick={() =>
                      setSelectedQuestion(
                        Math.max(1, (selectedQuestion || 1) - 1)
                      )
                    }
                    disabled={selectedQuestion === 1}
                    className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <div className="text-sm text-muted-foreground">
                    Question {selectedQuestion} of {reviewData.questions.length}
                  </div>
                  <button
                    onClick={() =>
                      setSelectedQuestion(
                        Math.min(
                          reviewData.questions.length,
                          (selectedQuestion || 1) + 1
                        )
                      )
                    }
                    disabled={selectedQuestion === reviewData.questions.length}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Next
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
