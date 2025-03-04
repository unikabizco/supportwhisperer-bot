
/**
 * Amazon price comparison utilities
 * @module services/amazon/amazonPriceComparison
 */
import { amazonService } from './amazonService';

/**
 * Utilities for Amazon price comparisons
 */
export const amazonPriceComparison = {
  /**
   * Compare our price with Amazon's price for a product
   * @param asin - Amazon Standard Identification Number
   * @param ourPrice - Our price for the product
   * @returns Comparison result
   */
  async comparePrice(asin: string, ourPrice: number): Promise<{ 
    success: boolean;
    amazonPrice?: number;
    priceDifference?: number;
    percentageDifference?: number;
    isCheaper?: boolean;
    error?: string;
  }> {
    try {
      // Get product details
      const productResult = await amazonService.getProductDetails(asin);
      
      if (!productResult.success || !productResult.product) {
        return {
          success: false,
          error: productResult.error || 'Failed to retrieve product for price comparison'
        };
      }
      
      const amazonPrice = productResult.product.price?.amount || 0;
      
      if (amazonPrice === 0) {
        return {
          success: false,
          error: 'Amazon price not available for comparison'
        };
      }
      
      // Calculate price difference
      const priceDifference = ourPrice - amazonPrice;
      const percentageDifference = (priceDifference / amazonPrice) * 100;
      
      return {
        success: true,
        amazonPrice,
        priceDifference,
        percentageDifference,
        isCheaper: priceDifference < 0
      };
    } catch (error) {
      console.error('Error comparing prices:', error);
      
      return {
        success: false,
        error: `Error comparing prices: ${error.message || 'Unknown error'}`
      };
    }
  }
};
