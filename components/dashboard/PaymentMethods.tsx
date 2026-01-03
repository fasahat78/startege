"use client";

import { useEffect, useState } from "react";
import { CreditCard, Check, Plus } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
  isDefault: boolean;
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/stripe/payment-methods", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }

      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (err: any) {
      console.error("Error fetching payment methods:", err);
      setError(err.message || "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    // Return brand name as text for now (can add icons later)
    return brandLower.charAt(0).toUpperCase() + brandLower.slice(1);
  };

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;
  };

  const handleManagePaymentMethods = () => {
    // Redirect to Stripe Customer Portal for payment method management
    window.location.href = "/api/stripe/create-portal-session";
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
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
          onClick={fetchPaymentMethods}
          className="text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">No payment methods on file.</p>
        <button
          onClick={handleManagePaymentMethods}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Payment Method
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-card-foreground">
                  {method.card ? `${getCardBrandIcon(method.card.brand)} •••• ${method.card.last4}` : "Card"}
                </span>
                {method.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                    <Check className="h-3 w-3" />
                    Default
                  </span>
                )}
              </div>
              {method.card && (
                <p className="text-sm text-muted-foreground mt-1">
                  Expires {formatExpiry(method.card.expMonth, method.card.expYear)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleManagePaymentMethods}
            className="text-sm text-primary hover:underline"
          >
            Manage
          </button>
        </div>
      ))}
      <button
        onClick={handleManagePaymentMethods}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm text-card-foreground"
      >
        <Plus className="h-4 w-4" />
        Add Payment Method
      </button>
    </div>
  );
}

