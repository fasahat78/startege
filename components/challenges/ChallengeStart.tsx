"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChallengeStartProps {
  challenge: {
    id: string;
    level: number;
    title: string;
    description: string | null;
    questionCount: number;
    timeLimit: number;
    passingScore: number;
  };
  levelConfig: {
    level: number;
    title: string;
    description: string;
    outcomeStatement: string;
    questionCount: number;
    timeLimit: number;
    passingScore: number;
    basePoints: number;
  };
  userProgress: {
    passedAt: Date | null;
    bestScore: number | null;
    attemptsCount: number;
  } | null;
  concepts: Array<{
    id: string;
    concept: string;
    domain: string;
  }>;
  pastAttempts?: Array<{
    id: string;
    attemptNumber: number;
    score: number | null;
    pass: boolean | null;
    submittedAt: Date | null;
    evaluatedAt: Date | null;
    startedAt: Date;
  }>;
}

export default function ChallengeStart({
  challenge,
  levelConfig,
  userProgress,
  concepts,
  pastAttempts = [],
}: ChallengeStartProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const levelNum = (challenge as any).levelNumber || challenge.level;
      
      // Step 1: Get examId for this level
      const challengeResponse = await fetch(`/api/challenges/${levelNum}/start`, {
        method: "POST",
      });

      if (!challengeResponse.ok) {
        const error = await challengeResponse.json();
        alert(error.error || "Failed to start challenge");
        setIsStarting(false);
        return;
      }

      const challengeData = await challengeResponse.json();
      
      if (!challengeData || !challengeData.examId) {
        console.error("Challenge response missing examId:", challengeData);
        alert("Failed to get exam ID. Please try again.");
        setIsStarting(false);
        return;
      }

      const { examId } = challengeData;
      console.log("Starting exam with examId:", examId);

      // Step 2: Start the exam using exam API
      const examResponse = await fetch(`/api/exams/${examId}/start`, {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      });
      
      console.log("Exam API response status:", examResponse.status);
      console.log("Exam API response ok:", examResponse.ok);
      console.log("Exam API response headers:", Object.fromEntries(examResponse.headers.entries()));
      console.log("Exam API response URL:", examResponse.url);

      // Read response body ONCE (can only be read once)
      const responseText = await examResponse.text();
      console.log("Raw response text:", responseText);
      console.log("Response text length:", responseText.length);
      console.log("Response text is empty:", responseText.trim() === "");
      console.log("Response text is '{}':", responseText.trim() === "{}");
      
      if (!examResponse.ok) {
        console.error("=== EXAM API ERROR DETAILS ===");
        console.error("Response status:", examResponse.status);
        console.error("Response statusText:", examResponse.statusText);
        console.error("Response URL:", examResponse.url);
        console.error("Response headers:", Object.fromEntries(examResponse.headers.entries()));
        console.error("Raw response text:", responseText);
        console.error("Response text length:", responseText?.length || 0);
        console.error("Response text is empty:", !responseText || responseText.trim() === "");
        console.error("Response text is '{}':", responseText?.trim() === "{}");
        
        let error;
        try {
          if (responseText && responseText.trim() !== "" && responseText.trim() !== "{}") {
            error = JSON.parse(responseText);
            console.error("Parsed error object:", error);
          } else {
            error = { 
              error: `Server returned ${examResponse.status} ${examResponse.statusText} with empty response`,
              status: examResponse.status,
              statusText: examResponse.statusText,
              emptyResponse: true,
            };
            console.error("Empty response detected, using fallback error");
          }
        } catch (parseError: any) {
          console.error("Failed to parse error response:", parseError);
          error = { 
            error: responseText || `Server returned ${examResponse.status} ${examResponse.statusText}`,
            status: examResponse.status,
            statusText: examResponse.statusText,
            rawResponse: responseText,
            parseError: parseError.message,
          };
        }
        
        // Handle specific error types with better UX
        let errorMessage: string;
        if (error.error === "COOLDOWN_ACTIVE" && error.nextEligibleAt) {
          const nextEligible = new Date(error.nextEligibleAt);
          const now = new Date();
          const secondsRemaining = Math.ceil((nextEligible.getTime() - now.getTime()) / 1000);
          const minutesRemaining = Math.floor(secondsRemaining / 60);
          const seconds = secondsRemaining % 60;
          
          if (minutesRemaining > 0) {
            errorMessage = `Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''} before starting a new attempt.`;
          } else {
            errorMessage = `Please wait ${secondsRemaining} second${secondsRemaining !== 1 ? 's' : ''} before starting a new attempt.`;
          }
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else {
          errorMessage = `Failed to start exam (${examResponse.status}). Check server logs for details.`;
        }
        
        // Include error details if available
        if (error.details || error.errorType) {
          console.error("Error details:", error.details);
          console.error("Error type:", error.errorType);
        }
        
        console.error("Final error message:", errorMessage);
        console.error("=== END ERROR DETAILS ===");
        
        alert(errorMessage);
        setIsStarting(false);
        return;
      }

      // Check content type
      const contentType = examResponse.headers.get("content-type");
      console.log("Response content-type:", contentType);
      console.log("Raw response text:", responseText);
      console.log("Response text length:", responseText.length);
      console.log("Response text is empty:", responseText.trim() === "");
      console.log("Response text is '{}':", responseText.trim() === "{}");
      
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Unexpected content type:", contentType);
        console.error("Response text:", responseText);
        alert("Invalid response format from server. Please try again.");
        setIsStarting(false);
        return;
      }

      // Parse JSON response
      let examData;
      try {
        if (!responseText || responseText.trim() === "" || responseText.trim() === "{}") {
          console.error("Response body is empty or just empty object");
          console.error("Response status:", examResponse.status);
          console.error("Response URL:", examResponse.url);
          alert("Received empty response from server. Please check the console and try again.");
          setIsStarting(false);
          return;
        }
        examData = JSON.parse(responseText);
      } catch (err) {
        console.error("Failed to parse exam response as JSON:", err);
        console.error("Response text:", responseText);
        console.error("Response status:", examResponse.status);
        alert("Failed to parse exam response. Please check the console.");
        setIsStarting(false);
        return;
      }
      
      console.log("Parsed exam data:", examData);
      console.log("Exam data keys:", Object.keys(examData || {}));
      console.log("Exam data attemptId:", examData?.attemptId);
      console.log("Exam data type:", typeof examData);
      
      // Check if response is an error (even if status is 200)
      if (examData.error) {
        console.error("API returned error:", examData);
        alert(examData.error || "Failed to start exam");
        setIsStarting(false);
        return;
      }
      
      // Validate exam data is not empty
      if (!examData || Object.keys(examData).length === 0) {
        console.error("Exam data is empty object");
        console.error("Response status:", examResponse.status);
        console.error("Response headers:", Object.fromEntries(examResponse.headers.entries()));
        console.error("Response URL:", examResponse.url);
        alert("Received empty response from server. Please check the console and try again.");
        setIsStarting(false);
        return;
      }
      
      // Validate exam data structure
      if (!examData.challenge) {
        console.error("Exam data missing challenge:", examData);
        console.error("Response status:", examResponse.status);
        console.error("Full exam data:", JSON.stringify(examData, null, 2));
        alert("Invalid exam data structure. Please check the console and try again.");
        setIsStarting(false);
        return;
      }
      
      // Validate attemptId is present
      if (!examData.attemptId) {
        console.error("Exam data missing attemptId:", examData);
        console.error("Exam data keys:", Object.keys(examData || {}));
        console.error("Full exam data:", JSON.stringify(examData, null, 2));
        console.error("Response status:", examResponse.status);
        console.error("Response URL:", examResponse.url);
        alert("Failed to get attempt ID. Please check the console and try again.");
        setIsStarting(false);
        return;
      }
      
      // Ensure attemptId is set in examData (defensive)
      examData.attemptId = examData.attemptId;
      
      console.log("Storing exam data with attemptId:", examData.attemptId);
      
      // Store exam data in sessionStorage for the exam page
      sessionStorage.setItem(`exam_${examData.attemptId}`, JSON.stringify(examData));
      
      // Close modal and navigate
      setIsStarting(false);
      
      // Use window.location for reliable navigation
      const examUrl = `/challenges/${levelNum}/exam?attemptId=${examData.attemptId}`;
      console.log("Navigating to:", examUrl);
      window.location.href = examUrl;
    } catch (error) {
      console.error("Error starting challenge:", error);
      alert("Failed to start challenge");
      setIsStarting(false);
    }
  };

  // Check if level is completed: userProgress must exist AND passedAt must be truthy (not null/undefined)
  // Handle both Date objects and date strings from JSON serialization
  const isCompleted = userProgress !== null && 
    userProgress !== undefined &&
    userProgress.passedAt !== null && 
    userProgress.passedAt !== undefined;
  const bestScore = userProgress?.bestScore || 0;

  return (
    <div className="bg-card rounded-lg shadow-card p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-card-foreground">
              Level {(challenge as any).levelNumber || challenge.level}: {challenge.title}
            </h1>
            {challenge.description && (
              <p className="text-muted-foreground mt-2">{challenge.description}</p>
            )}
          </div>
          {isCompleted && (
            <span className="px-4 py-2 bg-status-success/10 text-status-success border border-status-success/20 rounded-lg font-semibold">
              Completed ✓
            </span>
          )}
        </div>
        
        {/* Outcome Statement */}
        {levelConfig.outcomeStatement && (
          <div className="bg-accent/10 border-l-4 border-accent rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-accent mb-1">
                  This Level Answers...
                </h3>
                <p className="text-base text-card-foreground font-medium">
                  {levelConfig.outcomeStatement}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Challenge Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="text-sm font-medium text-accent mb-1">
            Questions
          </div>
          <div className="text-2xl font-bold text-brand-midnight">
            {challenge.questionCount}
          </div>
        </div>
        <div className="bg-status-warning/10 border border-status-warning/20 rounded-lg p-4">
          <div className="text-sm font-medium text-status-warning mb-1">
            Time Limit
          </div>
          <div className="text-2xl font-bold text-brand-midnight">
            {challenge.timeLimit} min
          </div>
        </div>
        <div className="bg-status-success/10 border border-status-success/20 rounded-lg p-4">
          <div className="text-sm font-medium text-status-success mb-1">
            Passing Score
          </div>
          <div className="text-2xl font-bold text-brand-midnight">
            {challenge.passingScore}%
          </div>
        </div>
      </div>

      {/* Previous Attempt Info */}
      {userProgress && userProgress.attemptsCount > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Best Score
            </div>
            <div className="text-2xl font-bold text-card-foreground">
              {Math.round(bestScore)}%
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Attempts
            </div>
            <div className="text-2xl font-bold text-card-foreground">
              {userProgress.attemptsCount}
            </div>
          </div>
        </div>
      )}

      {/* Concepts Covered */}
      {concepts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Concepts Covered ({concepts.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {concepts.map((concept) => (
              <Link
                key={concept.id}
                href={`/concepts/${concept.id}`}
                className="group bg-card rounded-lg border border-border p-4 hover:border-accent hover:shadow-card transition-all duration-200 flex flex-col justify-between min-h-[120px]"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-card-foreground mb-2 line-clamp-3 group-hover:text-accent transition">
                    {concept.concept}
                  </div>
                  <div className="text-xs text-muted-foreground">{concept.domain}</div>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <svg
                    className="h-4 w-4 text-muted-foreground group-hover:text-accent transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past Attempts */}
      {pastAttempts && pastAttempts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Past Attempts ({pastAttempts.length})
          </h2>
          <div className="space-y-3">
            {pastAttempts.map((attempt) => {
              const score = attempt.score !== null ? Math.round(attempt.score) : null;
              
              // Format dates consistently to avoid hydration mismatch
              let submittedDate: string | null = null;
              let submittedTime: string | null = null;
              
              if (attempt.submittedAt) {
                const date = new Date(attempt.submittedAt);
                // Use consistent format: DD/MM/YYYY
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                submittedDate = `${day}/${month}/${year}`;
                
                // Use consistent time format: HH:MM
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                submittedTime = `${hours}:${minutes}`;
              }
              
              return (
                <div
                  key={attempt.id}
                  className={`border-2 rounded-lg p-4 ${
                    attempt.pass
                      ? "border-status-success/20 bg-status-success/10"
                      : "border-status-error/20 bg-status-error/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-sm font-medium text-card-foreground">
                          Attempt #{attempt.attemptNumber}
                        </div>
                        {submittedDate && (
                          <div className="text-xs text-muted-foreground">
                            {submittedDate} at {submittedTime}
                          </div>
                        )}
                      </div>
                      {score !== null && (
                        <div className={`px-3 py-1 rounded font-semibold ${
                          attempt.pass
                            ? "bg-status-success/20 text-status-success"
                            : "bg-status-error/20 text-status-error"
                        }`}>
                          {score}%
                        </div>
                      )}
                      {attempt.pass !== null && (
                        <div className={`px-3 py-1 rounded text-sm font-medium ${
                          attempt.pass
                            ? "bg-status-success/30 text-status-success border border-status-success/20"
                            : "bg-status-error/30 text-status-error border border-status-error/20"
                        }`}>
                          {attempt.pass ? "✓ Passed" : "✗ Failed"}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/challenges/${challenge.level}/results?attemptId=${attempt.id}`}
                      className="text-accent hover:text-accent/80 text-sm font-medium"
                    >
                      View Results →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Answer all {challenge.questionCount} questions</li>
          <li>You have {challenge.timeLimit} minutes to complete</li>
          <li>You need {challenge.passingScore}% to pass</li>
          <li>You can navigate between questions</li>
          <li>Review your answers before submitting</li>
        </ul>
      </div>

      {/* Start Button */}
      <div className="flex gap-4">
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-status-disabled disabled:text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          {isStarting ? "Starting..." : isCompleted ? "Retake Challenge" : "Start Challenge"}
        </button>
        <Link
          href="/challenges"
          className="px-6 py-3 border border-border text-foreground hover:bg-muted rounded-lg font-medium transition"
        >
          Cancel
        </Link>
      </div>

      {/* Loading Modal for Exam Generation */}
      {isStarting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-float p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-2">
                Generating Your Exam
              </h3>
              <p className="text-muted-foreground mb-4">
                Creating personalized questions using AI...
              </p>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div className="bg-accent h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
              <p className="text-sm text-muted-foreground">
                This may take 10-30 seconds
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

