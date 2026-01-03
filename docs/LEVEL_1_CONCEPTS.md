# Level 1 Concepts - Introduction to AI Governance

## Overview

**Level:** 1  
**Title:** Introduction to AI Governance  
**Super Level Group:** Foundation  
**Difficulty:** Beginner  
**Total Concepts:** 10

## Category Coverage

From LevelCategoryCoverage (Step 2), Level 1 introduces:
- **Domain 1 — AI Fundamentals** (INTRODUCED)
- **Domain 1 — Governance Principles** (INTRODUCED)
- **Domain 1 — Governance Structures & Roles** (INTRODUCED)

## Design Principles

- Vocabulary + mental models
- No regulation detail
- No lifecycle depth yet
- No implementation mechanics

## Final Concepts (10)

### Domain 1 — AI Fundamentals (4 concepts)

1. **Artificial Intelligence vs Traditional Software**
   - Establishes why AI requires distinct governance approaches
   - No spiral learning

2. **Types of AI Systems (Rule-Based, ML, Generative)**
   - Introduces minimum AI system taxonomy
   - No spiral learning

3. **AI System vs AI Model vs AI Capability**
   - Prevents common governance terminology confusion
   - No spiral learning

4. **Autonomy and Decision-Making in AI Systems**
   - Foundation for later risk and accountability concepts
   - Spiral learning: Levels 1, 7, 21

### Domain 1 — Governance Principles (3 concepts)

5. **Purpose of AI Governance**
   - Explains why governance exists in AI contexts
   - No spiral learning

6. **Accountability as a Governance Principle**
   - Core principle revisited in accountability and audit levels
   - Spiral learning: Levels 1, 9, 16

7. **Transparency as a Governance Principle**
   - High-level transparency concept before technical explainability
   - Spiral learning: Levels 1, 8, 17

### Domain 1 — Governance Structures & Roles (3 concepts)

8. **AI Governance vs Corporate Governance**
   - Positions AI governance within existing organisational governance
   - No spiral learning

9. **Role of the Organisation in AI Accountability**
   - Shifts accountability from models to organisations
   - Spiral learning: Levels 1, 9, 26

10. **AI System Owner vs AI User**
    - Introduces role separation critical for later controls
    - Spiral learning: Levels 1, 9, 33

## Pruned Concepts

The following concepts were considered but pruned:

- **Why AI Governance Is a Socio-Technical Discipline** — Too abstract for Level 1 (better at Level 21+)
- **Consequences of Poor AI Governance** — Overlaps with "Purpose of AI Governance"

## Spiral Learning Summary

Concepts with spiral learning:
- **L1-C04** (Autonomy): Levels 1, 7, 21
- **L1-C06** (Accountability): Levels 1, 9, 16
- **L1-C07** (Transparency): Levels 1, 8, 17
- **L1-C09** (Organisation Role): Levels 1, 9, 26
- **L1-C10** (Owner vs User): Levels 1, 9, 33

## CSV File

The concepts are stored in `data/level-1-concepts.csv` and ready for import:

```bash
npm run import:level-mapping data/level-1-concepts.csv
```

## Next Steps

1. Import Level 1 concepts into database
2. Generate Category Exams for:
   - AI Fundamentals
   - Governance Principles
   - Governance Structures & Roles
3. Generate Level 1 Level Exam
4. Test category gating and level gating
5. Validate exam generation quality

