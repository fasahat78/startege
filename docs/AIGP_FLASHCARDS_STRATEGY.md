# AIGP Flashcards Implementation Strategy

## Overview
Implement an interactive flashcard study system on the AIGP exams page to help users prepare for AIGP certification exams.

## Data Structure Analysis

### Flashcard Schema (from batch files)
```typescript
interface Flashcard {
  id: string;                    // e.g., "fc_a1_accountability_missing_owner_v1"
  status: "ACTIVE";
  cardType: "TRIGGER" | "DIFFERENTIATION" | "PROCESS" | "DEFINITION";
  domain: "A" | "B" | "C" | "D" | "E" | "F";
  subDomain: string;              // e.g., "A1", "B2", "F5"
  topics: string[];               // e.g., ["Accountability", "Governance"]
  priority: "HIGH" | "MEDIUM" | "LOW";
  front: {
    prompt: string;               // Question/scenario
  };
  back: {
    answer: string;                // Main answer
    examCue: string;               // Exam tip
    commonTrap: string;            // Common mistake to avoid
  };
  source: {
    framework: string;             // GDPR, EU_AI_ACT, NIST_AI_RMF, etc.
    pointer: string;
  };
}
```

### Coverage
- **Total Cards**: 132 cards (11 batches × 12 cards)
- **Distribution**: 
  - TRIGGER: 60 cards
  - DIFFERENTIATION: 36 cards
  - PROCESS: 24 cards
  - DEFINITION: 12 cards
- **Domains**: A-F (Governance Foundations through Users & Transparency)
- **Sub-domains**: A1-A5, B1-B5, C1-C5, D1-D5, E1-E5, F1-F5

## Implementation Strategy

### Option 1: Tabbed Interface (RECOMMENDED) ⭐
**Add flashcards as a second tab on `/aigp-exams` page**

**Pros:**
- Clear separation between exams and study materials
- Easy to navigate between taking exams and studying
- Can study flashcards before/after exams
- Maintains focus on exam prep

**Cons:**
- Requires tab navigation component

**UX Flow:**
```
/aigp-exams
├── [Exams Tab] - Current exam list view
└── [Flashcards Tab] - New flashcard study interface
```

### Option 2: Integrated Study Mode
**Add "Study Flashcards" button on exam cards**

**Pros:**
- Contextual - study relevant flashcards for specific exam
- Less navigation overhead

**Cons:**
- Less discoverable
- Harder to study all flashcards independently

### Option 3: Standalone Page
**Create `/aigp-exams/flashcards` route**

**Pros:**
- Most flexible
- Can be deep-linked
- Clean separation

**Cons:**
- Feels disconnected from exam flow
- More routes to maintain

## Recommended Approach: Hybrid (Option 1 + Features)

### Implementation Plan

#### 1. UI Structure
```
/aigp-exams
├── Header with tabs: [Exams] [Flashcards]
├── Exams Tab (current view)
└── Flashcards Tab (new)
    ├── Filter Bar (Domain, Card Type, Priority)
    ├── Study Mode Toggle (Shuffle, Study All, Study Weak)
    └── Flashcard Deck Component
```

#### 2. Flashcard Component Features

**Core Features:**
- ✅ **Flip Animation**: Smooth card flip on click/tap
- ✅ **Progress Tracking**: Track which cards user has seen/mastered
- ✅ **Navigation**: Previous/Next buttons + keyboard shortcuts (← →)
- ✅ **Card Counter**: "Card 5 of 132"
- ✅ **Study Modes**:
  - Study All (default)
  - Study by Domain
  - Study by Card Type
  - Study Weak Cards (cards marked as difficult)
- ✅ **Marking System**: 
  - "Got it" / "Need review" / "Mastered"
  - Persist to database for progress tracking

**Enhanced Features:**
- ✅ **Shuffle**: Randomize card order
- ✅ **Filter**: By domain (A-F), card type, priority
- ✅ **Search**: Search by prompt text
- ✅ **Statistics**: Show progress (X/Y cards mastered)
- ✅ **Keyboard Shortcuts**:
  - Space/Enter: Flip card
  - Arrow Left: Previous card
  - Arrow Right: Next card
  - 1-3: Mark as "Got it" / "Need review" / "Mastered"

#### 3. Database Schema

