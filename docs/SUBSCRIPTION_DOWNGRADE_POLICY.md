# Subscription Downgrade & Cancellation Policy

## 🚫 Downgrade Prevention

### Policy: No Downgrades from Annual to Monthly

**Rationale:**
- Annual plans offer significant savings ($29/year)
- Prevents users from gaming the system (upgrade → downgrade)
- Protects revenue and pricing integrity
- Common industry practice for annual plans

### Implementation:
1. **Stripe Customer Portal**: Configure to prevent annual → monthly downgrades
2. **UI Warning**: Show clear warning when upgrading monthly → annual
3. **Webhook Protection**: Reject downgrade attempts in webhook handler

---

## ✅ Upgrade Flow (Monthly → Annual)

### User Experience:
1. User clicks "Get Annual Plan" while on monthly plan
2. **Warning Modal** appears:
   ```
   ⚠️ Important: Annual Plan Commitment
   
   By upgrading to the Annual Plan, you'll:
   • Save $29 per year (12% discount)
   • Get 1,250 credits/month (vs 1,000/month)
   • Commit to a full year subscription
   
   ⚠️ You will NOT be able to downgrade to monthly 
      until your annual period ends.
   
   [Cancel] [Confirm Upgrade]
   ```
3. User confirms → Proceed to Stripe Checkout
4. After payment → Annual plan activated

---

## 🚪 Cancellation Best Practices

### Option 1: Cancel at Period End (Recommended)
**Best Practice**: Allow subscription to continue until period ends

**Benefits:**
- User retains access until period ends
- Better user experience (no immediate cutoff)
- Opportunity for retention/re-engagement
- Industry standard practice

**Implementation:**
- Set `cancel_at_period_end: true` in Stripe
- User keeps access until `currentPeriodEnd`
- Show clear messaging: "Access until [date]"

### Option 2: Immediate Cancellation
**Use Case**: User explicitly requests immediate cancellation

**Implementation:**
- Set `cancel_at_period_end: false`
- Immediately revoke premium access
- Optionally offer prorated refund

---

## 📋 Cancellation Flow

### Step 1: User Initiates Cancellation
- Via Stripe Customer Portal or app settings
- Show retention offer (if applicable)

### Step 2: Confirmation Dialog
```
Are you sure you want to cancel?

Your subscription will end on [currentPeriodEnd].
You'll lose access to:
• All premium features
• Startegizer AI Assistant
• Advanced analytics
• Premium support

[Keep Subscription] [Cancel Subscription]
```

### Step 3: Cancellation Processing
- Set `cancel_at_period_end: true`
- Update database: `cancelAtPeriodEnd = true`
- Send confirmation email
- Show success message with end date

### Step 4: Period End Handling
- Webhook: `customer.subscription.deleted`
- Revoke premium access
- Downgrade to free tier
- Preserve user data (for potential reactivation)

---

## 🔄 Reactivation Flow

### If User Cancels but Wants to Return:
1. User can resubscribe anytime
2. Restore premium access immediately
3. Preserve all progress/data
4. Optionally offer "Welcome back" discount

---

## 💳 Credit Handling on Cancellation

### Monthly Plan Cancellation:
- User keeps access until period ends
- Credits reset normally at period end
- No prorated refunds (standard practice)

### Annual Plan Cancellation:
- User keeps access until period ends
- Credits reset normally at period end
- **Option**: Offer prorated refund for unused months
- **OR**: Standard practice: No refunds (clearly stated upfront)

---

## 📝 Implementation Checklist

- [ ] Configure Stripe Portal to prevent annual → monthly downgrades
- [ ] Add warning modal for monthly → annual upgrade
- [ ] Implement cancel-at-period-end flow
- [ ] Add cancellation confirmation dialog
- [ ] Handle webhook events for cancellations
- [ ] Update UI to show cancellation status
- [ ] Send cancellation confirmation emails
- [ ] Test cancellation flow end-to-end

