# Update .env.local with Test Mode Price IDs

## ⚠️ Current Issue

Your `.env.local` file has **LIVE mode** price IDs, but you're using **TEST mode** API keys.

This causes the error: `No such price: 'price_1SjfvQBek6nTXNYzMPYOdLLj'`

---

## ✅ Solution: Update .env.local

Replace the LIVE mode price IDs with TEST mode price IDs:

### Test Mode Price IDs (from `stripe/prices_test.csv`)

```env
# Stripe Subscription Price IDs (TEST MODE)
STRIPE_PRICE_MONTHLY=price_1SjgjVBEA7DCjdkmBtlbXixO
STRIPE_PRICE_ANNUAL=price_1SjgkBBEA7DCjdkmBNNuD71Q

# Stripe Credit Bundle Price IDs (TEST MODE)
STRIPE_PRICE_CREDITS_SMALL=price_1SjgkdBEA7DCjdkmmMe9NPl4
STRIPE_PRICE_CREDITS_STANDARD=price_1SjgmIBEA7DCjdkmN4L3A4xu
STRIPE_PRICE_CREDITS_LARGE=price_1SjgopBEA7DCjdkmIxPQ9Usj
```

---

## 📝 Complete .env.local Template

```env
# Stripe API Keys (TEST MODE)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Subscription Price IDs (TEST MODE)
STRIPE_PRICE_MONTHLY=price_1SjgjVBEA7DCjdkmBtlbXixO
STRIPE_PRICE_ANNUAL=price_1SjgkBBEA7DCjdkmBNNuD71Q
STRIPE_PRICE_LIFETIME=  # Optional, if you add lifetime later

# Stripe Credit Bundle Price IDs (TEST MODE)
STRIPE_PRICE_CREDITS_SMALL=price_1SjgkdBEA7DCjdkmmMe9NPl4
STRIPE_PRICE_CREDITS_STANDARD=price_1SjgmIBEA7DCjdkmN4L3A4xu
STRIPE_PRICE_CREDITS_LARGE=price_1SjgopBEA7DCjdkmIxPQ9Usj

# Stripe URLs
STRIPE_SUCCESS_URL=http://localhost:3000/dashboard?upgraded=true
STRIPE_CANCEL_URL=http://localhost:3000/dashboard?upgraded=false
```

---

## 🔄 After Updating

1. **Save** `.env.local`
2. **Restart** your development server
3. **Test** checkout flow again

---

## 📋 Price ID Reference

### Test Mode (Development)
- Monthly: `price_1SjgjVBEA7DCjdkmBtlbXixO`
- Annual: `price_1SjgkBBEA7DCjdkmBNNuD71Q`
- Small Credits: `price_1SjgkdBEA7DCjdkmmMe9NPl4`
- Standard Credits: `price_1SjgmIBEA7DCjdkmN4L3A4xu`
- Large Credits: `price_1SjgopBEA7DCjdkmIxPQ9Usj`

### Live Mode (Production - Keep for Later)
- Monthly: `price_1SjfvQBek6nTXNYzMPYOdLLj`
- Annual: `price_1SjfyHBek6nTXNYzWgm8OnVJ`
- Small Credits: `price_1Sjg57Bek6nTXNYzGCTW2Z3c`
- Standard Credits: `price_1Sjg8CBek6nTXNYzDZNO6b4J`
- Large Credits: `price_1SjgBUBek6nTXNYz1xF6HCIw`

---

**Status**: Ready to Update ✅

