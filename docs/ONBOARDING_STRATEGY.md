# Startege Onboarding Strategy & Startegizer Integration

## 🎯 Overview

A streamlined onboarding experience that captures user persona, interests, goals, and knowledge level through an engaging, card-based interface. This profile powers personalized learning paths and unlocks the premium Startegizer AI assistant.

---

## 👥 10 Personas

### 1. **Compliance Officer**
- **Focus**: Regulatory compliance, risk management, audit readiness
- **Goals**: Ensure organizational compliance, manage regulatory risk
- **Knowledge Areas**: GDPR, AI Act, compliance frameworks, risk assessment

### 2. **AI Ethics Researcher**
- **Focus**: Ethical AI principles, fairness, bias mitigation, societal impact
- **Goals**: Research and develop ethical AI frameworks, publish findings
- **Knowledge Areas**: Ethical frameworks, bias detection, fairness metrics, social implications

### 3. **Technical AI Developer**
- **Focus**: Building AI systems, technical implementation, model governance
- **Goals**: Develop compliant AI systems, implement governance in code
- **Knowledge Areas**: Technical governance, model documentation, MLOps, technical standards

### 4. **Legal/Regulatory Professional**
- **Focus**: Legal interpretation, regulatory analysis, policy development
- **Goals**: Navigate legal requirements, advise on regulatory compliance
- **Knowledge Areas**: AI Act, GDPR, legal precedents, regulatory frameworks

### 5. **Business Executive**
- **Focus**: Strategic AI governance, business alignment, ROI, risk management
- **Goals**: Make informed decisions, balance innovation with governance
- **Knowledge Areas**: Strategic governance, business risk, executive decision-making

### 6. **Data Protection Officer (DPO)**
- **Focus**: Data privacy, GDPR compliance, privacy impact assessments
- **Goals**: Protect personal data, ensure privacy compliance
- **Knowledge Areas**: GDPR, data protection, privacy frameworks, DPIA

### 7. **AI Governance Consultant**
- **Focus**: Advising organizations, implementing governance programs
- **Goals**: Help clients build effective AI governance, provide expert guidance
- **Knowledge Areas**: Comprehensive governance frameworks, best practices, implementation

### 8. **AI Product Manager**
- **Focus**: Product governance, user impact, product compliance
- **Goals**: Build compliant AI products, balance user needs with governance
- **Knowledge Areas**: Product governance, user rights, product compliance, UX considerations

### 9. **Student/Academic**
- **Focus**: Learning AI governance, academic research, theoretical understanding
- **Goals**: Gain knowledge, prepare for career, conduct research
- **Knowledge Areas**: Foundational concepts, academic frameworks, research methods

### 10. **Other** (User-Defined)
- **Focus**: Custom role description
- **Goals**: User-specified
- **Knowledge Areas**: User-specified

---

## 📋 Onboarding Flow

### Step 1: Persona Selection (Required)
- **UI**: 10 persona cards displayed in a grid
- **Action**: User selects one persona card
- **If "Other"**: Show text input for custom role description
- **Skip**: Not allowed (required for account setup)

### Step 2: Scenario-Based Knowledge Assessment (Optional but Recommended)
- **UI**: 3-5 scenario-based multiple-choice questions
- **Questions**: Tailored to selected persona
- **Purpose**: Assess knowledge level (beginner, intermediate, advanced)
- **Skip**: Allowed, but user warned that Startegizer won't be personalized
- **Scoring**: Right/wrong answers determine knowledge level

### Step 3: Interest Selection (Optional but Recommended)
- **UI**: Card-based selection (can select multiple)
- **Options**: See `INTERESTS_AND_GOALS.md` for complete list
- **Skip**: Allowed, but user warned that Startegizer won't be personalized

### Step 4: Goal Selection (Optional but Recommended)
- **UI**: Card-based selection (single or multiple)
- **Options**: See `INTERESTS_AND_GOALS.md` for complete list
- **Skip**: Allowed, but user warned that Startegizer won't be personalized

