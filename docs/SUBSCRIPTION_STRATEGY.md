# Subscription & Payment Strategy - Freemium Model

## Executive Summary

Startege will operate on a freemium model where:
- **Free Tier**: Levels 1-10 (Foundation levels)
- **Premium Tier**: Levels 11-40 (Requires Stripe payment)

---

## 1. Freemium Model Structure

### 1.1 Free Tier (Levels 1-10)

**Included**:
- ✅ Browse all 410 concept cards (free)
- ✅ Complete Level 1-10 challenges
- ✅ Earn badges for Levels 1-10
- ✅ Earn points from Levels 1-10
- ✅ Basic dashboard access
- ✅ Progress tracking

**Limitations**:
- ❌ Cannot access Levels 11-40
- ❌ Cannot earn badges for advanced levels
- ❌ Limited to foundation content

### 1.2 Premium Tier (Levels 11-40)

**Included**:
- ✅ Everything in Free Tier
- ✅ Access to Levels 11-40 challenges
- ✅ Earn badges for all levels
- ✅ Earn points from all levels
- ✅ Advanced analytics
- ✅ Priority support
- ✅ Future premium features (AI Agent, Market Scan, etc.)

---

## 2. Pricing Strategy

### 2.1 Subscription Options

#### Option A: Monthly Subscription
- **Price**: $29/month
- **Billing**: Recurring monthly
- **Cancel**: Anytime
- **Access**: All premium levels while active

#### Option B: Annual Subscription (Recommended)
- **Price**: $249/year (save $99, ~30% discount)
- **Billing**: Recurring annually
- **Cancel**: Anytime (prorated refund)
- **Access**: All premium levels while active

#### Option C: Lifetime Access (Optional)
- **Price**: $999 (one-time payment)
- **Billing**: One-time
- **Access**: Permanent premium access

### 2.2 Pricing Rationale

- **Free Tier Value**: 10 levels = ~25% of content (demonstrates value)
- **Premium Value**: 30 levels = ~75% of content + advanced features
- **Competitive**: Aligns with similar exam prep platforms ($20-40/month)
- **Conversion**: Free tier builds trust, premium unlocks full value

---

## 3. Stripe Integration Architecture

### 3.1 Stripe Products & Prices

#### Product: Startege Premium
- **Monthly Plan**: $29/month
- **Annual Plan**: $249/year
- **Lifetime Plan**: $999 (one-time)

#### Stripe Setup
```javascript
// Products
- Premium Monthly: price_xxxxx
- Premium Annual: price_xxxxx  
- Premium Lifetime: price_xxxxx
```

### 3.2 Payment Flow

```
User completes Level 10
    ↓
"Unlock Premium" CTA appears
    ↓
User clicks "Upgrade to Premium"
    ↓
Stripe Checkout Session created
    ↓
User completes payment
    ↓
Stripe webhook confirms payment
    ↓
User account upgraded to Premium
    ↓
Level 11 unlocked automatically
```

---

## 4. Database Schema Updates

### 4.1 New Models

#### Subscription
```prisma
model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  stripeCustomerId String   @unique
  stripeSubscriptionId String? @unique
  stripePriceId    String?
  status            String   // active, canceled, past_due, etc.
  planType          String   // monthly, annual, lifetime
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  cancelAtPeriodEnd  Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([stripeCustomerId])
}
```

#### Payment
```prisma
model Payment {
  id                String   @id @default(cuid())
  userId            String
  stripePaymentId   String   @unique
  amount            Int      // in cents
  currency          String   @default("usd")
  status            String   // succeeded, pending, failed
  planType          String   // monthly, annual, lifetime
  createdAt         DateTime @default(now())
  
  user              User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([stripePaymentId])
}
```

### 4.2 Updated Models

#### User Model
```prisma
model User {
  // ... existing fields
  subscriptionTier String   @default("free") // free, premium
  subscription     Subscription?
  payments         Payment[]
  currentLevel     Int      @default(1)
  maxUnlockedLevel Int      @default(1) // Free users max at 10
}
```

---

## 5. Access Control Logic

### 5.1 Level Access Rules

```typescript
function canAccessLevel(user: User, level: number): boolean {
  // Free tier: Levels 1-10
  if (level <= 10) {
    return true; // Everyone can access
  }
  
  // Premium tier: Levels 11-40
  if (level > 10 && level <= 40) {
    return user.subscriptionTier === "premium" && 
           user.subscription?.status === "active";
  }
  
  return false;
}
```

