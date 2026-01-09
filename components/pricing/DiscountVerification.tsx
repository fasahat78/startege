"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Component to verify and record discount code usage when user returns from Stripe checkout
 * This is a fallback for when webhooks don't fire (e.g., local development)
 */
export default function DiscountVerification() {
  const searchParams = useSearchParams();
  const [verified, setVerified] = useState(false);
  const upgraded = searchParams?.get("upgraded");

  useEffect(() => {
    // Only verify if user returned from successful checkout and haven't verified yet
    if (upgraded === "true" && !verified && typeof window !== "undefined") {
      // Get session ID from sessionStorage (stored before redirect)
      const sessionId = sessionStorage.getItem("stripeCheckoutSessionId");
      
      if (sessionId) {
        verifyDiscountUsage(sessionId);
        // Clean up sessionStorage after use
        sessionStorage.removeItem("stripeCheckoutSessionId");
      }
    }
  }, [upgraded, verified]);

  const verifyDiscountUsage = async (sessionId: string) => {
    try {
      console.log("[DISCOUNT VERIFICATION] Verifying discount usage for session:", sessionId);
      
      const response = await fetch("/api/stripe/verify-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerified(true);
        if (data.discountApplied) {
          console.log(`[DISCOUNT VERIFICATION] ✅ Discount code usage recorded! Saved: $${(data.amountSaved / 100).toFixed(2)}`);
        } else {
          console.log("[DISCOUNT VERIFICATION] No discount code found in session");
        }
        
        // Always trigger subscription sync after checkout
        // This ensures premium status is granted even if webhook didn't fire
        try {
          console.log(`[DISCOUNT VERIFICATION] Triggering subscription sync...`);
          const syncResponse = await fetch("/api/stripe/manual-upgrade", {
            method: "POST",
          });
          const syncData = await syncResponse.json();
          
          if (syncResponse.ok && syncData.success) {
            console.log(`[DISCOUNT VERIFICATION] ✅ Subscription synced! Premium status granted.`);
            // Refresh the page to show updated status
            setTimeout(() => {
              window.location.reload();
            }, 1000); // Small delay to ensure database updates are complete
          } else {
            console.log(`[DISCOUNT VERIFICATION] ⚠️ Subscription sync response:`, syncData);
            // Still reload to show current status
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } catch (syncError: any) {
          console.error("[DISCOUNT VERIFICATION] Error syncing subscription:", syncError.message);
          // Reload anyway to check status
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        console.error("[DISCOUNT VERIFICATION] Error:", data.error);
      }
    } catch (error: any) {
      console.error("[DISCOUNT VERIFICATION] Failed to verify discount:", error.message);
    }
  };

  // This component doesn't render anything visible
  return null;
}

