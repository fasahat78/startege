# Testing Admin Features

Now that all the admin features are set up, here's how to test everything:

## 1. Access Admin Dashboard

1. **Log in** with `fasahat@gmail.com`
2. **Navigate to** `/admin` 
3. You should see the admin dashboard with:
   - Quick stats (Total Users, Premium Users, Early Adopters, etc.)
   - Navigation menu (Overview, Users, Discount Codes, Analytics, Early Adopters, Feedback)

## 2. Test Discount Codes

### Create a Discount Code:
1. Go to `/admin/discount-codes`
2. Click "Create Discount Code"
3. Fill in:
   - Code: `TEST50`
   - Type: Percentage
   - Value: `50`
   - Max Uses: `10`
   - Applicable To: Both (monthly and annual)
   - Early Adopter Tier: (optional)
4. Click "Create"
5. Verify it appears in the list

### Test Discount Code Validation:
1. Go to `/pricing`
2. Enter discount code `TEST50` (or one of the sample codes)
3. Click "Apply"
4. Should show "Discount applied! Save 50%"

### Test in Stripe Checkout:
1. On pricing page, enter a valid discount code
2. Click "Upgrade to Premium"
3. The discount should be applied in Stripe checkout

## 3. Test User Management

1. Go to `/admin/users`
2. You should see a list of all users
3. Test search/filter:
   - Search by email
   - Filter by tier (free/premium)
   - Filter by early adopter status
4. Click on a user to view details
5. Try editing a user:
   - Change role
   - Mark as early adopter
   - Assign early adopter tier

## 4. Test Analytics

1. Go to `/admin/analytics`
2. You should see:
   - Overview stats (Total Users, Premium Users, Revenue, etc.)
   - Early Adopter Breakdown
   - Discount Code Performance
   - Subscription Stats
3. Try changing the time period (7, 30, 90, 365 days)

## 5. Test Early Adopter Management

1. Go to `/admin/early-adopters`
2. You should see:
   - Tier summary (Founding Members, Early Adopters, Launch Users)
   - List of early adopters
3. Try assigning tiers to users who don't have one

## 6. Create Sample Discount Codes

Run the sample discount codes script to create test codes:

```sql
-- Copy and run scripts/create-sample-discount-codes.sql in Cloud SQL Studio
```

This creates:
- `FOUNDING100` - 50% off forever (Founding Member tier)
- `EARLYBIRD40` - 40% off first year (Early Adopter tier)
- `LAUNCH20` - 20% off first year (Launch User tier)

## 7. Test Referral System

1. Check your dashboard - you should see your referral code displayed
2. Copy your referral link
3. Test signing up with a referral code in the URL: `/auth/signup-firebase?ref=YOURCODE`
4. Check `/admin/users` to see if the referral was tracked

## Troubleshooting

### If admin dashboard shows "Unauthorized":
- Verify your user has `isAdmin = true` and `role = 'ADMIN'`
- Check browser console for errors
- Make sure you're logged in with `fasahat@gmail.com`

### If discount codes don't work:
- Verify `DiscountCode` table exists and has data
- Check API logs at `/api/discount-codes/validate`
- Verify Stripe integration is working

### If tables don't appear:
- Run `npx prisma generate` to regenerate Prisma client
- Restart your development server
- Check database connection

## Next Steps

1. ✅ Create your first discount codes
2. ✅ Assign early adopter tiers to existing users
3. ✅ Set up referral program
4. ✅ Monitor analytics dashboard
5. ✅ Collect user feedback

