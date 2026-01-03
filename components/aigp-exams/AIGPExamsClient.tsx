"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";

interface Exam {
  id: string;
  examId: string;
  title: string;
  version: string;
  description: string | null;
  totalQuestions: number;
  estimatedTimeMin: number;
  domainDistribution: any;
  difficultyDistribution: any;
  createdAt: Date;
  attempts: Array<{
    id: string;
    attemptNumber: number;
    status: string;
    score: number | null;
    submittedAt: Date | null;
  }>;
}

interface AIGPExamsClientProps {
  exams: Exam[];
}

export default function AIGPExamsClient({ exams }: AIGPExamsClientProps) {
  const router = useRouter();

  const handleStartExam = async (examId: string) => {
    try {
      const response = await fetch(`/api/aigp-exams/${examId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTimed: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.error || "Failed to start exam";
        toast(errorMsg, "error");
        return;
      }

      const data = await response.json();
      toast("Exam started! Good luck!", "success");
      router.push(`/aigp-exams/${examId}/attempt/${data.attemptId}`);
    } catch (error) {
      console.error("Error starting exam:", error);
      toast("Failed to start exam. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-card-foreground mb-4 inline-flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            AIGP Prep Exams
          </h1>
          <p className="text-muted-foreground">
            Full-length practice exams aligned with AIGP certification blueprint. Each exam contains 100 questions covering all domains.
          </p>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const latestAttempt = exam.attempts[0];
            const bestScore = exam.attempts.reduce(
              (max, a) => Math.max(max, a.score || 0),
              0
            );

            return (
              <div
                key={exam.id}
                className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-float transition"
              >
                {/* Exam Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-card-foreground mb-1">
                    {exam.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Version {exam.version}
                  </p>
                </div>

                {/* Exam Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium text-card-foreground">
                      {exam.totalQuestions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <span className="font-medium text-card-foreground">
                      {exam.estimatedTimeMin} minutes
                    </span>
                  </div>
                  {bestScore > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Best Score:</span>
                      <span className="font-medium text-status-success">
                        {bestScore.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Domain Distribution */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Domain Distribution:
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {Object.entries(exam.domainDistribution || {}).map(
                      ([domain, count]: [string, any]) => (
                        <div key={domain} className="text-center">
                          <div className="font-semibold text-card-foreground">
                            {count}
                          </div>
                          <div className="text-muted-foreground">Domain {domain}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Attempt History */}
                {exam.attempts.length > 0 && (
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Recent Attempts:
                    </p>
                    <div className="space-y-1">
                      {exam.attempts.slice(0, 3).map((attempt) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">
                            Attempt #{attempt.attemptNumber}
                          </span>
                          {attempt.status === "SUBMITTED" && attempt.score !== null ? (
                            <span
                              className={`font-medium ${
                                attempt.score >= 70
                                  ? "text-status-success"
                                  : "text-status-error"
                              }`}
                            >
                              {attempt.score.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">In Progress</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {latestAttempt?.status === "IN_PROGRESS" ? (
                    <Link
                      href={`/aigp-exams/${exam.examId}/attempt/${latestAttempt.id}`}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition text-center"
                    >
                      Continue Exam
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleStartExam(exam.examId)}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
                    >
                      Start Exam
                    </button>
                  )}
                  {latestAttempt?.status === "SUBMITTED" && (
                    <Link
                      href={`/aigp-exams/${exam.examId}/attempt/${latestAttempt.id}/review`}
                      className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            About AIGP Prep Exams
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Each exam follows the AIGP blueprint: Domain I (20%), Domain II (30%), Domain III (30%), Domain IV (20%)</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Questions include case studies, multiple difficulty levels, and cover US, EU, and other jurisdictions</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You can pause and resume exams, flag questions for review, and take multiple attempts</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>After submission, review detailed analytics by domain, difficulty, jurisdiction, and topic</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

