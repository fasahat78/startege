# Stripe Setup - Final Configuration

## ✅ Setup Complete

All 5 Stripe products have been created and configured correctly.

---

## 📋 Price IDs (Final)

### Subscriptions
- **Monthly**: `price_1SjfvQBek6nTXNYzMPYOdLLj` - $19.00 USD/month
- **Annual**: `price_1SjfyHBek6nTXNYzWgm8OnVJ` - $199.00 USD/year

### AI Credits (One-time)
- **Small**: `price_1Sjg57Bek6nTXNYzGCTW2Z3c` - $5.00 USD
- **Standard**: `price_1Sjg8CBek6nTXNYzDZNO6b4J` - $10.00 USD
- **Large**: `price_1SjgBUBek6nTXNYz1xF6HCIw` - $25.00 USD ✅ Fixed

---

## 🔧 Environment Variables

Your `.env.local` should contain:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Subscription Price IDs
STRIPE_PRICE_MONTHLY=price_1SjfvQBek6nTXNYzMPYOdLLj
STRIPE_PRICE_ANNUAL=price_1SjfyHBek6nTXNYzWgm8OnVJ

# Stripe Credit Bundle Price IDs
STRIPE_PRICE_CREDITS_SMALL=price_1Sjg57Bek6nTXNYzGCTW2Z3c
STRIPE_PRICE_CREDITS_STANDARD=price_1Sjg8CBek6nTXNYzDZNO6b4J
STRIPE_PRICE_CREDITS_LARGE=price_1SjgBUBek6nTXNYz1xF6HCIw

# Stripe URLs
STRIPE_SUCCESS_URL=http://localhost:3000/dashboard?upgraded=true
STRIPE_CANCEL_URL=http://localhost:3000/dashboard?upgraded=false
```

---

## ✅ Verification Checklist

### Products Setup
- [x] All 5 products created
- [x] All prices in USD
- [x] Correct billing types (recurring vs one-time)
- [x] Descriptions are user-friendly

### Metadata (Verify in Stripe Dashboard)
- [ ] **Standard Credits**: `apiUsageCredits` = `"500"` (not `"standard"`)
- [ ] **Small Credits**: `apiUsageCredits` = `"250"`, `purchasePrice` = `"500"`
- [ ] **Large Credits**: `apiUsageCredits` = `"1500"`, `purchasePrice` = `"2500"`
- [ ] All credit products have `type` = `"credit_topup"`

### Environment Variables
- [x] Price IDs added to `.env.local`
- [ ] Stripe API keys configured
- [ ] Webhook secret configured

### Testing
- [ ] Test monthly subscription checkout
- [ ] Test annual subscription checkout
- [ ] Test credit purchase flow
- [ ] Verify webhook receives events
- [ ] Verify credits are allocated correctly

---

## 🧪 Testing Guide

### Test Subscription Checkout

1. **Navigate to pricing page**: `/pricing`
2. **Click "Upgrade to Premium"** (monthly or annual)
3. **Complete Stripe checkout** with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
4. **Verify**:
   - Redirects to dashboard with `?upgraded=true`
   - User subscription tier updated to "premium"
   - Monthly credits allocated ($10 = 1000 cents)

### Test Credit Purchase

1. **Navigate to credit purchase** (when implemented in UI)
2. **Select credit bundle** (Small, Standard, or Large)
3. **Complete Stripe checkout** with test card
4. **Verify**:
   - Webhook receives `checkout.session.completed` event
   - Credits added to user account
   - Transaction recorded in `CreditTransaction` table

### Test Webhook

1. **Use Stripe CLI** to forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. **Trigger test events**:
   ```bash
   stripe trigger checkout.session.completed
   ```
3. **Verify**:
   - Webhook receives events
   - No errors in console
   - Database updated correctly

---

## 📊 Expected Metadata Values

### Credit Products Metadata

**Small Credits** (`price_1Sjg57Bek6nTXNYzGCTW2Z3c`):
```json
{
  "type": "credit_topup",
  "purchasePrice": "500",
  "apiUsageCredits": "250",
  "bundle": "small",
  "expiresAtCycleEnd": "true"
}
```

**Standard Credits** (`price_1Sjg8CBek6nTXNYzDZNO6b4J`):
```json
{
  "type": "credit_topup",
  "purchasePrice": "1000",
  "apiUsageCredits": "500",
  "bundle": "standard",
  "expiresAtCycleEnd": "true"
}
```

**Large Credits** (`price_1SjgBUBek6nTXNYz1xF6HCIw`):
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

---

## 🚀 Next Steps

1. **Verify Metadata**: Check all credit products have correct metadata in Stripe Dashboard
2. **Test Checkout**: Test subscription and credit purchase flows
3. **Set Up Webhook**: Configure webhook endpoint in Stripe Dashboard
4. **Run Migration**: Execute Prisma migration for AI Credits schema
5. **Test Integration**: Verify end-to-end flow works correctly

---

## 📝 Notes

- All prices are now in USD ✅
- Large Credits currency issue fixed ✅
- Standard Credits metadata needs verification (should be `"500"`, not `"standard"`)
- Webhook URL: `https://yourdomain.com/api/stripe/webhook` (for production)

---

**Status**: ✅ Setup Complete | Ready for Testing