**New Table: `AIGPFlashcardProgress`**
```prisma
model AIGPFlashcardProgress {
  id            String   @id @default(cuid())
  userId        String
  flashcardId   String   // From JSON file
  status        String   @default("NOT_STARTED") // NOT_STARTED, REVIEWING, MASTERED
  timesViewed   Int      @default(0)
  timesCorrect  Int      @default(0)
  lastViewedAt  DateTime?
  masteredAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, flashcardId])
  @@index([userId])
  @@index([flashcardId])
}
```

#### 4. Data Loading Strategy

**Option A: Load all flashcards at once** (Recommended for 132 cards)
- Load all JSON files on page load
- Filter/search client-side
- Fast navigation, simple state management

**Option B: Lazy load batches**
- Load batches as needed
- More complex state management
- Better for very large decks (not needed here)

**Recommendation**: Option A - 132 cards is manageable to load at once.

#### 5. Component Architecture

```
components/aigp-exams/
├── AIGPExamsClient.tsx (existing - add tabs)
├── FlashcardsTab.tsx (new)
│   ├── FlashcardFilters.tsx
│   ├── FlashcardDeck.tsx
│   │   ├── Flashcard.tsx (flip animation)
│   │   └── FlashcardControls.tsx (prev/next/mark)
│   └── FlashcardStats.tsx
└── ...
```

#### 6. API Routes

**New Routes:**
- `GET /api/aigp-exams/flashcards` - Get all flashcards (load JSON files)
- `GET /api/aigp-exams/flashcards/progress` - Get user's flashcard progress
- `POST /api/aigp-exams/flashcards/progress` - Update flashcard progress
- `GET /api/aigp-exams/flashcards/stats` - Get study statistics

#### 7. Visual Design

**Card Design:**
- **Front**: Clean prompt/question with card type badge
- **Back**: Answer + exam cue + common trap (clearly separated)
- **Flip Animation**: 3D flip effect (CSS transform)
- **Color Coding**: 
  - TRIGGER: Blue
  - DIFFERENTIATION: Purple
  - PROCESS: Green
  - DEFINITION: Orange

**Layout:**
- Centered card (max-width: 600px)
- Large, readable text
- Clear visual hierarchy
- Mobile-responsive

## Technical Implementation Details

### 1. JSON Data Loading
```typescript
// Load all batch files
const batches = ['batch01', 'batch02', ..., 'batch11'];
const allCards = batches.flatMap(batch => batch.cards);
```

### 2. State Management
- Use React state for current card index
- Use React state for filtered cards
- Persist progress to database on mark/update

### 3. Flip Animation
```css
.flashcard {
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}
```

### 4. Progress Tracking
- Store in `AIGPFlashcardProgress` table
- Update on card mark/status change
- Show progress indicator in UI

## User Experience Flow

1. **User navigates to `/aigp-exams`**
2. **Clicks "Flashcards" tab**
3. **Sees flashcard deck with filters**
4. **Clicks card to flip** (or uses keyboard)
5. **Reviews answer, exam cue, common trap**
6. **Marks card** (Got it / Need review / Mastered)
7. **Navigates to next card** (arrow keys or buttons)
8. **Can filter by domain/type** to focus study
9. **Can shuffle** for random order
10. **Progress tracked** and shown in stats

## Success Metrics

- Users can study all 132 flashcards
- Progress is tracked and persisted
- Smooth flip animations
- Fast navigation (keyboard + buttons)
- Mobile-friendly experience
- Filtering works intuitively

## Future Enhancements (Post-MVP)

- Spaced repetition algorithm
- Daily study reminders
- Flashcard sets tied to specific exams
- Export flashcards to PDF
- Share flashcard sets
- Community-created flashcards

## Questions to Confirm

1. ✅ **Tabbed interface** vs standalone page?
2. ✅ **Progress tracking** - should it sync across devices?
3. ✅ **Study modes** - which ones are most important?
4. ✅ **Mobile experience** - swipe gestures for navigation?
5. ✅ **Integration** - should flashcards link to exam questions?

## Recommendation Summary

**Implement Option 1 (Tabbed Interface)** with:
- Flashcards as second tab on `/aigp-exams`
- Full deck of 132 cards
- Filter by domain, card type, priority
- Progress tracking (mark cards as mastered)
- Smooth flip animations
- Keyboard navigation
- Mobile-responsive design

This provides the best balance of discoverability, usability, and integration with the exam prep flow.

