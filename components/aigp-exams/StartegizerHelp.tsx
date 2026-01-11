"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { toast } from "@/components/ui/Toast";

interface ReviewQuestion {
  questionId: string;
  question: string;
  options: Array<{ key: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  domain: string;
  topic: string;
  difficulty: string;
  isCaseStudy: boolean;
  jurisdiction: string;
}

interface StartegizerHelpProps {
  attemptId: string;
  questionId: string;
  question: ReviewQuestion;
  userAnswer: string | null;
  isCorrect: boolean;
}

export default function StartegizerHelp({
  attemptId,
  questionId,
  question,
  userAnswer,
  isCorrect,
}: StartegizerHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [creditError, setCreditError] = useState<string | null>(null);

  // Reset explanation state when questionId changes
  useEffect(() => {
    setIsExpanded(false);
    setAiExplanation(null);
    setUserQuestion("");
    setCreditError(null);
  }, [questionId]);

  const handleGetExplanation = async (customQuestion?: string) => {
    try {
      setLoading(true);
      setCreditError(null);
      
      const response = await fetch(
        `/api/aigp-exams/attempts/${attemptId}/explain`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Include cookies for authentication
          body: JSON.stringify({
            questionId,
            userQuestion: customQuestion || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = "";
        if (response.status === 401) {
          errorMsg = "Please sign in to use this feature";
        } else if (response.status === 402) {
          errorMsg = data.message || "Insufficient credits";
        } else if (response.status === 403) {
          errorMsg = "Premium subscription required";
        } else {
          errorMsg = data.error || data.message || "Failed to get explanation";
        }
        setCreditError(errorMsg);
        toast(errorMsg, response.status === 402 ? "warning" : "error");
        return;
      }

      setAiExplanation(data.explanation);
      if (data.credits) {
        setCreditBalance(data.credits.balance);
        if (data.credits.deducted > 0) {
          toast(`Used ${data.credits.deducted} credits`, "info", 3000);
        }
      }
      setIsExpanded(true);
      toast("Explanation generated!", "success");
    } catch (error) {
      console.error("Error getting AI explanation:", error);
      const errorMsg = "Failed to get explanation";
      setCreditError(errorMsg);
      toast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;
    
    const questionToAsk = userQuestion;
    setUserQuestion("");
    await handleGetExplanation(questionToAsk);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-card-foreground mb-1">
                Need More Help?
              </h4>
              <p className="text-sm text-muted-foreground">
                Get a detailed AI explanation from Startegizer
              </p>
            </div>
            {creditBalance !== null && (
              <div className="text-xs text-muted-foreground">
                Credits: {creditBalance}
              </div>
            )}
          </div>

          {creditError && (
            <div className="mb-4 p-3 bg-status-error/10 border border-status-error/30 rounded-lg">
              <p className="text-sm text-status-error">{creditError}</p>
            </div>
          )}

          {!isExpanded ? (
            <button
              onClick={() => handleGetExplanation()}
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Getting explanation...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get AI Explanation (10 credits)
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {aiExplanation && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3 mb-2">
                    <svg className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div className="flex-1">
                      <h5 className="font-medium text-card-foreground mb-3">Startegizer Explanation</h5>
                      <div className="prose prose-sm max-w-none text-card-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-card-foreground">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => (
                              <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-card-foreground">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="mb-3 p-3 bg-muted rounded-lg overflow-x-auto">
                                {children}
                              </pre>
                            ),
                            h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-primary/30 pl-4 my-3 italic text-muted-foreground">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {aiExplanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAskQuestion} className="space-y-2">
                <label className="block text-sm font-medium text-card-foreground">
                  Ask a follow-up question:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="e.g., Can you explain more about data drift?"
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={loading || !userQuestion.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Ask
                  </button>
                </div>
              </form>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  setAiExplanation(null);
                  setUserQuestion("");
                }}
                className="text-sm text-muted-foreground hover:text-card-foreground transition"
              >
                Hide explanation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

