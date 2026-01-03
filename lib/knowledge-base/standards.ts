/**
 * AI Governance Standards, Legislation, and Frameworks
 * Knowledge base for RAG integration
 */

export interface GovernanceStandard {
  id: string;
  name: string;
  type: 'legislation' | 'standard' | 'guideline' | 'principle' | 'guidance';
  jurisdiction: string;
  organization: string;
  url: string;
  description: string;
  publishedDate?: string;
  effectiveDate?: string;
  domains: string[]; // AIGP domains this relates to
  topics: string[]; // Key topics covered
  filePath?: string; // Local file path if available
  status: 'active' | 'draft' | 'superseded';
}

/**
 * Key AI Governance Standards and Frameworks
 * These will be ingested into Vector DB for RAG
 */
export const KEY_STANDARDS: GovernanceStandard[] = [
  // Legislation
  {
    id: 'eu-ai-act',
    name: 'EU Artificial Intelligence Act',
    type: 'legislation',
    jurisdiction: 'EU',
    organization: 'European Union',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
    description: 'Comprehensive regulation on artificial intelligence, establishing rules for AI systems in the EU market.',
    publishedDate: '2024-07-12',
    effectiveDate: '2025-08-02',
    domains: ['Domain I', 'Domain II', 'Domain III', 'Domain IV'],
    topics: ['High-risk AI', 'Prohibited AI', 'Transparency', 'Compliance', 'Enforcement'],
    status: 'active',
  },
  {
    id: 'gdpr-ai-relevant',
    name: 'GDPR - AI Relevant Articles',
    type: 'legislation',
    jurisdiction: 'EU',
    organization: 'European Union',
    url: 'https://gdpr-info.eu/',
    description: 'General Data Protection Regulation articles relevant to AI systems (Articles 13-22, 25, 35, 36).',
    publishedDate: '2016-04-27',
    effectiveDate: '2018-05-25',
    domains: ['Domain I', 'Domain II'],
    topics: ['Data Protection', 'Privacy', 'Rights', 'DPIA', 'Data Subject Rights'],
    status: 'active',
  },
  {
    id: 'ccpa-ai-relevant',
    name: 'CCPA - AI Relevant Sections',
    type: 'legislation',
    jurisdiction: 'US',
    organization: 'State of California',
    url: 'https://oag.ca.gov/privacy/ccpa',
    description: 'California Consumer Privacy Act sections relevant to automated decision-making and AI.',
    publishedDate: '2018-06-28',
    effectiveDate: '2020-01-01',
    domains: ['Domain I', 'Domain II'],
    topics: ['Privacy Rights', 'Automated Decision-Making', 'Opt-Out', 'Transparency'],
    status: 'active',
  },

  // Standards (Publicly Available Only)
  // Note: ISO/IEC 42001 requires purchase, so we use publicly available summaries/guidance instead
  {
    id: 'nist-ai-rmf',
    name: 'NIST AI Risk Management Framework',
    type: 'standard',
    jurisdiction: 'US',
    organization: 'NIST',
    url: 'https://www.nist.gov/itl/ai-risk-management-framework',
    description: 'Voluntary framework for managing risks in AI systems, providing guidelines for trustworthy AI. Publicly available PDF and web content.',
    publishedDate: '2023-01-26',
    domains: ['Domain I', 'Domain III'],
    topics: ['Risk Management', 'Trustworthy AI', 'Governance', 'Measurement'],
    status: 'active',
    // Public PDF available at: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf
  },
  {
    id: 'ieee-ethically-aligned-design',
    name: 'IEEE Ethically Aligned Design',
    type: 'standard',
    jurisdiction: 'Global',
    organization: 'IEEE',
    url: 'https://ethicsinaction.ieee.org/',
    description: 'IEEE standards and recommendations for ethically aligned design of autonomous and intelligent systems.',
    publishedDate: '2019-03',
    domains: ['Domain I', 'Domain IV'],
    topics: ['Ethics', 'Human Values', 'Well-being', 'Autonomy'],
    status: 'active',
  },

  // Guidelines & Principles
  {
    id: 'oecd-ai-principles',
    name: 'OECD AI Principles',
    type: 'principle',
    jurisdiction: 'Global',
    organization: 'OECD',
    url: 'https://oecd.ai/en/ai-principles',
    description: 'Recommendation on AI principles promoting trustworthy AI that respects human rights and democratic values.',
    publishedDate: '2019-05-22',
    domains: ['Domain I', 'Domain IV'],
    topics: ['Trustworthy AI', 'Human Values', 'Transparency', 'Accountability'],
    status: 'active',
  },
  {
    id: 'unesco-ai-ethics',
    name: 'UNESCO Recommendation on AI Ethics',
    type: 'guideline',
    jurisdiction: 'Global',
    organization: 'UNESCO',
    url: 'https://www.unesco.org/en/artificial-intelligence/recommendation-ethics',
    description: 'First global standard-setting instrument on AI ethics, adopted by 193 countries.',
    publishedDate: '2021-11-25',
    domains: ['Domain I', 'Domain IV'],
    topics: ['Ethics', 'Human Rights', 'Diversity', 'Environment'],
    status: 'active',
  },
  {
    id: 'eu-ethics-guidelines',
    name: 'EU Ethics Guidelines for Trustworthy AI',
    type: 'guideline',
    jurisdiction: 'EU',
    organization: 'European Commission',
    url: 'https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai',
    description: 'Guidelines outlining requirements for trustworthy AI: lawful, ethical, and robust.',
    publishedDate: '2019-04-08',
    domains: ['Domain I', 'Domain IV'],
    topics: ['Trustworthy AI', 'Ethics', 'Human Agency', 'Robustness'],
    status: 'active',
  },
  {
    id: 'singapore-model-framework',
    name: 'Singapore Model AI Governance Framework',
    type: 'guideline',
    jurisdiction: 'Singapore',
    organization: 'IMDA & PDPC',
    url: 'https://www.pdpc.gov.sg/help-and-resources/2020/01/model-ai-governance-framework',
    description: 'Practical framework for implementing AI governance in organizations.',
    publishedDate: '2019-01',
    domains: ['Domain I', 'Domain III'],
    topics: ['Governance', 'Implementation', 'Risk Management', 'Transparency'],
    status: 'active',
  },

  // Regulatory Guidance
  {
    id: 'ico-ai-guidance',
    name: 'ICO AI and Data Protection Guidance',
    type: 'guidance',
    jurisdiction: 'UK',
    organization: 'ICO',
    url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/',
    description: 'Guidance on AI and data protection, covering GDPR compliance for AI systems.',
    publishedDate: '2020-07',
    domains: ['Domain I', 'Domain II'],
    topics: ['Data Protection', 'GDPR Compliance', 'DPIA', 'Fairness'],
    status: 'active',
  },
  {
    id: 'ftc-ai-guidelines',
    name: 'FTC AI Guidelines',
    type: 'guidance',
    jurisdiction: 'US',
    organization: 'FTC',
    url: 'https://www.ftc.gov/business-guidance/blog/2023/02/keep-your-ai-claims-check',
    description: 'FTC guidance on AI claims, transparency, and consumer protection.',
    publishedDate: '2023-02',
    domains: ['Domain I', 'Domain II'],
    topics: ['Consumer Protection', 'Transparency', 'Fairness', 'Deception'],
    status: 'active',
  },
];

/**
 * Get standards by domain
 */
export function getStandardsByDomain(domain: string): GovernanceStandard[] {
  return KEY_STANDARDS.filter(s => s.domains.includes(domain));
}

/**
 * Get standards by topic
 */
export function getStandardsByTopic(topic: string): GovernanceStandard[] {
  return KEY_STANDARDS.filter(s => 
    s.topics.some(t => t.toLowerCase().includes(topic.toLowerCase()))
  );
}

/**
 * Get standards by jurisdiction
 */
export function getStandardsByJurisdiction(jurisdiction: string): GovernanceStandard[] {
  return KEY_STANDARDS.filter(s => s.jurisdiction === jurisdiction);
}

