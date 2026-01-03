/**
 * Fetcher for publicly available AI Governance standards and frameworks
 * Fetches content from public URLs (no authentication required)
 */

import * as https from 'https';
import * as http from 'http';
import { GovernanceStandard } from './standards';

export interface FetchedContent {
  title: string;
  content: string;
  source: string;
  url: string;
  fetchedAt: Date;
}

/**
 * Fetch content from a public URL
 * Handles HTML pages, PDFs, and plain text
 */
export async function fetchPublicContent(
  standard: GovernanceStandard
): Promise<FetchedContent | null> {
  try {
    console.log(`[STANDARDS_FETCHER] Fetching: ${standard.name} from ${standard.url}`);
    
    const url = new URL(standard.url);
    const protocol = url.protocol === 'https:' ? https : http;
    
    return new Promise((resolve, reject) => {
      const request = protocol.get(url.href, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          // Try to extract text from HTML
          if (response.headers['content-type']?.includes('text/html')) {
            const textContent = extractTextFromHTML(data);
            resolve({
              title: standard.name,
              content: textContent || data.substring(0, 50000), // Limit to 50k chars
              source: standard.organization,
              url: standard.url,
              fetchedAt: new Date(),
            });
          } else {
            // For PDFs or other formats, we'd need a parser
            // For now, return what we can
            resolve({
              title: standard.name,
              content: data.substring(0, 50000),
              source: standard.organization,
              url: standard.url,
              fetchedAt: new Date(),
            });
          }
        });
      });
      
      request.on('error', (error) => {
        console.error(`[STANDARDS_FETCHER] Error fetching ${standard.name}:`, error.message);
        reject(error);
      });
      
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  } catch (error: any) {
    console.error(`[STANDARDS_FETCHER] Error fetching ${standard.name}:`, error.message);
    return null;
  }
}

/**
 * Extract text content from HTML
 * Simple implementation - removes HTML tags and decodes entities
 */
function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Fetch content from multiple standards in parallel
 */
export async function fetchMultipleStandards(
  standards: GovernanceStandard[]
): Promise<Array<FetchedContent | null>> {
  const results = await Promise.allSettled(
    standards.map(standard => fetchPublicContent(standard))
  );
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : null
  );
}

