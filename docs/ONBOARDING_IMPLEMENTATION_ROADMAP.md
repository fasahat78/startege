# Onboarding & Startegizer Implementation Roadmap

## 📋 Overview

This roadmap outlines the step-by-step implementation of the onboarding experience and Startegizer integration.

---

## 🎯 Phase 1: Database Schema & Models (Week 1)

### Tasks
1. **Update Prisma Schema**
   - [ ] Add `PersonaType` enum
   - [ ] Add `KnowledgeLevel` enum
   - [ ] Add `OnboardingStatus` enum
   - [ ] Create `UserProfile` model
   - [ ] Create `UserInterest` model
   - [ ] Create `UserGoal` model
   - [ ] Create `OnboardingScenario` model
   - [ ] Create `OnboardingScenarioAnswer` model
   - [ ] Update `User` model with `profile` relation

2. **Run Migrations**
   - [ ] Generate Prisma migration
   - [ ] Review migration SQL
   - [ ] Apply migration to database

3. **Create Seed Scripts**
   - [ ] Create seed script for onboarding scenarios (50 questions)
   - [ ] Create seed script for interest options
   - [ ] Create seed script for goal options
   - [ ] Test seed scripts

**Deliverable**: Database schema ready, seed data populated

---

## 🎨 Phase 2: Onboarding UI Components (Week 2)

### Tasks
1. **Persona Selection Page**
   - [ ] Create `/app/onboarding/persona/page.tsx`
   - [ ] Design persona card component
   - [ ] Implement grid layout (responsive)
   - [ ] Add "Other" persona modal with text input
   - [ ] Add API route `/api/onboarding/persona` (POST)
   - [ ] Add loading states and error handling

2. **Scenario Questions Page**
   - [ ] Create `/app/onboarding/knowledge/page.tsx`
   - [ ] Design question card component
   - [ ] Implement stepper/progress indicator
   - [ ] Add option selection logic
   - [ ] Add "Skip Assessment" functionality
   - [ ] Add API route `/api/onboarding/knowledge` (POST answers)
   - [ ] Calculate knowledge level on completion

3. **Interest Selection Page**
   - [ ] Create `/app/onboarding/interests/page.tsx`
   - [ ] Design interest card component (multi-select)
   - [ ] Implement card grid layout
   - [ ] Add selection state management
   - [ ] Add API route `/api/onboarding/interests` (POST)
   - [ ] Add "Skip" functionality

4. **Goal Selection Page**
   - [ ] Create `/app/onboarding/goals/page.tsx`
   - [ ] Design goal card component (multi-select)
   - [ ] Implement card grid layout
   - [ ] Add selection state management
   - [ ] Add API route `/api/onboarding/goals` (POST)
   - [ ] Add "Skip" functionality

5. **Completion Page**
   - [ ] Create `/app/onboarding/complete/page.tsx`
   - [ ] Display profile summary
   - [ ] Show Startegizer unlock status
   - [ ] Add "Start Learning" CTA
   - [ ] Add "Edit Profile" link

**Deliverable**: Complete onboarding flow UI

---

## 📝 Phase 3: Scenario Questions Content (Week 2-3)

### Tasks
1. **Question Creation**
   - [ ] Write 5 questions for Compliance Officer
   - [ ] Write 5 questions for AI Ethics Researcher
   - [ ] Write 5 questions for Technical AI Developer
   - [ ] Write 5 questions for Legal/Regulatory Professional
   - [ ] Write 5 questions for Business Executive
   - [ ] Write 5 questions for Data Protection Officer
   - [ ] Write 5 questions for AI Governance Consultant
   - [ ] Write 5 questions for AI Product Manager
   - [ ] Write 5 questions for Student/Academic
   - [ ] Write 5 generic questions for "Other" persona

2. **Content Review**
   - [ ] Review all questions for accuracy
   - [ ] Ensure questions differentiate knowledge levels
   - [ ] Verify explanations are educational
   - [ ] Check for clarity and ambiguity

3. **Database Seeding**
   - [ ] Format questions for database insertion
   - [ ] Create seed script with all 50 questions
   - [ ] Test seed script
   - [ ] Verify questions load correctly

**Deliverable**: 50 scenario questions ready in database

---

## 🔄 Phase 4: Onboarding Flow Logic (Week 3)

### Tasks
1. **Onboarding State Management**
   - [ ] Create onboarding status check middleware
   - [ ] Implement redirect logic for incomplete onboarding
   - [ ] Add "Resume Onboarding" functionality
   - [ ] Handle skip scenarios

2. **Profile Completion Logic**
   - [ ] Calculate knowledge level from answers
   - [ ] Update onboarding status after each step
   - [ ] Mark profile as complete when all steps done
   - [ ] Handle partial completion scenarios

3. **Integration Points**
   - [ ] Update signup flow to redirect to onboarding
   - [ ] Update dashboard to check onboarding status
   - [ ] Add onboarding completion check to Startegizer access
   - [ ] Add profile completion reminders

