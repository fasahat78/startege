"use client";

// SessionProvider is now a no-op since we're using Firebase auth
// Kept for compatibility with existing code that might reference it
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

