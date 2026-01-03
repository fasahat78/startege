# Level Exam Prompt Template

This template is used to generate level-specific exam prompts.

Fill in the placeholders `<< >>` for each level and store in `Challenge.examSystemPrompt`.

Supports both regular level exams and Boss level exams (10, 20, 30, 40).

---

You are generating a **mandatory level exam** for a professional AI Governance learning platform.

This exam assesses mastery of **all concepts assigned to this level**.
If this is a **Boss Level**, it assesses mastery of **all concepts across the entire super-level block**.

---

## 1) Level Context (AUTHORITATIVE)

**Level Number:**
<<LEVEL_NUMBER>>

**Level Title:**
<<LEVEL_TITLE>>

**Super Level Group:**
<<SUPER_LEVEL_GROUP>>

**Is Boss Level:**
<<IS_BOSS_LEVEL>>

---

## 2) Exam Scope (CRITICAL — DO NOT VIOLATE)

### Concepts In Scope (AUTHORITATIVE LIST)

You may test **only** the following concepts:

<<EXPLICIT_LIST_OF_CONCEPT_NAMES_OR_IDS>>

* Every concept listed above **must be assessed at least once**.
* No concept outside this list may be tested.

If you cannot generate valid questions for every listed concept:

* reduce the number of questions
* **never** introduce new concepts

---

## 3) Category Coverage Rules

These concepts span multiple categories.

You must:

* distribute questions across categories **proportionally**
* avoid clustering questions from a single category
* ensure no category dominates unless explicitly specified

If this is a **Boss Level**:

* ensure **cross-category integration**
* prefer scenarios that require reasoning across **multiple categories**

---

## 4) Difficulty Calibration

Difficulty level is determined by **Super Level Group**:

* **FOUNDATION:** structured, low ambiguity, clear signals
* **BUILDING:** realistic application, multiple constraints
* **ADVANCED:** trade-offs, incomplete information
* **MASTERY:** judgement, second-order effects, organisational impact

If **Is Boss Level = true**:

* increase scenario realism
* increase integration across concepts
* increase decision complexity
* avoid purely definitional questions

---

## 5) Boss Exam Rules (ONLY IF Is Boss Level = true)

If this is a Boss Level exam:

* Questions must assess:
  * synthesis across multiple levels
  * governance judgement
  * prioritisation under constraint
* At least **60%** of questions must:
  * involve **two or more concepts**
  * span **two or more categories**
* Avoid repeating the same scenario pattern.

Boss exams are **hard gates**.
They must feel meaningfully harder than non-boss exams.

---

## 6) Question Design Constraints (STRICT)

* All questions must be **MCQs**
* Exactly **four (4) options**
* Exactly **one correct answer**
* No trick questions
* No ambiguous wording
* No "all/none of the above"

---

## 7) Governance Framing Rules

Frame questions from the perspective of:

* enterprise decision-makers
* AI governance councils
* risk owners
* compliance leaders
* regulators (where relevant)

Avoid:

* ML model internals
* software implementation detail
* academic theory disconnected from practice

---

## 8) Explanations & Rationales

For each question:

* Explain **why the correct option is correct**
* Explain **why each incorrect option is incorrect**
* Tie explanations back to:
  * governance principles
  * organisational accountability
  * regulatory expectations

Do not introduce new concepts in explanations.

---

## 9) Output Format

Follow the **Global Base Exam Prompt** output schema exactly.
Return **valid JSON only** matching the JSON Schema specified in the base prompt.

**CRITICAL:** The output must match the exact JSON Schema from the base prompt:
- Root object with `questions` array
- Each question has: `id`, `stem`, `options` (4 items), `correctOptionId`, `rationale`
- Option IDs must be exactly "A", "B", "C", or "D"
- Question IDs must follow pattern `Q1`, `Q2`, `Q3`, etc.
- Do not include any text outside the JSON payload
- Do not include markdown code fences or commentary

---

## 10) Quality Bar (NON-NEGOTIABLE)

A learner who passes this exam should demonstrably:

* understand all in-scope concepts
* apply them appropriately for this level
* be ready to progress to the next level (or next super-level if boss)

