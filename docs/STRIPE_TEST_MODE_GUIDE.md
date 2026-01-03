# Stripe Test Mode Guide

## 🧪 Testing Without Spending Real Money

**Yes!** Stripe has a **Test Mode** that allows you to test everything without spending real money.

---

## 🔑 API Keys - You Need BOTH

### 1. Publishable Key (Frontend)
- **Starts with**: `pk_test_` (test mode) or `pk_live_` (live mode)
- **Used for**: Client-side code (React components, checkout forms)
- **Safe to expose**: Yes, it's meant to be public
- **Where**: Frontend code, browser

### 2. Secret Key (Backend)
- **Starts with**: `sk_test_` (test mode) or `sk_live_` (live mode)
- **Used for**: Server-side code (API routes, webhooks)
- **Safe to expose**: **NO!** Never expose this publicly
- **Where**: `.env.local` file, server-side only

---

## 🎯 Test Mode vs Live Mode

### Test Mode (Development)
- **API Keys**: Start with `pk_test_` and `sk_test_`
- **Money**: **No real charges** - uses test cards
- **Products**: Separate test products
- **Webhooks**: Test webhook events
- **Dashboard**: Test mode toggle in Stripe Dashboard

### Live Mode (Production)
- **API Keys**: Start with `pk_live_` and `sk_live_`
- **Money**: **Real charges** - actual payments
- **Products**: Real products
- **Webhooks**: Real events
- **Dashboard**: Live mode toggle in Stripe Dashboard

---

## 🧪 How to Test Pricing

### Step 1: Use Test Mode API Keys

In your `.env.local` file, use **test mode** keys:

```env
# Test Mode Keys (Safe for Development)
STRIPE_SECRET_KEY=sk_test_xxxxx  # From Stripe Dashboard → Developers → API keys
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # From Stripe Dashboard → Developers → API keys
```

### Step 2: Use Test Cards

Stripe provides test card numbers that work in test mode:

**Successful Payment**:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Declined Payment**:
- Card: `4000 0000 0000 0002`
- Use to test payment failure scenarios

**Requires Authentication**:
- Card: `4000 0025 0000 3155`
- Tests 3D Secure flow

### Step 3: Test Your Products

1. **Navigate to your pricing page**
2. **Click "Upgrade to Premium"**
3. **Use test card**: `4242 4242 4242 4242`
4. **Complete checkout**
5. **Verify**: No real money charged!

---

## 📋 Test Mode Checklist

### API Keys
- [ ] Using `sk_test_` (not `sk_live_`)
- [ ] Using `pk_test_` (not `pk_live_`)
- [ ] Keys added to `.env.local`
- [ ] Secret key never exposed in frontend code

### Products
- [ ] Test mode toggle ON in Stripe Dashboard
- [ ] Products created in test mode
- [ ] Price IDs from test mode products
- [ ] Metadata configured correctly

### Testing
- [ ] Test subscription checkout with test card
- [ ] Test credit purchase with test card
- [ ] Verify webhook receives test events
- [ ] Check database updates correctly
- [ ] No real charges appear on card

---

## 🔄 Switching Between Test and Live Mode

### In Stripe Dashboard
1. **Toggle**: Top right corner - "Test mode" / "Live mode"
2. **Different Products**: Test and live products are separate
3. **Different Keys**: Test keys vs live keys
4. **Different Webhooks**: Test webhooks vs live webhooks

### In Your Code
- **Development**: Use test keys (`sk_test_`, `pk_test_`)
- **Production**: Use live keys (`sk_live_`, `pk_live_`)
- **Environment Variables**: Switch keys based on environment

---

## 🧪 Testing Credit Purchases

### Test Credit Purchase Flow

1. **Use Test Mode**: Ensure test keys in `.env.local`
2. **Navigate to Credit Purchase** (when UI is ready)
3. **Select Bundle**: Small, Standard, or Large
4. **Checkout**: Use test card `4242 4242 4242 4242`
5. **Verify**:
   - No real charge
   - Webhook receives event
   - Credits added to account
   - Transaction recorded

### Test Webhook Locally

Use Stripe CLI to forward webhooks to localhost:

```bash
# Install Stripe CLI (if not installed)
# macOS: brew install stripe/stripe-cli/stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will:
- Show webhook events in terminal
- Forward events to your local server
- Display webhook signing secret (add to `.env.local`)

---

## 🚨 Important Notes

1. **Never Commit Secret Keys**: Add `.env.local` to `.gitignore`
2. **Test Mode Only**: Use test keys during development
3. **Test Cards**: Only work in test mode
4. **Separate Products**: Test and live products are separate
5. **Webhook Secret**: Different for test vs live mode

---

## 📝 Environment Variables Template

```env
# Test Mode (Development)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # From Stripe CLI or Dashboard

# Live Mode (Production) - Use different keys
# STRIPE_SECRET_KEY=sk_live_xxxxx
# STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## ✅ Quick Test

1. Add test keys to `.env.local`
2. Restart dev server
3. Go to `/pricing`
4. Click "Upgrade"
5. Use card: `4242 4242 4242 4242`
6. Complete checkout
7. **Result**: No real charge! ✅

---

**Status**: Ready for Test Mode Testing ✅

