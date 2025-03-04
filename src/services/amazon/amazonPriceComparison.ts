
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
        return amazonErrorHandler.createErrorResponse(
          'ASIN cannot be empty',
          AmazonErrorType.VALIDATION
        );
      }
      
      if (typeof ourPrice !== 'number' || isNaN(ourPrice)) {
        return amazonErrorHandler.createErrorResponse(
          'Our price must be a valid number',
          AmazonErrorType.VALIDATION
        );
      }
      
      // Get product details
      const productResult = await amazonProductDetails.getProductDetails(asin);
      
      if (!productResult.success || !productResult.product) {
        return amazonErrorHandler.createErrorResponse(
          productResult.error || 'Failed to retrieve product for price comparison',
          AmazonErrorType.UNKNOWN,
          { originalError: productResult.error }
        );
      }
      
      const amazonPrice = productResult.product.price?.amount || 0;
      
      if (amazonPrice === 0) {
        return amazonErrorHandler.createErrorResponse(
          'Amazon price not available for comparison',
          AmazonErrorType.NOT_FOUND
        );
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
      return amazonErrorHandler.handleError(error, 'price comparison');
    }
  }
};
