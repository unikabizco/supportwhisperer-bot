
/**
 * Caching service for web browsing requests
 * @module services/browsing/cache
 */
import { BrowsingResponse } from './types';

// In-memory cache for browsing responses
const browsingCache: Record<string, { response: BrowsingResponse; expiresAt: number }> = {};

/**
 * Stores a browsing response in the cache
 * @param url - The URL that was browsed
 * @param response - The browsing response
 * @param cacheTime - Time in seconds to cache this response
 */
export function cacheResponse(url: string, response: BrowsingResponse, cacheTime: number): void {
  const expiresAt = Date.now() + cacheTime * 1000;
  browsingCache[url] = { response, expiresAt };
  
  // Set the source to cache for future retrievals
  response.source = 'cache';
  
  console.log(`Cached browsing response for ${url} for ${cacheTime} seconds`);
}

/**
 * Gets a cached browsing response if available and not expired
 * @param url - The URL to retrieve from cache
 * @returns The cached response or null if not found or expired
 */
export function getCachedResponse(url: string): BrowsingResponse | null {
  const cached = browsingCache[url];
  
  if (!cached) {
    return null;
  }
  
  // Check if the cached response has expired
  if (cached.expiresAt < Date.now()) {
    // Remove expired cache entry
    delete browsingCache[url];
    return null;
  }
  
  return cached.response;
}

/**
 * Clears all cached browsing responses
 */
export function clearCache(): void {
  Object.keys(browsingCache).forEach(key => {
    delete browsingCache[key];
  });
  console.log('Browsing cache cleared');
}

/**
 * Gets statistics about the current cache
 */
export function getCacheStats(): { size: number; urls: string[] } {
  return {
    size: Object.keys(browsingCache).length,
    urls: Object.keys(browsingCache)
  };
}
