"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FeedbackType } from "@prisma/client";

const FEEDBACK_TYPES = [
  { value: FeedbackType.BUG, label: "Bug Report", icon: "🐛", description: "Something isn't working as expected" },
  { value: FeedbackType.FEATURE_REQUEST, label: "Feature Request", icon: "💡", description: "Suggest a new feature or improvement" },
  { value: FeedbackType.UX_ISSUE, label: "UX Issue", icon: "🎨", description: "User experience or design concern" },
  { value: FeedbackType.GENERAL, label: "General Feedback", icon: "💬", description: "Other comments or suggestions" },
];

export default function FeedbackFormClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [type, setType] = useState<FeedbackType | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Capture current page URL for context
    if (typeof window !== "undefined") {
      // Already have pathname from usePathname
    }
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!type) {
      setError("Please select a feedback type");
      return;
    }

    if (!message.trim()) {
      setError("Please enter your feedback message");
      return;
    }

    if (message.trim().length < 10) {
      setError("Please provide more details (at least 10 characters)");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim() || null,
          message: message.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
          metadata: {
            userAgent: typeof window !== "undefined" ? navigator.userAgent : null,
            screenResolution: typeof window !== "undefined" 
              ? `${window.screen.width}x${window.screen.height}` 
              : null,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit feedback");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setType(null);
      setTitle("");
      setMessage("");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6 border border-border">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-status-success/10 border border-status-success/20 text-status-success rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Thank you! Your feedback has been submitted.</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 text-status-error rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feedback Type Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            What type of feedback is this? <span className="text-status-error">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FEEDBACK_TYPES.map((feedbackType) => (
              <button
                key={feedbackType.value}
                type="button"
                onClick={() => setType(feedbackType.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  type === feedbackType.value
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-muted/50 hover:border-accent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{feedbackType.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-card-foreground mb-1">
                      {feedbackType.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {feedbackType.description}
                    </div>
                  </div>
                  {type === feedbackType.value && (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Title (Optional) */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
            Title (Optional)
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of your feedback"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent focus:border-accent"
            maxLength={200}
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
            Details <span className="text-status-error">*</span>
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please provide as much detail as possible. For bugs, include steps to reproduce. For feature requests, explain the use case."
            rows={8}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent focus:border-accent resize-none"
            required
            minLength={10}
          />
          <div className="mt-1 text-xs text-muted-foreground">
            {message.length} characters (minimum 10)
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Your feedback helps us improve Startege for everyone.
          </p>
          <button
            type="submit"
            disabled={loading || !type || !message.trim() || message.trim().length < 10}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
}

