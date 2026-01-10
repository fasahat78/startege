import Stripe from "stripe";

// Lazy initialization - only create Stripe instance when actually used at runtime
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// Export a getter function instead of direct instance
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

// Stripe Price IDs (set these in your .env file after creating products in Stripe)
export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || "",
  annual: process.env.STRIPE_PRICE_ANNUAL || "",
  lifetime: process.env.STRIPE_PRICE_LIFETIME || "",
  // Credit bundles (one-time purchases)
  creditsSmall: process.env.STRIPE_PRICE_CREDITS_SMALL || "",    // $5
  creditsStandard: process.env.STRIPE_PRICE_CREDITS_STANDARD || "", // $10
  creditsLarge: process.env.STRIPE_PRICE_CREDITS_LARGE || "",    // $25
};

// App URLs - Use NEXT_PUBLIC_APP_URL if available, otherwise fallback to localhost for development
const getBaseUrl = () => {
  // Check for explicit Stripe URLs first
  if (process.env.STRIPE_SUCCESS_URL && process.env.STRIPE_CANCEL_URL) {
    return {
      base: process.env.STRIPE_SUCCESS_URL.replace('/dashboard?upgraded=true', ''),
    };
  }
  // Use NEXT_PUBLIC_APP_URL if available (production)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return {
      base: process.env.NEXT_PUBLIC_APP_URL,
    };
  }
  // Fallback to localhost for local development
  return {
    base: 'http://localhost:3000',
  };
};

const baseUrl = getBaseUrl().base;

export const STRIPE_URLS = {
  success: process.env.STRIPE_SUCCESS_URL || `${baseUrl}/dashboard?upgraded=true`,
  cancel: process.env.STRIPE_CANCEL_URL || `${baseUrl}/dashboard?upgraded=false`,
};

