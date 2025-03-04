
/**
 * Domain allowlist for web browsing service
 * @module services/browsing/allowlist
 */
import { AllowedDomain } from './types';

/**
 * List of allowed domains for web browsing
 * This serves as a security measure to prevent accessing unauthorized websites
 */
export const ALLOWED_DOMAINS: AllowedDomain[] = [
  {
    domain: 'amazon.com',
    allowSubdomains: true,
    extractionTypes: ['product', 'review'],
    maxRequestsPerMinute: 5,
  },
  {
    domain: 'bestbuy.com',
    allowSubdomains: true,
    extractionTypes: ['product'],
    maxRequestsPerMinute: 5,
  },
  {
    domain: 'support.apple.com',
    allowSubdomains: false,
    extractionTypes: ['article'],
    maxRequestsPerMinute: 10,
  },
  {
    domain: 'samsung.com',
    allowSubdomains: true,
    extractionTypes: ['product', 'article'],
    maxRequestsPerMinute: 10,
  },
  {
    domain: 'wikihow.com',
    allowSubdomains: false,
    extractionTypes: ['article'],
    maxRequestsPerMinute: 10,
  }
];

/**
 * Checks if a URL is in the allowed domains list
 * @param url - The URL to check
 * @returns boolean indicating if the URL is allowed and the matching domain config
 */
export function isUrlAllowed(url: string): { allowed: boolean; domain?: AllowedDomain } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    for (const domain of ALLOWED_DOMAINS) {
      if (domain.allowSubdomains) {
        if (hostname === domain.domain || hostname.endsWith('.' + domain.domain)) {
          return { allowed: true, domain };
        }
      } else {
        if (hostname === domain.domain) {
          return { allowed: true, domain };
        }
      }
    }

    return { allowed: false };
  } catch (error) {
    // Invalid URL format
    return { allowed: false };
  }
}
