# Fix Stripe Price IDs in Production

## Problem
Production is using **test mode** Stripe price IDs, which don't exist in your **live mode** Stripe account.

Error:
```
No such price: 'price_1SjgjVBEA7DCjdkmBtlbXixO'
No such price: 'price_1SjgkBBEA7DCjdkmBNNuD71Q'
```

## Solution

### Step 1: Get Live Mode Price IDs from Stripe Dashboard

1. Go to: https://dashboard.stripe.com/products
2. **Switch to LIVE mode** (toggle in top right)
3. Find your products:
   - **Startege Premium Monthly** → Copy the price ID
   - **Startege Premium Annual** → Copy the price ID
   - **AI Credits Small Top-Up** → Copy the price ID
   - **AI Credits Standard Top-Up** → Copy the price ID
   - **AI Credits Large Top-Up** → Copy the price ID

### Step 2: Update Cloud Run Environment Variables

1. Go to: https://console.cloud.google.com/run/detail/us-central1/startege/variables-and-secrets?project=startege
2. Update these environment variables with **LIVE mode** price IDs:

   - `STRIPE_PRICE_MONTHLY` = `price_xxxxx` (from Stripe Dashboard LIVE mode)
   - `STRIPE_PRICE_ANNUAL` = `price_xxxxx` (from Stripe Dashboard LIVE mode)
   - `STRIPE_PRICE_CREDITS_SMALL` = `price_xxxxx` (from Stripe Dashboard LIVE mode)
   - `STRIPE_PRICE_CREDITS_STANDARD` = `price_xxxxx` (from Stripe Dashboard LIVE mode)
   - `STRIPE_PRICE_CREDITS_LARGE` = `price_xxxxx` (from Stripe Dashboard LIVE mode)

3. **Also verify** `STRIPE_SECRET_KEY` is set to your **LIVE mode** secret key (starts with `sk_live_...`)

### Step 3: Verify

After updating:
1. Wait for Cloud Run to restart (automatic)
2. Try purchasing a plan again
3. Should work now!

## Important Notes

- **Test mode** price IDs start with `price_1Sjg...` (these are what you're currently using)
- **Live mode** price IDs will be different (check your Stripe Dashboard)
- Make sure `STRIPE_SECRET_KEY` matches the mode (test vs live)
- Make sure `STRIPE_PUBLISHABLE_KEY` matches the mode (test vs live)

## Quick Check

Run this to see current environment variables:
```bash
gcloud run services describe startege \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)" \
  --project=startege
```

