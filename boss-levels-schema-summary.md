# Boss Levels JSON Schema Summary

This document summarizes the JSON schemas for boss levels 10, 20, 30, and 40, highlighting their differences and requirements.

---

## Overview

Boss levels are integration and mastery exams that test end-to-end governance decision-making. Each boss level has progressively higher complexity and requirements.

| Level | Title | Questions | Time Limit | Passing Score | Tests Concepts From |
|-------|-------|-----------|------------|---------------|---------------------|
| **10** | Foundation Mastery | 12 | 25 min | 70% | Levels 1-9 |
| **20** | Intermediate Mastery | 20 | 45 min | 75% | Levels 11-19 |
| **30** | Advanced Mastery | 20 | 50 min | 80% | Levels 21-29 |
| **40** | AI Governance Master | 25 | 60 min | 85% | Levels 1-39 (ALL) |

---

## Common Requirements (All Boss Levels)

### Mandatory Requirements
1. **2-3 concepts per question** (`conceptIds` array with 2-3 IDs)
2. **2+ categories per question** (`categoryIds` array with 2+ IDs)
3. **NO recall questions** - Only "apply", "analyse", or "judgement" allowed
4. **Even answer distribution** - Correct answers distributed evenly across A, B, C, D
5. **Scenario-based questions** - All questions must simulate real governance decision-making
6. **Comprehensive explanations** - Detailed rationale following AIGP standards

### Schema Structure
All boss levels follow the same JSON structure:
```json
{
  "questions": [
    {
      "id": "Q1",
      "stem": "Scenario-based question text...",
      "options": [
        { "id": "A", "text": "..." },
        { "id": "B", "text": "..." },
        { "id": "C", "text": "..." },
        { "id": "D", "text": "..." }
      ],
      "correctOptionId": "A",
      "conceptIds": ["cmj...", "cmj..."],
      "categoryIds": ["cmj...", "cmj..."],
      "difficultyTag": "judgement",
      "rationale": {
        "correct": "...",
        "incorrect": {
          "B": "...",
          "C": "...",
          "D": "..."
        }
      }
    }
  ]
}
```

---

## Level-Specific Differences

### Level 10: Foundation Mastery

**File:** `boss-level-10-schema.json`

**Key Characteristics:**
- **Question Count:** 12 questions
- **Answer Distribution:** ~3 correct answers per option (A, B, C, D)
- **Difficulty Mix:** 
  - ~30% apply (4 questions)
  - ~40% analyse (5 questions)
  - ~30% judgement (3 questions)
- **Stem Length:** Minimum 100 characters
- **Rationale Length:** 3-5 sentences for correct answer
- **Focus:** Integration of foundational concepts (Levels 1-9)
- **Complexity:** Moderate - tests ability to apply core principles together

**Example Scenario:** Healthcare AI system requiring GDPR compliance, AI Act classification, and impact assessment integration.

---

### Level 20: Intermediate Mastery

**File:** `boss-level-20-schema.json`

**Key Characteristics:**
- **Question Count:** 20 questions
- **Answer Distribution:** ~5 correct answers per option (A, B, C, D)
- **Difficulty Mix:**
  - ~30% apply (6 questions)
  - ~40% analyse (8 questions)
  - ~30% judgement (6 questions)
- **Stem Length:** Minimum 120 characters
- **Rationale Length:** 4-6 sentences for correct answer
- **Focus:** End-to-end governance in real organizational contexts (Levels 11-19)
- **Complexity:** High - tests ability to operate AI governance end-to-end

**Example Scenario:** Multinational financial services company deploying AI across multiple jurisdictions with cross-border data transfers, AI Act compliance, bias mitigation, and enforcement readiness.

---

### Level 30: Advanced Mastery

**File:** `boss-level-30-schema.json`

**Key Characteristics:**
- **Question Count:** 20 questions
- **Answer Distribution:** ~5 correct answers per option (A, B, C, D)
- **Difficulty Mix:**
  - ~30% apply (6 questions)
  - ~40% analyse (8 questions)
  - ~30% judgement (6 questions)
- **Stem Length:** Minimum 150 characters
- **Rationale Length:** 5-7 sentences for correct answer
- **Focus:** Strategic governance when rules are incomplete (Levels 21-29)
- **Complexity:** Very High - tests ability to design and defend decisions with incomplete information

**Additional Requirements:**
- Questions must involve **incomplete information**
- Questions must involve **trade-offs**
- Questions must involve **systemic risks**
- Emphasis on **strategic thinking** and **second-order effects**

**Example Scenario:** Global technology company deploying AI across multiple jurisdictions with conflicting regulations, investor pressure, regulatory scrutiny, and ethical concerns - requiring strategic governance balancing all competing demands.

---

### Level 40: AI Governance Master

**File:** `boss-level-40-schema.json`

**Key Characteristics:**
- **Question Count:** 25 questions
- **Answer Distribution:** ~6-7 correct answers per option (A, B, C, D)
- **Difficulty Mix:**
  - ~20% apply (5 questions)
  - ~30% analyse (8 questions)
  - ~50% judgement (12 questions) - **Heavy emphasis on judgement**
