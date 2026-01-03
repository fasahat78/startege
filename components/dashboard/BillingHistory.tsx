"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, Calendar, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";

interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string;
  date: string;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
}

interface Charge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  date: string;
  receiptUrl: string | null;
  paymentMethod: string;
}

interface BillingHistoryData {
  invoices: Invoice[];
  charges: Charge[];
}

export default function BillingHistory() {
  const [data, setData] = useState<BillingHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/stripe/billing-history", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch billing history");
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error("Error fetching billing history:", err);
      setError(err.message || "Failed to load billing history");
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "paid" || statusLower === "succeeded") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-status-success/10 text-status-success text-xs font-medium rounded">
          <CheckCircle className="h-3 w-3" />
          Paid
        </span>
      );
    } else if (statusLower === "pending" || statusLower === "open") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-status-warning/10 text-status-warning text-xs font-medium rounded">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-status-error/10 text-status-error text-xs font-medium rounded">
          <XCircle className="h-3 w-3" />
          {status}
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-20" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-status-error mb-4">{error}</p>
        <button
          onClick={fetchBillingHistory}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || (data.invoices.length === 0 && data.charges.length === 0)) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No billing history found.</p>
      </div>
    );
  }

  // Combine and sort by date (newest first)
  const allItems = [
    ...data.invoices.map(inv => ({ ...inv, type: "invoice" as const })),
    ...data.charges.map(ch => ({ ...ch, type: "charge" as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {allItems.map((item) => (
        <div
          key={item.id}
          className="bg-muted/50 rounded-lg border border-border p-4 hover:bg-muted transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {item.type === "invoice" ? (
                    <DollarSign className="h-5 w-5 text-primary" />
                  ) : (
                    <Calendar className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-card-foreground">
                    {item.description}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{formatDate(item.date)}</span>
                    {item.type === "invoice" && (item as Invoice).number && (
                      <span>• Invoice #{(item as Invoice).number}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-card-foreground">
                  {formatCurrency(item.amount, item.currency)}
                </p>
                {getStatusBadge(item.status)}
              </div>
              <div className="flex items-center gap-2">
                {item.type === "invoice" && (item as Invoice).invoicePdf && (
                  <a
                    href={(item as Invoice).invoicePdf!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-muted rounded-lg transition"
                    title="Download invoice"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
                {item.type === "invoice" && (item as Invoice).hostedInvoiceUrl && (
                  <a
                    href={(item as Invoice).hostedInvoiceUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-muted rounded-lg transition"
                    title="View invoice"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
                {item.type === "charge" && (item as Charge).receiptUrl && (
                  <a
                    href={(item as Charge).receiptUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-muted rounded-lg transition"
                    title="View receipt"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
          </div>
          {item.type === "invoice" && (item as Invoice).periodStart && (
            <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
              Period: {formatDate((item as Invoice).periodStart!)} - {formatDate((item as Invoice).periodEnd!)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