### Step 5: Completion & Dashboard Redirect
- **Summary**: Show completed profile
- **Redirect**: User lands on dashboard
- **Dashboard Behavior**: 
  - Free features: Concept Cards (accessible)
  - Premium features: All other features (locked, requires subscription)
  - Profile block: Shows completion status
  - Startegizer: Unlocked if premium + profile complete

### Skip Behavior
- **When user skips**: Redirected to dashboard immediately
- **Dashboard shows**: 
  - Free features accessible (Concept Cards)
  - Premium features locked (Level Exams, Startegizer, etc.)
  - Profile block with "Complete Profile" CTA
- **User can**: Resume onboarding anytime via "Complete Profile" button
- **Note**: Startegizer requires premium subscription + complete profile

---

## 🎯 Scenario Question Design

### Question Structure
Each question follows this format:
```
**Scenario**: [Real-world AI governance situation]
**Question**: [What should happen? / What's the best approach?]
**Options**: 
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]
```

### Knowledge Level Assessment
- **Beginner**: 0-1 correct answers
- **Intermediate**: 2-3 correct answers
- **Advanced**: 4-5 correct answers

### Question Sets by Persona

#### Compliance Officer (5 questions)
1. **GDPR Compliance**: AI system processing personal data without proper consent
2. **Risk Assessment**: High-risk AI system classification under AI Act
3. **Audit Readiness**: Documentation requirements for compliance audit
4. **Cross-Border**: Data transfer compliance for multinational AI deployment
5. **Incident Response**: Handling AI system failure during regulatory inspection

#### AI Ethics Researcher (5 questions)
1. **Bias Detection**: Identifying algorithmic bias in hiring AI
2. **Fairness Metrics**: Choosing appropriate fairness metrics for healthcare AI
3. **Ethical Frameworks**: Applying ethical principles to autonomous systems
4. **Societal Impact**: Assessing long-term societal implications of AI deployment
5. **Research Ethics**: Ethical considerations in AI research studies

#### Technical AI Developer (5 questions)
1. **Model Documentation**: Required documentation for AI model deployment
2. **Technical Standards**: Implementing ISO/IEC standards in AI development
3. **MLOps Governance**: Governance requirements in ML pipeline
4. **Model Monitoring**: Continuous monitoring requirements for production AI
5. **Technical Compliance**: Technical measures for GDPR compliance in AI systems

#### Legal/Regulatory Professional (5 questions)
1. **AI Act Interpretation**: Classifying AI system under AI Act risk categories
2. **GDPR Application**: Applying GDPR to AI processing activities
3. **Regulatory Gaps**: Navigating gaps in existing regulations
4. **Legal Precedents**: Applying case law to AI governance scenarios
5. **Policy Development**: Drafting AI governance policies for organization

#### Business Executive (5 questions)
1. **Strategic Risk**: Balancing innovation with governance risk
2. **ROI of Governance**: Justifying governance investment to stakeholders
3. **Business Alignment**: Aligning AI governance with business objectives
4. **Executive Decision**: Making governance decisions under uncertainty
5. **Organizational Change**: Implementing governance culture change

#### Data Protection Officer (5 questions)
1. **DPIA Requirements**: When to conduct DPIA for AI systems
2. **Data Subject Rights**: Handling data subject requests for AI processing
3. **Privacy by Design**: Implementing privacy in AI system design
4. **Cross-Border Transfers**: Ensuring lawful data transfers for AI
5. **Breach Notification**: AI-related data breach notification requirements

#### AI Governance Consultant (5 questions)
1. **Framework Selection**: Choosing appropriate governance framework for client
2. **Implementation Strategy**: Developing governance implementation roadmap
3. **Maturity Assessment**: Assessing client's governance maturity
4. **Best Practices**: Applying industry best practices to unique situations
5. **Change Management**: Managing organizational change for governance adoption

#### AI Product Manager (5 questions)
1. **Product Compliance**: Ensuring AI product meets regulatory requirements
2. **User Rights**: Implementing user rights in AI product design
3. **Product Risk**: Assessing and mitigating product-level AI risks
4. **UX & Governance**: Balancing user experience with governance requirements
5. **Product Documentation**: Documentation requirements for AI products

