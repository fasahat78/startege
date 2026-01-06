# Update Stripe Secret Key in Cloud Run

## Problem
Cloud Run is using an expired/old Stripe secret key. The error shows:
```
Expired API Key provided: sk_live_...OgjlMM
```

## Solution: Update Secret Manager

### Step 1: Get New Secret Key from Stripe

1. Go to: https://dashboard.stripe.com/apikeys
2. **Switch to LIVE mode** (toggle in top right)
3. Find your **NEW secret key** (the one you just created)
4. Click **"Reveal"** to show the full key
5. **Copy the entire key** (starts with `sk_live_...`)

⚠️ **Important**: Make sure it's the NEW key, not the old one ending with `OgjlMM`

### Step 2: Update Secret Manager

1. Go to: https://console.cloud.google.com/security/secret-manager?project=startege
2. Find the secret: **`STRIPE_SECRET_KEY`**
3. Click on **`STRIPE_SECRET_KEY`**
4. Click **"ADD NEW VERSION"** button (top right)
5. In the "Secret value" field, **paste your NEW secret key**
6. Click **"ADD VERSION"**
7. The new version will be automatically used by Cloud Run

### Step 3: Verify Update

1. Wait 1-2 minutes for Cloud Run to pick up the new secret
2. Try purchasing credits again
3. Should work now!

## Alternative: Update via gcloud CLI

If you prefer command line:

```bash
# Get your new secret key (replace with your actual key)
NEW_STRIPE_KEY="sk_live_YOUR_NEW_KEY_HERE"

# Add new version to Secret Manager
echo -n "$NEW_STRIPE_KEY" | gcloud secrets versions add STRIPE_SECRET_KEY \
  --data-file=- \
  --project=startege

# Verify it was added
gcloud secrets versions list STRIPE_SECRET_KEY --project=startege
```

## Why This Happens

Cloud Run uses **Secret Manager** to store sensitive values like `STRIPE_SECRET_KEY`. When you:
1. Generate a new key in Stripe Dashboard
2. But don't update Secret Manager
3. Cloud Run keeps using the old key → "Expired API Key" error

## Verification

After updating, check Cloud Run logs to verify:

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege AND textPayload=~'STRIPE'" --limit 10 --project=startege
```

You should see successful Stripe API calls, not "Expired API Key" errors.

## Important Notes

- ⚠️ Secret Manager versions are used automatically - no restart needed
- ⚠️ Make sure you're updating the **LIVE mode** key (not test mode)
- ⚠️ The key should start with `sk_live_` (not `sk_test_`)
- ⚠️ Don't share the new key publicly!

