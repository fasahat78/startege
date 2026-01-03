# Stripe Integration Setup Guide

## ✅ Phase 4: Stripe Integration - Implementation Complete

### What's Been Implemented

1. **Stripe SDK Installed** ✅
   - `stripe` package installed
   - `@stripe/stripe-js` installed

2. **Stripe Configuration** ✅
   - Created `/lib/stripe.ts` with Stripe client initialization
   - Environment variable support for API keys and price IDs

3. **API Routes Created** ✅
   - `/api/stripe/create-checkout-session` - Creates Stripe Checkout session
   - `/api/stripe/webhook` - Handles Stripe webhook events
   - `/api/stripe/create-portal-session` - Creates customer portal session

4. **Frontend Integration** ✅
   - Updated `/app/pricing/page.tsx` with Stripe checkout
   - Created `PricingClient` component for checkout flow

---

## 🔧 Setup Instructions

### Step 1: Stripe Account Setup

1. **Create/Login to Stripe Account**
   - Go to https://stripe.com
   - Complete business verification (if needed)

2. **Create Products & Prices**
   - Go to Stripe Dashboard → Products
   - Create products:
     - **Startege Premium Monthly**: $29/month (recurring)
     - **Startege Premium Annual**: $249/year (recurring)
     - **Startege Premium Lifetime**: $999 (one-time payment)
   - Copy the Price IDs (e.g., `price_xxxxx`)

### Step 2: Environment Variables

Add to your `.env.local` file:

```bash
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Price IDs (from Step 1)
STRIPE_PRICE_MONTHLY=price_xxxxx
STRIPE_PRICE_ANNUAL=price_xxxxx
STRIPE_PRICE_LIFETIME=price_xxxxx

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SUCCESS_URL=http://localhost:3000/dashboard?upgraded=true
STRIPE_CANCEL_URL=http://localhost:3000/dashboard?upgraded=false
```

### Step 3: Webhook Setup (Development)

1. **Install Stripe CLI**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   
   This will output a webhook signing secret (e.g., `whsec_xxxxx`)
   - Copy this and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Step 4: Test the Integration

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Checkout Flow**
   - Go to `/pricing`
   - Click "Upgrade to Premium"
   - Use test card: `4242 4242 4242 4242`
   - Use any future expiry date (e.g., 12/34)
   - Use any CVC (e.g., 123)
   - Complete checkout

3. **Verify Webhook Events**
   - Check Stripe CLI output for webhook events
   - Verify user subscription tier updated in database
   - Check dashboard shows premium status

---

## 📋 Webhook Events Handled

- ✅ `checkout.session.completed` - Payment successful
- ✅ `customer.subscription.created` - Subscription created
- ✅ `customer.subscription.updated` - Subscription updated
- ✅ `customer.subscription.deleted` - Subscription canceled
- ✅ `invoice.payment_succeeded` - Recurring payment succeeded
- ✅ `invoice.payment_failed` - Payment failed

---

## 🚀 Production Setup

### Before Going Live

1. **Switch to Live Keys**
   - Replace test keys with live keys in `.env`
   - Update `STRIPE_PRICE_*` IDs with live price IDs

2. **Configure Production Webhook**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen for (same as above)
   - Copy webhook signing secret

3. **Update Environment Variables**
   - Set `NEXT_PUBLIC_APP_URL` to production URL
   - Update `STRIPE_SUCCESS_URL` and `STRIPE_CANCEL_URL`

4. **Test with Real Payment**
   - Use real card (small amount)
   - Verify webhook delivery
   - Check subscription status updates

---

## 🔍 Testing Checklist

- [ ] Checkout session creates successfully
- [ ] Payment completes with test card
- [ ] Webhook receives `checkout.session.completed`
- [ ] User subscription tier updates to "premium"
- [ ] Subscription record created in database
- [ ] Payment record created in database
- [ ] User can access premium levels (11-40)
- [ ] Customer portal session creates successfully
- [ ] Subscription cancellation works
- [ ] Failed payment handling works

---

## 🐛 Troubleshooting

### Issue: "STRIPE_SECRET_KEY is not set"
- **Solution**: Add `STRIPE_SECRET_KEY` to `.env.local`

### Issue: "Webhook signature verification failed"
- **Solution**: Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe CLI output

### Issue: "Price ID not found"
- **Solution**: Verify price IDs in Stripe Dashboard and `.env.local`

### Issue: User not upgraded after payment
- **Solution**: Check webhook logs, verify webhook handler logic

---

## 📚 Next Steps

After Stripe integration is working:

1. Add subscription status widget to dashboard
2. Add "Manage Subscription" link
3. Add upgrade prompts after Level 10 completion
4. Implement subscription renewal reminders
5. Add payment failure notifications

---

**Status**: ✅ Implementation Complete - Ready for Testing

