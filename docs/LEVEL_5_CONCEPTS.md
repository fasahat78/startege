# Level 5 Concepts - Privacy Rights

## Overview

**Level:** 5  
**Title:** Privacy Rights  
**Super Level Group:** Foundation  
**Difficulty:** Beginner → early Intermediate  
**Total Concepts:** 10

## Category Coverage

From LevelCategoryCoverage (Step 2), Level 5 introduces:
- **Domain 2 — Regulatory Oversight & Authorities** (INTRODUCED)

**Practice:**
- **Domain 2 — Data Protection & Privacy Law** (PRACTICED)
- **Domain 3 — Data Governance & Management** (PRACTICED)

## Design Principles

- Help learners understand data subject rights
- Why they matter for AI systems
- What organisations must do in response
- Rights, not regulators or penalties
- Focus on response obligations, not legal procedures
- AI-specific implications (automation, scale, opacity)
- No DPIAs or enforcement yet

## Final Concepts (10)

### Domain 2 — Data Protection & Privacy Law (7 concepts)

1. **Overview of Data Subject Rights under GDPR**
   - Introduces the full set of individual rights under GDPR
   - Spiral learning: Levels 5, 18, 36

2. **Right of Access**
   - Most commonly exercised GDPR right with AI relevance
   - Spiral learning: Levels 5, 8, 36

3. **Right to Rectification**
   - Links data subject rights to data quality and AI accuracy
   - Spiral learning: Levels 5, 7, 27

4. **Right to Erasure (Right to be Forgotten)**
   - Challenges AI data retention and model training
   - Spiral learning: Levels 5, 27, 40

5. **Right to Restriction of Processing**
   - Introduces limits on continued AI processing
   - Spiral learning: Levels 5, 18, 36

6. **Right to Data Portability**
   - Introduces data reuse and interoperability expectations
   - Spiral learning: Levels 5, 12, 34

7. **Right to Object to Processing**
   - Relevant for AI-driven profiling and decisions
   - Spiral learning: Levels 5, 18, 36

### Domain 3 — Data Governance & Management (3 concepts)

8. **Handling Data Subject Requests in AI Systems**
   - Bridges rights to operational governance processes
   - Spiral learning: Levels 5, 8, 18

9. **Automated Decision-Making and Individual Rights**
   - Explicit GDPR hook for AI-driven decisions
   - Spiral learning: Levels 5, 15, 33

10. **Explainability Expectations for Data Subject Requests**
    - Sets expectations without technical explainability depth
    - Spiral learning: Levels 5, 8, 17

## Pruned Concepts

The following concepts were considered but pruned:

- **Response Timeframes for Data Subject Requests** — Procedural detail; low conceptual value here
- **Identity Verification for Data Subject Requests** — Operational detail, not conceptual
- **Refusing or Limiting Data Subject Requests** — Better placed with enforcement and exemptions later
- **Children's Data Rights** — Important, but a specialised branch topic

## Spiral Learning Summary

All 10 concepts have spiral learning:
- **L5-C01** (Overview of Rights): Levels 5, 18, 36
- **L5-C02** (Right of Access): Levels 5, 8, 36
- **L5-C03** (Right to Rectification): Levels 5, 7, 27
- **L5-C04** (Right to Erasure): Levels 5, 27, 40
- **L5-C05** (Right to Restriction): Levels 5, 18, 36
- **L5-C06** (Right to Data Portability): Levels 5, 12, 34
- **L5-C07** (Right to Object): Levels 5, 18, 36
- **L5-C08** (Handling Requests): Levels 5, 8, 18
- **L5-C09** (Automated Decision-Making): Levels 5, 15, 33
- **L5-C10** (Explainability Expectations): Levels 5, 8, 17

## CSV File

The concepts are stored in `data/level-5-concepts.csv` and ready for import:

```bash
npm run import:level-mapping data/level-5-concepts.csv
```

## Validation Notes

✅ **Completes GDPR rights foundation**  
✅ **Strong AI-specific framing**  
✅ **Clean bridge to Transparency (Level 8) and Accountability (Level 9)**  
✅ **No overlap with enforcement or DPIAs**

## Next Steps

After importing Level 5 concepts:
1. Verify category assignment
2. Verify LevelCategoryCoverage enforcement
3. Continue with Level 6 concepts generation

