"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GoalsSelectionClientProps {
  goals: string[];
  isEditing?: boolean;
}

export default function GoalsSelectionClient({ goals, isEditing = false }: GoalsSelectionClientProps) {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoalToggle = (goal: string) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(goal)) {
      newSelected.delete(goal);
    } else {
      newSelected.add(goal);
    }
    setSelectedGoals(newSelected);
    setError("");
  };

  const handleSubmit = async () => {
    if (selectedGoals.size === 0) {
      setError("Please select at least one goal, or skip this step");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: Array.from(selectedGoals),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save goals");
        setLoading(false);
        return;
      }

      // Redirect to completion page (or back to profile if editing)
      router.push(isEditing ? "/dashboard/profile" : "/onboarding/complete");
    } catch (error) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Save empty goals
      await fetch("/api/onboarding/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goals: [] }),
      });
      router.push(isEditing ? "/dashboard/profile" : "/onboarding/complete");
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
            What are your goals?
          </h1>
          <p className="text-lg text-muted-foreground">
            Select all that apply - this helps us prioritize content for you
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-card rounded-lg shadow-card p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Step 4: Select Your Goals
          </h2>
          <p className="text-muted-foreground">
            What do you want to achieve with AI governance learning? Select all that apply.
            This helps us recommend the right learning path and customize Startegizer for your objectives.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {goals.map((goal) => {
            const isSelected = selectedGoals.has(goal);
            return (
              <button
                key={goal}
                onClick={() => handleGoalToggle(goal)}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg scale-105"
                    : "border-border bg-card hover:border-accent hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-foreground font-medium">{goal}</span>
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
            disabled={loading || selectedGoals.size === 0}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : `Complete with ${selectedGoals.size} goal${selectedGoals.size !== 1 ? "s" : ""} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