#### Student/Academic (5 questions)
1. **Foundational Concepts**: Understanding core AI governance principles
2. **Framework Comparison**: Comparing different governance frameworks
3. **Research Ethics**: Ethical considerations in AI research
4. **Theoretical Application**: Applying theoretical frameworks to scenarios
5. **Academic Standards**: Academic standards for AI governance research

#### Other (Generic 5 questions)
1. **General Governance**: Basic AI governance principles
2. **Risk Awareness**: Understanding AI risks
3. **Compliance Basics**: Basic compliance requirements
4. **Ethical Considerations**: Ethical AI considerations
5. **Best Practices**: General best practices

---

## 💾 Database Schema

### New Models

```prisma
enum PersonaType {
  COMPLIANCE_OFFICER
  AI_ETHICS_RESEARCHER
  TECHNICAL_AI_DEVELOPER
  LEGAL_REGULATORY_PROFESSIONAL
  BUSINESS_EXECUTIVE
  DATA_PROTECTION_OFFICER
  AI_GOVERNANCE_CONSULTANT
  AI_PRODUCT_MANAGER
  STUDENT_ACADEMIC
  OTHER
}

enum KnowledgeLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  NOT_ASSESSED
}

enum OnboardingStatus {
  NOT_STARTED
  PERSONA_SELECTED
  KNOWLEDGE_ASSESSED
  INTERESTS_SELECTED
  GOALS_SELECTED
  COMPLETED
  SKIPPED
}

model UserProfile {
  id                String          @id @default(cuid())
  userId            String          @unique
  personaType       PersonaType?
  customPersona    String?         // If personaType is OTHER
  knowledgeLevel    KnowledgeLevel  @default(NOT_ASSESSED)
  onboardingStatus  OnboardingStatus @default(NOT_STARTED)
  completedAt       DateTime?
  
  // Relations
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  interests         UserInterest[]
  goals             UserGoal[]
  scenarioAnswers   OnboardingScenarioAnswer[]
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model UserInterest {
  id          String      @id @default(cuid())
  userId      String
  interest    String      // e.g., "Regulatory Compliance", "Ethical AI & Fairness"
  
  userProfile UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, interest])
  @@index([userId])
}

model UserGoal {
  id          String      @id @default(cuid())
  userId      String
  goal        String      // e.g., "AIGP Certification Preparation"
  
  userProfile UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, goal])
  @@index([userId])
}

model OnboardingScenario {
  id            String      @id @default(cuid())
  personaType   PersonaType
  questionOrder Int         // 1-5
  scenario      String      @db.Text
  question      String      @db.Text
  optionA       String      @db.Text
  optionB       String      @db.Text
  optionC       String      @db.Text
  optionD       String      @db.Text
  correctAnswer String      // "A", "B", "C", or "D"
  explanation   String?     @db.Text
  
  answers       OnboardingScenarioAnswer[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@unique([personaType, questionOrder])
  @@index([personaType])
}

model OnboardingScenarioAnswer {
  id              String              @id @default(cuid())
  userId          String
  scenarioId      String
  selectedAnswer  String              // "A", "B", "C", or "D"
  isCorrect       Boolean
  answeredAt      DateTime            @default(now())
  
  userProfile     UserProfile         @relation(fields: [userId], references: [id], onDelete: Cascade)
  scenario        OnboardingScenario  @relation(fields: [scenarioId], references: [id], onDelete: Cascade)
  
  @@unique([userId, scenarioId])
  @@index([userId])
}
```

### Update User Model

```prisma
model User {
  // ... existing fields ...
  profile         UserProfile?
  promptUsages    PromptUsage[] // For Startegizer
}
```

### Profile Editing Behavior
- **Users can change persona**: Yes, via profile settings
- **Changing persona**: Resets entire profile creation journey
  - Persona selection resets
  - Knowledge assessment resets
  - Interests/goals remain (user can choose to keep or reset)
