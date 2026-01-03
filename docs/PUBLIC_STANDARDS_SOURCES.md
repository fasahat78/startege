# Publicly Available AI Governance Standards & Frameworks

**Policy**: Only use publicly available, free sources. No paid content or subscriptions required.

---

## ✅ Publicly Available Sources

### Legislation

#### 1. EU AI Act
- **URL**: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689
- **Status**: ✅ Publicly available
- **Format**: HTML, PDF download available
- **Access**: Free, no login required

#### 2. GDPR (AI-Relevant Articles)
- **URL**: https://gdpr-info.eu/
- **Status**: ✅ Publicly available
- **Format**: HTML, well-structured
- **Access**: Free, no login required
- **Relevant Articles**: 13-22, 25, 35, 36

#### 3. CCPA (AI-Relevant Sections)
- **URL**: https://oag.ca.gov/privacy/ccpa
- **Status**: ✅ Publicly available
- **Format**: HTML
- **Access**: Free, no login required

---

### Standards & Frameworks

#### 4. NIST AI Risk Management Framework
- **URL**: https://www.nist.gov/itl/ai-risk-management-framework
- **PDF**: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf
- **Status**: ✅ Publicly available
- **Format**: PDF, HTML
- **Access**: Free, no login required

#### 5. IEEE Ethically Aligned Design
- **URL**: https://ethicsinaction.ieee.org/
- **Status**: ✅ Publicly available
- **Format**: HTML, PDFs available
- **Access**: Free, no login required

---

### Guidelines & Principles

#### 6. OECD AI Principles
- **URL**: https://oecd.ai/en/ai-principles
- **Status**: ✅ Publicly available
- **Format**: HTML, PDF available
- **Access**: Free, no login required

#### 7. UNESCO Recommendation on AI Ethics
- **URL**: https://www.unesco.org/en/artificial-intelligence/recommendation-ethics
- **PDF**: Available for download
- **Status**: ✅ Publicly available
- **Format**: HTML, PDF
- **Access**: Free, no login required

#### 8. EU Ethics Guidelines for Trustworthy AI
- **URL**: https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai
- **Status**: ✅ Publicly available
- **Format**: HTML, PDF available
- **Access**: Free, no login required

#### 9. Singapore Model AI Governance Framework
- **URL**: https://www.pdpc.gov.sg/help-and-resources/2020/01/model-ai-governance-framework
- **Status**: ✅ Publicly available
- **Format**: HTML, PDF available
- **Access**: Free, no login required

---

### Regulatory Guidance

#### 10. ICO AI and Data Protection Guidance
- **URL**: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/
- **Status**: ✅ Publicly available
- **Format**: HTML
- **Access**: Free, no login required

#### 11. FTC AI Guidelines
- **URL**: https://www.ftc.gov/business-guidance/blog/2023/02/keep-your-ai-claims-check
- **Status**: ✅ Publicly available
- **Format**: HTML
- **Access**: Free, no login required

---

## ❌ Excluded (Require Purchase/Subscription)

### ISO/IEC 42001:2023
- **Reason**: Requires purchase from ISO
- **Alternative**: Use publicly available summaries, guidance documents, and implementation guides
- **Note**: Many organizations publish free summaries and implementation guides

---

## 📥 Ingestion Strategy

### Option 1: Web Scraping (Current Implementation)
- Fetch HTML content from public URLs
- Extract text content
- Store in database
- **Pros**: Automated, always up-to-date
- **Cons**: May miss PDF content, formatting issues

### Option 2: Manual PDF Download & Upload
- Download PDFs manually from public sources
- Upload to a storage location
- Parse PDFs and extract text
- **Pros**: Complete content, better formatting
- **Cons**: Manual process, requires PDF parser

### Option 3: Hybrid Approach (Recommended)
- Use web scraping for HTML content
- For PDFs, provide download links
- Extract text from PDFs when available
- **Pros**: Best of both worlds
- **Cons**: More complex

---

## 🔧 Implementation Notes

### Current Approach
1. **Web Scraping**: Fetch HTML content from public URLs
2. **Text Extraction**: Remove HTML tags, extract text
3. **Storage**: Store in MarketScanArticle table (type: STANDARD)
4. **RAG**: Use in Startegizer responses

### Future Enhancements
1. **PDF Parsing**: Add PDF parser for downloadable PDFs
2. **Content Updates**: Periodic re-fetching to keep content current
3. **Section Extraction**: Extract specific sections (e.g., GDPR Articles 13-22)
4. **Version Tracking**: Track versions of standards

---

## 📋 Checklist

- [x] Identify publicly available sources
- [x] Create fetcher for public URLs
- [x] Update standards catalog (remove paid sources)
- [x] Create ingestion script
- [ ] Test fetching from public URLs
- [ ] Ingest standards content
- [ ] Verify content quality
- [ ] Set up periodic updates

---

## 🚀 Usage

```bash
# Ingest all publicly available standards
npx tsx scripts/ingest-standards.ts

# The script will:
# 1. Fetch content from public URLs
# 2. Extract text content
# 3. Generate embeddings (when Vector DB is set up)
# 4. Store in database
```

---

**Last Updated**: 2025-02-11  
**Policy**: Only publicly available, free sources. No paid content.

