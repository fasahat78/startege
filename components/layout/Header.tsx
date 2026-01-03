"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Logo from "./Logo";
import UserMenu from "./UserMenu";

export default function Header() {
  const [user, setUser] = useState<{ email: string | null; name?: string | null } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
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
  }, []);

  const isAuthPage = pathname?.startsWith("/auth");
  const isLandingPage = pathname === "/";

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
            <nav className="ml-4 md:ml-8 flex space-x-2 md:space-x-4 overflow-x-auto">
              <Link
                href="/dashboard"
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap ${
                  pathname === "/dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/concepts"
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap ${
                  pathname?.startsWith("/concepts")
                    ? "bg-primary/10 text-primary"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                Concepts
              </Link>
              <Link
                href="/challenges"
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap ${
                  pathname?.startsWith("/challenges")
                    ? "bg-primary/10 text-primary"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                Challenges
              </Link>
              <Link
                href="/startegizer"
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap ${
                  pathname?.startsWith("/startegizer")
                    ? "bg-primary/10 text-primary"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                Startegizer
              </Link>
              <Link
                href="/aigp-exams"
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap ${
                  pathname?.startsWith("/aigp-exams")
                    ? "bg-primary/10 text-primary"
                    : "text-card-foreground hover:bg-muted"
                }`}
              >
                AIGP Exams
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

