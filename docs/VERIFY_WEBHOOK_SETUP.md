# Verify Stripe Webhook Setup for Automatic Credit Allocation

## Problem
Credits weren't allocated automatically for your subscription because the webhook wasn't processing correctly.

## Solution: Verify Webhook Configuration

### Step 1: Check Webhook Endpoint in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. **Switch to LIVE mode** (toggle in top right)
3. Check if webhook endpoint exists:
   - **URL**: `https://startege-785373873454.us-central1.run.app/api/stripe/webhook`
   - If it doesn't exist, create it (see Step 2)

### Step 2: Create/Update Webhook Endpoint

1. Click **"Add endpoint"** (or edit existing)
2. **Endpoint URL**: `https://startege-785373873454.us-central1.run.app/api/stripe/webhook`
3. **Description**: "Startege Production Webhook"
4. **Events to send**: Select these events:
   - `checkout.session.completed` ✅ **CRITICAL** - Allocates credits on subscription purchase
   - `customer.subscription.created` ✅ **CRITICAL** - Handles subscription creation
   - `customer.subscription.updated` ✅ **CRITICAL** - Handles plan changes
   - `customer.subscription.deleted` ✅ Handles cancellations
   - `invoice.payment_succeeded` ✅ Records successful payments
   - `invoice.payment_failed` ✅ Records failed payments
5. Click **"Add endpoint"**
6. **Copy the Signing secret** (starts with `whsec_...`)
7. **Add to Cloud Run environment variables**:
   - Variable: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (the signing secret you just copied)

### Step 3: Verify Environment Variables in Cloud Run

Go to: https://console.cloud.google.com/run/detail/us-central1/startege/variables-and-secrets?project=startege

Verify these are set:
- ✅ `STRIPE_SECRET_KEY` = `sk_live_...` (LIVE mode)
- ✅ `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from webhook endpoint)
- ✅ `STRIPE_PRICE_MONTHLY` = `price_1SjfvQBek6nTXNYzMPYOdLLj`
- ✅ `STRIPE_PRICE_ANNUAL` = `price_1SjfyHBek6nTXNYzWgm8OnVJ`

### Step 4: Test Webhook

1. **Send a test event** from Stripe Dashboard:
   - Go to webhook endpoint → Click "Send test webhook"
   - Select: `checkout.session.completed`
   - Click "Send test webhook"
2. **Check Cloud Run logs**:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege" --limit 50 --format json --project=startege
   ```
3. **Look for**:
   - `[WEBHOOK] Processing checkout.session.completed`
   - `✅ Allocated monthly credits`
   - Any error messages

### Step 5: Verify AICredit Table Exists

The webhook will fail silently if `AICredit` table doesn't exist. Verify it exists:

1. Go to Cloud SQL Studio
2. Run:
   ```sql
   SELECT EXISTS (
       SELECT 1 FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name = 'AICredit'
   );
   ```
3. Should return `true`

## How It Works

### For New Users (Automatic):

1. **User purchases subscription** → Stripe Checkout completes
2. **Stripe sends webhook** → `checkout.session.completed` event
3. **Webhook handler** (`app/api/stripe/webhook/route.ts`):
   - Updates user to `premium` tier
   - Creates/updates subscription record
   - **Calls `allocateMonthlyCredits()`** → Creates AICredit record with 1,000 credits
4. **User sees credits** in dashboard ✅

### Current Issue:

The webhook handler **does** allocate credits (lines 209-230), but:
- ❌ Webhook might not be configured in Stripe Dashboard
- ❌ `STRIPE_WEBHOOK_SECRET` might not be set in Cloud Run
- ❌ AICredit table might not exist (but you said you created it)
- ❌ Webhook might be failing silently (errors caught but not thrown)

## Verification Checklist

- [ ] Webhook endpoint exists in Stripe Dashboard (LIVE mode)
- [ ] Webhook URL is correct: `https://startege-785373873454.us-central1.run.app/api/stripe/webhook`
- [ ] Required events are selected (`checkout.session.completed` is critical)
- [ ] `STRIPE_WEBHOOK_SECRET` is set in Cloud Run
- [ ] `STRIPE_SECRET_KEY` is LIVE mode (`sk_live_...`)
- [ ] AICredit table exists in production database
- [ ] Test webhook sends successfully (check Cloud Run logs)

## If Webhook Still Doesn't Work

The webhook handler has error handling that catches credit allocation errors (line 226-229) and doesn't fail the webhook. This means:

- ✅ Subscription will be created
- ❌ Credits might not be allocated if there's an error

**Fallback**: Run `scripts/allocate-credits-for-existing-subscriptions.ts` manually for any users who don't get credits automatically.

## Next Steps

1. **Verify webhook is configured** (Step 1-2)
2. **Add `STRIPE_WEBHOOK_SECRET`** to Cloud Run (Step 2)
3. **Test with a new subscription** (or test webhook)
4. **Check Cloud Run logs** to see if webhook is processing correctly

