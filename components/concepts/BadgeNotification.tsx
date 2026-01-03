"use client";

import { useEffect, useState } from "react";

interface BadgeNotificationProps {
  badges: string[];
}

export default function BadgeNotification({ badges }: BadgeNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (badges.length > 0) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [badges]);

  if (!show || badges.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in px-4">
      <div className="bg-card rounded-lg shadow-float border-2 border-status-warning/30 p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-status-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-card-foreground">
              🎉 Badge Unlocked!
            </h3>
            <div className="mt-1">
              {badges.map((badge, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  {badge}
                </p>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="ml-4 flex-shrink-0 text-muted-foreground hover:text-card-foreground transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

