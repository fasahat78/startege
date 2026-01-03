"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BadgeNotification from "./BadgeNotification";

interface ConceptCardActionsProps {
  conceptCardId: string;
  currentStatus: string;
}

export default function ConceptCardActions({
  conceptCardId,
  currentStatus,
}: ConceptCardActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [badgesAwarded, setBadgesAwarded] = useState<string[]>([]);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/concepts/${conceptCardId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(newStatus);
        if (data.badgesAwarded && data.badgesAwarded.length > 0) {
          setBadgesAwarded(data.badgesAwarded);
        }
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "completed":
        return { text: "Completed", color: "text-status-success" };
      case "in_progress":
        return { text: "In Progress", color: "text-accent" };
      default:
        return { text: "Not Started", color: "text-muted-foreground" };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <>
      <BadgeNotification badges={badgesAwarded} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Progress:</span>
          <span className={`text-sm font-medium ${statusDisplay.color}`}>
            {statusDisplay.text}
          </span>
        </div>
        <div className="flex gap-2">
          {status !== "in_progress" && status !== "completed" && (
            <button
              onClick={() => handleStatusChange("in_progress")}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Learning
            </button>
          )}
          {status === "in_progress" && (
            <button
              onClick={() => handleStatusChange("completed")}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition bg-status-success text-white hover:bg-status-success/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Complete
            </button>
          )}
          {status === "completed" && (
            <button
              disabled
              className="px-4 py-2 rounded-lg text-sm font-medium bg-status-success/20 text-status-success border border-status-success/30 cursor-default"
            >
              ✓ Completed
            </button>
          )}
        </div>
      </div>
    </>
  );
}

