# AI Credits Implementation Summary

## ✅ Implementation Complete

The AI Credits system has been fully implemented with the following features:

### 🎯 Key Features

1. **50% API Usage Allocation Model**
   - $5 purchase → $2.50 API usage (250 cents)
   - $10 purchase → $5.00 API usage (500 cents)
   - $25 purchase → $15.00 API usage (1500 cents, 20% bonus)
   - $50 purchase → $32.50 API usage (3250 cents, 30% bonus)

2. **Monthly Credit Allocation**
   - Premium subscribers: $10/month credits (1000 cents)
   - 50% allocation = $5 API usage per month
   - Automatic reset on billing cycle

3. **Credit Purchase System**
   - One-time Stripe payments for credit bundles
   - Credits expire at end of billing cycle
   - Monthly credits used first, then purchased credits

4. **Gemini API Cost Calculation**
   - Tracks input/output tokens
   - Calculates cost based on Gemini pricing model
   - Deducts credits based on actual API usage

---

## 📁 Files Created/Modified

### New Files

1. **`lib/gemini-pricing.ts`**
   - Gemini API pricing constants
   - Cost calculation functions
   - Credit bundle configurations
   - Token estimation utilities

2. **`lib/ai-credits.ts`**
   - Credit allocation service
   - Credit deduction functions
   - Purchase credit handling
   - Monthly reset job

3. **`app/api/stripe/purchase-credits/route.ts`**
   - Credit purchase checkout API
   - Bundle listing endpoint
   - Stripe integration

### Modified Files

1. **`prisma/schema.prisma`**
   - Added `AICredit` model
   - Added `CreditTransaction` model
   - Added `CreditTransactionType` enum
   - Updated `User` and `Subscription` relations

2. **`lib/stripe.ts`**
   - Added credit bundle price IDs

3. **`app/api/stripe/webhook/route.ts`**
   - Added credit purchase handling
   - Added credit allocation on subscription

---

## 🗄️ Database Schema

### AICredit Model
```prisma
model AICredit {
  id                String   @id @default(cuid())
  userId            String   @unique
  subscriptionId   String?  @unique
  
  monthlyAllowance  Int      @default(1000) // $10.00
  currentBalance     Int      @default(1000)
  purchasedCredits   Int      @default(0)
  
  billingCycleStart DateTime @default(now())
  billingCycleEnd   DateTime
  
  totalCreditsUsed  Int      @default(0)
  creditsUsedThisCycle Int   @default(0)
  
  // Relations
  user              User
  subscription      Subscription?
  creditTransactions CreditTransaction[]
}
```

### CreditTransaction Model
```prisma
model CreditTransaction {
  id            String   @id @default(cuid())
  creditId      String
  userId        String
  
  amount        Int      // in cents
  type          CreditTransactionType
  description   String
  
  service       String?  // "startegizer", "exam_generation"
  tokensUsed    Int?
  inputTokens   Int?
  outputTokens  Int?
  
  balanceBefore Int
  balanceAfter  Int
  
  stripePaymentId String?
  expiresAt      DateTime?
  
  // Relations
  credit        AICredit
  user          User
}
```

---

## 🚀 Next Steps

### 1. Run Database Migration

