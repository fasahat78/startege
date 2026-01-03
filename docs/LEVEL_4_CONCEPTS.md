# Level 4 Concepts - Data Protection

## Overview

**Level:** 4  
**Title:** Data Protection  
**Super Level Group:** Foundation  
**Difficulty:** Beginner → early Intermediate  
**Total Concepts:** 10

## Category Coverage

From LevelCategoryCoverage (Step 2), Level 4 introduces:
- **Domain 3 — Data Governance & Management** (INTRODUCED)

**Practice:**
- **Domain 2 — Data Protection & Privacy Law** (PRACTICED)

## Design Principles

- Move from GDPR as a framework (Level 3) to data protection as an operational discipline
- Still GDPR-centric, but control-oriented
- Introduce data governance as the bridge to AI development
- No DPIA mechanics yet (that's Level 14)
- No enforcement, penalties, or regulators yet

## Final Concepts (10)

### Domain 2 — Data Protection & Privacy Law (6 concepts)

1. **Data Protection Principles under GDPR**
   - Introduces core GDPR principles without article-level detail
   - Spiral learning: Levels 4, 5, 14

2. **Purpose Limitation**
   - Foundational principle shaping AI data use
   - Spiral learning: Levels 4, 5, 14

3. **Data Minimisation**
   - Key control for reducing AI data risk
   - Spiral learning: Levels 4, 5, 17

4. **Accuracy and Data Quality**
   - Links legal accuracy to model risk and performance
   - Spiral learning: Levels 4, 7, 27

5. **Storage Limitation**
   - Introduces retention and lifecycle thinking
   - Spiral learning: Levels 4, 5, 27

6. **Integrity and Confidentiality (Security Principle)**
   - Frames security as a legal data protection principle
   - Spiral learning: Levels 4, 7, 18

### Domain 3 — Data Governance & Management (4 concepts)

7. **Data Governance in AI Systems**
   - Introduces ownership and accountability for AI data
   - Spiral learning: Levels 4, 7, 26

8. **Training Data vs Operational Data**
   - Critical AI data distinction
   - Spiral learning: Levels 4, 7, 17

9. **Data Lineage and Provenance**
   - Prepares for documentation and audit
   - Spiral learning: Levels 4, 8, 16

10. **Consent and Data Collection in AI Contexts**
    - Applies lawful basis thinking to AI data intake
    - Spiral learning: Levels 4, 5, 12

## Pruned Concepts

The following concepts were considered but pruned:

- **Right to Erasure (Right to be Forgotten)** — Belongs to Privacy Rights (Level 5)
- **Anonymisation vs Pseudonymisation** — Important, but fits better under risk mitigation later
- **Security Controls for AI Data** — Too implementation-heavy for Foundation
- **Data Breaches and Notification** — Incident management comes later

## Spiral Learning Summary

All 10 concepts have spiral learning:
- **L4-C01** (Data Protection Principles): Levels 4, 5, 14
- **L4-C02** (Purpose Limitation): Levels 4, 5, 14
- **L4-C03** (Data Minimisation): Levels 4, 5, 17
- **L4-C04** (Accuracy and Data Quality): Levels 4, 7, 27
- **L4-C05** (Storage Limitation): Levels 4, 5, 27
- **L4-C06** (Integrity and Confidentiality): Levels 4, 7, 18
- **L4-C07** (Data Governance in AI Systems): Levels 4, 7, 26
- **L4-C08** (Training Data vs Operational Data): Levels 4, 7, 17
- **L4-C09** (Data Lineage and Provenance): Levels 4, 8, 16
- **L4-C10** (Consent and Data Collection): Levels 4, 5, 12

## CSV File

The concepts are stored in `data/level-4-concepts.csv` and ready for import:

```bash
npm run import:level-mapping data/level-4-concepts.csv
```

## Validation Notes

✅ **Clean progression from Level 3**  
✅ **Introduces Domain 3 without overload**  
✅ **Sets up Privacy Rights (L5) and Risk Mgmt (L7)**  
✅ **Strong AI-specific framing**

## Next Steps

After importing Level 4 concepts:
1. Verify category assignment
2. Verify LevelCategoryCoverage enforcement
3. Continue with Level 5 concepts generation

