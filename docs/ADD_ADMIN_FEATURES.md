# Adding Admin Features to Database

Now that you've made yourself an admin, let's add all the admin features (discount codes, early adopters, referrals, feedback) to the database.

## Quick Steps

1. **Go to Cloud SQL Studio**: [Open Query Editor](https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege)

2. **Run the SQL Script**: 
   - Copy the entire contents of `scripts/add-admin-features.sql`
   - Paste into the query editor
   - Click "Run"

3. **Verify**: The script will show verification queries at the end showing:
   - All 5 tables created (DiscountCode, DiscountCodeUsage, Referral, Feedback, UserEvent)
   - All 6 enums created

## What This Adds

### Tables Created:
- **DiscountCode** - Store discount codes and their settings
- **DiscountCodeUsage** - Track when discount codes are used
- **Referral** - Track referral relationships between users
- **Feedback** - User feedback for admin management
- **UserEvent** - Analytics events tracking

### Enums Created:
- **DiscountCodeType** - PERCENTAGE, FIXED_AMOUNT, FREE_TRIAL
- **DiscountCodeStatus** - ACTIVE, INACTIVE, EXPIRED, USED_UP
- **EarlyAdopterTier** - FOUNDING_MEMBER, EARLY_ADOPTER, LAUNCH_USER
- **UserRole** - USER, ADMIN, SUPER_ADMIN
- **FeedbackType** - BUG, FEATURE_REQUEST, UX_ISSUE, CONTENT_FEEDBACK, GENERAL
- **FeedbackStatus** - PENDING, REVIEWED, IN_PROGRESS, RESOLVED, REJECTED

### User Table Columns Added:
- `isEarlyAdopter` - Boolean flag
- `earlyAdopterTier` - Enum value
- `earlyAdopterStartDate` - When they became early adopter
- `earlyAdopterEndDate` - When benefits expire
- `discountCodeUsed` - Code they used to sign up
- `referralCode` - Their unique referral code
- `referredByUserId` - Who referred them
- `referralCount` - How many they've referred
- `totalReferralCredits` - Credits earned from referrals

## After Running

Once the script completes successfully:

1. ✅ You can access `/admin` dashboard
2. ✅ Create discount codes at `/admin/discount-codes`
3. ✅ View users at `/admin/users`
4. ✅ See analytics at `/admin/analytics`
5. ✅ Manage early adopters at `/admin/early-adopters`

## Troubleshooting

If you get permission errors, make sure you're running as a user with ALTER TABLE permissions. The script uses `IF NOT EXISTS` checks so it's safe to run multiple times.

