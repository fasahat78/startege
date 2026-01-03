"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";

interface BillingClientProps {
  hasSubscription: boolean;
  stripeCustomerId: string | null;
  showHistory?: boolean;
}

export default function BillingClient({ hasSubscription, stripeCustomerId, showHistory }: BillingClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleManageSubscription = async () => {
    if (!hasSubscription || !stripeCustomerId) {
      router.push("/pricing");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create portal session");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (err: any) {
      console.error("Error opening Stripe portal:", err);
      const errorMessage = err.message || "Failed to open billing portal. Please try again.";
      setError(errorMessage);
      toast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleManageSubscription}
        disabled={loading}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Loading...
          </span>
        ) : showHistory ? (
          "View Full Billing History"
        ) : (
          "Manage Subscription & Billing"
        )}
      </button>
      {error && (
        <p className="text-sm text-status-error">{error}</p>
      )}
    </div>
  );
}

