# Dashboard Feature Blocks - Free vs Premium

## 🎯 Overview

After onboarding (or skipping), users land on the dashboard which displays feature blocks clearly indicating free vs premium features.

---

## 📋 Feature Blocks

### 🆓 Free Features

#### 1. **Concept Cards** (Free)
- **Status**: ✅ Free
- **Description**: Browse and learn from 360 AI governance concept cards
- **Access**: Full access to all concept cards
- **Features**:
  - View concepts by domain/category
  - Read definitions and scenarios
  - Track progress
  - Mark concepts as completed

#### 2. **Basic Dashboard** (Free)
- **Status**: ✅ Free
- **Description**: View your learning progress and stats
- **Access**: Basic dashboard view
- **Features**:
  - Overall progress bar
  - Basic stats (points, streak)
  - Level pathway (view only)
  - Recent achievements

---

### 💎 Premium Features

#### 3. **Level Exams** (Premium)
- **Status**: 🔒 Premium
- **Description**: Take level exams (Levels 1-40)
- **Access**: Requires premium subscription
- **Features**:
  - All 40 level exams
  - Boss level exams (10, 20, 30, 40)
  - Exam results and analytics
  - Retake exams

#### 4. **Category Exams** (Premium)
- **Status**: 🔒 Premium
- **Description**: Take category-specific exams
- **Access**: Requires premium subscription
- **Features**:
  - Domain-specific exams
  - Category mastery exams
  - Detailed results

#### 5. **Startegizer** (Premium)
- **Status**: 🔒 Premium
- **Description**: AI Governance Expert Assistant
- **Access**: Requires premium subscription + complete profile
- **Features**:
  - Scenario-based AI guidance
  - Personalized prompt library
  - Expert analysis and recommendations
  - Context-aware responses

#### 6. **Profile & Personalization** (Premium)
- **Status**: 🔒 Premium
- **Description**: Complete your profile for personalized experience
- **Access**: Free to complete, but unlocks premium features
- **Features**:
  - Persona selection
  - Knowledge assessment
  - Interest/goal selection
  - Personalized learning paths
  - Startegizer personalization

#### 7. **Advanced Analytics** (Premium)
- **Status**: 🔒 Premium
- **Description**: Detailed learning analytics and insights
- **Access**: Requires premium subscription
- **Features**:
  - Detailed progress tracking
  - Performance analytics
  - Learning path recommendations
  - Weakness identification

#### 8. **Badges & Achievements** (Premium)
- **Status**: 🔒 Premium
- **Description**: Earn badges and achievements
- **Access**: Requires premium subscription
- **Features**:
  - Badge collection
  - Achievement tracking
  - Leaderboard (if implemented)
  - Social sharing

---

## 🎨 Dashboard Layout Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard Header                                         │
│ Welcome, [Name] | Points: X | Streak: Y days            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Overall Progress Bar (Free)                             │
│ [████████░░░░░░░░░░] 40% Complete                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Feature Blocks Grid                                      │
│                                                          │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ │ Concept Cards│  │  Level Exams  │  │ Startegizer  │  │
│ │   ✅ FREE    │  │   🔒 PREMIUM  │  │  🔒 PREMIUM   │  │
│ │              │  │               │  │               │  │
│ │ [View All]   │  │ [Upgrade]     │  │ [Upgrade]     │  │
│ └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ │   Profile    │  │   Category   │  │   Analytics   │  │
│ │ 🔒 PREMIUM   │  │   Exams       │  │  🔒 PREMIUM   │  │
│ │              │  │  🔒 PREMIUM   │  │               │  │
│ │ [Complete]   │  │ [Upgrade]     │  │ [Upgrade]     │  │
│ └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Levels Pathway (Free View)                              │
│ [Visual level progression - view only]                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Feature Block States

### Free Feature Block
```
┌─────────────────────────┐
│ Concept Cards           │
│ ✅ FREE                 │
│                         │
│ Browse 360 AI           │
│ governance concepts     │
│                         │
│ [View All Concepts] →   │
└─────────────────────────┘
```

### Premium Feature Block (Not Subscribed)
```
┌─────────────────────────┐
│ Level Exams             │
│ 🔒 PREMIUM              │
│                         │
│ Take level exams        │
│ (Levels 1-40)           │
│                         │
│ [Upgrade to Premium] →  │
└─────────────────────────┘
```

### Premium Feature Block (Subscribed, Profile Incomplete)
```
┌─────────────────────────┐
│ Startegizer             │
│ 🔒 PREMIUM              │
│ ⚠️ Profile Incomplete   │
│                         │
│ Complete your profile   │
│ to unlock               │
│ personalized prompts    │
│                         │
│ [Complete Profile] →    │
└─────────────────────────┘
```

### Premium Feature Block (Subscribed, Profile Complete)
```
┌─────────────────────────┐
│ Startegizer             │
│ ✅ PREMIUM              │
│ ✅ Profile Complete     │
│                         │
│ AI Governance Expert    │
│ Assistant ready         │
│                         │
│ [Open Startegizer] →    │
└─────────────────────────┘
```

### Profile Block (Incomplete)
```
┌─────────────────────────┐
│ Complete Your Profile   │
│ 🔒 PREMIUM              │
│                         │
│ Unlock personalized     │
│ learning experience     │
│                         │
│ [Start Onboarding] →    │
└─────────────────────────┘
```

---

## 🔄 Skip Behavior Flow

### User Skips Onboarding

1. **User clicks "Skip"** on any onboarding step
2. **Redirected to Dashboard**
3. **Dashboard shows**:
   - Free features: Concept Cards (accessible)
   - Premium features: All other features (locked)
   - Profile block: Shows "Complete Your Profile" CTA
4. **User can**:
   - Access Concept Cards immediately
   - See all premium features (locked)
   - Click "Complete Profile" anytime to resume onboarding
   - Upgrade to premium (but Startegizer still requires profile)

### User Completes Onboarding Later

1. **User clicks "Complete Profile"** from dashboard
2. **Resume onboarding** from where they left off
3. **After completion**:
   - Profile block updates to "Profile Complete"
   - Startegizer unlocks (if premium)
   - Personalized recommendations appear

---

## 💳 Premium Upgrade Flow

### Upgrade CTA Behavior

1. **User clicks "Upgrade to Premium"** on any premium feature block
2. **Redirected to**:
   - `/pricing` page (if exists)
   - Or Stripe checkout directly
3. **After payment**:
   - User tier updated to "premium"
   - Dashboard refreshes
   - Premium features unlock
   - Startegizer still requires profile completion

---

## 📊 Implementation Notes

### Database Checks

For each feature block, check:
- `user.subscriptionTier === "premium"` (for premium features)
- `user.profile.onboardingStatus === "COMPLETED"` (for Startegizer)
- `user.profile.personaType !== null` (for personalization)

### Component Structure

```typescript
// FeatureBlock component
interface FeatureBlockProps {
  title: string;
  description: string;
  isFree: boolean;
  isPremium: boolean;
  isUnlocked: boolean;
  requiresProfile: boolean;
  profileComplete: boolean;
  ctaText: string;
  ctaAction: () => void;
}
```

### Routing

- `/dashboard` - Main dashboard (shows feature blocks)
- `/onboarding/*` - Onboarding flow (can resume)
- `/pricing` - Premium upgrade page
- `/startegizer` - Startegizer interface (premium + profile gate)

---

## 🎯 Next Steps

1. Design feature block components
2. Implement premium/subscription checks
3. Add upgrade CTAs
4. Implement profile completion reminders
5. Add Stripe integration for premium subscriptions

