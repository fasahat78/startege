# Stripe Webhook Setup Guide

## Overview
This guide explains how to configure Stripe webhooks to handle subscription and payment events in your Startege application.

## Webhook Endpoint URL

### Local Development
```
http://localhost:3000/api/stripe/webhook
```

### Production
```
https://yourdomain.com/api/stripe/webhook
```

## Step-by-Step Setup

### 1. Add Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **"+ Add endpoint"** (or **"+ Add destination"**)
3. Enter your webhook endpoint URL:
   - **For local testing**: Use Stripe CLI (see below)
   - **For production**: Enter `https://yourdomain.com/api/stripe/webhook`

### 2. Select Events to Listen For

Select these events:
- ✅ `checkout.session.completed` - When a checkout is completed (subscription or credit purchase)
- ✅ `customer.subscription.created` - When a subscription is created
- ✅ `customer.subscription.updated` - When a subscription is updated (plan changes, renewals)
- ✅ `customer.subscription.deleted` - When a subscription is canceled
- ✅ `invoice.payment_succeeded` - When a payment succeeds
- ✅ `invoice.payment_failed` - When a payment fails

### 3. Get Webhook Signing Secret

After creating the webhook endpoint:

1. Click on your webhook endpoint in the Stripe Dashboard
2. Find the **"Signing secret"** section
3. Click **"Reveal"** to show the secret (starts with `whsec_...`)
4. Copy this secret

### 4. Add Secret to Environment Variables

Add the webhook secret to your `.env.local` file:

```bash
# Stripe Webhook Secret (get from Stripe Dashboard → Webhooks → Your Endpoint → Signing secret)
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### 5. Restart Your Development Server

After adding the secret, restart your Next.js server:
```bash
npm run dev
```

## Local Development Setup (Using Stripe CLI) ⭐ RECOMMENDED

For local development, use Stripe CLI to forward webhooks to your local server. This is the **easiest method** - no ngrok needed!

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Login to Stripe CLI
```bash
stripe login
```
This will open your browser to authenticate with Stripe.

### Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will:
- Show you a webhook signing secret (starts with `whsec_...`) - **COPY THIS!**
- Forward all webhook events to your local endpoint
- Display webhook events in real-time
- Keep running until you stop it (Ctrl+C)

**Important**: 
- Use the signing secret shown by `stripe listen` in your `.env.local` for local development
- Keep the `stripe listen` command running in a separate terminal window
- You don't need to configure anything in Stripe Dashboard when using Stripe CLI

### Trigger Test Events
```bash
# Test subscription creation
stripe trigger checkout.session.completed

# Test subscription update
stripe trigger customer.subscription.updated

# Test credit purchase
stripe trigger checkout.session.completed --add checkout.session.metadata.purchaseType=credit_topup
```

## Testing Webhooks

### 1. Test in Stripe Dashboard
1. Go to your webhook endpoint in Stripe Dashboard
2. Click **"Send test webhook"**
3. Select an event type (e.g., `checkout.session.completed`)
4. Click **"Send test webhook"**
5. Check your server logs for `[WEBHOOK]` messages

### 2. Check Server Logs
Look for these log messages:
```
[WEBHOOK] Processing checkout.session.completed for session cs_...
[WEBHOOK] ✅ Successfully updated user ... to premium
[WEBHOOK] ✅ Added X credits to user ...
```

### 3. Verify Database Updates
After a webhook fires, check:
- User's `subscriptionTier` is set to "premium"
- Subscription record has correct `planType` ("monthly" or "annual")
- AI credits are allocated/updated correctly

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook endpoint URL**
   - Ensure it's correct and accessible
   - For local dev, use Stripe CLI forwarding

2. **Verify webhook secret**
   - Check `.env.local` has `STRIPE_WEBHOOK_SECRET`
   - Restart server after adding secret

3. **Check webhook logs in Stripe Dashboard**
   - Go to Webhooks → Your Endpoint → Logs
   - Look for failed requests or errors

4. **Check server logs**
   - Look for `[WEBHOOK]` messages
   - Check for error messages

### Webhook Signature Verification Failed

- Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
- For local dev, use the secret from `stripe listen` command
- Don't use the same secret for local and production

### Credits Not Being Added

1. Check webhook logs for `[WEBHOOK] Processing credit purchase`
2. Verify `purchaseType: "credit_topup"` in checkout session metadata
3. Check `addPurchasedCredits` function logs
4. Verify user has premium subscription (required for credit purchases)

### Subscription Status Not Updating

1. Check webhook is receiving `customer.subscription.updated` events
2. Verify webhook handler is updating `subscriptionTier` correctly
3. Check Firebase custom claims are being set
4. Use `/api/stripe/manual-upgrade` endpoint to sync status manually

## Production Deployment

### 1. Set Up Production Webhook

1. Create a new webhook endpoint in Stripe Dashboard (or use existing)
2. Set URL to: `https://yourdomain.com/api/stripe/webhook`
3. Select the same events as local
4. Copy the production webhook signing secret

### 2. Add to Production Environment

Add to your production environment variables:
```bash
STRIPE_WEBHOOK_SECRET=whsec_production_secret_here
```

### 3. Test Production Webhook

1. Make a test purchase in production
2. Check webhook logs in Stripe Dashboard
3. Verify events are being received and processed

## Security Notes

- **Never commit webhook secrets to git**
- Use different secrets for local and production
- Webhook endpoint verifies signatures automatically
- Failed signature verification returns 400 error

## Related Files

- `/app/api/stripe/webhook/route.ts` - Webhook handler
- `/lib/ai-credits.ts` - Credit management functions
- `/lib/firebase-server.ts` - Firebase custom claims

