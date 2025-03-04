
/**
 * Amazon price comparison utilities
 * @module services/amazon/amazonPriceComparison
 */
import { amazonProductDetails } from './amazonProductDetails';
import { amazonErrorHandler, AmazonErrorType } from './amazonErrorHandler';

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
    errorType?: string;
  }> {
    try {
      // Validate inputs
      if (!asin || asin.trim() === '') {
        return {
          success: false,
          error: 'ASIN cannot be empty',
          errorType: AmazonErrorType.VALIDATION
        };
      }
      
      if (typeof ourPrice !== 'number' || isNaN(ourPrice)) {
        return {
          success: false,
          error: 'Our price must be a valid number',
          errorType: AmazonErrorType.VALIDATION
        };
      }
      
      // Get product details
      const productResult = await amazonProductDetails.getProductDetails(asin);
      
      if (!productResult.success || !productResult.product) {
        return {
          success: false,
          error: productResult.error || 'Failed to retrieve product for price comparison',
          errorType: productResult.errorType || AmazonErrorType.UNKNOWN,
          errorDetails: productResult.errorDetails
        };
      }
      
      const amazonPrice = productResult.product.price?.amount || 0;
      
      if (amazonPrice === 0) {
        return {
          success: false,
          error: 'Amazon price not available for comparison',
          errorType: AmazonErrorType.NOT_FOUND
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
      return {
        success: false,
        error: `Error during price comparison: ${error instanceof Error ? error.message : String(error)}`,
        errorType: AmazonErrorType.UNKNOWN
      };
    }
  }
};
