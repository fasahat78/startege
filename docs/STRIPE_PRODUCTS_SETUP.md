# Stripe Products Setup Guide

## 📋 Products Overview

### Subscription Products (2)
1. **Startege Premium Monthly** - $19/month
2. **Startege Premium Annual** - $199/year

### AI Credits Products (3)
1. **AI Credits Small Top-Up** - $5.00
2. **AI Credits Standard Top-Up** - $10.00
3. **AI Credits Large Top-Up** - $25.00

---

## 🎯 Product 1: Startege Premium Monthly

### Product Details
- **Product Name**: `Startege Premium Monthly`
- **Description**: 
  ```
  Full access to all 40 AI Governance level exams, Startegizer AI Assistant, advanced analytics, personalized learning paths, and achievement tracking. Cancel anytime.
  ```

### Price Details
- **Amount**: $19.00 USD
- **Billing**: Recurring
- **Interval**: Monthly
- **Trial Period**: None (or 7 days if you want to offer)

### Stripe Dashboard Setup Steps

1. **Go to Stripe Dashboard** → Products → Add Product
2. **Product Information**:
   - Name: `Startege Premium Monthly`
   - Description: (Copy from above)
   - Image: (Optional - upload Startege logo)
3. **Pricing**:
   - Price: `19.00`
   - Currency: `USD`
   - Billing: `Recurring`
   - Billing period: `Monthly`
   - Trial period: `None` (or `7 days`)
4. **Metadata** (Optional but recommended):
   ```json
   {
     "tier": "premium",
     "planType": "monthly",
     "features": "all",
     "credits": "1000"
   }
   ```
5. **Save** and copy the **Price ID** (starts with `price_`)

---

## 🎯 Product 2: Startege Premium Annual

### Product Details
- **Product Name**: `Startege Premium Annual`
- **Description**: 
  ```
  Full access to all 40 AI Governance level exams, Startegizer AI Assistant, advanced analytics, personalized learning paths, and achievement tracking. Save $29 per year with annual billing. Cancel anytime.
  ```

### Price Details
- **Amount**: $199.00 USD
- **Billing**: Recurring
- **Interval**: Yearly
- **Trial Period**: None (or 14 days if you want to offer)

### Stripe Dashboard Setup Steps

1. **Go to Stripe Dashboard** → Products → Add Product
2. **Product Information**:
   - Name: `Startege Premium Annual`
   - Description: (Copy from above)
   - Image: (Optional - upload Startege logo)
3. **Pricing**:
   - Price: `199.00`
   - Currency: `USD`
   - Billing: `Recurring`
   - Billing period: `Yearly`
   - Trial period: `None` (or `14 days`)
4. **Metadata** (Optional but recommended):
   ```json
   {
     "tier": "premium",
     "planType": "annual",
     "features": "all",
     "credits": "1000",
     "discount": "13%",
     "savings": "29"
   }
   ```
5. **Save** and copy the **Price ID** (starts with `price_`)

---

## 🎯 Product 3: AI Credits Small Top-Up

### Product Details
- **Product Name**: `AI Credits Small Top-Up`
- **Description**: 
  ```
  Additional AI credits for Startegizer queries and dynamic exam generation. Perfect for light users who need extra capacity. Credits expire at the end of your billing cycle.
  ```

### Price Details
- **Amount**: $5.00 USD
- **Billing**: One-time payment
- **Type**: Payment (not subscription)

### Stripe Dashboard Setup Steps

1. **Go to Stripe Dashboard** → Products → Add Product
2. **Product Information**:
   - Name: `AI Credits Small Top-Up`
   - Description: (Copy from above)
   - Image: (Optional)
3. **Pricing**:
   - Price: `5.00`
   - Currency: `USD`
   - Billing: `One-time`
   - **Important**: Select "One-time payment" (not recurring)
