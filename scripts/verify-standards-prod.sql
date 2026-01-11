-- Verify Standards in Production Database
-- Run this query in Cloud SQL Studio or via psql

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

-- Expected standards (for comparison):
-- 1. EU Artificial Intelligence Act
-- 2. GDPR - AI Relevant Articles
-- 3. CCPA - AI Relevant Sections
-- 4. NIST AI Risk Management Framework
-- 5. IEEE Ethically Aligned Design
-- 6. OECD AI Principles
-- 7. UNESCO Recommendation on AI Ethics
-- 8. EU Ethics Guidelines for Trustworthy AI
-- 9. Singapore Model AI Governance Framework
-- 10. ICO AI and Data Protection Guidance
-- 11. FTC AI Guidelines

