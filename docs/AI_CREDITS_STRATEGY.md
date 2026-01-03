# AI Credits Strategy for Startege

## 🎯 Overview

**Problem**: Prevent API cost overruns while maintaining good user experience
**Solution**: Monthly AI Credits allocation with usage tracking and limits

**Credit Allocation**:
- **Monthly Subscribers**: $10 worth of API credits per month
- **Annual Subscribers**: $10 worth of API credits per month (same allocation)
- **Rationale**: Credits are usage-based, subscription discount applies to platform access, not API usage

---

## 💰 Credit System Design

### Credit Allocation Model

**Monthly Credit Allowance**: $10 USD equivalent per month
- **Applies to**: Both monthly and annual subscribers
- **Reset Period**: Monthly (resets on billing cycle start date)
- **Unused Credits**: Do NOT roll over (use-it-or-lose-it)

**Why Same for Annual?**
- Annual subscribers get discount on **subscription cost** ($199 vs $228)
- Credits are **usage-based** (fair allocation for all)
- Prevents cost overruns regardless of subscription type
- Simple to implement and understand

### Credit Usage Tracking

**What Consumes Credits?**
1. **Startegizer AI Assistant** (primary use case)
   - Chat messages
   - Prompt executions
   - Market scan queries
   - Estimated: $0.01-0.05 per interaction

2. **Dynamic Exam Generation** (if not pre-generated)
   - Level exam generation
   - Category exam generation
   - Estimated: $0.10-0.50 per exam

3. **Concept Content Generation** (admin/one-time)
   - Concept definition generation
   - Scenario generation
   - Estimated: $0.05-0.20 per concept

**Credit Value Calculation**:
- Track actual API costs (tokens used × cost per token)
- Convert to USD
- Deduct from credit balance

---

## 📊 Database Schema

### New Models

```prisma
model AICredit {
  id                String   @id @default(cuid())
  userId            String   @unique
  subscriptionId   String?  // Link to subscription
  
  // Credit allocation
  monthlyAllowance Int      @default(1000) // $10.00 in cents
  currentBalance   Int      @default(1000) // Current balance in cents
  
  // Billing cycle tracking
  billingCycleStart DateTime @default(now())
  billingCycleEnd   DateTime // Next reset date
  
  // Usage tracking
  totalCreditsUsed  Int      @default(0) // Lifetime total
  creditsUsedThisCycle Int   @default(0) // Current cycle
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription      Subscription? @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)
  creditTransactions CreditTransaction[]
  
  @@index([userId])
  @@index([billingCycleEnd])
}

model CreditTransaction {
  id            String   @id @default(cuid())
  creditId      String
  userId        String
  
  // Transaction details
  amount        Int      // Amount in cents (positive = credit, negative = debit)
  type          CreditTransactionType
  description   String   @db.Text
  
  // API usage details
  service       String?  // "startegizer", "exam_generation", "concept_generation"
  tokensUsed    Int?     // Number of tokens consumed
  costPerToken  Float?   // Cost per token (for tracking)
  
  // Balance tracking
  balanceBefore Int      // Balance before transaction
  balanceAfter  Int      // Balance after transaction
  
  createdAt     DateTime @default(now())
  
  // Relations
  credit        AICredit @relation(fields: [creditId], references: [id], onDelete: Cascade)
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([creditId])
  @@index([userId])
  @@index([createdAt])
}

enum CreditTransactionType {
  ALLOCATION    // Monthly credit allocation
  USAGE         // API usage deduction
  RESET         // Monthly reset
  BONUS         // Bonus credits (promotions)
  REFUND        // Refund for failed API call
}
```

### Updated Models

```prisma
model User {
  // ... existing fields
  aiCredit AICredit?
  creditTransactions CreditTransaction[]
}

model Subscription {
  // ... existing fields
  aiCredit AICredit?
}
```

---

## 🔄 Credit Lifecycle

### Monthly Allocation Flow