4. **Metadata** (Important for webhook processing):
   ```json
   {
     "type": "credit_topup",
     "purchasePrice": "500",
     "apiUsageCredits": "250",
     "bundle": "small",
     "expiresAtCycleEnd": "true"
   }
   ```
   - `purchasePrice`: Amount in cents (500 = $5.00)
   - `apiUsageCredits`: API usage credits in cents (250 = $2.50, which is 50% of purchase)
5. **Save** and copy the **Price ID** (starts with `price_`)

---

## 🎯 Product 4: AI Credits Standard Top-Up

### Product Details
- **Product Name**: `AI Credits Standard Top-Up`
- **Description**: 
  ```
  Additional AI credits for Startegizer queries and dynamic exam generation. Matches your monthly credit allowance. Credits expire at the end of your billing cycle.
  ```

### Price Details
- **Amount**: $10.00 USD
- **Billing**: One-time payment
- **Type**: Payment (not subscription)

### Stripe Dashboard Setup Steps

1. **Go to Stripe Dashboard** → Products → Add Product
2. **Product Information**:
   - Name: `AI Credits Standard Top-Up`
   - Description: (Copy from above)
   - Image: (Optional)
3. **Pricing**:
   - Price: `10.00`
   - Currency: `USD`
   - Billing: `One-time`
   - **Important**: Select "One-time payment" (not recurring)
4. **Metadata** (Important for webhook processing):
   ```json
   {
     "type": "credit_topup",
     "purchasePrice": "1000",
     "apiUsageCredits": "500",
     "bundle": "standard",
     "expiresAtCycleEnd": "true"
   }
   ```
   - `purchasePrice`: Amount in cents (1000 = $10.00)
   - `apiUsageCredits`: API usage credits in cents (500 = $5.00, which is 50% of purchase)
5. **Save** and copy the **Price ID** (starts with `price_`)

---

## 🎯 Product 5: AI Credits Large Top-Up

### Product Details
- **Product Name**: `AI Credits Large Top-Up`
- **Description**: 
  ```
  Additional AI credits for Startegizer queries and dynamic exam generation. Includes 20% bonus credits. Perfect for heavy users. Credits expire at the end of your billing cycle.
  ```

### Price Details
- **Amount**: $25.00 USD
- **Billing**: One-time payment
- **Type**: Payment (not subscription)

### Stripe Dashboard Setup Steps

1. **Go to Stripe Dashboard** → Products → Add Product
2. **Product Information**:
   - Name: `AI Credits Large Top-Up`
   - Description: (Copy from above)
   - Image: (Optional)
3. **Pricing**:
   - Price: `25.00`
   - Currency: `USD`
   - Billing: `One-time`
   - **Important**: Select "One-time payment" (not recurring)
4. **Metadata** (Important for webhook processing):
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
   - `purchasePrice`: Amount in cents (2500 = $25.00)
   - `apiUsageCredits`: API usage credits in cents (1500 = $15.00, which includes 20% bonus)
   - Note: Standard would be $12.50 (50% of $25), but with 20% bonus = $15.00
5. **Save** and copy the **Price ID** (starts with `price_`)

---

## 📝 Quick Setup Checklist

### Step 1: Create Products in Stripe
- [ ] Create "Startege Premium Monthly" product
- [ ] Create "Startege Premium Annual" product
- [ ] Create "AI Credits Small Top-Up" product
- [ ] Create "AI Credits Standard Top-Up" product
- [ ] Create "AI Credits Large Top-Up" product

### Step 2: Copy Price IDs
After creating each product, copy the Price ID (starts with `price_`) and save them:

- [ ] Monthly subscription price ID: `price_xxxxx`
- [ ] Annual subscription price ID: `price_xxxxx`
- [ ] Small credits price ID: `price_xxxxx`
- [ ] Standard credits price ID: `price_xxxxx`
- [ ] Large credits price ID: `price_xxxxx`

### Step 3: Update Environment Variables

