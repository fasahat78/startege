# Verify Standards in Production Database

**Date**: 2025-01-27  
**Purpose**: Confirm all 11 expected standards are ingested in production

---

## Expected Standards (11 total)

### Legislation (3)
1. **EU Artificial Intelligence Act**
   - Organization: European Union
   - URL: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689

2. **GDPR - AI Relevant Articles**
   - Organization: European Union
   - URL: https://gdpr-info.eu/
   - Relevant Articles: 13-22, 25, 35, 36

3. **CCPA - AI Relevant Sections**
   - Organization: State of California
   - URL: https://oag.ca.gov/privacy/ccpa

### Standards & Frameworks (2)
4. **NIST AI Risk Management Framework**
   - Organization: NIST
   - URL: https://www.nist.gov/itl/ai-risk-management-framework

5. **IEEE Ethically Aligned Design**
   - Organization: IEEE
   - URL: https://ethicsinaction.ieee.org/

### Guidelines & Principles (4)
6. **OECD AI Principles**
   - Organization: OECD
   - URL: https://oecd.ai/en/ai-principles

7. **UNESCO Recommendation on AI Ethics**
   - Organization: UNESCO
   - URL: https://www.unesco.org/en/artificial-intelligence/recommendation-ethics

8. **EU Ethics Guidelines for Trustworthy AI**
   - Organization: European Commission
   - URL: https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai

9. **Singapore Model AI Governance Framework**
   - Organization: IMDA & PDPC
   - URL: https://www.pdpc.gov.sg/help-and-resources/2020/01/model-ai-governance-framework

### Regulatory Guidance (2)
10. **ICO AI and Data Protection Guidance**
    - Organization: ICO
    - URL: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/

11. **FTC AI Guidelines**
    - Organization: FTC
    - URL: https://www.ftc.gov/business-guidance/blog/2023/02/keep-your-ai-claims-check

---

## Verification Methods

### Method 1: SQL Query (Recommended - Cloud SQL Studio)

Run the SQL query in Cloud SQL Studio:

**File**: `scripts/verify-standards-prod.sql`

```sql
-- Count total standards
SELECT 
    COUNT(*) as total_standards,
    COUNT(DISTINCT title) as unique_titles,
    COUNT(DISTINCT source) as unique_sources
FROM "MarketScanArticle"
WHERE "sourceType" = 'STANDARD';

-- List all standards with details
SELECT 
    id,
    title,
    source,
    "sourceUrl",
    jurisdiction,
    category,
    LENGTH(content) as content_length,
    LENGTH(summary) as summary_length,
    "publishedAt",
    "createdAt",
    "updatedAt"
FROM "MarketScanArticle"
WHERE "sourceType" = 'STANDARD'
ORDER BY title ASC;
```

**Expected Results**:
- `total_standards`: Should be **11** (or more if duplicates exist)
- `unique_titles`: Should be **11**
- List should show all 11 standards listed above

### Method 2: TypeScript Script (Requires Cloud SQL Proxy)

**Prerequisites**:
1. Cloud SQL Proxy must be running:
   ```bash
   cloud-sql-proxy startege:us-central1:startege-db --port=5436
   ```

2. Run the verification script:
   ```bash
   npx tsx scripts/verify-standards-prod.ts
   ```

**Expected Output**:
```
✅ FOUND STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. EU Artificial Intelligence Act
   ✅ Found in DB: EU Artificial Intelligence Act
   ...

[All 11 standards listed]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VERIFICATION PASSED: All expected standards are present!
```

---

## What to Check

### ✅ Success Criteria
- **11 standards** found in database
- All expected titles match (case-insensitive)
- Each standard has:
  - `title`: Standard name
  - `source`: Organization name
  - `sourceUrl`: URL to source
  - `sourceType`: `'STANDARD'`
  - `content`: Non-empty content
  - `summary`: Description

### ⚠️ Common Issues

1. **Missing Standards**:
   - If count < 11, some standards weren't ingested
   - Check ingestion logs for errors
   - Re-run ingestion script: `npx tsx scripts/ingest-standards.ts`

2. **Duplicate Standards**:
   - If count > 11, duplicates may exist
   - Check for multiple entries with same title
   - May need to deduplicate

3. **Empty Content**:
   - If `content_length` is 0 or very small, content fetch may have failed
   - Check `sourceUrl` is accessible
   - Re-run ingestion for specific standards

---

## Re-Ingesting Standards

If standards are missing, re-run the ingestion script:

```bash
# Make sure Cloud SQL Proxy is running
cloud-sql-proxy startege:us-central1:startege-db --port=5436

# Run ingestion script
npx tsx scripts/ingest-standards.ts
```

**Note**: The script will attempt to create duplicates. You may need to:
1. Delete existing standards first, OR
2. Modify the script to use `upsert` instead of `create`

---

## Database Schema

Standards are stored in `MarketScanArticle` table with:
- `sourceType = 'STANDARD'`
- `category = 'Standard/Framework'`
- Other fields populated from `KEY_STANDARDS` array

---

## Related Files

- **Standards Definition**: `lib/knowledge-base/standards.ts`
- **Ingestion Script**: `scripts/ingest-standards.ts`
- **RAG Usage**: `lib/startegizer-rag.ts` (searches standards)
- **Verification SQL**: `scripts/verify-standards-prod.sql`
- **Verification Script**: `scripts/verify-standards-prod.ts`

---

**Last Updated**: 2025-01-27

