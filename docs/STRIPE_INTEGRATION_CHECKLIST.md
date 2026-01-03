# Stripe Integration Checklist

## Pre-Implementation Setup

### Stripe Account Setup
- [ ] Create Stripe account (or use existing)
- [ ] Complete business verification
- [ ] Set up bank account for payouts
- [ ] Configure tax settings (if applicable)
- [ ] Set up email notifications

### Stripe Products & Prices
- [ ] Create "Startege Premium Monthly" product
  - Price: $29/month
  - Billing: Recurring monthly
  - Price ID: `price_xxxxx`
- [ ] Create "Startege Premium Annual" product
  - Price: $249/year
  - Billing: Recurring annually
  - Price ID: `price_xxxxx`
- [ ] Create "Startege Premium Lifetime" product (optional)
  - Price: $999 one-time
  - Price ID: `price_xxxxx`

### Stripe API Keys
- [ ] Get publishable key: `pk_test_xxxxx` (test)
- [ ] Get secret key: `sk_test_xxxxx` (test)
- [ ] Get publishable key: `pk_live_xxxxx` (production)
- [ ] Get secret key: `sk_live_xxxxx` (production)
- [ ] Add to `.env` file:
  ```
  STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
  STRIPE_SECRET_KEY=sk_test_xxxxx
  STRIPE_WEBHOOK_SECRET=whsec_xxxxx
  ```

### Webhook Configuration
- [ ] Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- [ ] Configure events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Get webhook signing secret: `whsec_xxxxx`

---

## Implementation Checklist

### 1. Install Dependencies
- [ ] Install Stripe SDK: `npm install stripe`
- [ ] Install Stripe React: `npm install @stripe/stripe-js @stripe/react-stripe-js`

### 2. Database Schema
- [ ] Create Subscription model
- [ ] Create Payment model
- [ ] Update User model (subscriptionTier, maxUnlockedLevel)
- [ ] Run migrations: `npm run db:push`

### 3. API Routes
- [ ] Create `/api/stripe/create-checkout-session`
- [ ] Create `/api/stripe/create-portal-session`
- [ ] Create `/api/stripe/webhook`
- [ ] Create `/api/stripe/subscription-status`

### 4. Frontend Components
- [ ] Create `<UpgradePrompt />` component
- [ ] Create `<PricingPlans />` component
- [ ] Create `<SubscriptionStatus />` component
- [ ] Create upgrade CTAs on Level 10 completion
- [ ] Add premium gates to Level 11+ content

### 5. Access Control
- [ ] Create `canAccessLevel()` utility function
- [ ] Create `isPremiumUser()` utility function
- [ ] Add middleware for premium routes
- [ ] Update challenge access checks

### 6. Webhook Handlers
- [ ] Handle `checkout.session.completed`
- [ ] Handle `customer.subscription.created`
- [ ] Handle `customer.subscription.updated`
- [ ] Handle `customer.subscription.deleted`
- [ ] Handle `invoice.payment_succeeded`
- [ ] Handle `invoice.payment_failed`

### 7. User Experience
- [ ] Level 10 completion → Upgrade prompt
- [ ] Premium level pages → Locked state
- [ ] Dashboard → Subscription status widget
- [ ] Settings → Manage subscription link
- [ ] Success page after payment
- [ ] Error handling for failed payments

---

## Testing Checklist

### Test Mode Testing
- [ ] Test checkout flow with test card: `4242 4242 4242 4242`
- [ ] Test subscription creation
- [ ] Test webhook events (use Stripe CLI)
- [ ] Test subscription cancellation
- [ ] Test payment failure handling
- [ ] Test access control (free vs premium)

### Stripe CLI Testing
- [ ] Install Stripe CLI
- [ ] Login: `stripe login`
- [ ] Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Trigger test events:
  - `stripe trigger checkout.session.completed`
  - `stripe trigger customer.subscription.created`
  - `stripe trigger invoice.payment_failed`

### User Flow Testing
- [ ] Free user completes Level 10
- [ ] Upgrade prompt appears
- [ ] Checkout session created
- [ ] Payment completed
- [ ] Webhook received and processed
- [ ] User upgraded to premium
- [ ] Level 11 unlocked
- [ ] Premium user can access Level 11-40

---

## Production Checklist

### Before Going Live
- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment (small amount)
- [ ] Verify webhook signature validation
- [ ] Set up monitoring/alerts
- [ ] Configure email notifications
- [ ] Test customer portal access
- [ ] Review security settings

### Security
- [ ] Webhook signature validation implemented
- [ ] API keys stored in environment variables
- [ ] HTTPS enabled for all payment pages
- [ ] No sensitive data in client-side code
- [ ] Rate limiting on payment endpoints

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Monitor webhook delivery
- [ ] Track conversion rates
- [ ] Monitor failed payments
- [ ] Set up alerts for payment issues

---

## Environment Variables

```bash
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Price IDs
STRIPE_PRICE_MONTHLY=price_xxxxx
STRIPE_PRICE_ANNUAL=price_xxxxx
STRIPE_PRICE_LIFETIME=price_xxxxx

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SUCCESS_URL=http://localhost:3000/dashboard?upgraded=true
STRIPE_CANCEL_URL=http://localhost:3000/dashboard?upgraded=false
```

---

## Common Issues & Solutions

### Issue: Webhook not receiving events
- **Solution**: Check webhook endpoint URL, verify signature validation

### Issue: Subscription not updating
- **Solution**: Check webhook handler logic, verify database updates

### Issue: Access control not working
- **Solution**: Verify subscription status check, check JWT token

### Issue: Checkout session failing
- **Solution**: Verify API keys, check price IDs, verify redirect URLs

---

**Status**: Ready for Implementation 🚀

