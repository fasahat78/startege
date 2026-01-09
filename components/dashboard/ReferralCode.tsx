"use client";

import { useState } from "react";

interface ReferralCodeProps {
  referralCode: string;
  referralCount: number;
}

export default function ReferralCode({ referralCode, referralCount }: ReferralCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const referralLink = `${window.location.origin}/auth/signup-firebase?ref=${referralCode}`;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 p-4 bg-card/50 rounded-lg border border-border">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Referral Program</p>
          <p className="text-xs text-muted-foreground mb-3">
            Share your code with friends and earn rewards when they sign up!
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <code className="px-3 py-1.5 bg-background rounded font-mono font-semibold text-foreground border border-border">
          {referralCode}
        </code>
        <button
          onClick={handleCopy}
          className="text-sm px-3 py-1.5 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition font-medium"
        >
          {copied ? "✓ Copied!" : "Copy Link"}
        </button>
      </div>
      {referralCount > 0 ? (
        <p className="text-xs text-status-success mt-2 font-medium">
          🎉 {referralCount} referral{referralCount !== 1 ? "s" : ""} • Earn 1 month free per referral!
        </p>
      ) : (
        <p className="text-xs text-muted-foreground mt-2">
          Share your link to start earning rewards!
        </p>
      )}
    </div>
  );
}

