
/**
 * Web browsing service for e-commerce chatbot
 * @module services/browsing/browsingService
 */
import { toast } from "sonner";
import { BrowsingRequest, BrowsingResponse, DEFAULT_CACHE_TIME, REQUEST_TIMEOUT_MS } from './types';
import { isUrlAllowed } from './allowlist';
import { cacheResponse, getCachedResponse } from './cache';
import { canMakeRequest, recordRequest } from './rateLimiter';
import { extractContent } from './contentExtractor';

// Maximum number of retries for failed network requests
const MAX_RETRIES = 3;
// Base delay for exponential backoff (in milliseconds)
const BASE_RETRY_DELAY = 1000;

/**
 * Service to handle secure web browsing for the chatbot
 */
export const browsingService = {
  /**
   * Browse a URL with security checks and caching
   * @param request - The browsing request
   * @returns Promise with browsing response
   */
  async browseUrl(request: BrowsingRequest): Promise<BrowsingResponse> {
    try {
      // Validate URL format
      let url;
      try {
        url = new URL(request.url);
        // Ensure protocol is http or https
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          throw new Error('Invalid URL protocol');
        }
      } catch (error) {
        return {
          success: false,
          url: request.url,
          source: 'live',
          error: 'Invalid URL format'
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
      
      // Implement fetch with retries and exponential backoff
      return await this.fetchWithRetries(request, url, domain, cacheKey, extractionType);
    } catch (error) {
      console.error('Error browsing URL:', error);
      
      return {
        success: false,
        url: request.url,
        source: 'live',
        error: `Error browsing URL: ${error.message || 'Unknown error'}`
      };
    }
  },
  
  /**
   * Fetch URL content with retries and exponential backoff
   * @private
   */
  async fetchWithRetries(
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
        
        // Create fetch request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        
        // Use a more specific User-Agent that might be less likely to be blocked
        const response = await fetch(request.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
          },
          signal: controller.signal,
          // Adding no-cors mode may help with CORS issues but limits response usage
          // mode: 'no-cors',
          credentials: 'omit',
          redirect: 'follow'
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // If we get here, we've successfully made the request
        if (!response.ok) {
          const errorMsg = `HTTP error: ${response.status}`;
          console.error(errorMsg);
          lastError = new Error(errorMsg);
          
          // For 429 (rate limit) or 5xx (server error), retry with backoff
          if (response.status === 429 || response.status >= 500) {
            await this.delay(attempt);
            continue;
          } else {
            // For other HTTP errors, don't retry
            break;
          }
        }
        
        // Successfully got a response - process it
        const html = await response.text();
        
        // Extract relevant content
        const { content, metadata } = extractContent(html, request.url, extractionType);
        
        // Create successful response
        const browsingResponse: BrowsingResponse = {
          success: true,
          url: request.url,
          content,
          metadata,
          source: 'live'
        };
        
        // Cache the response
        const cacheTime = request.cacheTime || DEFAULT_CACHE_TIME;
        cacheResponse(cacheKey, browsingResponse, cacheTime);
        
        return browsingResponse;
      } catch (error) {
        console.error(`Fetch error (attempt ${attempt + 1}):`, error);
        lastError = error;
        
        // If it's a timeout, network error, or CORS issue, retry with backoff
        if (
          error.name === 'AbortError' || 
          error.message.includes('NetworkError') ||
          error.message.includes('network') ||
          error.message.includes('CORS')
        ) {
          if (attempt < MAX_RETRIES - 1) {
            await this.delay(attempt);
            continue;
          }
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
  },
  
  /**
   * Delay with exponential backoff
   * @private
   */
  async delay(attempt: number): Promise<void> {
    const delayMs = BASE_RETRY_DELAY * Math.pow(2, attempt);
    console.log(`Retrying after ${delayMs}ms delay...`);
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }
};
