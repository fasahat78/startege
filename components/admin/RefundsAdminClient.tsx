"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/Toast";
import { RotateCcw, Search, DollarSign, Filter, ExternalLink } from "lucide-react";

interface Payment {
  id: string;
  userId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  planType: string | null;
  refundedAmount: number;
  refundedAt: Date | null;
  refundReason: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface RefundsAdminClientProps {
  initialPayments: Payment[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalRefunded: number;
  fullyRefundedCount: number;
  partiallyRefundedCount: number;
  refundStats: any[];
  currentUserId?: string;
  currentStatus?: string;
}

export default function RefundsAdminClient({
  initialPayments,
  totalCount,
  currentPage,
  pageSize,
  totalRefunded,
  fullyRefundedCount,
  partiallyRefundedCount,
  refundStats,
  currentUserId,
  currentStatus,
}: RefundsAdminClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState(initialPayments);
  const [loading, setLoading] = useState(false);
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    router.push(`/admin/refunds?${params.toString()}`);
  };

  const handleProcessRefund = async () => {
    if (!selectedPayment) return;

    const amount = refundAmount ? parseInt(refundAmount) * 100 : undefined;
    const remainingAmount = selectedPayment.amount - selectedPayment.refundedAmount;

    if (amount && amount > remainingAmount) {
      toast("Refund amount exceeds remaining amount", "error");
      return;
    }

    try {
      setProcessingRefund(selectedPayment.id);
      const response = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          amount,
          reason: refundReason || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process refund");
      }

      const result = await response.json();
      toast(`Refund processed: ${formatCurrency(result.refund.amount, selectedPayment.currency)}`, "success");

      // Refresh the page
      router.refresh();
      setShowRefundModal(false);
      setSelectedPayment(null);
      setRefundAmount("");
      setRefundReason("");
    } catch (error: any) {
      console.error("Error processing refund:", error);
      toast(error.message || "Failed to process refund", "error");
    } finally {
      setProcessingRefund(null);
    }
  };

  const openRefundModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundAmount("");
    setRefundReason("");
    setShowRefundModal(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Refund Management</h1>
        <p className="text-muted-foreground">
          View and process refunds for payments
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Refunded</div>
          <div className="text-2xl font-bold text-status-warning">
            {formatCurrency(totalRefunded)}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Fully Refunded</div>
          <div className="text-2xl font-bold text-card-foreground">
            {fullyRefundedCount}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Partially Refunded</div>
          <div className="text-2xl font-bold text-card-foreground">
            {partiallyRefundedCount}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Refunds</div>
          <div className="text-2xl font-bold text-card-foreground">
            {totalCount}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-card-foreground">Status:</span>
          </div>
          <button
            onClick={() => handleFilter("all")}
            className={`px-3 py-1 rounded-md text-sm transition ${
              !currentStatus || currentStatus === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => handleFilter("refunded")}
            className={`px-3 py-1 rounded-md text-sm transition ${
              currentStatus === "refunded"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Fully Refunded ({fullyRefundedCount})
          </button>
          <button
            onClick={() => handleFilter("partially_refunded")}
            className={`px-3 py-1 rounded-md text-sm transition ${
              currentStatus === "partially_refunded"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Partially Refunded ({partiallyRefundedCount})
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Refunded
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Refunded At
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No refunds found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const isFullyRefunded = payment.refundedAmount >= payment.amount;
                  const remainingAmount = payment.amount - payment.refundedAmount;

                  return (
                    <tr key={payment.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-card-foreground">
                            {payment.user.name || payment.user.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-mono text-card-foreground">
                          {payment.stripePaymentId.slice(0, 20)}...
                        </div>
                        <a
                          href={`https://dashboard.stripe.com/payments/${payment.stripePaymentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          View in Stripe
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-card-foreground">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        {payment.planType && (
                          <div className="text-xs text-muted-foreground capitalize">
                            {payment.planType}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-status-warning">
                          {formatCurrency(payment.refundedAmount, payment.currency)}
                        </div>
                        {!isFullyRefunded && (
                          <div className="text-xs text-muted-foreground">
                            Remaining: {formatCurrency(remainingAmount, payment.currency)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isFullyRefunded
                              ? "bg-status-success/10 text-status-success"
                              : "bg-status-warning/10 text-status-warning"
                          }`}
                        >
                          {isFullyRefunded ? "Fully Refunded" : "Partially Refunded"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-card-foreground">
                          {formatDate(payment.refundedAt)}
                        </div>
                        {payment.refundReason && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Reason: {payment.refundReason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!isFullyRefunded && (
                          <button
                            onClick={() => openRefundModal(payment)}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition"
                          >
                            Process Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} refunds
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", String(Math.max(1, currentPage - 1)));
                  router.push(`/admin/refunds?${params.toString()}`);
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md text-sm border border-border hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", String(Math.min(totalPages, currentPage + 1)));
                  router.push(`/admin/refunds?${params.toString()}`);
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md text-sm border border-border hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Process Refund
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Payment Amount
                </label>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Already Refunded
                </label>
                <div className="text-sm text-status-warning">
                  {formatCurrency(selectedPayment.refundedAmount, selectedPayment.currency)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Remaining Amount
                </label>
                <div className="text-sm text-card-foreground">
                  {formatCurrency(selectedPayment.amount - selectedPayment.refundedAmount, selectedPayment.currency)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Refund Amount (leave empty for full refund)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Enter amount in dollars"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">
                  Reason (optional)
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter refund reason"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-card-foreground"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedPayment(null);
                  setRefundAmount("");
                  setRefundReason("");
                }}
                className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={processingRefund === selectedPayment.id}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
              >
                {processingRefund === selectedPayment.id ? "Processing..." : "Process Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

