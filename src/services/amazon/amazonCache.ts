
/**
 * Amazon product data caching utilities
 * @module services/amazon/amazonCache
 */
import { AmazonProduct } from './types';

// In-memory cache for product data
const productCache: Record<string, { product: AmazonProduct; expiresAt: number }> = {};

/**
 * Cache utilities for Amazon product data
 */
export const amazonCache = {
  /**
   * Gets a cached product if available and not expired
   */
  getCachedProduct(asin: string): AmazonProduct | null {
    const cached = productCache[asin];
    
    if (!cached) {
      return null;
    }
    
    // Check if the cached product has expired
    if (cached.expiresAt < Date.now()) {
      // Remove expired cache entry
      delete productCache[asin];
      return null;
    }
    
    return cached.product;
  },
  
  /**
   * Caches a product for future requests
   */
  cacheProduct(asin: string, product: AmazonProduct): void {
    const expiresAt = Date.now() + (3600 * 1000); // 1 hour
    productCache[asin] = { product, expiresAt };
    
    console.log(`Cached product ${asin} for 1 hour`);
  }
};
