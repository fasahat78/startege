# Level 3 Concepts - GDPR Fundamentals

## Overview

**Level:** 3  
**Title:** GDPR Fundamentals  
**Super Level Group:** Foundation  
**Difficulty:** Beginner  
**Total Concepts:** 10

## Category Coverage

From LevelCategoryCoverage (Step 2), Level 3 introduces:
- **Domain 2 — Data Protection & Privacy Law** (INTRODUCED)

**Practice:**
- Policies & Standards (Internal) (from Level 2)
- AI Lifecycle Governance (from Level 2)

## Design Principles

- Introduce GDPR as a legal framework relevant to AI
- GDPR structure and concepts, not deep articles yet
- Focus on why GDPR matters for AI
- No DPIA mechanics (that's later)
- No enforcement detail yet
- No AI Act yet

## Final Concepts (10)

### Domain 2 — Data Protection & Privacy Law (8 concepts)

1. **Purpose and Scope of GDPR**
   - Introduces GDPR intent and applicability
   - No spiral learning

2. **Personal Data vs Non-Personal Data**
   - Foundational classification used throughout GDPR compliance
   - Spiral learning: Levels 3, 4, 12

3. **Processing of Personal Data**
   - Defines legal trigger for GDPR obligations
   - Spiral learning: Levels 3, 4, 14

4. **Data Controller vs Data Processor**
   - Critical role distinction reused across compliance and contracts
   - Spiral learning: Levels 3, 5, 18

5. **Lawful Basis for Processing Personal Data**
   - Central requirement for lawful processing
   - Spiral learning: Levels 3, 4, 15

6. **Special Category (Sensitive) Personal Data**
   - Introduces heightened protection and risk
   - Spiral learning: Levels 3, 4, 17

7. **GDPR Territorial Scope**
   - Explains extraterritorial application of GDPR
   - Spiral learning: Levels 3, 12, 22

8. **Relationship Between GDPR and AI Systems**
   - Explicitly connects GDPR obligations to AI use
   - No spiral learning

### Practiced Foundations (2 concepts)

9. **Accountability Principle under GDPR**
   - Bridges governance accountability with legal obligation
   - Spiral learning: Levels 3, 9, 16

10. **Data Protection Across the AI Lifecycle**
    - Applies GDPR thinking across lifecycle stages
    - Spiral learning: Levels 3, 4, 27

## Pruned Concepts

The following concepts were considered but pruned:

- **Data Minimisation Principle** — Overlaps with lawful basis + lifecycle later; better in Data Protection level
- **Purpose Limitation Principle** — Same as above; too detailed for first legal exposure
- **GDPR Articles and Structure** — Too legalistic; not learner-friendly at Level 3
- **Consent under GDPR** — Important but better handled with lawful bases together later

## Spiral Learning Summary

Concepts with spiral learning:
- **L3-C02** (Personal Data vs Non-Personal): Levels 3, 4, 12
- **L3-C03** (Processing): Levels 3, 4, 14
- **L3-C04** (Controller vs Processor): Levels 3, 5, 18
- **L3-C05** (Lawful Basis): Levels 3, 4, 15
- **L3-C06** (Special Category): Levels 3, 4, 17
- **L3-C07** (Territorial Scope): Levels 3, 12, 22
- **L3-C09** (Accountability): Levels 3, 9, 16
- **L3-C10** (Data Protection Across Lifecycle): Levels 3, 4, 27

## CSV File

The concepts are stored in `data/level-3-concepts.csv` and ready for import:

```bash
npm run import:level-mapping data/level-3-concepts.csv
```

## Validation Notes

✅ **Clean first exposure to law**  
✅ **No overlap with Level 2 principles**  
✅ **Sets up Levels 4–6 cleanly**  
✅ **Strong bridge from governance → regulation**

## Next Steps

After importing Level 3 concepts:
1. Verify category assignment
2. Verify LevelCategoryCoverage enforcement
3. Continue with Level 4 concepts generation

