"use client";

import { useEffect, useState } from "react";
import { Coins, Calendar } from "lucide-react";

interface CreditPurchase {
  id: string;
  credits: number;
  description: string;
  date: string;
  stripePaymentId: string | null;
  balanceAfter: number;
}

interface CreditHistoryData {
  purchases: CreditPurchase[];
  totalPurchases: number;
}

export default function CreditPurchaseHistory() {
  const [data, setData] = useState<CreditHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditHistory();
  }, []);

  const fetchCreditHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/stripe/credit-history", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch credit history");
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error("Error fetching credit history:", err);
      setError(err.message || "Failed to load credit history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCredits = (credits: number) => {
    // Credits are stored as integers (not cents), so display as-is
    return new Intl.NumberFormat("en-US").format(credits);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-16" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-status-error text-sm mb-2">{error}</p>
        <button
          onClick={fetchCreditHistory}
          className="text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.purchases.length === 0) {
    return (
      <div className="text-center py-6">
        <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground mb-2">No credit purchases yet.</p>
        <p className="text-sm text-muted-foreground">
          Purchase credits to use premium AI features.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.purchases.map((purchase) => (
        <div
          key={purchase.id}
          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">
                {purchase.description}
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(purchase.date)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-card-foreground">
              +{formatCredits(purchase.credits)} credits
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Balance: {formatCredits(purchase.balanceAfter)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

