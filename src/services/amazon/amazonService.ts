
/**
 * Amazon product data service
 * @module services/amazon/amazonService
 */
import { ProductSearchParams, ProductSearchResult, ProductDetailsResult } from './types';
import { amazonProductSearch } from './amazonProductSearch';
import { amazonProductDetails } from './amazonProductDetails';
import { amazonPriceComparison } from './amazonPriceComparison';

/**
 * Service to handle Amazon product data retrieval
 */
export const amazonService = {
  /**
   * Search for products on Amazon
   * @param params - Search parameters
   * @returns Promise with search results
   */
  async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
    return amazonProductSearch.searchProducts(params);
  },
  
  /**
   * Get detailed information for a specific product by ASIN
   * @param asin - Amazon Standard Identification Number
   * @returns Promise with product details
   */
  async getProductDetails(asin: string): Promise<ProductDetailsResult> {
    return amazonProductDetails.getProductDetails(asin);
  },
  
  /**
   * Compare our price with Amazon's price for a product
   * @param asin - Amazon Standard Identification Number
   * @param ourPrice - Our price for the product
   * @returns Comparison result
   */
  async comparePrice(asin: string, ourPrice: number) {
    return amazonPriceComparison.comparePrice(asin, ourPrice);
  }
};
