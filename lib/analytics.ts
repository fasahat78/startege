/**
 * Analytics Utility
 * 
 * Provides a centralized analytics interface that can be easily
 * integrated with Google Analytics, Plausible, or other analytics services.
 * 
 * Currently provides structure for Google Analytics 4 integration.
 */

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

class Analytics {
  private initialized = false;
  private service: "ga4" | "plausible" | "console" | null = null;
  private measurementId: string | null = null;

  /**
   * Initialize analytics service
   */
  initialize() {
    if (this.initialized) return;

    // Check for Google Analytics 4
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      this.measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      this.service = "ga4";
      this.loadGoogleAnalytics();
    }
    // Check for Plausible
    else if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
      this.service = "plausible";
      this.loadPlausible();
    }
    // Fallback to console
    else {
      this.service = "console";
    }

    this.initialized = true;
  }

  /**
   * Load Google Analytics 4 script
   */
  private loadGoogleAnalytics() {
    if (typeof window === "undefined" || !this.measurementId) return;

    // Load gtag script
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${this.measurementId}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);
  }

  /**
   * Load Plausible script
   */
  private loadPlausible() {
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) return;

    const script = document.createElement("script");
    script.defer = true;
    script.setAttribute("data-domain", process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN);
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  }

  /**
   * Track a page view
   */
  pageview(path: string, title?: string) {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.service === "ga4" && typeof window !== "undefined") {
      (window as any).gtag?.("config", this.measurementId, {
        page_path: path,
        page_title: title,
      });
    } else if (this.service === "plausible" && typeof window !== "undefined") {
      (window as any).plausible?.("pageview", {
        u: path,
      });
    } else if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Pageview:", { path, title });
    }
  }

  /**
   * Track an event
   */
  event(event: AnalyticsEvent) {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.service === "ga4" && typeof window !== "undefined") {
      (window as any).gtag?.("event", event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event,
      });
    } else if (this.service === "plausible" && typeof window !== "undefined") {
      (window as any).plausible?.(event.action, {
        props: {
          category: event.category,
          label: event.label,
          value: event.value,
        },
      });
    } else if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Event:", event);
    }
  }

  /**
   * Set user properties
   */
  setUser(userId: string, properties?: Record<string, any>) {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.service === "ga4" && typeof window !== "undefined") {
      (window as any).gtag?.("set", {
        user_id: userId,
        ...properties,
      });
    } else if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Set user:", { userId, properties });
    }
  }
}

// Singleton instance
export const analytics = new Analytics();

// Initialize on client-side
if (typeof window !== "undefined") {
  analytics.initialize();
}

/**
 * Common analytics events
 */
export const analyticsEvents = {
  // User actions
  userSignUp: (method: string) => ({
    action: "sign_up",
    category: "user",
    label: method,
  }),
  userSignIn: (method: string) => ({
    action: "sign_in",
    category: "user",
    label: method,
  }),
  userUpgrade: (plan: string) => ({
    action: "upgrade",
    category: "subscription",
    label: plan,
  }),

  // Exam actions
  examStart: (level: number) => ({
    action: "exam_start",
    category: "exam",
    label: `level_${level}`,
  }),
  examComplete: (level: number, passed: boolean, score: number) => ({
    action: "exam_complete",
    category: "exam",
    label: `level_${level}`,
    passed,
    score,
  }),

  // Feature usage
  featureUsed: (feature: string) => ({
    action: "feature_used",
    category: "feature",
    label: feature,
  }),
};

