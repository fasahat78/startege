"use client";

import { useState } from "react";

interface AnnualUpgradeWarningProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Warning modal for upgrading from monthly to annual plan
 * Informs user that downgrading won't be possible
 */
export default function AnnualUpgradeWarning({
  isOpen,
  onConfirm,
  onCancel,
}: AnnualUpgradeWarningProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6 border-2 border-accent">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-status-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-card-foreground mb-2">
              Annual Plan Commitment
            </h3>
            <p className="text-muted-foreground mb-4">
              By upgrading to the Annual Plan, you'll get great benefits, but please note:
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-foreground">
              Save $29 per year (12% discount)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-foreground">
              Get 1,250 credits/month (vs 1,000/month)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <svg
              className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-foreground">
              Commit to a full year subscription
            </span>
          </div>
          <div className="flex items-start gap-2 border-t border-border pt-3 mt-3">
            <svg
              className="h-5 w-5 text-status-warning mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-semibold text-status-warning">
              You will NOT be able to downgrade to monthly until your annual period ends.
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border-2 border-border rounded-lg font-semibold hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Confirm Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

