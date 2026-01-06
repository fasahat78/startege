"use client";

/**
 * Component that handles Stripe redirects and refreshes the session cookie
 * This ensures users stay logged in after Stripe checkout redirects
 */

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { refreshSessionCookie } from "@/lib/firebase-client-refresh";

export default function StripeRedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    // Check if this is a Stripe redirect (has upgraded or credits_purchased params)
    const upgraded = searchParams.get("upgraded");
    const creditsPurchased = searchParams.get("credits_purchased");
    const isStripeRedirect = upgraded === "true" || creditsPurchased === "true";

    if (!isStripeRedirect || hasHandledRef.current) {
      return;
    }

    hasHandledRef.current = true;

    // User is coming from Stripe redirect
    // Check if client-side Firebase auth is still valid
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is authenticated on client side
        // Refresh the server-side session cookie to ensure it's synced
        console.log("[STRIPE REDIRECT] User authenticated, refreshing session cookie...");
        try {
          const success = await refreshSessionCookie();
          if (success) {
            console.log("[STRIPE REDIRECT] ✅ Session cookie refreshed successfully");
            // Refresh the page to reload server-side data
            router.refresh();
          } else {
            console.warn("[STRIPE REDIRECT] ⚠️ Failed to refresh session cookie");
          }
        } catch (error) {
          console.error("[STRIPE REDIRECT] Error refreshing session:", error);
        }
      } else {
        // User is not authenticated on client side
        // This shouldn't happen if cookie is valid, but let's handle it
        console.warn("[STRIPE REDIRECT] ⚠️ User not authenticated on client side");
      }
      unsubscribe();
    });

    return () => {
      unsubscribe();
    };
  }, [searchParams, router]);

  return null; // This component doesn't render anything
}