### 5.2 Challenge Access Rules

```typescript
function canTakeChallenge(user: User, challenge: Challenge): boolean {
  // Check level access
  if (!canAccessLevel(user, challenge.level)) {
    return false;
  }
  
  // Check if previous level completed
  if (challenge.level > 1) {
    const previousLevel = challenge.level - 1;
    const previousCompleted = hasCompletedLevel(user, previousLevel);
    if (!previousCompleted) {
      return false;
    }
  }
  
  return true;
}
```

---

## 6. Stripe Integration Implementation

### 6.1 Required Stripe APIs

#### Checkout Session API
- Create checkout session for subscription
- Handle successful payment redirect
- Handle canceled payment redirect

#### Webhook API
- `checkout.session.completed` - Payment successful
- `customer.subscription.updated` - Subscription status changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Recurring payment successful
- `invoice.payment_failed` - Payment failed

#### Customer API
- Create/update customer
- Retrieve customer subscription
- Update payment method

### 6.2 API Routes Structure

```
/api/stripe/
  ├── create-checkout-session    # POST - Create checkout
  ├── create-portal-session      # POST - Customer portal
  ├── webhook                    # POST - Stripe webhooks
  └── subscription-status        # GET - Check subscription
```

---

## 7. User Experience Flow

### 7.1 Free User Completing Level 10

1. **User completes Level 10 challenge** (score ≥70%)
2. **System shows success page** with:
   - "Congratulations! Level 10 Complete!"
   - "Unlock 30 More Levels" CTA
   - Preview of Level 11 content
   - Pricing options
3. **User clicks "Upgrade to Premium"**
4. **Stripe Checkout opens** (embedded or redirect)
5. **User selects plan** (Monthly/Annual)
6. **User completes payment**
7. **Stripe redirects** to success page
8. **Webhook processes** payment
9. **User account upgraded**
10. **Level 11 unlocked** automatically
11. **Success message**: "Welcome to Premium! Level 11 is now unlocked."

### 7.2 Premium User Experience

- **No barriers** - Access all levels
- **Seamless progression** - Levels unlock automatically
- **Premium badge** - Shows premium status
- **Advanced features** - Access to future premium features

### 7.3 Payment Failed Experience

1. **Payment fails** (card declined, etc.)
2. **Stripe webhook** receives `invoice.payment_failed`
3. **System sends email** notification
4. **User sees banner** on dashboard
5. **User can retry** payment via customer portal
6. **Grace period** (7 days) before access revoked

---

## 8. Subscription Management

### 8.1 Customer Portal

**Features**:
- View subscription status
- Update payment method
- View payment history
- Cancel subscription
- Reactivate subscription

**Implementation**: Stripe Customer Portal (hosted)

### 8.2 Subscription Lifecycle

```
Active Subscription
    ↓
User cancels (cancelAtPeriodEnd = true)
    ↓
Access continues until period end
    ↓
Period ends → Status: canceled
    ↓
Access revoked (Level 11-40 locked)
    ↓
User can reactivate (resume subscription)
```

---

## 9. Upgrade Prompts & CTAs

### 9.1 Strategic Upgrade Points

#### After Level 10 Completion
- **Primary CTA**: "Unlock 30 More Levels - Upgrade Now"
- **Value Prop**: "Continue your journey to AI Governance mastery"
- **Pricing**: Show both monthly and annual options

#### Level 10 Challenge Page
- **Banner**: "Complete Level 10 to unlock Premium content"
- **Preview**: Show Level 11 concepts preview

#### Dashboard (Free Users)
- **Widget**: "You've completed 10 levels! Unlock 30 more"
- **Progress Bar**: Shows 10/40 levels completed

#### Concept Cards (Level 11+)
- **Lock Icon**: On Level 11+ concept cards
- **Tooltip**: "Upgrade to Premium to access this content"

### 9.2 CTA Design

```typescript
// Upgrade CTA Component
<UpgradePrompt>
  <Title>Unlock Premium Content</Title>
  <Description>
    Access 30 more levels, advanced challenges, and exclusive features
  </Description>
  <Pricing>
    <Plan price="$29/month" />
    <Plan price="$249/year" highlighted />
  </Pricing>
  <Button>Upgrade to Premium</Button>
</UpgradePrompt>
```