- **Stem Length:** Minimum 200 characters
- **Rationale Length:** 6-8 sentences for correct answer
- **Focus:** Complete mastery integrating ALL concepts (Levels 1-39)
- **Complexity:** Ultra-High - tests ability to govern at the highest level

**Additional Requirements:**
- Questions should integrate concepts from **different level ranges** (e.g., Foundation + Advanced)
- Questions should span categories from **different domains** when possible
- Scenarios must be **ultra-complex** with:
  - Multiple competing demands
  - Incomplete information
  - Systemic risks
  - Organizational impact
- Heavy emphasis on **judgement questions** (50% of exam)
- Tests **complete integration of knowledge** and **strategic thinking**

**Example Scenario:** Global financial institution designing comprehensive AI governance program across all business units in 15+ jurisdictions, facing regulatory scrutiny, requiring integration of compliance, ethics, innovation, scalability, and accountability - demonstrating complete governance philosophy.

---

## Validation Checklist

When generating boss level exams, validate:

### Level 10
- [ ] Exactly 12 questions
- [ ] Each question has 2-3 conceptIds from Levels 1-9
- [ ] Each question has 2+ categoryIds
- [ ] ~3 correct answers per option (A, B, C, D)
- [ ] ~4 apply, ~5 analyse, ~3 judgement questions
- [ ] NO recall questions
- [ ] All concepts from Levels 1-9 represented
- [ ] All categories from Levels 1-9 appear at least once

### Level 20
- [ ] Exactly 20 questions
- [ ] Each question has 2-3 conceptIds from Levels 11-19
- [ ] Each question has 2+ categoryIds
- [ ] ~5 correct answers per option (A, B, C, D)
- [ ] ~6 apply, ~8 analyse, ~6 judgement questions
- [ ] NO recall questions
- [ ] All concepts from Levels 11-19 represented
- [ ] All categories from Levels 11-19 appear at least once
- [ ] Questions test end-to-end organizational governance

### Level 30
- [ ] Exactly 20 questions
- [ ] Each question has 2-3 conceptIds from Levels 21-29
- [ ] Each question has 2+ categoryIds
- [ ] ~5 correct answers per option (A, B, C, D)
- [ ] ~6 apply, ~8 analyse, ~6 judgement questions
- [ ] NO recall questions
- [ ] All concepts from Levels 21-29 represented
- [ ] All categories from Levels 21-29 appear at least once
- [ ] Questions involve incomplete information, trade-offs, systemic risks
- [ ] Questions test strategic thinking with incomplete rules

### Level 40
- [ ] Exactly 25 questions
- [ ] Each question has 2-3 conceptIds from ANY level (1-39)
- [ ] Each question has 2+ categoryIds (preferably from different domains)
- [ ] ~6-7 correct answers per option (A, B, C, D)
- [ ] ~5 apply, ~8 analyse, ~12 judgement questions (50% judgement!)
- [ ] NO recall questions
- [ ] Questions integrate concepts from different level ranges
- [ ] Questions span categories from different domains
- [ ] Ultra-complex scenarios with multiple competing demands
- [ ] Tests complete mastery and strategic thinking

---

## Usage Instructions

1. **Load the appropriate schema file** for the boss level you're generating
2. **Follow the validation rules** in the `validationRules` section
3. **Use the example** as a reference for question structure and quality
4. **Validate your output** against the schema using a JSON schema validator
5. **Check answer distribution** - count correctOptionId values
6. **Verify concept coverage** - ensure all required concepts appear
7. **Verify category coverage** - ensure all required categories appear

---

## Files

- `boss-level-10-schema.json` - Foundation Mastery (Levels 1-9)
- `boss-level-20-schema.json` - Intermediate Mastery (Levels 11-19)
- `boss-level-30-schema.json` - Advanced Mastery (Levels 21-29)
- `boss-level-40-schema.json` - AI Governance Master (Levels 1-39)

Each schema file includes:
- Complete JSON schema definition
- Validation rules
- Example question demonstrating the required quality and structure
- Level-specific requirements and constraints

---

## Key Differences Summary

| Aspect | Level 10 | Level 20 | Level 30 | Level 40 |
|--------|----------|----------|----------|----------|
| Questions | 12 | 20 | 20 | 25 |
| Answer Distribution | ~3 each | ~5 each | ~5 each | ~6-7 each |
| Judgement % | 30% | 30% | 30% | **50%** |
| Stem Min Length | 100 | 120 | 150 | **200** |
| Rationale Length | 3-5 sent | 4-6 sent | 5-7 sent | **6-8 sent** |
| Complexity | Moderate | High | Very High | **Ultra-High** |
| Concept Range | Levels 1-9 | Levels 11-19 | Levels 21-29 | **Levels 1-39** |
| Focus | Foundation integration | End-to-end governance | Strategic thinking | **Complete mastery** |

---

**Ready to generate?** Use the appropriate schema file for each boss level and follow the validation rules strictly!

