
/**
 * Type definitions for Amazon product service
 * @module services/amazon/types
 */

export interface AmazonProduct {
  asin: string;
  title: string;
  description: string;
  price?: {
    amount: number;
    currency: string;
    formattedPrice: string;
  };
  images: string[];
  rating?: {
    value: number;
    count: number;
  };
  features: string[];
  specifications: Record<string, string>;
  url: string;
  lastUpdated: string;
}

export interface ProductSearchParams {
  keywords: string;
  category?: string;
  maxResults?: number;
}

export interface ProductSearchResult {
  success: boolean;
  products: AmazonProduct[];
  totalResults?: number;
  error?: string;
}

export interface ProductDetailsResult {
  success: boolean;
  product?: AmazonProduct;
  error?: string;
}

// Constants for Amazon service
export const CACHE_EXPIRY_TIME = 3600; // 1 hour in seconds
export const DEFAULT_MAX_RESULTS = 5;
