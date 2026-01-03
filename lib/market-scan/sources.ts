/**
 * Verified sources for Market Scan feature
 * Only authentic, verified sources are included
 */

export interface ScanSource {
  id: string;
  name: string;
  type: 'RSS' | 'API' | 'SCRAPE' | 'MANUAL';
  url: string;
  verified: boolean;
  jurisdiction?: string;
  category: string[];
  enabled: boolean;
  lastScanned?: Date;
  description?: string;
}

export const VERIFIED_SOURCES: ScanSource[] = [
  // EU Regulatory Bodies
  {
    id: 'eu-commission-ai',
    name: 'EU Commission - AI Act Updates',
    type: 'RSS',
    url: 'https://digital-strategy.ec.europa.eu/en/rss.xml',
    verified: true,
    jurisdiction: 'EU',
    category: ['Regulatory Update', 'AI Act'],
    enabled: true,
    description: 'Official EU Commission updates on AI Act implementation',
  },
  {
    id: 'eu-data-protection-board',
    name: 'European Data Protection Board',
    type: 'RSS',
    url: 'https://edpb.europa.eu/rss.xml',
    verified: true,
    jurisdiction: 'EU',
    category: ['Regulatory Update', 'GDPR', 'Data Protection'],
    enabled: true,
    description: 'EDPB guidance and decisions on data protection',
  },

  // UK Regulatory Bodies
  {
    id: 'ico-ai-guidance',
    name: 'ICO - AI Guidance',
    type: 'RSS',
    url: 'https://ico.org.uk/rss-feeds/',
    verified: true,
    jurisdiction: 'UK',
    category: ['Regulatory Update', 'Guidance'],
    enabled: true,
    description: 'ICO guidance on AI and data protection',
  },

  // US Regulatory Bodies
  {
    id: 'ftc-ai-enforcement',
    name: 'FTC - AI Enforcement Actions',
    type: 'RSS',
    url: 'https://www.ftc.gov/news-events/rss-feeds',
    verified: true,
    jurisdiction: 'US',
    category: ['Regulatory Update', 'Enforcement'],
    enabled: true,
    description: 'FTC enforcement actions related to AI',
  },
  {
    id: 'nist-ai-standards',
    name: 'NIST - AI Standards',
    type: 'RSS',
    url: 'https://www.nist.gov/rss-feeds',
    verified: true,
    jurisdiction: 'US',
    category: ['Standards', 'NIST'],
    enabled: true,
    description: 'NIST AI standards and guidelines',
  },

  // Reputable News Sources
  {
    id: 'techcrunch-ai',
    name: 'TechCrunch - AI',
    type: 'RSS',
    url: 'https://techcrunch.com/tag/artificial-intelligence/feed/',
    verified: true,
    jurisdiction: 'Global',
    category: ['News', 'AI Technology'],
    enabled: true,
    description: 'TechCrunch coverage of AI governance and regulation',
  },
  {
    id: 'mit-tech-review-ai',
    name: 'MIT Technology Review - AI',
    type: 'RSS',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/',
    verified: true,
    jurisdiction: 'Global',
    category: ['News', 'Research'],
    enabled: true,
    description: 'MIT Technology Review on AI governance',
  },

  // Standards Organizations
  {
    id: 'iso-ai-standards',
    name: 'ISO - AI Standards',
    type: 'RSS',
    url: 'https://www.iso.org/rss/rss-news.html',
    verified: true,
    jurisdiction: 'Global',
    category: ['Standards', 'ISO'],
    enabled: false, // Disabled until we can filter for AI-specific content
    description: 'ISO standards updates (needs filtering for AI content)',
  },
];

/**
 * Get enabled sources
 */
export function getEnabledSources(): ScanSource[] {
  return VERIFIED_SOURCES.filter(source => source.enabled);
}

/**
 * Get sources by jurisdiction
 */
export function getSourcesByJurisdiction(jurisdiction: string): ScanSource[] {
  return VERIFIED_SOURCES.filter(
    source => source.enabled && source.jurisdiction === jurisdiction
  );
}

/**
 * Get sources by category
 */
export function getSourcesByCategory(category: string): ScanSource[] {
  return VERIFIED_SOURCES.filter(
    source => source.enabled && source.category.includes(category)
  );
}