```
1. User subscribes (monthly or annual)
   ↓
2. Create AICredit record
   - monthlyAllowance: $10 (1000 cents)
   - currentBalance: $10 (1000 cents)
   - billingCycleStart: subscription start date
   - billingCycleEnd: subscription start date + 1 month
   ↓
3. User uses Startegizer or generates exam
   ↓
4. Calculate API cost (tokens × cost)
   ↓
5. Deduct from currentBalance
   ↓
6. Create CreditTransaction record
   ↓
7. If balance reaches 0: Block further API usage
   ↓
8. On billing cycle reset:
   - Reset currentBalance to monthlyAllowance
   - Update billingCycleStart/End
   - Create RESET transaction
```

### Annual Subscription Credit Handling

**Approach**: Monthly credit allocation, reset monthly

**Implementation**:
- Annual subscribers get $10/month credits
- Credits reset on the same day each month (based on subscription start date)
- Example: Subscribed Jan 15 → Credits reset Feb 15, Mar 15, Apr 15, etc.

**Why Monthly Reset for Annual?**
- Prevents abuse (can't use all $120 upfront)
- Fair usage distribution
- Easier cost management
- Better user experience (consistent monthly allowance)

---

## 💻 Implementation

### Credit Allocation Service

```typescript
// lib/ai-credits.ts

export async function allocateMonthlyCredits(
  userId: string,
  subscriptionId?: string
): Promise<AICredit> {
  const monthlyAllowance = 1000; // $10.00 in cents
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return await prisma.aICredit.upsert({
    where: { userId },
    update: {
      currentBalance: monthlyAllowance,
      billingCycleStart: now,
      billingCycleEnd: nextMonth,
      creditsUsedThisCycle: 0,
    },
    create: {
      userId,
      subscriptionId,
      monthlyAllowance,
      currentBalance: monthlyAllowance,
      billingCycleStart: now,
      billingCycleEnd: nextMonth,
      creditsUsedThisCycle: 0,
    },
  });
}

export async function checkCreditBalance(userId: string): Promise<number> {
  const credit = await prisma.aICredit.findUnique({
    where: { userId },
  });

  if (!credit) {
    return 0;
  }

  // Check if billing cycle has reset
  if (new Date() >= credit.billingCycleEnd) {
    // Reset credits
    await allocateMonthlyCredits(userId, credit.subscriptionId || undefined);
    return 1000; // $10.00
  }

  return credit.currentBalance;
}

export async function deductCredits(
  userId: string,
  amount: number, // in cents
  service: string,
  description: string,
  tokensUsed?: number,
  costPerToken?: number
): Promise<{ success: boolean; remainingBalance: number }> {
  const credit = await prisma.aICredit.findUnique({
    where: { userId },
  });

  if (!credit) {
    throw new Error("No credit account found");
  }

  // Check if reset needed
  let currentCredit = credit;
  if (new Date() >= credit.billingCycleEnd) {
    currentCredit = await allocateMonthlyCredits(userId, credit.subscriptionId || undefined);
  }

  // Check balance
  if (currentCredit.currentBalance < amount) {
    return {
      success: false,
      remainingBalance: currentCredit.currentBalance,
    };
  }

  // Deduct credits
  const balanceBefore = currentCredit.currentBalance;
  const balanceAfter = balanceBefore - amount;

  await prisma.aICredit.update({
    where: { userId },
    data: {
      currentBalance: balanceAfter,
      creditsUsedThisCycle: {
        increment: amount,
      },
      totalCreditsUsed: {
        increment: amount,
      },
    },
  });

  // Create transaction record
  await prisma.creditTransaction.create({
    data: {
      creditId: currentCredit.id,
      userId,
      amount: -amount, // Negative for deduction
      type: "USAGE",
      description,
      service,
      tokensUsed,
      costPerToken,
      balanceBefore,
      balanceAfter,
    },
  });

  return {
    success: true,
    remainingBalance: balanceAfter,
  };
}
```

### Credit Reset Job (Scheduled)

```typescript
// lib/credit-reset.ts

export async function resetMonthlyCredits() {
  // Find all credits that need reset
  const creditsToReset = await prisma.aICredit.findMany({
    where: {
      billingCycleEnd: {
        lte: new Date(),
      },
    },
    include: {
      user: {
        select: {
          subscriptionTier: true,
        },
      },
    },
  });

  for (const credit of creditsToReset) {
    // Only reset for premium users
    if (credit.user.subscriptionTier === "premium") {
      await allocateMonthlyCredits(credit.userId, credit.subscriptionId || undefined);
    }
  }
}
```

---

## 🎨 User Interface

### Credit Balance Display

**Dashboard Widget**:
```
┌─────────────────────────────┐
│ AI Credits                  │
│ $8.50 / $10.00 remaining    │
│ [████████░░] 85%            │
│                             │
│ Resets: Jan 15, 2025        │
│                             │
│ [View Usage History]        │
└─────────────────────────────┘
```

**Startegizer Interface**:
```
┌─────────────────────────────┐
│ Startegizer                 │
│ Credits: $8.50 remaining    │
│                             │
│ [Chat Input]                │
│                             │
│ ⚠️ Low credits warning      │
│ at $2.00 remaining          │
└─────────────────────────────┘
```

### Credit Usage Page

**Features**:
- Current balance
- Usage history (transactions)
- Reset date countdown
- Usage breakdown by service
- Cost per interaction

---

## 🚨 Credit Limit Handling

### When Credits Run Out

**Scenario 1**: Credits depleted mid-month
- **Action**: Block API usage (Startegizer, exam generation)
- **Message**: "You've used all your monthly AI credits. Credits reset on [date]."
- **Options**: 
  - Wait for reset
  - Purchase additional credits (immediate access)
  - Upgrade to higher tier (if available)

**Credit Purchase Flow**:
1. User runs out of credits
2. System shows "Out of Credits" message with purchase options
3. User selects credit bundle
4. Stripe Checkout for one-time payment
5. Credits added immediately to account
6. User can continue using Startegizer

**Scenario 2**: Low Credits Warning
- **Threshold**: $2.00 remaining
- **Action**: Show warning banner
- **Message**: "You have $2.00 in AI credits remaining. Credits reset on [date]."

**Scenario 3**: Pre-Generated Exams
- **Action**: Use pre-generated exams (no credit cost)
- **Benefit**: Users can still take exams without credits

---

## 📈 Cost Management

### API Cost Estimation

**Startegizer (Gemini AI)**:
- Fixed cost model: 10 credits per API call
- Premium AI tutor providing personalized, context-aware explanations
- **$10 credits (1,000 credits) = 100 API calls/month** (base monthly allowance)
- Additional top-ups: $5 = 250 credits = 25 API calls

**Exam Generation (ChatGPT/Gemini)**:
- Average exam: ~$0.20-0.50 per generation
- **$10 credits = ~20-50 exams/month** (if not pre-generated)

**Realistic Usage**:
- Most users: 50-200 Startegizer queries/month = $0.03-0.12
- Exam generation: Mostly pre-generated = $0
- **Buffer**: $10/month provides significant headroom

### Cost Protection

**Hard Limits**:
- Maximum $10/month per user
- No rollover (prevents accumulation)
- Monthly reset (prevents abuse)

**Monitoring**:
- Track average credit usage per user
- Alert if usage exceeds $8/month average
- Adjust allocation if needed

---

## 🔄 Annual Subscription Credit Logic

### Implementation Approach

**Option 1: Monthly Reset (Recommended)**
- Annual subscribers: $10/month credits
- Reset on same day each month
- Simple, fair, prevents abuse

**Option 2: Annual Credit Pool**
- Annual subscribers: $120 upfront credits
- Reset annually
- **Risk**: User could exhaust all credits in first month
- **Not Recommended**

**Option 3: Prorated Monthly**
- Annual subscribers: $10/month × 12 = $120/year
- Reset monthly, but track annual total
- **Complex, not necessary**

**Recommendation**: **Option 1** - Monthly reset for all subscribers

---

## 📋 Implementation Checklist

### Phase 1: Database Schema
- [ ] Add `AICredit` model
- [ ] Add `CreditTransaction` model
- [ ] Add `CreditTransactionType` enum
- [ ] Update `User` and `Subscription` models
- [ ] Run migrations

### Phase 2: Credit Allocation
- [ ] Create credit allocation on subscription
- [ ] Implement monthly reset logic
- [ ] Create scheduled job for resets
- [ ] Handle subscription cancellation (stop allocation)

### Phase 3: Credit Usage Tracking
- [ ] Integrate credit deduction in Startegizer
- [ ] Integrate credit deduction in exam generation
- [ ] Track API costs accurately
- [ ] Create transaction records

### Phase 4: UI Components
- [ ] Credit balance widget (dashboard)
- [ ] Credit display in Startegizer
- [ ] Credit usage history page
- [ ] Low credit warnings
- [ ] Credit exhausted messages

### Phase 5: Credit Purchase Products
- [ ] Create Stripe products for credit bundles ($5, $10, $25, $50)
- [ ] Create API route for credit purchase checkout
- [ ] Implement credit addition on purchase completion
- [ ] Add credit expiration tracking
- [ ] Create credit purchase UI components
- [ ] Handle credit expiration job

### Phase 6: Testing
- [ ] Test credit allocation
- [ ] Test credit deduction
- [ ] Test monthly reset
- [ ] Test credit exhaustion handling
- [ ] Test annual subscription credits
- [ ] Test credit purchase flow
- [ ] Test credit expiration

---

## 💳 Credit Purchase Products (Stripe)

### Credit Bundle Options

Users can purchase additional credits when they run out or want extra capacity.

#### Product: AI Credits Top-Up

**Bundle 1: Small Top-Up**
- **Price**: $5.00
- **Credits**: $5.00 worth (500 cents)
- **Best For**: Light users who need a bit more
- **Stripe Price ID**: `price_credits_5_xxxxx`
- **Type**: One-time payment

**Bundle 2: Standard Top-Up** (Recommended)
- **Price**: $10.00
- **Credits**: $10.00 worth (1000 cents)
- **Best For**: Most users (matches monthly allowance)
- **Stripe Price ID**: `price_credits_10_xxxxx`
- **Type**: One-time payment

**Bundle 3: Large Top-Up**
- **Price**: $25.00
- **Credits**: $30.00 worth (3000 cents) - **20% bonus**
- **Best For**: Heavy users, power users
- **Stripe Price ID**: `price_credits_25_xxxxx`
- **Type**: One-time payment
- **Value Prop**: "Get 20% bonus credits"

### Credit Purchase Rules

**Expiration Policy**:
- Purchased credits expire at the end of the current billing cycle
- Example: User buys $10 credits on Jan 20, billing cycle ends Jan 31
  - Credits expire Jan 31 (11 days to use)
- **Rationale**: Prevents hoarding, encourages usage

**Usage Priority**:
1. Monthly allocated credits ($10) are used first
2. Purchased credits are used after monthly credits
3. This ensures monthly allocation is always available

**Purchase Eligibility**:
- Only available to premium subscribers (monthly/annual)
- Free users cannot purchase credits (must upgrade first)
- Lifetime subscribers can purchase credits

### Credit Purchase UI Flow

**When Credits Run Out**:
```
┌─────────────────────────────────────────┐
│ ⚠️ Out of AI Credits                    │
│                                         │
│ You've used all your monthly credits.  │
│ Credits reset on: Jan 31, 2025          │
│                                         │
│ Purchase Additional Credits:            │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ $5      │ │ $10 ⭐ │ │ $25     │    │
│ │ 500 cr  │ │1000 cr │ │3000 cr  │    │
│ │         │ │        │ │+20%     │    │
│ │[Buy Now]│ │[Buy Now]│ │[Buy Now]│    │
│ └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│ Or wait until Jan 31 for reset          │
└─────────────────────────────────────────┘
```

**Low Credits Warning** (at $2 remaining):
```
┌─────────────────────────────────────────┐
│ 💡 Low Credits Warning                  │
│                                         │
│ You have $2.00 credits remaining.      │
│ Credits reset on: Jan 31, 2025          │
│                                         │
│ [Purchase More Credits] [Dismiss]      │
└─────────────────────────────────────────┘
```

### Stripe Product Setup

**Product Name**: `AI Credits Top-Up`
**Description**: Additional AI credits for Startegizer and exam generation

**Prices**:
1. `price_credits_5`: $5.00 (500 credits)
2. `price_credits_10`: $10.00 (1000 credits) ⭐ Recommended
3. `price_credits_25`: $25.00 (3000 credits, 20% bonus)
4. `price_credits_50`: $50.00 (6500 credits, 30% bonus)

**Metadata**:
```json
{
  "type": "credit_topup",
  "creditAmount": 500,  // in cents
  "bonus": false,
  "expiresAtCycleEnd": true
}
```

### Credit Purchase Implementation

**API Route**: `/api/stripe/purchase-credits`
```typescript
POST /api/stripe/purchase-credits
Body: { priceId: "price_credits_10_xxxxx" }

Response: { checkoutUrl: "https://checkout.stripe.com/..." }
```

**Webhook Handler**:
- On `checkout.session.completed` for credit purchases:
  1. Identify credit purchase (check metadata)
  2. Add credits to user's account
  3. Set expiration date (end of current billing cycle)
  4. Create credit transaction record

**Credit Addition Service**:
```typescript
export async function addPurchasedCredits(
  userId: string,
  amount: number, // in cents
  expiresAt: Date
): Promise<void> {
  const credit = await prisma.aICredit.findUnique({
    where: { userId },
  });

  if (!credit) {
    throw new Error("No credit account found");
  }

  await prisma.aICredit.update({
    where: { userId },
    data: {
      currentBalance: {
        increment: amount,
      },
    },
  });

  await prisma.creditTransaction.create({
    data: {
      creditId: credit.id,
      userId,
      amount, // Positive for addition
      type: "BONUS", // or new type "PURCHASE"
      description: `Purchased ${amount} credits (expires ${expiresAt.toISOString()})`,
      balanceBefore: credit.currentBalance,
      balanceAfter: credit.currentBalance + amount,
    },
  });
}
```

### Credit Expiration Handling

**Scheduled Job**: Run daily to expire purchased credits
```typescript
export async function expirePurchasedCredits() {
  const now = new Date();
  
  // Find credits that should expire
  // (This requires tracking purchased credit expiration dates)
  // Implementation depends on how we track expiration
}
```

**Note**: Need to track which credits are purchased vs allocated to handle expiration properly.

---

## 💡 Future Enhancements

**Credit Rollover** (Optional):
- Allow up to $5 rollover from monthly allocation
- Prevents waste, encourages usage
- More complex to implement

**Tiered Credit Allocation** (Future):
- Basic Premium: $10/month
- Premium Plus: $25/month (future tier)
- Enterprise: Unlimited (custom)

**Credit Subscription** (Future):
- Monthly credit subscription: $15/month for $20 worth of credits
- For users who consistently need more than $10/month

---

## 🎯 Summary

### Credit Allocation Strategy

| Subscription Type | Monthly Credits | Reset Period | Rationale |
|-------------------|----------------|--------------|-----------|
| **Monthly ($19/mo)** | $10 | Monthly | Standard allocation |
| **Annual ($199/yr)** | $10 | Monthly | Same allocation, discount on subscription |
| **Lifetime ($999)** | $10 | Monthly | Same allocation, permanent access |

### Key Benefits

1. **Cost Control**: Maximum $10/user/month API costs
2. **Fair Allocation**: Same credits for all premium users
3. **Simple Logic**: Monthly reset for all subscription types
4. **User-Friendly**: Clear balance display and warnings
5. **Scalable**: Easy to adjust allocation if needed

### Implementation Priority

1. **High**: Credit allocation and tracking
2. **High**: Monthly reset logic
3. **High**: Credit purchase products (Stripe integration)
4. **Medium**: UI components (balance display, purchase prompts)
5. **Medium**: Credit exhaustion handling
6. **Medium**: Credit expiration tracking
7. **Low**: Usage history page
8. **Low**: Credit rollover (future)

---

**Status**: ✅ Strategy Complete - Ready for Implementation

**Next Steps**: 
1. Review and approve credit allocation strategy
2. Implement database schema
3. Build credit allocation service
4. Integrate with Startegizer and exam generation

