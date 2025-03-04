
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
      
      // Create fetch request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      
      try {
        console.log(`Fetching ${request.url}`);
        
        // Make the request using fetch API
        const response = await fetch(request.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 Support Chatbot Browser/1.0',
            'Accept': 'text/html',
          },
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          return {
            success: false,
            url: request.url,
            source: 'live',
            error: `HTTP error: ${response.status}`
          };
        }
        
        // Get HTML content
        const html = await response.text();
        
        // Extract relevant content based on extraction type
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
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          return {
            success: false,
            url: request.url,
            source: 'live',
            error: 'Request timed out'
          };
        }
        
        throw error; // Re-throw for general error handling
      }
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
};