Add to your `.env.local` file:

```env
# Stripe Subscription Price IDs
STRIPE_PRICE_MONTHLY=price_xxxxx
STRIPE_PRICE_ANNUAL=price_xxxxx
STRIPE_PRICE_LIFETIME=price_xxxxx  # If you have lifetime option

# Stripe Credit Bundle Price IDs
STRIPE_PRICE_CREDITS_SMALL=price_xxxxx
STRIPE_PRICE_CREDITS_STANDARD=price_xxxxx
STRIPE_PRICE_CREDITS_LARGE=price_xxxxx
```

### Step 4: Verify Setup

1. **Test Product Creation**:
   - Verify all 5 products are created
   - Check metadata is set correctly
   - Verify price amounts match

2. **Test Price IDs**:
   - Copy price IDs to `.env.local`
   - Restart your development server
   - Verify no errors in console

---

## 🎨 Product Display Names (For UI)

Use these display names in your application UI:

### Subscriptions
- **Monthly**: "Premium Monthly - $19/month"
- **Annual**: "Premium Annual - $199/year (Save $29)"

### Credit Bundles
- **Small**: "Small Top-Up - $5.00 → $2.50 API Credits"
- **Standard**: "Standard Top-Up - $10.00 → $5.00 API Credits ⭐ Most Popular"
- **Large**: "Large Top-Up - $25.00 → $15.00 API Credits (20% Bonus) 🎯 Best Value"

---

## 🔍 Verification Steps

### After Creating Products

1. **Check Product List**:
   - Go to Stripe Dashboard → Products
   - Verify all 5 products are listed
   - Check product names match exactly

2. **Verify Pricing**:
   - Click on each product
   - Verify price amounts are correct
   - Check billing type (recurring vs one-time)

3. **Check Metadata**:
   - For credit products, verify metadata includes:
     - `type: "credit_topup"`
     - `purchasePrice` (in cents)
     - `apiUsageCredits` (in cents)

4. **Test Price IDs**:
   - Copy price IDs to `.env.local`
   - Restart dev server
   - Check console for any errors

---

## 📊 Product Summary Table

| Product Name | Type | Price | Credits | Price ID Variable |
|-------------|------|-------|---------|-------------------|
| Startege Premium Monthly | Subscription | $19/month | $5/month API | `STRIPE_PRICE_MONTHLY` |
| Startege Premium Annual | Subscription | $199/year | $5/month API | `STRIPE_PRICE_ANNUAL` |
| AI Credits Small Top-Up | One-time | $5.00 | $2.50 API | `STRIPE_PRICE_CREDITS_SMALL` |
| AI Credits Standard Top-Up | One-time | $10.00 | $5.00 API | `STRIPE_PRICE_CREDITS_STANDARD` |
| AI Credits Large Top-Up | One-time | $25.00 | $15.00 API | `STRIPE_PRICE_CREDITS_LARGE` |

---

## ⚠️ Important Notes

1. **Metadata is Critical**: The credit purchase webhook relies on metadata to determine credit amounts. Make sure metadata is set correctly.

2. **Price IDs**: Copy the Price ID (not Product ID). Price IDs start with `price_`, Product IDs start with `prod_`.

3. **One-time vs Recurring**: Credit products must be "One-time payment", subscription products must be "Recurring".

4. **Testing**: Use Stripe Test Mode to test before going live. Test mode price IDs are different from live mode.

---

## 🚀 Next Steps After Setup

1. ✅ Create all 5 products in Stripe Dashboard
2. ✅ Copy price IDs to `.env.local`
3. ✅ Restart development server
4. ✅ Test subscription checkout flow
5. ✅ Test credit purchase flow
6. ✅ Verify webhook receives events correctly

---

**Status**: Ready for Stripe Dashboard Setup ✅

**Need Help?**: If you encounter any issues, check Stripe Dashboard → Events → Webhooks for error logs.

