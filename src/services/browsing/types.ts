
/**
 * Type definitions for web browsing service
 * @module services/browsing/types
 */

export interface BrowsingRequest {
  url: string;
  extractionType?: 'full' | 'product' | 'article' | 'review';
  cacheTime?: number; // Time in seconds to cache this request
}

export interface BrowsingResponse {
  success: boolean;
  url: string;
  content?: string;
  metadata?: {
    title?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
    productDetails?: Record<string, string>;
    lastUpdated?: string;
  };
  source: 'cache' | 'live';
  error?: string;
}

export interface AllowedDomain {
  domain: string;
  allowSubdomains: boolean;
  extractionTypes: ('full' | 'product' | 'article' | 'review')[];
  maxRequestsPerMinute: number;
}

// Constants for browsing service
export const DEFAULT_CACHE_TIME = 3600; // 1 hour in seconds
export const MAX_REQUESTS_PER_MINUTE = 10;
export const REQUEST_TIMEOUT_MS = 15000; // 15 seconds
