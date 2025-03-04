
/**
 * Network utilities for web browsing service
 * @module services/browsing/networkUtils
 */
import { REQUEST_TIMEOUT_MS } from './types';

/**
 * Standard browser-like request headers to improve compatibility with websites
 */
export const BROWSER_HEADERS = {
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
};

/**
 * Creates a fetch request with timeout and appropriate headers
 * @param url - The URL to fetch
 * @returns Promise with the fetch response
 */
export async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: BROWSER_HEADERS,
      signal: controller.signal,
      credentials: 'omit',
      redirect: 'follow'
    });
    
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validates a URL string for basic correctness and security
 * @param urlString - URL to validate
 * @returns Object with URL object and validation result
 */
export function validateUrl(urlString: string): { 
  isValid: boolean; 
  url?: URL; 
  error?: string;
} {
  try {
    const url = new URL(urlString);
    
    // Ensure protocol is http or https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { 
        isValid: false, 
        error: 'Invalid URL protocol. Only HTTP and HTTPS are supported.' 
      };
    }
    
    return { isValid: true, url };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid URL format' 
    };
  }
}
