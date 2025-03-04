
/**
 * Amazon URL generation utilities
 * @module services/amazon/amazonUrlUtils
 */
import { ProductSearchParams } from './types';

/**
 * Utilities for constructing Amazon URLs
 */
export const amazonUrlUtils = {
  /**
   * Constructs an Amazon search URL from search parameters
   */
  constructSearchUrl(params: ProductSearchParams): string {
    const baseUrl = 'https://www.amazon.com/s';
    const searchParams = new URLSearchParams();
    
    searchParams.append('k', params.keywords);
    
    if (params.category) {
      searchParams.append('i', params.category);
    }
    
    return `${baseUrl}?${searchParams.toString()}`;
  },
  
  /**
   * Constructs an Amazon product URL from ASIN
   */
  constructProductUrl(asin: string): string {
    return `https://www.amazon.com/dp/${asin}`;
  }
};
