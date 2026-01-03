"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PersonaType } from "@prisma/client";

interface Persona {
  type: PersonaType;
  name: string;
  description: string;
}

interface PersonaSelectionClientProps {
  personas: Persona[];
}

export default function PersonaSelectionClient({ personas }: PersonaSelectionClientProps) {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [customPersona, setCustomPersona] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePersonaSelect = (personaType: PersonaType) => {
    setSelectedPersona(personaType);
    setError("");
  };

  const handleSubmit = async () => {
    if (!selectedPersona) {
      setError("Please select a role");
      return;
    }

    if (selectedPersona === PersonaType.OTHER && !customPersona.trim()) {
      setError("Please describe your role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/onboarding/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaType: selectedPersona,
          customPersona: selectedPersona === PersonaType.OTHER ? customPersona : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save persona selection");
        setLoading(false);
        return;
      }

      // Redirect to knowledge assessment
      router.push("/onboarding/knowledge");
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
            Welcome to Startege! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's personalize your AI Governance learning experience
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-card rounded-lg shadow-card p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Step 1: Select Your Role
          </h2>
          <p className="text-muted-foreground">
            Choose the role that best describes your work or interests in AI governance. 
            This helps us tailor your learning experience and Startegizer AI assistant.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Persona Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {personas.map((persona) => (
            <button
              key={persona.type}
              onClick={() => handlePersonaSelect(persona.type)}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                selectedPersona === persona.type
                  ? "border-primary bg-primary/5 shadow-lg scale-105"
                  : "border-border bg-card hover:border-accent hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {persona.name}
                </h3>
                {selectedPersona === persona.type && (
                  <svg
                    className="w-6 h-6 text-primary"
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
              <p className="text-sm text-muted-foreground">
                {persona.description}
              </p>
            </button>
          ))}
        </div>

        {/* Custom Persona Input */}
        {selectedPersona === PersonaType.OTHER && (
          <div className="bg-card rounded-lg shadow-card p-6 mb-8 border border-border">
            <label htmlFor="customPersona" className="block text-sm font-medium text-foreground mb-2">
              Describe Your Role
            </label>
            <textarea
              id="customPersona"
              value={customPersona}
              onChange={(e) => setCustomPersona(e.target.value)}
              placeholder="e.g., AI Policy Analyst, Risk Manager, etc."
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent focus:border-accent"
              rows={3}
            />
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedPersona}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Continue to Knowledge Assessment →"}
          </button>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now (you can complete this later)
          </button>
        </div>
      </div>
    </div>
  );
}

