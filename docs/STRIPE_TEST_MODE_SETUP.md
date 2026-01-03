# Stripe Test Mode Setup - Quick Guide

## ⚠️ Important: Test Mode vs Live Mode

**Test Mode and Live Mode are completely separate:**
- Products created in Live mode **do NOT appear** in Test mode
- Products created in Test mode **do NOT appear** in Live mode
- You need to create products in **both** modes
- Use **Test mode** for development/testing
- Use **Live mode** for production

---

## 🎯 What You Need to Do

### Option 1: Recreate Products in Test Mode (Recommended)

1. **Switch to Test Mode** in Stripe Dashboard (toggle top right)
2. **Recreate all 5 products** using the same details:
   - Startege Premium Monthly ($19/month)
   - Startege Premium Annual ($199/year)
   - AI Credits Small Top-Up ($5)
   - AI Credits Standard Top-Up ($10)
   - AI Credits Large Top-Up ($25)
3. **Copy the new Test Mode Price IDs**
4. **Update `.env.local`** with Test Mode Price IDs

### Option 2: Use Live Mode for Testing (Not Recommended)

⚠️ **Warning**: This will charge real money!
- Keep your Live products
- Use Live API keys
- **Risk**: Real charges on test cards (though you can refund)

---

## 📋 Quick Recreation Steps

### Step 1: Switch to Test Mode

1. Go to Stripe Dashboard
2. Toggle **"Test mode"** (top right corner)
3. You'll see "Test mode" badge

### Step 2: Recreate Products

Use the same product details from your Live products:

**1. Startege Premium Monthly**
- Name: `Startege Premium Monthly`
- Description: `Full access to all 40 AI Governance level exams, Startegizer AI Assistant, advanced analytics, personalized learning paths, and achievement tracking. Cancel anytime.`
- Price: $19.00 USD
- Billing: Recurring Monthly
- **Copy new Price ID**: `price_test_xxxxx`

**2. Startege Premium Annual**
- Name: `Startege Premium Annual`
- Description: `Full access to all 40 AI Governance level exams, Startegizer AI Assistant, advanced analytics, personalized learning paths, and achievement tracking. Save $29 per year with annual billing. Cancel anytime.`
- Price: $199.00 USD
- Billing: Recurring Yearly
- **Copy new Price ID**: `price_test_xxxxx`

**3. AI Credits Small Top-Up**
- Name: `AI Credits Small Top-Up`
- Description: `Additional AI credits for Startegizer queries and dynamic exam generation. Perfect for light users who need extra capacity. Credits expire at the end of your billing cycle.`
- Price: $5.00 USD
- Billing: One-time
- Metadata:
  ```json
  {
    "type": "credit_topup",
    "purchasePrice": "500",
    "apiUsageCredits": "250",
    "bundle": "small",
    "expiresAtCycleEnd": "true"
  }
  ```
- **Copy new Price ID**: `price_test_xxxxx`

**4. AI Credits Standard Top-Up**
- Name: `AI Credits Standard Top-Up`
- Description: `Additional AI credits for Startegizer queries and dynamic exam generation. Matches your monthly credit allowance. Credits expire at the end of your billing cycle.`
- Price: $10.00 USD
- Billing: One-time
- Metadata:
  ```json
  {
    "type": "credit_topup",
    "purchasePrice": "1000",
    "apiUsageCredits": "500",
    "bundle": "standard",
    "expiresAtCycleEnd": "true"
  }
  ```
- **Copy new Price ID**: `price_test_xxxxx`

**5. AI Credits Large Top-Up**
- Name: `AI Credits Large Top-Up`
- Description: `Additional AI credits for Startegizer queries and dynamic exam generation. Includes 20% bonus credits. Perfect for heavy users. Credits expire at the end of your billing cycle.`
- Price: $25.00 USD
- Billing: One-time
- Metadata:
  ```json
  {
    "type": "credit_topup",
    "purchasePrice": "2500",
    "apiUsageCredits": "1500",
    "bundle": "large",
    "bonus": "20%",
    "expiresAtCycleEnd": "true"
  }
  ```
- **Copy new Price ID**: `price_test_xxxxx`

### Step 3: Update Environment Variables

After creating Test Mode products, update `.env.local`:

```env
# Test Mode API Keys
STRIPE_SECRET_KEY=sk_test_xxxxx  # Test mode secret key
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Test mode publishable key

# Test Mode Price IDs (NEW - from Test Mode products)
STRIPE_PRICE_MONTHLY=price_test_xxxxx
STRIPE_PRICE_ANNUAL=price_test_xxxxx
STRIPE_PRICE_CREDITS_SMALL=price_test_xxxxx
STRIPE_PRICE_CREDITS_STANDARD=price_test_xxxxx
STRIPE_PRICE_CREDITS_LARGE=price_test_xxxxx
```

---

## 🔄 Managing Both Modes

### Development (Test Mode)
- Use Test Mode API keys (`sk_test_`, `pk_test_`)
- Use Test Mode Price IDs
- Test with test cards (no real charges)
- Products: Test Mode products

### Production (Live Mode)
- Use Live Mode API keys (`sk_live_`, `pk_live_`)
- Use Live Mode Price IDs (your current ones)
- Real payments
- Products: Live Mode products (already created)

### Environment-Based Configuration

You can use different keys based on environment:

```env
# Development (.env.local)
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_PRICE_MONTHLY=price_test_xxxxx
# ... etc

# Production (.env.production)
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_PRICE_MONTHLY=price_1SjfvQBek6nTXNYzMPYOdLLj  # Your live price ID
# ... etc
```

---

## ✅ Quick Checklist

### Test Mode Setup
- [ ] Switch to Test Mode in Stripe Dashboard
- [ ] Create all 5 products in Test Mode
- [ ] Add metadata to credit products
- [ ] Copy Test Mode Price IDs
- [ ] Get Test Mode API keys
- [ ] Update `.env.local` with Test Mode keys and Price IDs
- [ ] Test checkout with test card: `4242 4242 4242 4242`

### Live Mode (Keep for Production)
- [x] Products already created ✅
- [x] Price IDs saved ✅
- [ ] Keep Live Mode API keys for production
- [ ] Use Live Price IDs in production environment

---

## 💡 Pro Tip

**Keep a spreadsheet** with both Test and Live Price IDs:

| Product | Test Mode Price ID | Live Mode Price ID |
|---------|-------------------|-------------------|
| Monthly | `price_test_xxxxx` | `price_1SjfvQBek6nTXNYzMPYOdLLj` |
| Annual | `price_test_xxxxx` | `price_1SjfyHBek6nTXNYzWgm8OnVJ` |
| Small Credits | `price_test_xxxxx` | `price_1Sjg57Bek6nTXNYzGCTW2Z3c` |
| Standard Credits | `price_test_xxxxx` | `price_1Sjg8CBek6nTXNYzDZNO6b4J` |
| Large Credits | `price_test_xxxxx` | `price_1SjgBUBek6nTXNYz1xF6HCIw` |

---

## 🚨 Important Notes

1. **Test Mode First**: Always test in Test Mode before going live
2. **Separate Products**: Test and Live products are completely separate
3. **Different Price IDs**: You'll get different Price IDs for Test Mode
4. **Test Cards**: Only work in Test Mode
5. **No Real Charges**: Test Mode never charges real money

---

**Status**: Ready to Create Test Mode Products ✅

**Time Estimate**: 10-15 minutes to recreate all 5 products

