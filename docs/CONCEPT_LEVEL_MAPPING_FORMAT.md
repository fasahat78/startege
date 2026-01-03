# Concept-to-Level Mapping Data Format

This document specifies the data format needed to import ChatGPT-categorized concepts aligned with the 40-level game design.

## Quick Start

Level concepts are ready for import:
```bash
npm run import:level-mapping data/level-1-concepts.csv
npm run import:level-mapping data/level-2-concepts.csv
```

See `LEVEL_1_CONCEPTS.md` and `LEVEL_2_CONCEPTS.md` for details on concept generation.

## Data Model Requirements

### Required Fields

1. **conceptId** (string) - Unique identifier for the concept (can be concept name if IDs aren't available)
2. **primaryLevel** (number, 1-40) - The main level this concept belongs to
3. **levelTheme** (string) - The theme/topic of the level (e.g., "Introduction to AI Governance", "GDPR Fundamentals")
4. **complexity** (string) - beginner | intermediate | advanced | expert
5. **alignment** (string) - How well the concept aligns with the level theme: high | medium | low
6. **isSpiralLearning** (boolean) - Whether this concept appears in multiple levels
7. **spiralLevels** (string, comma-separated) - Additional levels this concept appears in (e.g., "1,5,10")
8. **domain** (string) - Domain classification (Domain 1, Domain 2, Domain 3, Domain 4)
9. **category** (string) - Sub-category within domain (must match exact category name from canonical list)
10. **notes** (string, optional) - Any additional notes about the assignment

## CSV Format

### Column Headers

```csv
conceptId,conceptName,primaryLevel,levelTheme,complexity,alignment,isSpiralLearning,spiralLevels,domain,category,notes
```

### Example CSV Row

```csv
cmj30oyve00000al3q30ujesd,GDPR Article 6 Legal Basis,3,GDPR Fundamentals,beginner,high,true,"3,7,15",Domain 2,Data Protection & Privacy Law,"Core concept - appears in foundation, risk management, and compliance levels"
```

### Canonical Category Names

**IMPORTANT**: Use EXACTLY these category names (case + spacing):

#### Domain 1 — AI Governance Foundations
1. AI Fundamentals
2. Governance Principles
3. Governance Structures & Roles
4. Policies & Standards (Internal)
5. AI Lifecycle Governance
6. Decision-Making & Escalation
7. Operating Models
8. Organisational Change & Adoption
9. Strategy & Value Realisation

#### Domain 2 — Laws, Regulations & External Frameworks
1. Data Protection & Privacy Law
2. AI-Specific Regulation
3. Other Relevant Laws
4. Cross-Border Data & Jurisdiction
5. Regulatory Oversight & Authorities
6. Enforcement & Penalties
7. International Standards & Frameworks
8. Regulatory Interpretation & Guidance
9. Emerging & Future Regulation

#### Domain 3 — Governing AI Development
1. Use Case Definition & Scoping
2. Data Governance & Management
3. Risk Identification & Assessment
4. Impact Assessments
5. Model Development & Training Controls
6. Bias, Fairness & Harm Mitigation
7. Testing, Validation & Evaluation
8. Documentation & Record-Keeping
9. Human Oversight in Development

#### Domain 4 — Governing Deployment & Use
1. Deployment Models & Architecture
2. Vendor & Third-Party Governance
3. Operational Monitoring & Controls
4. Transparency & Communication
5. Human Oversight in Operations
6. Incident & Issue Management
7. Audit, Assurance & Review
8. Change Management & Updates
9. Decommissioning & Exit

### CSV Format Details

- **conceptId**: Can be the Prisma ID or concept name (we'll match by name if ID not available)
- **primaryLevel**: Integer 1-40
- **levelTheme**: Must match one of the level titles from `LEVEL_CONFIGS`
- **complexity**: Must be one of: beginner, intermediate, advanced, expert
- **alignment**: Must be one of: high, medium, low
- **isSpiralLearning**: true or false (or 1/0)
- **spiralLevels**: Comma-separated level numbers, or empty string if not spiral
- **domain**: Domain 1, Domain 2, Domain 3, or Domain 4 (no Bonus domain)
- **category**: Must match EXACT category name from canonical list (see below)
- **notes**: Optional, can be empty

## JSON Format (Alternative)

### Structure

```json
{
  "mappings": [
    {
      "conceptId": "cmj30oyve00000al3q30ujesd",
      "conceptName": "GDPR Article 6 Legal Basis",
      "primaryLevel": 3,
      "levelTheme": "GDPR Fundamentals",
      "complexity": "beginner",
      "alignment": "high",
      "isSpiralLearning": true,
      "spiralLevels": [3, 7, 15],
      "domain": "Domain 1",
      "category": "Legal Framework",
      "notes": "Core concept - appears in foundation, risk management, and compliance levels"
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "createdAt": "2024-01-15T00:00:00Z",
    "totalConcepts": 410,
    "levelsCovered": [1, 2, 3, ..., 40]
  }
}
```

## Level Themes Reference

Use these exact level themes when categorizing:

### Foundation Levels (1-10)
1. Introduction to AI Governance
2. Core Principles
3. GDPR Fundamentals
4. Data Protection
5. Privacy Rights
6. AI Act Overview
7. Risk Management
8. Transparency
9. Accountability
10. Foundation Mastery

### Building Levels (11-20)
11. Intermediate Applications
12. Cross-Border Data
13. AI Act Requirements
14. Impact Assessments
15. High-Risk AI Systems
16. Algorithmic Accountability
17. Bias and Fairness
18. Enforcement Mechanisms
19. Compliance Frameworks
20. Intermediate Mastery

### Advanced Levels (21-30)
21. Advanced Scenarios
22. Multi-Jurisdictional
23. Ethical Frameworks
24. Regulatory Sandboxes
25. Case Law Analysis
26. Governance Models
27. Risk Management Advanced
28. Strategic Compliance
29. Emerging Regulations
30. Advanced Mastery

### Mastery Levels (31-40)
31. Expert Synthesis
32. Framework Design
33. Real-World Problems
34. Multi-Domain Integration
35. Strategic Planning
36. Expert Analysis
37. Mastery Integration
38. Advanced Frameworks
39. Expert Synthesis
40. AI Governance Master

## Import Process

1. Export your ChatGPT categorization to CSV or JSON using the format above
2. Run the import script: `npm run import:level-mapping <file.csv|file.json>`
3. The script will:
   - Validate the data format
   - Match concepts by ID or name
   - Update Challenge.concepts arrays for each level
   - Update ConceptCard.difficulty and ConceptCard.importance if needed
   - Generate a coverage report

## Validation Rules

- All 410 concepts must be assigned to at least one level
- Each level should have 10-18 concepts (balanced distribution)
- Spiral learning concepts should appear in 2-4 levels maximum
- Concepts with "high" alignment should be prioritized for their primary level
- Complexity should match level range:
  - Levels 1-10: beginner/intermediate
  - Levels 11-20: intermediate/advanced
  - Levels 21-30: advanced
  - Levels 31-40: expert

## Example ChatGPT Prompt Template

```
You are categorizing AI Governance concepts for a gamified learning platform with 40 progressive levels.

For each concept, assign:
1. Primary level (1-40) based on the level theme
2. Complexity (beginner/intermediate/advanced/expert)
3. Alignment with level theme (high/medium/low)
4. Whether it should appear in multiple levels (spiral learning)
5. Additional levels if spiral learning

Level themes:
[Paste level themes from above]

Concepts to categorize:
[Your concept list]

Output format: CSV with columns: conceptId,conceptName,primaryLevel,levelTheme,complexity,alignment,isSpiralLearning,spiralLevels,domain,category,notes
```

