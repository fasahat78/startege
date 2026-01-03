"use client";

/**
 * Component that automatically refreshes the session cookie when needed
 * Detects when user is authenticated on client but server cookie might be expired
 */

import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { refreshSessionCookie } from "@/lib/firebase-client-refresh";
import { usePathname, useRouter } from "next/navigation";

export default function SessionRefresh() {
  const pathname = usePathname();
  const router = useRouter();
  const isRefreshingRef = useRef(false);
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    // Don't refresh on auth pages
    if (pathname?.startsWith("/auth")) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || isRefreshingRef.current) {
        return;
      }

      // Throttle checks - only check once per 30 seconds
      const now = Date.now();
      if (now - lastCheckRef.current < 30000) {
        return;
      }
      lastCheckRef.current = now;

      // User is authenticated on client side
      // Check if server-side cookie might be expired by making a test request
      try {
        const response = await fetch("/api/auth/firebase/diagnose", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json().catch(() => ({}));
        
        // If token is invalid or expired, refresh it
        if (!data.token?.valid) {
          console.log("[SESSION REFRESH] Server cookie expired, refreshing...");
          isRefreshingRef.current = true;
          const success = await refreshSessionCookie(pathname || undefined);
          if (success) {
            // Refresh the page to reload server-side data
            router.refresh();
          }
          isRefreshingRef.current = false;
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.log("[SESSION REFRESH] Could not check session status");
        isRefreshingRef.current = false;
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return null; // This component doesn't render anything
}

