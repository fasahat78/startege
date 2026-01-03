# Stripe Setup Issues to Fix

## ⚠️ Issues Found in Stripe Products

### Issue 1: Large Credits Price Currency
**Problem**: AI Credits Large Top-Up price is set to **AUD** instead of **USD**

**Current**:
- Price ID: `price_1SjgBUBek6nTXNYz1xF6HCIw`
- Currency: AUD
- Amount: $25.00 AUD

**Fix Required**:
1. Go to Stripe Dashboard → Products → AI Credits Large Top-Up
2. Click on the price
3. **Delete** the AUD price
4. **Create new price**:
   - Amount: `25.00`
   - Currency: `USD` (not AUD)
   - Billing: One-time
5. Copy the new Price ID
6. Update `.env.local` with the new Price ID

---

### Issue 2: Standard Credits Metadata
**Problem**: `apiUsageCredits` metadata is set to `"standard"` instead of `"500"`

**Current Metadata**:
```json
{
  "apiUsageCredits": "standard",  // ❌ Wrong - should be "500"
  "purchasePrice": "1000",
  "bundle": "standard"
}
```

**Fix Required**:
1. Go to Stripe Dashboard → Products → AI Credits Standard Top-Up
2. Click on the price (`price_1Sjg8CBek6nTXNYzDZNO6b4J`)
3. Scroll to **Metadata** section
4. Update `apiUsageCredits` from `"standard"` to `"500"`
5. Save changes

**Correct Metadata**:
```json
{
  "type": "credit_topup",
  "purchasePrice": "1000",
  "apiUsageCredits": "500",  // ✅ Correct
  "bundle": "standard",
  "expiresAtCycleEnd": "true"
}
```

---

## ✅ Verified Correct Configurations

### Monthly Subscription
- ✅ Price ID: `price_1SjfvQBek6nTXNYzMPYOdLLj`
- ✅ Amount: $19.00 USD
- ✅ Billing: Recurring Monthly
- ✅ Metadata: Correct

### Annual Subscription
- ✅ Price ID: `price_1SjfyHBek6nTXNYzWgm8OnVJ`
- ✅ Amount: $199.00 USD
- ✅ Billing: Recurring Yearly
- ✅ Metadata: Correct

### Small Credits
- ✅ Price ID: `price_1Sjg57Bek6nTXNYzGCTW2Z3c`
- ✅ Amount: $5.00 USD
- ✅ Billing: One-time
- ✅ Metadata: Correct (`apiUsageCredits: "250"`, `purchasePrice: "500"`)

---

## 📋 Action Items

1. [ ] Fix Large Credits currency (AUD → USD)
2. [ ] Fix Standard Credits metadata (`apiUsageCredits: "standard"` → `"500"`)
3. [ ] Update `.env.local` with corrected price IDs
4. [ ] Test checkout flow for all products
5. [ ] Verify webhook receives correct metadata

---

## 🔍 How to Verify Metadata

After fixing, verify metadata in Stripe Dashboard:

1. Go to Products → Select product → Click on price
2. Scroll to **Metadata** section
3. Verify:
   - `type`: `"credit_topup"` (for credit products)
   - `purchasePrice`: Amount in cents (e.g., `"500"` for $5.00)
   - `apiUsageCredits`: API credits in cents (e.g., `"250"` for $2.50)
   - `bundle`: `"small"`, `"standard"`, or `"large"`
   - `expiresAtCycleEnd`: `"true"`

---

**Status**: ⚠️ 2 Issues Need Fixing | Ready After Fixes ✅