- **Reason**: Different personas have different knowledge assessment questions

---

## 🎨 UI/UX Design

### Persona Selection Page
- **Layout**: 3-column grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
- **Card Design**: 
  - Persona icon/illustration
  - Persona name
  - Brief description (1-2 sentences)
  - Hover effect: Highlight border
- **"Other" Card**: Special styling, opens text input modal

### Scenario Questions Page
- **Layout**: Single question per page (stepper: 1/5, 2/5, etc.)
- **Design**:
  - Scenario box (highlighted background)
  - Question text (bold)
  - 4 option cards (clickable, show selected state)
  - "Next" button (disabled until selection)
  - "Skip Assessment" link (bottom, smaller text)
- **Progress**: Progress bar at top

### Interest Selection Page
- **Layout**: Card grid (similar to personas)
- **Design**: 
  - Multi-select checkboxes
  - Cards show selected state
  - "Select at least 1" helper text
  - "Skip" button

### Goal Selection Page
- **Layout**: Card grid (similar to interests)
- **Design**:
  - Multi-select checkboxes
  - Cards show selected state
  - "Select at least 1" helper text
  - "Skip" button

### Completion Page
- **Layout**: Summary card + Startegizer intro
- **Design**:
  - Profile summary (persona, knowledge level, interests, goals)
  - Startegizer unlock status
  - "Start Learning" CTA
  - "Edit Profile" link

---

## 🤖 Startegizer Integration

### Profile-Based Customization

Startegizer prompt library will be filtered and customized based on:

1. **Persona Type**: Persona-specific prompt categories
2. **Knowledge Level**: Adjust complexity and depth
3. **Interests**: Show relevant prompt categories
4. **Goals**: Prioritize goal-aligned prompts

### Prompt Library Structure

```
Startegizer Prompts/
├── By Persona/
│   ├── Compliance Officer/
│   ├── AI Ethics Researcher/
│   ├── Technical AI Developer/
│   └── ...
├── By Knowledge Level/
│   ├── Beginner/
│   ├── Intermediate/
│   └── Advanced/
├── By Interest/
│   ├── Regulatory Compliance/
│   ├── Ethical AI & Fairness/
│   └── ...
└── By Goal/
    ├── AIGP Certification/
    ├── Career Advancement/
    └── ...
```

### Unlock Criteria

- **Free Users**: Can see Startegizer exists but cannot access (premium gate)
- **Premium Users**: 
  - Profile incomplete: Generic prompts only
  - Profile complete: Full personalized experience

---

## 📊 Implementation Phases

### Phase 1: Database & Schema
- [ ] Add UserProfile model
- [ ] Add UserInterest model
- [ ] Add UserGoal model
- [ ] Add OnboardingScenario model
- [ ] Add OnboardingScenarioAnswer model
- [ ] Update User model
- [ ] Run migrations

### Phase 2: Onboarding UI
- [ ] Persona selection page
- [ ] Scenario questions page
- [ ] Interest selection page
- [ ] Goal selection page
- [ ] Completion page
- [ ] Onboarding flow routing

### Phase 3: Scenario Questions
- [ ] Create 5 questions per persona (50 total)
- [ ] Seed database with scenarios
- [ ] Knowledge level calculation logic

### Phase 4: Profile Integration
- [ ] Update dashboard to use profile data
- [ ] Personalized learning path recommendations
- [ ] Profile completion reminders

### Phase 5: Startegizer Integration
- [ ] Prompt library structure
- [ ] Profile-based filtering
- [ ] Premium gating
- [ ] Startegizer UI components

---

## 🎯 Success Metrics

- **Onboarding Completion Rate**: % of users completing full profile
- **Knowledge Assessment Accuracy**: Correlation with actual performance
- **Startegizer Engagement**: Usage by profile completeness
- **Personalization Effectiveness**: Learning path completion rates by persona

---

## 📝 Next Steps

1. Review and approve persona definitions
2. Review and approve scenario questions
3. Approve database schema
4. Begin Phase 1 implementation

