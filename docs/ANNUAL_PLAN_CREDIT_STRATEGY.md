# Annual Plan Credit Allocation Strategy

## Current Behavior

**Monthly Plan:**
- 1,000 credits/month
- Credits reset monthly

**Annual Plan:**
- 1,000 credits/month (same as monthly)
- Credits reset monthly
- **No extra credit value** - only $29 price savings

## Issues

1. **Misleading Display**: Pricing page shows "12,000 Credits/year" but users actually get 1,000/month
2. **No Extra Value**: Annual users get same credits as monthly users
3. **Downgrade Policy**: Users can downgrade from annual to monthly via Stripe Customer Portal

## Options for Annual Plan Credit Allocation

### Option 1: Keep Current (1,000/month)
**Pros:**
- Simple to implement
- Consistent monthly allocation
- Users understand monthly reset

**Cons:**
- No extra value beyond price savings
- Misleading "12,000 Credits/year" display

### Option 2: Allocate 12,000 Credits Upfront
**Pros:**
- Clear value proposition
- Users get all credits immediately
- Matches "12,000 Credits/year" display

**Cons:**
- Users might exhaust credits quickly
- No monthly reset (credits don't renew)
- Complex logic needed

### Option 3: Higher Monthly Allowance (e.g., 1,200/month)
**Pros:**
- Extra value for annual subscribers
- Still monthly reset (predictable)
- 20% bonus credits

**Cons:**
- Still doesn't match "12,000 Credits/year" display
- More complex allocation logic

### Option 4: Bonus Credits Upfront + Monthly Allocation
**Pros:**
- Best of both worlds
- Immediate value + ongoing allocation
- Example: 2,000 bonus + 1,000/month = 14,000 total/year

**Cons:**
- Most complex to implement
- Need to track bonus vs monthly credits

## Recommendation

**Option 1 (Current)** - Keep it simple:
- Change display to "1,000 Credits/month" (not "12,000 Credits/year")
- Annual value = $29 savings only
- Users understand monthly allocation

**OR**

**Option 3** - Add extra value:
- Annual users get 1,200 credits/month (20% bonus)
- Total: 14,400 credits/year vs 12,000 for monthly
- Clear value proposition

## Downgrade Policy

**Current:** Users can downgrade annual → monthly via Stripe Customer Portal

**Recommendation:** Allow downgrades but:
- Downgrade takes effect at end of annual period
- User keeps access until annual period ends
- Credits continue to reset monthly during annual period

