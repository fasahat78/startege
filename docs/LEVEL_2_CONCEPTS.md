# Level 2 Concepts - Core Principles

## Overview

**Level:** 2  
**Title:** Core Principles  
**Super Level Group:** Foundation  
**Difficulty:** Beginner → early Intermediate  
**Total Concepts:** 10

## Category Coverage

From LevelCategoryCoverage (Step 2), Level 2 introduces:
- **Domain 1 — Governance Principles** (INTRODUCED deeper)
- **Domain 1 — Policies & Standards (Internal)** (INTRODUCED)
- **Domain 1 — AI Lifecycle Governance** (INTRODUCED)

**Practice:**
- AI Fundamentals (from Level 1)
- Governance Principles (from Level 1)

## Design Principles

- Move from "what AI governance is" to "principles that shape governance decisions"
- No regulations yet
- No compliance mechanics
- Principles must be decision-shaping, not slogans
- Concepts must be non-overlapping with Level 1

## Final Concepts (10)

### Domain 1 — Governance Principles (5 concepts)

1. **Responsible AI as a Governance Concept**
   - Frames Responsible AI as a governance construct rather than ethics alone
   - No spiral learning

2. **Risk-Based Approach to AI Governance**
   - Foundational risk framing reused in later risk management levels
   - Spiral learning: Levels 2, 7, 15

3. **Proportionality in AI Governance**
   - Explains why governance intensity varies by risk
   - Spiral learning: Levels 2, 6, 13

4. **Human Oversight as a Governance Principle**
   - Introduces oversight before lifecycle and operational controls
   - Spiral learning: Levels 2, 7, 36

5. **Accountability vs Responsibility in AI Contexts**
   - Clarifies governance ownership distinctions
   - Spiral learning: Levels 2, 9, 16

### Domain 1 — Policies & Standards (Internal) (3 concepts)

6. **Purpose of Internal AI Policies**
   - Explains why organisations formalise AI expectations
   - No spiral learning

7. **AI Policy vs AI Standard vs AI Procedure**
   - Prevents structural confusion in governance artefacts
   - Spiral learning: Levels 2, 19, 32

8. **Principle-Based vs Rule-Based AI Policies**
   - Introduces policy design trade-offs
   - Spiral learning: Levels 2, 19, 28

### Domain 1 — AI Lifecycle Governance (2 concepts)

9. **AI Lifecycle Stages (Design to Decommission)**
   - Defines shared lifecycle language
   - Spiral learning: Levels 2, 5, 31

10. **Governance Controls Across the AI Lifecycle**
    - Introduces stage-based governance controls
    - Spiral learning: Levels 2, 7, 27

## Pruned Concepts

The following concepts were considered but pruned:

- **Ethics vs Governance in AI** — Overlaps with "Responsible AI"
- **Trustworthy AI as an Outcome** — Too abstract; outcome, not governance mechanism
- **Why One-Size-Fits-All Governance Fails** — Overlaps with proportionality

## Spiral Learning Summary

Concepts with spiral learning:
- **L2-C02** (Risk-Based Approach): Levels 2, 7, 15
- **L2-C03** (Proportionality): Levels 2, 6, 13
- **L2-C04** (Human Oversight): Levels 2, 7, 36
- **L2-C05** (Accountability vs Responsibility): Levels 2, 9, 16
- **L2-C07** (Policy vs Standard vs Procedure): Levels 2, 19, 32
- **L2-C08** (Principle-Based vs Rule-Based): Levels 2, 19, 28
- **L2-C09** (Lifecycle Stages): Levels 2, 5, 31
- **L2-C10** (Governance Controls): Levels 2, 7, 27

## CSV File

The concepts are stored in `data/level-2-concepts.csv` and ready for import:

```bash
npm run import:level-mapping data/level-2-concepts.csv
```

## Validation Notes

✅ **No overlap with Level 1**  
✅ **Introduces new categories cleanly**  
✅ **Sets up Levels 3–7 naturally**  
✅ **Perfect precursor to GDPR + AI Act later**

## Next Steps

After importing Level 2 concepts:
1. Verify category assignment
2. Verify LevelCategoryCoverage enforcement
3. Continue with Level 3 concepts generation

