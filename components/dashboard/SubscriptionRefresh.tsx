"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Client component to refresh subscription status after Stripe checkout
 * Checks subscription status and refreshes page if needed
 */
export default function SubscriptionRefresh() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded");

  useEffect(() => {
    // If user just upgraded, check subscription status
    if (upgraded === "true") {
      const checkAndRefresh = async () => {
        try {
          // First, try manual upgrade endpoint (in case webhook didn't fire)
          const upgradeResponse = await fetch("/api/stripe/manual-upgrade", { method: "POST" });
          const upgradeData = await upgradeResponse.json();
          
          console.log("[SubscriptionRefresh] Manual upgrade response:", upgradeData);

          // Then check subscription status
          const response = await fetch("/api/stripe/check-subscription");
          const data = await response.json();

          console.log("[SubscriptionRefresh] Current status:", data);

          if (data.subscriptionTier === "premium") {
            // Refresh the page to show updated premium features
            // Use router.push to force a full page reload and clear cache
            setTimeout(() => {
              const currentPath = window.location.pathname;
              const currentSearch = window.location.search;
              router.push(currentPath + currentSearch);
              // Also force a hard refresh to clear any cached data
              window.location.reload();
            }, 1000);
          } else {
            // If still not premium, try again after longer delay
            console.log("[SubscriptionRefresh] Not premium yet, retrying in 5 seconds...");
            setTimeout(async () => {
              const retryResponse = await fetch("/api/stripe/manual-upgrade", { method: "POST" });
              const retryData = await retryResponse.json();
              console.log("[SubscriptionRefresh] Retry response:", retryData);
              router.refresh();
            }, 5000);
          }
        } catch (error) {
          console.error("[SubscriptionRefresh] Error:", error);
        }
      };

      // Wait a bit for webhook to process, then check
      const timeout = setTimeout(() => {
        checkAndRefresh();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [upgraded, router]);

  return null;
}

