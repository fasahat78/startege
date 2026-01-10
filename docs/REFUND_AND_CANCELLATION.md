# Refund and Cancellation Implementation

## Overview

This document outlines the refund and cancellation mechanisms implemented in the Startege application.

## Current Implementation Status

### ✅ Subscription Cancellation (Fully Implemented)

**User-Facing:**
- Users can cancel subscriptions via **Stripe Customer Portal**
- Accessible through: `/dashboard/billing` → "Manage Subscription & Billing" button
- Cancellation takes effect at the end of the billing period
- Users retain access until period end

**Backend:**
- Webhook handler: `customer.subscription.deleted`
- On cancellation:
  - Subscription status → `"canceled"`
  - User tier → `"free"`
  - Firebase custom claims updated
  - Access continues until `currentPeriodEnd`

**Database:**
- `Subscription` model tracks `cancelAtPeriodEnd` flag
- UI displays "Cancels at period end" status

### ✅ Refund Processing (Newly Implemented)

**Webhook Handlers:**
- `charge.refunded` - Handles refunds on charges
- `payment_intent.refunded` - Handles refunds on payment intents
- Automatically updates payment records with refund information

**Database Schema:**
- `Payment` model now includes:
  - `refundedAmount` (Int, default: 0)
  - `refundedAt` (DateTime, nullable)
  - `refundReason` (String, nullable)
  - `updatedAt` (DateTime, auto-updated)
  - Status can be: `"refunded"` or `"partially_refunded"`

**Admin API Endpoints:**
- `GET /api/admin/refunds` - List all refunded payments
  - Query params: `userId` (optional), `limit` (default: 50)
- `POST /api/admin/refunds` - Process a refund
  - Body: `{ paymentId, amount?, reason? }`
  - If `amount` not specified, refunds remaining amount
- `GET /api/admin/refunds/[paymentId]` - Get refund details for a payment

**Billing History:**
- Refunds are displayed in billing history with:
  - Refund icon (RotateCcw)
  - Refunded amount highlighted in warning color
  - Original payment amount shown
  - Refund reason displayed (if available)
  - Status badge: "Refunded" or "Partially Refunded"

## Database Migration Required

To add refund fields to the `Payment` table, run this SQL:

```sql
ALTER TABLE "Payment" 
ADD COLUMN IF NOT EXISTS "refundedAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "refundReason" TEXT,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to set updatedAt
UPDATE "Payment" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
```

## Refund Workflow

### Automatic Refunds (via Stripe Webhooks)

1. Refund processed in Stripe Dashboard or via API
2. Stripe sends `charge.refunded` or `payment_intent.refunded` webhook
3. Webhook handler (`handleRefund`) processes the event:
   - Finds payment record by `stripePaymentId`
   - Updates `refundedAmount`, `refundedAt`, and `status`
   - Logs refund details

### Manual Refunds (via Admin API)

1. Admin calls `POST /api/admin/refunds` with:
   ```json
   {
     "paymentId": "payment_id",
     "amount": 1999,  // Optional: cents, defaults to remaining amount
     "reason": "Customer request"  // Optional
   }
   ```
2. API:
   - Validates admin access
   - Finds payment record
   - Processes refund via Stripe API
   - Updates payment record with refund details
   - Returns refund confirmation

## Refund Policy

**Current Policy (from Terms):**
- Premium subscriptions: "Non-refundable except as required by law"
- AI Credits: "Non-refundable"

**Implementation Notes:**
- Refunds can be processed manually by admins
- Webhook handlers automatically track refunds processed in Stripe
- Refund reasons can be recorded for audit purposes
- Partial refunds are supported

## Testing Refunds

### Test Webhook Events

Use Stripe CLI to test refund webhooks:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger charge.refunded
```

### Test Admin Refund API

1. Get a payment ID from database:
   ```sql
   SELECT id, "stripePaymentId", amount, "refundedAmount" 
   FROM "Payment" 
   WHERE "refundedAmount" = 0 
   LIMIT 1;
   ```

2. Call admin API:
   ```bash
   curl -X POST http://localhost:3000/api/admin/refunds \
     -H "Content-Type: application/json" \
     -H "Cookie: your-auth-cookie" \
     -d '{
       "paymentId": "payment_id",
       "amount": 1000,
       "reason": "Test refund"
     }'
   ```

## Future Enhancements

1. **Admin UI for Refunds:**
   - Create admin page to view and process refunds
   - Display refund history
   - Filter by user, date range, status

2. **Refund Notifications:**
   - Email users when refunds are processed
   - Notify admins of refund requests

3. **Refund Policy Automation:**
   - Implement automatic refund rules (e.g., within 7 days)
   - Refund request workflow for users

4. **Credit Refunds:**
   - Handle refunds for AI credit purchases
   - Deduct credits if already used

5. **Prorated Refunds:**
   - Calculate prorated refunds for annual subscriptions
   - Handle mid-cycle cancellations with refunds

## Files Modified

- `prisma/schema.prisma` - Added refund fields to Payment model
- `app/api/stripe/webhook/route.ts` - Added refund webhook handlers
- `app/api/admin/refunds/route.ts` - New admin refund API
- `app/api/admin/refunds/[paymentId]/route.ts` - New refund details API
- `app/api/stripe/billing-history/route.ts` - Added refund data to billing history
- `components/dashboard/BillingHistory.tsx` - Display refunds in UI

## Security Considerations

- Admin endpoints require admin authentication (`requireAdmin()`)
- Refunds processed via Stripe API (secure payment processing)
- Refund reasons logged for audit trail
- Webhook signature verification ensures authenticity