---

## 10. Revenue Projections

### 10.1 Assumptions

- **Free users**: 1,000 users/month
- **Conversion rate**: 5% (industry average for freemium)
- **Premium users**: 50 users/month
- **Average plan**: 60% annual, 40% monthly

### 10.2 Monthly Revenue

```
Monthly Subscribers: 50 × 40% = 20 users × $29 = $580
Annual Subscribers: 50 × 60% = 30 users × ($249/12) = $622.50
Total Monthly Recurring Revenue: $1,202.50
Annual Revenue: $14,430
```

### 10.3 Growth Scenarios

**Conservative** (3% conversion):
- 30 premium users/month
- $720 MRR
- $8,640/year

**Moderate** (5% conversion):
- 50 premium users/month
- $1,200 MRR
- $14,400/year

**Optimistic** (10% conversion):
- 100 premium users/month
- $2,400 MRR
- $28,800/year

---

## 11. Implementation Phases

### Phase 1: Stripe Setup (Week 1)
- [ ] Create Stripe account
- [ ] Set up products and prices
- [ ] Install Stripe SDK
- [ ] Configure webhooks

### Phase 2: Database Schema (Week 1)
- [ ] Add Subscription model
- [ ] Add Payment model
- [ ] Update User model
- [ ] Run migrations

### Phase 3: Payment Flow (Week 2)
- [ ] Create checkout session API
- [ ] Build upgrade UI components
- [ ] Implement payment success page
- [ ] Add upgrade prompts

### Phase 4: Webhook Handling (Week 2)
- [ ] Set up webhook endpoint
- [ ] Handle subscription events
- [ ] Update user subscription status
- [ ] Send confirmation emails

### Phase 5: Access Control (Week 3)
- [ ] Implement level access checks
- [ ] Add premium gates to UI
- [ ] Create subscription status API
- [ ] Add customer portal access

### Phase 6: Testing & Polish (Week 3)
- [ ] Test payment flows
- [ ] Test webhook handling
- [ ] Test access control
- [ ] User acceptance testing

---

## 12. Security Considerations

### 12.1 Payment Security

- **Never store** credit card information
- **Use Stripe** for all payment processing
- **Validate webhooks** with Stripe signature
- **HTTPS only** for payment pages

### 12.2 Access Security

- **Server-side validation** of subscription status
- **JWT tokens** include subscription tier
- **API rate limiting** for premium endpoints
- **Audit logs** for subscription changes

---

## 13. Legal & Compliance

### 13.1 Terms of Service

- **Subscription terms**: Auto-renewal, cancellation policy
- **Refund policy**: Prorated refunds for annual plans
- **Access terms**: Premium content access rules

### 13.2 Privacy

- **Payment data**: Handled by Stripe (PCI compliant)
- **Subscription data**: Stored securely
- **User consent**: Clear subscription terms

---

## 14. Monitoring & Analytics

### 14.1 Key Metrics

- **Conversion rate**: Free → Premium
- **Churn rate**: Premium cancellations
- **MRR**: Monthly Recurring Revenue
- **ARPU**: Average Revenue Per User
- **LTV**: Lifetime Value

### 14.2 Tracking Events

- Upgrade CTA clicks
- Checkout session starts
- Payment completions
- Payment failures
- Subscription cancellations
- Subscription reactivations

---

## 15. Future Enhancements

### 15.1 Additional Premium Features

- **AI Governance Agent**: Premium-only access
- **Market Scan**: Premium-only regulatory updates
- **Practice Questions**: Unlimited premium questions
- **Mock Exams**: Full-length AIGP practice exams
- **Study Plans**: Personalized premium study plans

### 15.2 Pricing Tiers (Future)

- **Free**: Levels 1-10
- **Premium**: Levels 11-40 + basic features
- **Premium Plus**: All premium + AI Agent + Market Scan

---

## Conclusion

This freemium model with Stripe integration provides:
- **Clear value proposition**: Free tier demonstrates platform value
- **Natural upgrade point**: After completing foundation levels
- **Sustainable revenue**: Recurring subscription model
- **Scalable**: Easy to add premium features

**Next Steps**: 
1. Review and approve pricing strategy
2. Set up Stripe account
3. Begin Phase 1 implementation

---

**Status**: Strategy Complete ✅ | Ready for Implementation 🚀

