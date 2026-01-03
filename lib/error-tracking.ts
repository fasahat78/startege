/**
 * Error Tracking Utility
 * 
 * Provides a centralized error tracking interface that can be easily
 * integrated with services like Sentry, LogRocket, or other monitoring tools.
 * 
 * Currently logs to console in development, ready for production integration.
 */

interface ErrorContext {
  userId?: string;
  userEmail?: string;
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

class ErrorTracker {
  private initialized = false;
  private service: "console" | "sentry" | null = null;

  /**
   * Initialize error tracking service
   */
  async initialize() {
    if (this.initialized) return;

    // Check if Sentry is configured
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        // Dynamic import to avoid breaking if Sentry not installed
        // @ts-ignore - Sentry may not be installed
        const Sentry = await import("@sentry/nextjs").catch(() => null);
        if (!Sentry) return;
        // @ts-ignore - Sentry types may not be available
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          environment: process.env.NODE_ENV || "development",
          tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        });
        this.service = "sentry";
        this.initialized = true;
        return;
      } catch (error) {
        console.warn("[ErrorTracker] Sentry import failed, falling back to console:", error);
      }
    }

    // Fallback to console logging
    this.service = "console";
    this.initialized = true;
  }

  /**
   * Capture an error
   */
  captureError(error: Error, context?: ErrorContext) {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.service === "sentry") {
      // Sentry integration would go here
      // For now, log to console
      this.logError(error, context);
    } else {
      this.logError(error, context);
    }
  }

  /**
   * Capture an exception with message
   */
  captureException(message: string, error: Error, context?: ErrorContext) {
    const enhancedError = new Error(message);
    enhancedError.cause = error;
    this.captureError(enhancedError, context);
  }

  /**
   * Set user context for error tracking
   */
  setUser(userId: string, email?: string, additionalData?: Record<string, any>) {
    if (this.service === "sentry") {
      // Sentry user context would go here
    }
    // Store for console logging
    if (process.env.NODE_ENV === "development") {
      console.log("[ErrorTracker] User context:", { userId, email, ...additionalData });
    }
  }

  /**
   * Log error to console (development) or monitoring service (production)
   */
  private logError(error: Error, context?: ErrorContext) {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorTracker] Error captured:", {
        message: error.message,
        stack: error.stack,
        context,
      });
    } else {
      // In production, you would send to monitoring service
      // For now, log structured error (can be picked up by log aggregation)
      console.error(JSON.stringify({
        level: "error",
        message: error.message,
        error: error.name,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      }));
    }
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Initialize on import
if (typeof window === "undefined") {
  // Server-side only
  errorTracker.initialize();
}

/**
 * Helper function to capture errors in API routes
 */
export function captureApiError(
  error: Error,
  request: Request,
  userId?: string
) {
  errorTracker.captureError(error, {
    userId,
    path: new URL(request.url).pathname,
    method: request.method,
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  });
}

