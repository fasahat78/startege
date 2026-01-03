# Startegizer Pricing Strategy

## Strategic Value Assessment

### Current Pricing: 10 Credits per API Call

Startegizer is positioned as a **premium AI tutor** providing personalized, context-aware explanations for AI Governance learning. The 10-credit cost reflects its strategic value and premium positioning.

## Why 10 Credits Makes Strategic Sense

### 1. **Premium Positioning**
- Startegizer is a core differentiator for the premium tier
- Higher cost = higher perceived value
- Positions the feature as a premium service, not a commodity

### 2. **Educational Value**
- Provides personalized, context-aware explanations
- Understands user's persona, knowledge level, and learning goals
- Offers detailed explanations with real-world examples
- Supports follow-up questions for deeper understanding
- More valuable than a simple API call - it's a tutoring session

### 3. **Usage Economics**
- **Base Plan**: 1,000 credits/month = 100 Startegizer sessions/month
- **Additional Top-ups**: $5 = 250 credits = 25 sessions
- Still provides generous usage while encouraging thoughtful engagement
- Prevents spam/abuse while maintaining accessibility

### 4. **Cost Structure Alignment**
- 50% profit margin rule: If $10 is paid, user gets $5 worth of API usage
- 10 credits per call aligns with this model
- Base monthly allowance (1,000 credits) = $10 value = $5 API usage
- Matches the strategic pricing framework

### 5. **User Behavior**
- Encourages thoughtful usage vs. rapid-fire queries
- Users will value each interaction more
- Higher engagement quality = better learning outcomes
- Reduces unnecessary API calls

### 6. **Competitive Positioning**
- Premium AI tutoring typically costs $20-50/hour
- 100 sessions/month for $10/month = exceptional value
- Even at 10 credits, it's significantly cheaper than human tutors
- Positions Startege as a high-value learning platform

## Comparison: 5 vs 10 Credits

| Metric | 5 Credits | 10 Credits |
|--------|-----------|------------|
| Base Monthly Sessions | 200 | 100 |
| $5 Top-up Sessions | 50 | 25 |
| Perceived Value | Standard | Premium |
| Usage Quality | Lower (spam risk) | Higher (thoughtful) |
| Positioning | Commodity | Premium Service |
| Learning Outcomes | Potentially diluted | Focused & effective |

## Recommendation: **10 Credits**

The 10-credit model:
- ✅ Better aligns with premium positioning
- ✅ Encourages quality over quantity
- ✅ Still provides excellent value (100 sessions/month)
- ✅ Matches strategic pricing framework
- ✅ Reflects the true value of personalized AI tutoring

## Implementation

- **Chat API**: `/api/startegizer/chat` - 10 credits per call
- **Exam Explanations**: `/api/aigp-exams/attempts/[attemptId]/explain` - 10 credits per call
- **UI Display**: Shows "10 credits" in all user-facing components
- **Documentation**: Updated to reflect new pricing model

## Future Considerations

- Monitor usage patterns and user feedback
- Consider tiered pricing for different use cases (if needed)
- Potential for bulk session packages (e.g., 500 credits for 50 sessions)
- A/B testing could validate optimal pricing point

