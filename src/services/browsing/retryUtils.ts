
/**
 * Retry utility for web browsing service
 * @module services/browsing/retryUtils
 */

// Maximum number of retries for failed network requests
export const MAX_RETRIES = 3;
// Base delay for exponential backoff (in milliseconds)
export const BASE_RETRY_DELAY = 1000;

/**
 * Implements an exponential backoff delay
 * @param attempt - Current attempt number (0-based)
 * @returns Promise that resolves after the calculated delay
 */
export async function exponentialBackoffDelay(attempt: number): Promise<void> {
  const delayMs = BASE_RETRY_DELAY * Math.pow(2, attempt);
  console.log(`Retrying after ${delayMs}ms delay...`);
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

/**
 * Determines if an error is eligible for retry
 * @param error - The error to evaluate
 * @returns Boolean indicating if retry is appropriate
 */
export function isRetryableError(error: Error): boolean {
  return (
    error.name === 'AbortError' || 
    error.message.includes('NetworkError') ||
    error.message.includes('network') ||
    error.message.includes('CORS')
  );
}

/**
 * Determines if an HTTP response status warrants a retry
 * @param status - HTTP status code
 * @returns Boolean indicating if retry is appropriate
 */
export function isRetryableStatus(status: number): boolean {
  // Retry on rate limiting (429) or server errors (5xx)
  return status === 429 || status >= 500;
}
