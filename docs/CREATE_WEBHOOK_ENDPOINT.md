# Create Stripe Webhook Endpoint

## What You're Seeing

You're viewing **Stripe Events** - this shows all events Stripe generates. But you need a **Webhook Endpoint** configured to actually receive these events at your application.

## Step-by-Step: Create Webhook Endpoint

### Step 1: Go to Webhooks Tab

1. In the interface you're viewing, click the **"Webhooks"** tab (next to "Events")
2. This will show your webhook endpoints (if any)

### Step 2: Create New Endpoint

1. Click **"Add endpoint"** or **"Create endpoint"** button
2. You'll see a form to configure the webhook

### Step 3: Configure Endpoint

Fill in the form:

1. **Endpoint URL**:
   ```
   https://startege-785373873454.us-central1.run.app/api/stripe/webhook
   ```
   ⚠️ Make sure this URL is **exactly** correct (no trailing slash)

2. **Description** (optional):
   ```
   Startege Production Webhook
   ```

3. **Events to send**: Click **"Select events"** or **"Add events"**

4. **Select these events** (check the boxes):
   - ✅ `checkout.session.completed` ← **CRITICAL**
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Click **"Add endpoint"** or **"Save"**

### Step 4: Copy Signing Secret

After creating the endpoint:

1. You'll see the **"Signing secret"** (starts with `whsec_...`)
2. Click **"Reveal"** or **"Copy"** to copy it
3. **Save it** - you'll need it for the next step

### Step 5: Add to Cloud Run

1. Go to: https://console.cloud.google.com/run/detail/us-central1/startege/variables-and-secrets?project=startege
2. Click **"ADD VARIABLE"**
3. **Name**: `STRIPE_WEBHOOK_SECRET`
4. **Value**: Paste the signing secret (`whsec_...`)
5. Click **"Save"**
6. Cloud Run will restart automatically

### Step 6: Verify It's Working

1. Go back to Stripe → **Webhooks** tab
2. Click on your endpoint
3. Scroll to **"Recent deliveries"** or **"Event deliveries"**
4. You should see recent webhook attempts
5. Click on one to see:
   - ✅ **200 OK** = Success (webhook received and processed)
   - ❌ **4xx/5xx** = Failed (check Cloud Run logs)

## What Happens Next

Once configured:

1. **User purchases subscription** → Stripe generates `checkout.session.completed` event
2. **Stripe sends webhook** → POST to your Cloud Run URL
3. **Your webhook handler** (`app/api/stripe/webhook/route.ts`):
   - Verifies signature
   - Updates user to premium
   - **Allocates credits automatically** ✅
4. **User sees credits** in dashboard

## Troubleshooting

### "I don't see Webhooks tab"

- Make sure you're in **LIVE mode** (not Test mode)
- The interface might be Stripe Workbench - try going to: https://dashboard.stripe.com/webhooks

### "Webhook is failing (4xx/5xx)"

- Check Cloud Run logs for errors
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify webhook URL is correct
- Make sure AICredit table exists

### "Events show but webhook not receiving"

- Check if webhook endpoint exists
- Check if events are selected (`checkout.session.completed` must be checked)
- Check Cloud Run logs to see if requests are arriving

## Quick Test

After setting up:

1. Make a test purchase (or use Stripe's "Send test webhook")
2. Go to Webhooks → Your endpoint → Recent deliveries
3. You should see a delivery attempt
4. Click it to see the response (should be 200 OK)

