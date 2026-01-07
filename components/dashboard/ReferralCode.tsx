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
    <div className="mt-3 p-3 bg-card/50 rounded-lg border border-border">
      <p className="text-sm text-muted-foreground mb-1">Your Referral Code:</p>
      <div className="flex items-center gap-2">
        <code className="px-3 py-1 bg-background rounded font-mono font-semibold text-foreground">
          {referralCode}
        </code>
        <button
          onClick={handleCopy}
          className="text-sm text-accent hover:text-accent/80 transition"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
      {referralCount > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {referralCount} referral{referralCount !== 1 ? "s" : ""} • Earn 1 month free per referral!
        </p>
      )}
    </div>
  );
}

