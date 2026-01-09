# Referral System - PARKED

## Status: Hidden/Disabled

The referral system has been parked due to logical flaws:

1. **Premium Requirement Issue**: Referral codes were visible to non-premium users, but rewards (AI credits) require premium to use
2. **Reward Confusion**: Reward structure unclear - credits vs. subscription time
3. **Complexity**: Adds unnecessary complexity to the onboarding flow

## What Was Implemented

- Database schema: `referralCode`, `referredByUserId`, `referralCount`, `totalReferralCredits`
- Referral code generation (unique codes based on user email/name)
- Referral tracking in signup flow (`?ref=CODE` URL parameter)
- Referral code display component (`components/dashboard/ReferralCode.tsx`)
- Referral code lookup and linking in `/api/auth/firebase/verify`

## Files Affected

- `app/dashboard/page.tsx` - ReferralCode component commented out
- `app/auth/signup-firebase/page.tsx` - Referral code capture (still functional but hidden)
- `app/api/auth/firebase/verify/route.ts` - Referral processing logic (still functional)
- `components/dashboard/ReferralCode.tsx` - Component still exists but not rendered
- `prisma/schema.prisma` - Schema fields still exist (no migration needed)

## To Re-enable

1. Clarify reward structure (credits vs. subscription time)
2. Add premium requirement check before showing referral codes
3. Uncomment ReferralCode component in `app/dashboard/page.tsx`
4. Test referral flow end-to-end

## Future Considerations

- Should referral rewards be:
  - AI credits (requires premium to use)?
  - Subscription time extension?
  - One-time discount codes?
- Should referral codes only be visible to premium users?
- Should referrers get rewards immediately or only when referee subscribes?

