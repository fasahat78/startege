"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface InterestsSelectionClientProps {
  interests: string[];
}

export default function InterestsSelectionClient({ interests }: InterestsSelectionClientProps) {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInterestToggle = (interest: string) => {
    const newSelected = new Set(selectedInterests);
    if (newSelected.has(interest)) {
      newSelected.delete(interest);
    } else {
      newSelected.add(interest);
    }
    setSelectedInterests(newSelected);
    setError("");
  };

  const handleSubmit = async () => {
    if (selectedInterests.size === 0) {
      setError("Please select at least one interest, or skip this step");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: Array.from(selectedInterests),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save interests");
        setLoading(false);
        return;
      }

      // Redirect to goals
      router.push("/onboarding/goals");
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Save empty interests
      await fetch("/api/onboarding/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: [] }),
      });
      router.push("/onboarding/goals");
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            What are your interests?
          </h1>
          <p className="text-lg text-muted-foreground">
            Select all that apply - this helps personalize your learning experience
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-card rounded-lg shadow-card p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Step 3: Select Your Interests
          </h2>
          <p className="text-muted-foreground">
            Choose the areas of AI governance that interest you most. You can select multiple options.
            This helps us recommend relevant concepts and customize Startegizer for you.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Interests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {interests.map((interest) => {
            const isSelected = selectedInterests.has(interest);
            return (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg scale-105"
                    : "border-border bg-card hover:border-accent hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-foreground font-medium">{interest}</span>
                  {isSelected && (
                    <svg
                      className="w-6 h-6 text-primary flex-shrink-0 ml-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedInterests.size === 0}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : `Continue with ${selectedInterests.size} interest${selectedInterests.size !== 1 ? "s" : ""} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

