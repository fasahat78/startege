"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExamInterface from "@/components/challenges/ExamInterface";

function ExamPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setError("No attempt ID provided");
      setLoading(false);
      return;
    }

    // The exam data should have been passed from the start page
    // For now, we'll need to fetch it or store it in sessionStorage
    const storedData = sessionStorage.getItem(`exam_${attemptId}`);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Ensure attemptId is set in examData (it should be in the response)
      // Use the attemptId from URL if it's missing from stored data
      if (!parsedData.attemptId || parsedData.attemptId === 'undefined') {
        if (attemptId && attemptId !== 'undefined') {
          parsedData.attemptId = attemptId;
        } else {
          console.error("Invalid attemptId:", { 
            storedAttemptId: parsedData.attemptId, 
            urlAttemptId: attemptId,
            keys: Object.keys(parsedData),
          });
          setError("Invalid attempt ID. Please start the challenge again.");
          setLoading(false);
          return;
        }
      }
      
      // Validate attemptId is a valid string (not 'undefined')
      if (parsedData.attemptId === 'undefined' || !parsedData.attemptId) {
        console.error("Invalid attemptId in stored data:", parsedData.attemptId);
        setError("Invalid attempt ID in stored data. Please start the challenge again.");
        setLoading(false);
        return;
      }
      
      console.log("Loaded exam data:", { 
        hasAttemptId: !!parsedData.attemptId, 
        attemptId: parsedData.attemptId,
        urlAttemptId: attemptId,
        keys: Object.keys(parsedData),
      });
      setExamData(parsedData);
      setLoading(false);
    } else {
      console.error("No stored exam data found for attemptId:", attemptId);
      setError("Exam data not found. Please start the challenge again.");
      setLoading(false);
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="bg-card rounded-lg shadow-card p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-card-foreground mb-4">Error</h2>
          <p className="text-muted-foreground mb-6">{error || "Failed to load exam"}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <ExamInterface examData={examData} attemptId={attemptId!} />;
}

export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading exam...</p>
          </div>
        </div>
      }
    >
      <ExamPageContent />
    </Suspense>
  );
}

