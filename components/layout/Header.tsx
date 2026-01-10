"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Logo from "./Logo";
import UserMenu from "./UserMenu";

export default function Header() {
  const [user, setUser] = useState<{ email: string | null; name?: string | null } | null>(null);
  const [premiumMenuOpen, setPremiumMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const premiumMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check server-side session first (for users authenticated via session cookie)
    const checkServerSession = async () => {
      try {
        const response = await fetch("/api/auth/firebase/session", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser({
              email: data.user.email,
              name: data.user.name || null,
            });
            return; // Server session found, don't set up Firebase listener
          }
        }
      } catch (error) {
        console.error("[HEADER] Error checking server session:", error);
      }
      
      // Fallback to Firebase client-side auth state (for OAuth popups, etc.)
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            email: firebaseUser.email,
            name: firebaseUser.displayName || null,
          });
        } else {
          setUser(null);
        }
      });

      return () => unsubscribe();
    };

    checkServerSession();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (premiumMenuRef.current && !premiumMenuRef.current.contains(event.target as Node)) {
        setPremiumMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthPage = pathname?.startsWith("/auth");
  const isLandingPage = pathname === "/";
  
  // Check if any premium route is active
  const isPremiumRouteActive = pathname?.startsWith("/startegizer") || 
                                pathname?.startsWith("/aigp-exams") || 
                                pathname?.startsWith("/market-scan");
  
  // Check if any "more" route is active
  const isMoreRouteActive = pathname?.startsWith("/dashboard/badges") || 
                            pathname?.startsWith("/dashboard/feedback");

  if (isAuthPage || isLandingPage) {
    return null;
  }

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1 min-w-0">
            <Link href="/dashboard" className="flex items-center space-x-2 md:space-x-3 group flex-shrink-0">
              <div className="h-8 md:h-10 w-auto flex items-center">
                <Logo width={80} height={40} className="h-8 md:h-10 w-auto" priority />
              </div>
              <div className="flex flex-col justify-center hidden md:flex">
                <span className="text-base font-bold text-card-foreground leading-tight">
                  STARTEGE
                </span>
                <span className="text-xs font-medium text-muted-foreground leading-tight">
                  Master AI Governance
                </span>
              </div>
            </Link>
            <nav className="ml-2 sm:ml-4 md:ml-8 flex items-center space-x-0.5 sm:space-x-1 md:space-x-2 overflow-x-auto scrollbar-hide">
              {/* Primary Navigation - Always Visible */}
              <Link
                href="/dashboard"
                className={`px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  pathname === "/dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/concepts"
                className={`px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  pathname?.startsWith("/concepts")
                    ? "bg-primary/10 text-primary"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                Concepts
              </Link>
              <Link
                href="/challenges"
                className={`px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  pathname?.startsWith("/challenges")
                    ? "bg-primary/10 text-primary"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                Challenges
              </Link>

              {/* Premium Features Dropdown */}
              <div className="relative" ref={premiumMenuRef}>
                <button
                  onClick={() => {
                    setPremiumMenuOpen(!premiumMenuOpen);
                    setMoreMenuOpen(false);
                  }}
                  className={`px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap flex items-center gap-0.5 sm:gap-1 ${
                    isPremiumRouteActive
                      ? "bg-primary/10 text-primary"
                      : "text-card-foreground hover:bg-muted"
                  }`}
                >
                  Premium
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      premiumMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {premiumMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 sm:w-56 bg-card rounded-lg shadow-lg border border-border z-[100]">
                    <div className="py-1">
                      <Link
                        href="/startegizer"
                        onClick={() => setPremiumMenuOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                          pathname?.startsWith("/startegizer")
                            ? "bg-primary/10 text-primary"
                            : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Startegizer
                      </Link>
                      <Link
                        href="/aigp-exams"
                        onClick={() => setPremiumMenuOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                          pathname?.startsWith("/aigp-exams")
                            ? "bg-primary/10 text-primary"
                            : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        AIGP Prep Exams
                      </Link>
                      <Link
                        href="/market-scan"
                        onClick={() => setPremiumMenuOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                          pathname?.startsWith("/market-scan")
                            ? "bg-primary/10 text-primary"
                            : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Market Scan
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* More Menu Dropdown */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => {
                    setMoreMenuOpen(!moreMenuOpen);
                    setPremiumMenuOpen(false);
                  }}
                  className={`px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap flex items-center gap-0.5 sm:gap-1 ${
                    isMoreRouteActive
                      ? "bg-primary/10 text-primary"
                      : "text-card-foreground hover:bg-muted"
                  }`}
                >
                  More
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      moreMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {moreMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 sm:w-56 bg-card rounded-lg shadow-lg border border-border z-[100]">
                    <div className="py-1">
                      <Link
                        href="/dashboard/badges"
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                          pathname?.startsWith("/dashboard/badges")
                            ? "bg-primary/10 text-primary"
                            : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Achievements & Badges
                      </Link>
                      <Link
                        href="/dashboard/feedback"
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                          pathname?.startsWith("/dashboard/feedback")
                            ? "bg-primary/10 text-primary"
                            : "text-card-foreground hover:bg-muted"
                        }`}
                      >
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Send Feedback
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing - Always Visible */}
              <Link
                href="/pricing"
                className={`px-1.5 sm:px-2 md:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  pathname === "/pricing"
                    ? "bg-primary/10 text-primary"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center ml-2">
            {user && <UserMenu user={user} />}
          </div>
        </div>
      </div>
    </header>
  );
}

