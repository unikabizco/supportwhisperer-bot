
/**
 * Error handling utilities for Amazon services
 * @module services/amazon/amazonErrorHandler
 */
import { toast } from "sonner";

/**
 * Standard error categories for Amazon service operations
 */
export enum AmazonErrorType {
  NETWORK = 'NETWORK',
  PARSING = 'PARSING',
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATION = 'AUTHENTICATION',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Standardized error response structure for Amazon services
 */
export interface AmazonErrorResponse {
  success: false;
  error: string;
  errorType: AmazonErrorType;
  errorDetails?: Record<string, any>;
}

/**
 * Amazon error handling utilities
 */
export const amazonErrorHandler = {
  /**
   * Creates a standardized error response
   * @param message - Error message
   * @param type - Error type category
   * @param details - Additional error details
   * @returns Standardized error response
   */
  createErrorResponse(
    message: string, 
    type: AmazonErrorType = AmazonErrorType.UNKNOWN,
    details?: Record<string, any>
  ): AmazonErrorResponse {
    // Log the error for debugging purposes
    console.error(`Amazon service error (${type}):`, message, details || '');
    
    return {
      success: false,
      error: message,
      errorType: type,
      errorDetails: details
    };
  },
  
  /**
   * Handles errors from Amazon operations and returns standardized response
   * @param error - The caught error object
   * @param operation - Name of the operation that failed
   * @returns Standardized error response
   */
  handleError(error: unknown, operation: string): AmazonErrorResponse {
    // Determine error type and create appropriate message
    if (error instanceof Error) {
      // Network errors
      if (
        error.message.includes('network') || 
        error.message.includes('fetch') ||
        error.message.includes('connection')
      ) {
        toast.error("Network error when accessing Amazon data. Please check your connection.");
        return this.createErrorResponse(
          `Network error during ${operation}`,
          AmazonErrorType.NETWORK
        );
      }
      
      // Timeout errors
      if (error.message.includes('timeout')) {
        toast.error("Request timed out when accessing Amazon data.");
        return this.createErrorResponse(
          `Request timed out during ${operation}`,
          AmazonErrorType.TIMEOUT
        );
      }
      
      // Rate limiting errors
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        toast.error("Amazon rate limit exceeded. Please try again later.");
        return this.createErrorResponse(
          `Rate limit exceeded during ${operation}`,
          AmazonErrorType.RATE_LIMIT
        );
      }
      
      // Not found errors
      if (error.message.includes('404') || error.message.includes('not found')) {
        return this.createErrorResponse(
          `Resource not found during ${operation}`,
          AmazonErrorType.NOT_FOUND
        );
      }
      
      // Authentication errors
      if (error.message.includes('401') || error.message.includes('auth')) {
        toast.error("Authentication error when accessing Amazon. Please check credentials.");
        return this.createErrorResponse(
          `Authentication error during ${operation}`,
          AmazonErrorType.AUTHENTICATION
        );
      }
      
      // Parsing errors
      if (error.message.includes('parse') || error.message.includes('invalid JSON')) {
        return this.createErrorResponse(
          `Error parsing data during ${operation}`,
          AmazonErrorType.PARSING
        );
      }
      
      // Default case - unknown error with message
      return this.createErrorResponse(
        `Error during ${operation}: ${error.message}`,
        AmazonErrorType.UNKNOWN
      );
    }
    
    // Default case for non-Error objects
    return this.createErrorResponse(
      `Unknown error during ${operation}`,
      AmazonErrorType.UNKNOWN,
      { rawError: String(error) }
    );
  }
};
