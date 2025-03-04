
/**
 * Core browsing functionality for web browsing service
 * @module services/browsing/browsingCore
 */
import { toast } from "sonner";
import { BrowsingRequest, BrowsingResponse } from './types';
import { isUrlAllowed } from './allowlist';
import { cacheResponse, getCachedResponse } from './cache';
import { canMakeRequest, recordRequest } from './rateLimiter';
import { extractContent } from './contentExtractor';
import { validateUrl, fetchWithTimeout } from './networkUtils';
import { MAX_RETRIES, exponentialBackoffDelay, isRetryableError, isRetryableStatus } from './retryUtils';

/**
 * Core function to browse a URL with all security checks and validation
 * @param request - The browsing request
 * @returns Promise with browsing response
 */
export async function browseUrl(request: BrowsingRequest): Promise<BrowsingResponse> {
  try {
    // Validate URL format
    const { isValid, url, error } = validateUrl(request.url);
    if (!isValid || !url) {
      return {
        success: false,
        url: request.url,
        source: 'live',
        error: error || 'Invalid URL'
      };
    }
    
    // Check if URL is in allowlist
    const { allowed, domain } = isUrlAllowed(request.url);
    if (!allowed || !domain) {
      return {
        success: false,
        url: request.url,
        source: 'live',
        error: 'URL not in allowed domains list'
      };
    }
    
    // Determine extraction type based on allowed types for this domain
    const extractionType = request.extractionType && 
      domain.extractionTypes.includes(request.extractionType) ? 
      request.extractionType : 'full';
    
    // Check cache first
    const cacheKey = `${request.url}:${extractionType}`;
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log(`Using cached response for ${request.url}`);
      return cachedResponse;
    }
    
    // Check rate limits
    if (!canMakeRequest(domain.domain, domain.maxRequestsPerMinute)) {
      return {
        success: false,
        url: request.url,
        source: 'live',
        error: `Rate limit exceeded for ${domain.domain}`
      };
    }
    
    // Record the request for rate limiting
    recordRequest(domain.domain);
    
    // Fetch with retries
    return await fetchWithRetries(request, url, domain, cacheKey, extractionType);
  } catch (error) {
    console.error('Error browsing URL:', error);
    
    return {
      success: false,
      url: request.url,
      source: 'live',
      error: `Error browsing URL: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Fetch URL content with retries and exponential backoff
 * @private
 */
async function fetchWithRetries(
  request: BrowsingRequest, 
  url: URL, 
  domain: any, 
  cacheKey: string, 
  extractionType: string
): Promise<BrowsingResponse> {
  let lastError = null;
  
  // Try up to MAX_RETRIES times
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching ${request.url}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`);
      
      // Fetch the URL with timeout
      const response = await fetchWithTimeout(request.url);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorMsg = `HTTP error: ${response.status}`;
        console.error(errorMsg);
        lastError = new Error(errorMsg);
        
        // For retryable status codes, retry with backoff
        if (isRetryableStatus(response.status)) {
          await exponentialBackoffDelay(attempt);
          continue;
        } else {
          // For other HTTP errors, don't retry
          break;
        }
      }
      
      // Successfully got a response - process it
      const html = await response.text();
      
      // Extract relevant content
      const typedExtractionType = extractionType as 'full' | 'product' | 'article' | 'review';
      const { content, metadata } = extractContent(html, request.url, typedExtractionType);
      
      // Create successful response
      const browsingResponse: BrowsingResponse = {
        success: true,
        url: request.url,
        content,
        metadata,
        source: 'live'
      };
      
      // Cache the response
      const cacheTime = request.cacheTime || domain.defaultCacheTime;
      cacheResponse(cacheKey, browsingResponse, cacheTime);
      
      return browsingResponse;
    } catch (error) {
      console.error(`Fetch error (attempt ${attempt + 1}):`, error);
      lastError = error;
      
      // If it's a retryable error, retry with backoff
      if (isRetryableError(error) && attempt < MAX_RETRIES - 1) {
        await exponentialBackoffDelay(attempt);
        continue;
      }
      
      // For other errors, don't retry
      break;
    }
  }
  
  // If we get here, all retries failed
  return {
    success: false,
    url: request.url,
    source: 'live',
    error: lastError ? `Error: ${lastError.message}` : 'Failed after maximum retry attempts'
  };
}
