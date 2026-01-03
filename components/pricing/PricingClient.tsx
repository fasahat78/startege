"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AnnualUpgradeWarning from "./AnnualUpgradeWarning";

interface PricingClientProps {
  isPremium: boolean;
  planType: "monthly" | "annual" | "credits-small" | "credits-standard" | "credits-large";
  currentPlanType?: string | null; // "monthly", "annual", or null
}

export default function PricingClient({ isPremium, planType, currentPlanType }: PricingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAnnualWarning, setShowAnnualWarning] = useState(false);

  // Debug logging
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("[PRICING CLIENT] Props:", { isPremium, planType, currentPlanType });
  }

  const handleCheckout = async () => {
    setLoading(true);

    try {
      let response;
      
      // Handle credit purchases differently
      if (planType.startsWith("credits-")) {
        const creditType = planType.replace("credits-", "") as "small" | "standard" | "large";
        response = await fetch("/api/stripe/purchase-credits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creditType,
          }),
        });
      } else {
        // Subscription purchase
        response = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planType: planType === "annual" ? "annual" : "monthly",
            returnUrl: window.location.origin + "/pricing",
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        // Store that we're coming from pricing page
        sessionStorage.setItem("checkoutFrom", "pricing");
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  // For subscriptions, show "Current Plan" only if this is the active plan
  if (planType === "monthly" && currentPlanType === "monthly") {
    return (
      <button
        disabled
        className="block w-full text-center px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed"
      >
        Current Plan
      </button>
    );
  }
  
  if (planType === "annual" && currentPlanType === "annual") {
    return (
      <button
        disabled
        className="block w-full text-center px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed"
      >
        Current Plan
      </button>
    );
  }

  // Prevent downgrade: If user is on annual plan, disable monthly plan option
  if (planType === "monthly" && (currentPlanType === "annual" || currentPlanType === "year")) {
    return (
      <>
        <button
          disabled
          className="block w-full text-center px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed"
        >
          Downgrade Not Available
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Annual plan cannot be downgraded until period ends
        </p>
      </>
    );
  }
  
  // Handle annual upgrade with warning
  const handleAnnualUpgrade = () => {
    if (currentPlanType === "monthly") {
      // Show warning modal before upgrading
      setShowAnnualWarning(true);
    } else {
      // Direct checkout for new subscriptions
      handleCheckout();
    }
  };

  const confirmAnnualUpgrade = () => {
    setShowAnnualWarning(false);
    handleCheckout();
  };
  
  // For credit purchases, require premium
  if (planType.startsWith("credits-") && !isPremium) {
    return (
      <>
        <button
          disabled
          className="block w-full text-center px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed"
        >
          Premium Required
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Upgrade to premium to purchase credits
        </p>
      </>
    );
  }

  // Button text based on plan type
  const getButtonText = () => {
    if (loading) return "Loading...";
    
    switch (planType) {
      case "monthly":
        return "Upgrade to Premium";
      case "annual":
        return "Get Annual Plan";
      case "credits-small":
        return "Buy Small Credits";
      case "credits-standard":
        return "Buy Standard Credits";
      case "credits-large":
        return "Buy Large Credits";
      default:
        return "Purchase";
    }
  };

  // For annual plan upgrades from monthly, show warning first
  const handleButtonClick = () => {
    if (planType === "annual" && currentPlanType === "monthly") {
      handleAnnualUpgrade();
    } else {
      handleCheckout();
    }
  };

  return (
    <>
      <AnnualUpgradeWarning
        isOpen={showAnnualWarning}
        onConfirm={confirmAnnualUpgrade}
        onCancel={() => setShowAnnualWarning(false)}
      />
      <button
        onClick={handleButtonClick}
        disabled={loading}
        className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {getButtonText()}
      </button>
      {planType.startsWith("credits-") ? (
        <p className="text-xs text-muted-foreground text-center mt-2">
          One-time purchase • Credits never expire
        </p>
      ) : (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Secure payment powered by Stripe
        </p>
      )}
    </>
  );
}
