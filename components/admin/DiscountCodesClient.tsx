"use client";

import { useState, useEffect } from "react";
import { DiscountCodeType, DiscountCodeStatus, EarlyAdopterTier } from "@prisma/client";

interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  type: DiscountCodeType;
  value: number;
  status: DiscountCodeStatus;
  maxUses: number | null;
  currentUses: number;
  maxUsesPerUser: number;
  applicableToPlanTypes: string[];
  minAmount: number | null;
  validFrom: string;
  validUntil: string | null;
  earlyAdopterTier: EarlyAdopterTier | null;
  createdAt: string;
  _count: {
    usages: number;
  };
}

export default function DiscountCodesClient() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const response = await fetch("/api/admin/discount-codes");
      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes);
      }
    } catch (error) {
      console.error("Error loading discount codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCode(null);
    setShowForm(true);
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setShowForm(true);
  };

  const handleDelete = async (codeId: string) => {
    if (!confirm("Are you sure you want to deactivate this discount code?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadCodes();
      } else {
        alert("Failed to delete discount code");
      }
    } catch (error) {
      console.error("Error deleting discount code:", error);
      alert("Failed to delete discount code");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading discount codes...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">All Discount Codes</h2>
          <p className="text-sm text-muted-foreground">
            {codes.length} code{codes.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          + Create Discount Code
        </button>
      </div>

      {showForm && (
        <DiscountCodeForm
          code={editingCode}
          onClose={() => {
            setShowForm(false);
            setEditingCode(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingCode(null);
            loadCodes();
          }}
        />
      )}

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Value</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Uses</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Tier</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {codes.map((code) => (
              <tr key={code.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="font-mono font-semibold text-foreground">{code.code}</div>
                  {code.description && (
                    <div className="text-xs text-muted-foreground mt-1">{code.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {code.type === "PERCENTAGE" ? "Percentage" : code.type === "FIXED_AMOUNT" ? "Fixed Amount" : "Free Trial"}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {code.type === "PERCENTAGE" ? `${code.value}%` : `$${(code.value / 100).toFixed(2)}`}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {code.currentUses} / {code.maxUses || "∞"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      code.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : code.status === "USED_UP"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {code.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {code.earlyAdopterTier || "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(code)}
                      className="text-sm text-accent hover:text-accent/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="text-sm text-status-error hover:text-status-error/80"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {codes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No discount codes found. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}

function DiscountCodeForm({
  code,
  onClose,
  onSuccess,
}: {
  code: DiscountCode | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    code: code?.code || "",
    description: code?.description || "",
    type: code?.type || "PERCENTAGE",
    value: code?.value || 0,
    maxUses: code?.maxUses?.toString() || "",
    maxUsesPerUser: code?.maxUsesPerUser || 1,
    applicableToPlanTypes: code?.applicableToPlanTypes || ["both"],
    minAmount: code?.minAmount ? (code.minAmount / 100).toString() : "",
    validFrom: code?.validFrom ? new Date(code.validFrom).toISOString().split("T")[0] : "",
    validUntil: code?.validUntil ? new Date(code.validUntil).toISOString().split("T")[0] : "",
    earlyAdopterTier: code?.earlyAdopterTier || "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        value: parseFloat(formData.value.toString()),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        minAmount: formData.minAmount ? Math.round(parseFloat(formData.minAmount) * 100) : null,
        earlyAdopterTier: formData.earlyAdopterTier || null,
      };

      const url = code ? `/api/admin/discount-codes/${code.id}` : "/api/admin/discount-codes";
      const method = code ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save discount code");
      }
    } catch (error) {
      console.error("Error saving discount code:", error);
      alert("Failed to save discount code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-card-foreground mb-4">
          {code ? "Edit Discount Code" : "Create Discount Code"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              placeholder="FOUNDING100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DiscountCodeType })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="FREE_TRIAL">Free Trial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Value *
              </label>
              <input
                type="number"
                required
                step={formData.type === "PERCENTAGE" ? "1" : "0.01"}
                min="0"
                max={formData.type === "PERCENTAGE" ? "100" : undefined}
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                placeholder={formData.type === "PERCENTAGE" ? "50" : "10.00"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Max Uses (leave empty for unlimited)
              </label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Max Uses Per User
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxUsesPerUser}
                onChange={(e) => setFormData({ ...formData, maxUsesPerUser: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Applicable To Plan Types
            </label>
            <select
              multiple
              value={formData.applicableToPlanTypes}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                setFormData({ ...formData, applicableToPlanTypes: selected });
              }}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
              <option value="both">Both</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Hold Cmd/Ctrl to select multiple
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Valid From
              </label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Valid Until (optional)
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Early Adopter Tier (optional)
            </label>
            <select
              value={formData.earlyAdopterTier}
              onChange={(e) => setFormData({ ...formData, earlyAdopterTier: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">None</option>
              <option value="FOUNDING_MEMBER">Founding Member</option>
              <option value="EARLY_ADOPTER">Early Adopter</option>
              <option value="LAUNCH_USER">Launch User</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : code ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

