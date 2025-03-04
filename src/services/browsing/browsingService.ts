
/**
 * Web browsing service for e-commerce chatbot
 * @module services/browsing/browsingService
 */
import { BrowsingRequest, BrowsingResponse } from './types';
import { browseUrl } from './browsingCore';

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
    return browseUrl(request);
  }
};
