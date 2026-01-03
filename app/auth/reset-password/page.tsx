"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/firebase-auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      console.error("Reset password error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = "Failed to send reset email";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-card p-8 border-2 border-border text-center">
          <div className="mb-4">
            <svg
              className="h-16 w-16 text-status-success mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">
            Check Your Email
          </h2>
          <p className="text-muted-foreground mb-4">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Click the link in the email to reset your password.
          </p>
          <Link
            href="/auth/signin-firebase"
            className="text-accent hover:text-accent/80 font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-card p-8 border-2 border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-error/10 border border-status-error rounded-lg">
            <p className="text-sm text-status-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-primary bg-background text-foreground"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/signin-firebase"
            className="text-sm text-accent hover:text-accent/80 font-medium"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

