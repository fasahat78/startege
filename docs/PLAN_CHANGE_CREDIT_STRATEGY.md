# Plan Change Credit Strategy

## Scenario: Monthly → Annual Plan Change (Mid-Cycle)

**Example:**
- User on Monthly plan
- Day 15 of billing cycle
- 500 credits remaining (out of 1,000)
- User switches to Annual plan

## Current Behavior (Issue)
- `allocateMonthlyCredits` is called
- This **resets** credits to 1,250 (new annual allowance)
- **User loses their 500 remaining credits** ❌

## Desired Behavior
- User keeps their 500 remaining credits
- New allowance becomes 1,250/month
- Total balance: 500 (remaining) + 1,250 (new allowance) = 1,750 credits ✅

## Implementation Options

### Option 1: Preserve Remaining Credits (Recommended)
When plan changes mid-cycle:
1. Calculate remaining credits = currentBalance
2. Update monthlyAllowance to new plan's allowance
3. Keep currentBalance unchanged (preserves remaining credits)
4. On next billing cycle reset, use new allowance

**Pros:**
- User doesn't lose credits
- Fair and transparent
- Simple to implement

**Cons:**
- User might get "bonus" credits temporarily

### Option 2: Pro-Rate Credits
Calculate pro-rated credits based on days remaining:
- Days remaining: 15 days
- Monthly credits: 1,000
- Pro-rated: (15/30) × 1,000 = 500 credits
- New allowance: 1,250
- Total: 500 (pro-rated) + 1,250 (new) = 1,750

**Pros:**
- More "fair" accounting
- Matches billing cycle

**Cons:**
- More complex
- User might not understand

### Option 3: Reset Immediately
Reset credits immediately to new plan's allowance:
- Lose 500 credits
- Get 1,250 credits immediately

**Pros:**
- Simplest
- Clean reset

**Cons:**
- User loses credits (bad UX)
- Not fair

## Recommendation: Option 1
Preserve remaining credits when plan changes. This is the most user-friendly approach.

