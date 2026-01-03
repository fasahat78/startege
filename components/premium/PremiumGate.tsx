"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
  requiresProfile?: boolean;
}

export default function PremiumGate({
  feature,
  children,
  requiresProfile = false,
}: PremiumGateProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user subscription tier from API
        try {
          const response = await fetch("/api/user/subscription-tier");
          if (response.ok) {
            const data = await response.json();
            setIsPremium(data.subscriptionTier === "premium");
          }
        } catch (error) {
          console.error("Failed to fetch subscription tier:", error);
        }
      } else {
        setIsPremium(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  // Note: Profile completion check would need to be passed as prop or fetched
  // For now, we'll check premium only

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-card rounded-lg shadow-card p-8 max-w-md text-center border-2 border-border">
          <div className="mb-4">
            <svg
              className="h-16 w-16 mx-auto text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Premium Feature
          </h2>
          <p className="text-muted-foreground mb-6">
            {feature} is available for premium members only.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/pricing"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Upgrade to Premium
            </Link>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

