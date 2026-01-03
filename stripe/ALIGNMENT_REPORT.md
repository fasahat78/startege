# Stripe Products & Pricing Alignment Report

**Generated**: December 29, 2025

## ✅ Verified Correct

### Subscriptions
- ✅ **Monthly**: $19/month, 1,000 credits/month
- ✅ **Annual**: $199/year, savings $29 (12% off)

### Credit Bundles
- ✅ **Small**: $5.00 → 250 credits (50% allocation) ✅
- ✅ **Large**: $25.00 → 1,500 credits (50% + 20% bonus) ✅

---

## ❌ Issues Found

### 1. Annual Subscription Credits Metadata
**Current**: `credits (metadata) = "1000"`  
**Expected**: `credits (metadata) = "1250"` or `"15000"`

**Impact**: 
- UI displays correctly (1,250/month) but metadata doesn't match
- May cause confusion in webhook processing

**Fix Required**: Update Stripe Dashboard
- Product: `Startege Premium Annual` (prod_Th46N0Rdugel54)
- Metadata field: `credits`
- Change from: `1000`
- Change to: `1250` (or `15000` for yearly total)

---

### 2. Standard Credits API Usage Credits
**Current**: `apiUsageCredits (metadata) = "650"`  
**Expected**: `apiUsageCredits (metadata) = "500"`

**Impact**: 
- Code expects 500 credits for $10 purchase
- Webhook will allocate 650 credits instead of 500
- User gets more credits than intended (30% bonus not documented)

**Analysis**:
- Base 50% allocation: $10 × 50% = $5 = 500 credits
- Current: 650 credits = 500 + 150 (30% bonus?)
- **Question**: Is this intentional 30% bonus, or should it be 500?

**Fix Required**: Update Stripe Dashboard
- Product: `AI Credits Standard Top-Up` (prod_Th4GkGLldSCR6U)
- Metadata field: `apiUsageCredits`
- Change from: `650`
- Change to: `500` (if no bonus intended)

**OR** Update code to match:
- If 30% bonus is intentional, update `CREDIT_BUNDLES.STANDARD.apiUsageCredits` to `650`

---

### 3. Large Credits Allocation (Actually Correct!)
**Current**: `apiUsageCredits (metadata) = "1500"`  
**Expected**: `apiUsageCredits (metadata) = "1500"` ✅

**Analysis**:
- Base 50% allocation: $25 × 50% = $12.50 = 1,250 credits
- 20% bonus: 1,250 × 1.2 = 1,500 credits ✅
- **This is CORRECT** - matches bonus metadata

**Status**: ✅ No fix needed

---

## 📊 Summary Table

| Product | Price | Expected Credits | Actual Credits | Status |
|---------|-------|------------------|----------------|--------|
| Monthly | $19/mo | 1,000/mo | 1,000/mo | ✅ |
| Annual | $199/yr | 1,250/mo | 1,000 (metadata) | ❌ Fix metadata |
| Small Credits | $5 | 250 | 250 | ✅ |
| Standard Credits | $10 | 500 | 650 | ❌ Fix metadata or code |
| Large Credits | $25 | 1,500 (with bonus) | 1,500 | ✅ |

---

## 🔧 Recommended Actions

### Option A: Fix Stripe Metadata (Recommended)
1. **Annual Subscription**: Update `credits` metadata to `1250`
2. **Standard Credits**: Update `apiUsageCredits` metadata to `500`

### Option B: Update Code to Match Stripe
1. **Standard Credits**: Update `CREDIT_BUNDLES.STANDARD.apiUsageCredits` to `650` if bonus is intentional

---

## 📝 Notes

- Large Credits includes 20% bonus (documented in metadata)
- Standard Credits shows 650 (30% bonus?) - needs clarification
- Annual subscription metadata shows old monthly value (1,000) instead of annual (1,250)

