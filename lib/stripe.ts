import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
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

// App URLs
export const STRIPE_URLS = {
  success: process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/dashboard?upgraded=true",
  cancel: process.env.STRIPE_CANCEL_URL || "http://localhost:3000/dashboard?upgraded=false",
};

