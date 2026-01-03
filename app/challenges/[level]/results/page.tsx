"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import ExamResults from "@/components/challenges/ExamResults";

function ResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const attemptId = searchParams.get("attemptId");
  const level = parseInt(params.level as string) || 1;
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setError("No attempt ID provided");
      setLoading(false);
      return;
    }

    // Try to get results from sessionStorage first
    const storedResults = sessionStorage.getItem(`exam_result_${attemptId}`);
    if (storedResults) {
      setResults(JSON.parse(storedResults));
      setLoading(false);
      return;
    }

    // If not in sessionStorage, fetch from API (for past attempts)
    fetch(`/api/exams/attempts/${attemptId}/results`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch results: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching results:", err);
        setError("Failed to load results. Please try again.");
        setLoading(false);
      });
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="bg-card rounded-lg shadow-card p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-card-foreground mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error || "Failed to load results"}</p>
          <Link
            href="/challenges"
            className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg text-center transition"
          >
            Go to Challenges
          </Link>
        </div>
      </div>
    );
  }

  return <ExamResults results={results} attemptId={attemptId!} level={level} />;
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading results...</p>
          </div>
        </div>
      }
    >
      <ResultsPageContent />
    </Suspense>
  );
}

