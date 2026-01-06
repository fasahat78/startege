# Setup Stripe Webhook - Step by Step Guide

## Where to Find Webhooks

The webhook configuration is **NOT** on the Home/Dashboard page. You need to go to the **Developers** section.

## Step-by-Step Instructions

### Step 1: Navigate to Webhooks

1. In Stripe Dashboard, look at the **left sidebar**
2. Scroll down to find **"Developers"** section (at the bottom)
3. Click **"Developers"**
4. Click **"Webhooks"** (should be under Developers)

**OR** use direct URL:
- https://dashboard.stripe.com/webhooks

### Step 2: Check if Webhook Already Exists

1. Look for an endpoint with URL: `https://startege-785373873454.us-central1.run.app/api/stripe/webhook`
2. If it exists:
   - Click on it to edit
   - Go to Step 3
3. If it doesn't exist:
   - Click **"Add endpoint"** button (top right)
   - Go to Step 3

### Step 3: Configure Webhook Endpoint

#### If Creating New Endpoint:

1. **Endpoint URL**: 
   ```
   https://startege-785373873454.us-central1.run.app/api/stripe/webhook
   ```

2. **Description** (optional):
   ```
   Startege Production Webhook
   ```

3. **Events to send**: Click **"Select events"** or **"Add events"**

4. **Select these events** (check the boxes):
   - ✅ `checkout.session.completed` ← **CRITICAL for credit allocation**
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Click **"Add endpoint"** or **"Save"**

#### If Editing Existing Endpoint:

1. Click on the endpoint
2. Scroll to **"Events to send"** section
3. Click **"Add events"** or **"Edit events"**
4. Make sure `checkout.session.completed` is checked ✅
5. Click **"Save"**

### Step 4: Copy Webhook Signing Secret

1. After creating/editing the endpoint, you'll see the **"Signing secret"**
2. It starts with `whsec_...`
3. Click **"Reveal"** or **"Copy"** to copy it
4. **Save this somewhere safe** - you'll need it for Step 5

### Step 5: Add Signing Secret to Cloud Run

1. Go to: https://console.cloud.google.com/run/detail/us-central1/startege/variables-and-secrets?project=startege
2. Click **"ADD VARIABLE"** (or edit if `STRIPE_WEBHOOK_SECRET` already exists)
3. **Name**: `STRIPE_WEBHOOK_SECRET`
4. **Value**: Paste the signing secret (`whsec_...`)
5. Click **"Save"**
6. Cloud Run will restart automatically

### Step 6: Verify It's Working

1. Go back to Stripe Dashboard → Webhooks
2. Click on your endpoint
3. Scroll to **"Recent events"** section
4. You should see recent webhook events (if any purchases happened)
5. Click on an event to see details:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed

### Step 7: Test Webhook (Optional)

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click **"Send test webhook"** button
3. Select event: `checkout.session.completed`
4. Click **"Send test webhook"**
5. Check Cloud Run logs to see if it was received:
   ```bash
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=startege AND textPayload=~'WEBHOOK'" --limit 10 --format json --project=startege
   ```

## Troubleshooting

### "I don't see Developers section"

- Make sure you're in **LIVE mode** (toggle in top right)
- Scroll down in the left sidebar - Developers is usually at the bottom

### "I don't see Webhooks"

- Click **"Developers"** first
- Then click **"Webhooks"** (should be visible after clicking Developers)

### "I can't find checkout.session.completed event"

- When adding events, use the **search box** at the top
- Type: `checkout.session.completed`
- It should appear in the list
- Make sure to check the checkbox ✅

### "Webhook is failing"

- Check Cloud Run logs for errors
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify webhook URL is correct (no typos)
- Make sure you're using LIVE mode webhook secret (not test mode)

## Quick Links

- **Webhooks**: https://dashboard.stripe.com/webhooks
- **API Keys**: https://dashboard.stripe.com/apikeys
- **Cloud Run Variables**: https://console.cloud.google.com/run/detail/us-central1/startege/variables-and-secrets?project=startege

## Important Notes

- ⚠️ Make sure you're in **LIVE mode** (not Test mode) when setting up production webhook
- ⚠️ The webhook URL must be **exactly** correct (no trailing slashes)
- ⚠️ The signing secret is different for LIVE vs TEST mode
- ⚠️ After adding events, it may take a few seconds to save

