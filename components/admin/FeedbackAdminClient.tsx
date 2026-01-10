"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FeedbackStatus, FeedbackType } from "@prisma/client";

interface Feedback {
  id: string;
  type: FeedbackType;
  status: FeedbackStatus;
  title: string | null;
  message: string;
  pageUrl: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  assignedTo: string | null;
  priority: string | null;
  adminNotes: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface FeedbackAdminClientProps {
  initialFeedback: Feedback[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  currentStatus?: FeedbackStatus;
  currentType?: FeedbackType;
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  PENDING: "bg-status-warning/10 text-status-warning border-status-warning/20",
  REVIEWED: "bg-accent/10 text-accent border-accent/20",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/20",
  RESOLVED: "bg-status-success/10 text-status-success border-status-success/20",
  REJECTED: "bg-status-error/10 text-status-error border-status-error/20",
};

const TYPE_LABELS: Record<FeedbackType, string> = {
  BUG: "Bug",
  FEATURE_REQUEST: "Feature Request",
  UX_ISSUE: "UX Issue",
  GENERAL: "General",
};

const TYPE_ICONS: Record<FeedbackType, string> = {
  BUG: "🐛",
  FEATURE_REQUEST: "💡",
  UX_ISSUE: "🎨",
  GENERAL: "💬",
};

export default function FeedbackAdminClient({
  initialFeedback,
  totalCount,
  currentPage,
  pageSize,
  statusCounts,
  typeCounts,
  currentStatus,
  currentType,
}: FeedbackAdminClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState(initialFeedback);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (feedbackId: string, newStatus: FeedbackStatus) => {
    setUpdating(feedbackId);
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state
      setFeedback((prev) =>
        prev.map((f) =>
          f.id === feedbackId
            ? { ...f, status: newStatus, resolvedAt: newStatus === "RESOLVED" ? new Date() : f.resolvedAt }
            : f
        )
      );
    } catch (error) {
      console.error("Error updating feedback status:", error);
      alert("Failed to update feedback status");
    } finally {
      setUpdating(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to first page
    router.push(`/admin/feedback?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-card-foreground mb-2">Feedback Management</h1>
        <p className="text-muted-foreground">
          Review user feedback, prioritize issues, and track resolution status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div
            key={status}
            className="bg-card rounded-lg border border-border p-4 cursor-pointer hover:border-accent transition"
            onClick={() => handleFilterChange("status", status === currentStatus ? "" : status)}
          >
            <div className="text-2xl font-bold text-card-foreground">
              {statusCounts[status] || 0}
            </div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              value={currentStatus || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} ({statusCounts[value] || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Type</label>
            <select
              value={currentType || ""}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {TYPE_ICONS[value as FeedbackType]} {label} ({typeCounts[value] || 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-8 text-center">
            <p className="text-muted-foreground">No feedback found matching your filters.</p>
          </div>
        ) : (
          feedback.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{TYPE_ICONS[item.type]}</span>
                    <div>
                      <div className="font-semibold text-card-foreground">
                        {item.title || TYPE_LABELS[item.type]}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.user.name || item.user.email} • {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-card-foreground whitespace-pre-wrap">{item.message}</p>
                  {item.pageUrl && (
                    <a
                      href={item.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline mt-2 inline-block"
                    >
                      View page →
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                    disabled={updating === item.id}
                    className={`px-3 py-1 rounded-lg border text-sm font-medium ${
                      STATUS_COLORS[item.status]
                    }`}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {item.resolvedAt && (
                    <span className="text-xs text-muted-foreground">
                      Resolved {new Date(item.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} feedback items
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(currentPage - 1));
                router.push(`/admin/feedback?${params.toString()}`);
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(currentPage + 1));
                router.push(`/admin/feedback?${params.toString()}`);
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