**Deliverable**: Complete onboarding flow with state management

---

## 🎯 Phase 5: Profile-Based Personalization (Week 4)

### Tasks
1. **Dashboard Customization**
   - [ ] Use persona to customize dashboard recommendations
   - [ ] Use knowledge level to suggest appropriate levels
   - [ ] Use interests to highlight relevant concepts
   - [ ] Use goals to show relevant learning paths

2. **Learning Path Recommendations**
   - [ ] Create recommendation algorithm based on profile
   - [ ] Suggest next concepts based on interests
   - [ ] Suggest levels based on knowledge level
   - [ ] Show goal-aligned content

3. **Profile Display**
   - [ ] Add profile section to dashboard
   - [ ] Show persona, knowledge level, interests, goals
   - [ ] Add "Edit Profile" functionality
   - [ ] Show profile completion percentage

**Deliverable**: Personalized dashboard and recommendations

---

## 🤖 Phase 6: Startegizer Integration (Week 5-6)

### Tasks
1. **Prompt Library Structure**
   - [ ] Design prompt library database schema
   - [ ] Create prompt categories by persona
   - [ ] Create prompt categories by knowledge level
   - [ ] Create prompt categories by interest
   - [ ] Create prompt categories by goal

2. **Prompt Filtering Logic**
   - [ ] Implement persona-based filtering
   - [ ] Implement knowledge-level-based filtering
   - [ ] Implement interest-based filtering
   - [ ] Implement goal-based filtering
   - [ ] Combine filters for personalized experience

3. **Startegizer UI**
   - [ ] Create Startegizer chat interface
   - [ ] Add prompt library browser
   - [ ] Show filtered prompts based on profile
   - [ ] Add premium gating
   - [ ] Show profile completion requirement

4. **Premium Integration**
   - [ ] Add premium check for Startegizer access
   - [ ] Show upgrade prompt if not premium
   - [ ] Show profile completion prompt if incomplete
   - [ ] Enable full experience for premium + complete profile

**Deliverable**: Startegizer with personalized prompt library

---

## 🧪 Phase 7: Testing & Refinement (Week 7)

### Tasks
1. **Testing**
   - [ ] Test onboarding flow end-to-end
   - [ ] Test all persona selections
   - [ ] Test scenario questions and scoring
   - [ ] Test interest/goal selection
   - [ ] Test profile completion logic
   - [ ] Test Startegizer filtering
   - [ ] Test premium gating

2. **User Testing**
   - [ ] Conduct user testing with target personas
   - [ ] Gather feedback on onboarding experience
   - [ ] Gather feedback on question clarity
   - [ ] Gather feedback on Startegizer experience

3. **Refinement**
   - [ ] Refine questions based on feedback
   - [ ] Improve UI/UX based on testing
   - [ ] Optimize recommendation algorithm
   - [ ] Improve Startegizer prompts

**Deliverable**: Tested and refined onboarding + Startegizer

---

## 📊 Success Metrics

### Onboarding Metrics
- **Completion Rate**: Target 70%+ users complete full profile
- **Time to Complete**: Target < 10 minutes
- **Skip Rate**: Monitor skip rates for each step
- **Knowledge Assessment Accuracy**: Validate against actual performance

### Startegizer Metrics
- **Access Rate**: % of premium users accessing Startegizer
- **Engagement**: Prompts used per user
- **Profile Impact**: Usage difference between complete/incomplete profiles
- **Satisfaction**: User feedback on personalization

---

## 🚀 Quick Start Checklist

### For Developers
- [ ] Review `ONBOARDING_STRATEGY.md`
- [ ] Review `ONBOARDING_QUESTIONS_FORMAT.md`
- [ ] Set up development environment
- [ ] Start with Phase 1 (Database Schema)

### For Content Creators
- [ ] Review persona definitions
- [ ] Review question format examples
- [ ] Begin writing scenario questions
- [ ] Review questions with subject matter experts

### For Designers
- [ ] Review UI/UX requirements
- [ ] Design persona cards
- [ ] Design scenario question interface
- [ ] Design interest/goal selection cards
- [ ] Design completion page

---

## 📝 Next Steps

1. **Immediate**: Review and approve strategy documents
2. **Week 1**: Begin Phase 1 (Database Schema)
3. **Week 2**: Begin Phase 2 (UI Components) + Phase 3 (Questions)
4. **Week 3**: Complete onboarding flow
5. **Week 4**: Add personalization
6. **Week 5-6**: Integrate Startegizer
7. **Week 7**: Testing and refinement

---

## 🔗 Related Documents

- `ONBOARDING_STRATEGY.md` - Complete strategy and design
- `ONBOARDING_QUESTIONS_FORMAT.md` - Question format and examples
- `AI_GOVERNANCE_ASSISTANT_STRATEGY.md` - Startegizer strategy (update name)

