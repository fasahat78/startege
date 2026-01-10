# Adding Refund Events to Stripe Webhook

## Current Status
Your webhook endpoint is configured but missing refund events:
- `charge.refunded`
- `payment_intent.refunded`

## Method 1: Via Stripe Dashboard (Recommended)

1. **Navigate to Webhooks:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click on "Startege Prod" webhook

2. **Edit Webhook:**
   - Click the "Edit" button (or "Settings" → "Edit")
   - Scroll to "Events to send" section

3. **Add Events:**
   - Click "Add events" or "Select events"
   - Look for **"Charge"** category and select:
     - `charge.refunded` ✅
   - Look for **"Refund"** category and select:
     - `refund.created` ✅ (recommended for detailed tracking)
     - `refund.updated` (optional)
   - Click "Add events" or "Save"
   
   **Note:** `payment_intent.refunded` does NOT exist in Stripe. Use `charge.refunded` instead.

4. **Save Changes:**
   - Click "Save" or "Update webhook"
   - Stripe will test the endpoint automatically

## Method 2: Via Stripe API

You can also add events programmatically using the Stripe API:

```bash
curl https://api.stripe.com/v1/webhook_endpoints/we_1SmZ6ABek6nTXNYzY5vceSzp \
  -u sk_live_YOUR_SECRET_KEY: \
  -d "enabled_events[]=charge.refunded" \
  -d "enabled_events[]=payment_intent.refunded" \
  -X POST
```

**Note:** This will REPLACE existing events. To add without replacing, you need to:
1. First GET current events
2. Append new events to the list
3. POST with all events

## Method 3: Complete Event List (Recommended)

For comprehensive refund handling, ensure these events are enabled:

**Current Events (7):**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- (and possibly others)

**Add These Refund Events:**
- `charge.refunded` - **PRIMARY** - Triggered when a charge is refunded (includes all refund info)
- `refund.created` - **RECOMMENDED** - Triggered when a refund is created (more detailed)
- `refund.updated` - **OPTIONAL** - When refund status/details are updated

**Note:** `payment_intent.refunded` is NOT a valid Stripe event. Use `charge.refunded` or `refund.created` instead.

## Verification

After adding events:

1. **Test the webhook:**
   - Go to Stripe Dashboard → Webhooks → "Startege Prod"
   - Click "Send test webhook"
   - Select `charge.refunded` or `payment_intent.refunded`
   - Verify it reaches your endpoint

2. **Check logs:**
   - View webhook delivery logs in Stripe Dashboard
   - Check your application logs for webhook processing
   - Verify refund records are created in database

3. **Monitor:**
   - Watch for webhook delivery failures
   - Ensure response time stays reasonable
   - Check that refunds are being tracked correctly

## Testing with Stripe CLI

For local testing:

```bash
# Listen to webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger refund event
stripe trigger charge.refunded
stripe trigger payment_intent.refunded
```

## Troubleshooting

**If events aren't being received:**
1. Verify webhook endpoint URL is correct
2. Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
3. Ensure endpoint returns 200 status code
4. Check application logs for errors
5. Verify Stripe API version compatibility

**If refunds aren't being tracked:**
1. Check webhook handler logs for `handleRefund` function
2. Verify payment records exist in database
3. Check that `stripePaymentId` matches payment intent ID
4. Review webhook delivery logs in Stripe Dashboard