```bash
# Generate migration
npx prisma migrate dev --name add_ai_credits

# Or if you want to create migration without applying
npx prisma migrate dev --create-only --name add_ai_credits
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Set Up Stripe Credit Products

In Stripe Dashboard:

1. **Create Product**: "AI Credits Top-Up"
2. **Create Prices**:
   - Small: $5.00 (one-time)
   - Standard: $10.00 (one-time) ⭐
   - Large: $25.00 (one-time)

3. **Add Metadata to Prices**:
   ```json
   {
     "type": "credit_topup",
     "creditAmount": 250,  // for $5 bundle (in cents)
     "bonus": false
   }
   ```

### 4. Update Environment Variables

Add to `.env.local`:
```env
# Stripe Credit Bundle Price IDs
STRIPE_PRICE_CREDITS_SMALL=price_xxxxx
STRIPE_PRICE_CREDITS_STANDARD=price_xxxxx
STRIPE_PRICE_CREDITS_LARGE=price_xxxxx
```

### 5. Test Credit System

1. **Test Credit Allocation**:
   ```typescript
   import { allocateMonthlyCredits } from "@/lib/ai-credits";
   await allocateMonthlyCredits(userId, subscriptionId);
   ```

2. **Test Credit Deduction**:
   ```typescript
   import { deductCredits } from "@/lib/ai-credits";
   await deductCredits(
     userId,
     100, // 100 cents = $1.00
     "startegizer",
     "Chat query",
     { inputTokens: 2000, outputTokens: 1000 },
     "pro"
   );
   ```

3. **Test Credit Purchase**:
   - Call `/api/stripe/purchase-credits` with `priceId`
   - Complete Stripe checkout
   - Verify credits added via webhook

---

## 📊 Credit Allocation Logic

### Monthly Allocation
- **Premium Users**: $10/month (1000 cents)
- **API Usage**: $5/month (500 cents, 50% allocation)
- **Reset**: Monthly on billing cycle start date

### Purchase Allocation
- **$5 Purchase**: $2.50 API usage (250 cents)
- **$10 Purchase**: $5.00 API usage (500 cents)
- **$25 Purchase**: $15.00 API usage (1500 cents, 20% bonus)
- **$50 Purchase**: $32.50 API usage (3250 cents, 30% bonus)

### Usage Priority
1. Monthly allocated credits used first
2. Purchased credits used after monthly credits
3. Purchased credits expire at billing cycle end

---

## 🔧 Integration Points

### Startegizer Integration
```typescript
import { deductCredits, hasSufficientCredits } from "@/lib/ai-credits";
import { calculateGeminiCost } from "@/lib/gemini-pricing";

// Before API call
const estimatedCost = calculateGeminiCost(2000, 1000, "pro"); // ~100 cents

if (!(await hasSufficientCredits(userId, estimatedCost))) {
  throw new Error("Insufficient credits");
}

// After API call (with actual token counts)
const actualCost = calculateGeminiCost(actualInputTokens, actualOutputTokens, "pro");
await deductCredits(
  userId,
  actualCost,
  "startegizer",
  "Chat query: [user message]",
  { inputTokens: actualInputTokens, outputTokens: actualOutputTokens },
  "pro"
);
```

### Exam Generation Integration
```typescript
// Only deduct if exam is dynamically generated (not pre-generated)
if (!exam.preGenerated) {
  const cost = calculateGeminiCost(inputTokens, outputTokens, "pro");
  await deductCredits(userId, cost, "exam_generation", `Level ${levelNumber} exam`);
}
```

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **Credit Usage**:
   - Average credits used per user/month
   - Credits used by service (Startegizer vs Exam Generation)
   - Peak usage times

2. **Purchase Behavior**:
   - Credit purchase conversion rate
   - Average purchase amount
   - Purchase frequency

3. **Cost Management**:
   - Actual API costs vs allocated credits
   - Cost per user
   - Cost per service

### Database Queries

```sql
-- Average credits used per user
SELECT AVG(creditsUsedThisCycle) FROM "AICredit";

-- Credits by service
SELECT service, SUM(ABS(amount)) as total_credits
FROM "CreditTransaction"
WHERE type = 'USAGE'
GROUP BY service;

-- Purchase statistics
SELECT 
  COUNT(*) as purchase_count,
  AVG(amount) as avg_purchase_amount
FROM "CreditTransaction"
WHERE type = 'PURCHASE';
```

---

## ⚠️ Important Notes

1. **Credit Expiration**: Purchased credits expire at billing cycle end (no rollover)

2. **Monthly Reset**: Credits reset automatically on billing cycle start date

3. **Cost Calculation**: Actual API costs are calculated based on token usage, not estimated

4. **Premium Only**: Credit system only applies to premium subscribers

5. **50% Allocation**: Only 50% of purchase price goes to API usage (covers platform costs, margins)

---

## 🐛 Troubleshooting

### Credits Not Allocating
- Check user has premium subscription
- Verify subscription status is "active"
- Check billing cycle dates

### Credits Not Deducting
- Verify credit balance > 0
- Check billing cycle hasn't expired
- Ensure service name matches expected values

### Purchase Credits Not Adding
- Check Stripe webhook is configured
- Verify webhook secret is correct
- Check webhook logs for errors
- Ensure metadata is passed correctly

---

**Status**: ✅ Implementation Complete | Ready for Testing

**Next**: Run migration, set up Stripe products, and test!

