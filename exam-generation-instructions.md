# Exam Generation Instructions for ChatGPT

This document provides clear instructions for generating exam JSONs using ChatGPT, based on the answers to implementation questions.

---

## Key Decisions Made

### 1. Answer Distribution (CRITICAL)
- **Enforce even distribution per exam**: Each exam must have approximately equal numbers of correct answers for A, B, C, D
- For 10 questions: 2-3 correct answers per option
- For 12 questions: 3 correct answers per option
- For 20 questions: 5 correct answers per option
- **Validate your output**: Count correctOptionId values and ensure they're balanced

### 2. Question Generation Approach
- **Pre-generate question banks**: Generate 2-3x the required questionCount per level
  - Level 1 (needs 10): Generate 20-30 questions
  - Level 10 Boss (needs 12): Generate 30-40 questions
  - Level 20 Boss (needs 20): Generate 50-60 questions
- **Coverage requirement**: Every concept in the level MUST appear in at least one question
- **Boss levels**: Each question must integrate 2-3 concepts and span 2+ categories

### 3. Scoring & Difficulty
- **Binary scoring**: Always correct/incorrect (no partial credit)
- **Difficulty tags**: Use "recall", "apply", "analyse", "judgement" appropriately
- **Boss levels**: NO "recall" questions allowed, only "apply", "analyse", "judgement"

### 4. Category Requirements
- **Regular levels**: 1+ category per question (can be single category)
- **Boss levels**: 2+ categories per question (MANDATORY)
- **If concept has null categoryId**: Use categoryId from the concept's entry in levels-concepts-mapping.json
- **If still null**: Assign to a valid categoryId from the same domain, or note as "UNCLASSIFIED" (we'll fix upstream)

---

## Generation Process

### Step 1: Load Level Data
1. Open `levels-concepts-mapping.json`
2. Find the level you're generating (e.g., Level 1)
3. Note:
   - `levelNumber`: 1
   - `title`: "Introduction to AI Governance"
   - `questionCount`: 10 (but generate 20-30 for bank)
   - `conceptCount`: 10
   - `concepts`: Array of 10 concepts with IDs, definitions, categoryIds

### Step 2: Use System Prompt
1. Load `exam-generation-system-prompt.md`
2. Follow ALL rules, especially:
   - Answer distribution (even A/B/C/D)
   - Explanation quality (AIGP standards)
   - Concept coverage (every concept tested)
   - Category requirements (2+ for boss levels)

### Step 3: Generate Questions
1. Generate 2-3x `questionCount` questions
2. Ensure every concept appears at least once
3. For boss levels: Ensure every question has 2-3 conceptIds and 2+ categoryIds
4. Validate answer distribution before finalizing

### Step 4: Output Format
1. Use exact schema from `exam-output-format.json`
2. Return ONLY valid JSON (no markdown, no commentary)
3. Include all required fields:
   - `id`: Q1, Q2, Q3...
   - `stem`: Scenario-based question text
   - `options`: Exactly 4 options with id (A/B/C/D) and text
   - `correctOptionId`: One of A/B/C/D (distributed evenly!)
   - `conceptIds`: Array of concept IDs from mapping file
   - `categoryIds`: Array of category IDs from mapping file
   - `difficultyTag`: "recall" | "apply" | "analyse" | "judgement"
   - `rationale`: Object with `correct` (2-4 sentences) and `incorrect` (object with A/B/C/D explanations)

### Step 5: Validation Checklist
Before submitting, verify:
- [ ] JSON is valid (can be parsed)
- [ ] All required fields present
- [ ] Answer distribution is even (count correctOptionId)
- [ ] Every concept appears at least once (check conceptIds)
- [ ] Boss levels: 2+ categories per question
- [ ] Boss levels: 2-3 concepts per question
- [ ] Boss levels: NO "recall" difficultyTag
- [ ] Explanations follow AIGP style (2-4 sentences for correct, specific for incorrect)
- [ ] Question stems are scenario-based (not pure definition recall)

---

## Example Prompt for ChatGPT

```
You are generating exam questions for Level 1: "Introduction to AI Governance".

REQUIREMENTS:
- Generate 20-30 questions (we need a bank of 20-30, will select 10 per attempt)
- Test all 10 concepts from the provided level-concepts-mapping.json
- Each question must have exactly 4 options (A, B, C, D)
- Distribute correct answers evenly: ~5-7 per option (A, B, C, D)
- Every concept must appear in at least one question
- Questions must be scenario-based (not pure definition recall)
- Follow the exact JSON schema from exam-output-format.json

CONCEPTS TO TEST (from levels-concepts-mapping.json):
[List all 10 concepts with their IDs, definitions, and categoryIds]

OUTPUT FORMAT:
Return ONLY valid JSON matching exam-output-format.json schema.
No markdown, no commentary, just JSON.

VALIDATION:
After generating, verify:
1. Answer distribution is even (count correctOptionId values)
2. All 10 concepts appear in conceptIds arrays
3. JSON is valid and parseable
```

---

## Handling Edge Cases

### Concept with null categoryId
- Check the concept's entry in levels-concepts-mapping.json
- If categoryId is null but categoryName exists, try to match to a valid categoryId
- If still null, use a categoryId from the same domain
- Note in a comment which concepts had null categoryId (we'll fix upstream)

### Concept count > Question count
- This shouldn't happen (conceptCount should match or be less than questionCount)
- If it does: Generate multiple questions per concept, prioritizing high-importance concepts

### Boss level category coverage
- Ensure all categories from the level range appear at least once
- Distribute questions across categories proportionally
- No single category should dominate (>40% of questions)

---

## Quality Standards

### Question Stems
- **Good**: "A healthcare organisation is designing an AI system to assist doctors in diagnosing rare diseases. The system will process patient medical records from multiple EU countries. As the AI governance lead, what is the most appropriate first step?"
- **Bad**: "What is accountability?" (too simple, definition recall)

### Explanations
- **Good**: "This scenario requires early governance intervention. The use case involves cross-border data processing and medical decision-making assistance, which qualifies as high-risk under Annex III of the EU AI Act. Option A correctly integrates use case definition, risk classification, and impact assessment timing, following governance best practices."
- **Bad**: "This is correct because it's the right answer." (not educational)

### Distractors
- **Good**: "Delaying impact assessment until after deployment violates the AI Act's requirement for high-risk systems to undergo conformity assessment before being placed on the market."
- **Bad**: "This is incorrect." (not helpful)

---

## Final Notes

1. **Generate in batches**: Process 5 levels at a time (as you requested)
2. **Validate each batch**: Check answer distribution and concept coverage before moving to next batch
3. **Store outputs**: Save each level's JSON to a separate file (e.g., `level-1-questions.json`)
4. **Report issues**: Note any concepts with null categoryId or other data quality issues

---

## Files Reference

- **System Prompt**: `exam-generation-system-prompt.md`
- **Level-Concept Mapping**: `levels-concepts-mapping.json`
- **Output Schema**: `exam-output-format.json`
- **Implementation Answers**: `exam-generation-answers.md` (for context)

---

**Ready to generate? Start with Level 1 and work through all 36 levels (excluding boss levels 10, 20, 30, 40 - generate those separately with boss-level requirements).**

