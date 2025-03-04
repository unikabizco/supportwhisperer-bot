
/**
 * Claude API client for handling network requests with retry logic
 * @module services/claude/apiClient
 */
import { ClaudeRequest, ClaudeResponse, MAX_RETRIES, RETRY_DELAY_MS, CONNECTION_TIMEOUT_MS } from './types';

/**
 * Sends a request to Claude API with exponential backoff retry logic
 * @param request - The Claude API request object
 * @param apiKey - Claude API key
 * @param attempt - Current attempt number (for retry logic)
 * @returns Promise with Response object
 */
export async function sendWithRetry(
  request: ClaudeRequest, 
  apiKey: string, 
  attempt = 1
): Promise<Response> {
  try {
    // First check for network connectivity
    if (!navigator.onLine) {
      throw new Error('offline');
    }
    
    // Create an AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT_MS);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Claude API error:', errorData);
        
        // If we've reached max retries, throw an error
        if (attempt >= MAX_RETRIES) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // For 429 (rate limit) or 5xx errors, retry with exponential backoff
        if (response.status === 429 || response.status >= 500) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`Retrying request (attempt ${attempt + 1}) after ${delay}ms`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return sendWithRetry(request, apiKey, attempt + 1);
        }
        
        // For other errors, throw immediately
        throw new Error(`API error: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Check if the error was caused by the timeout
      if (error.name === 'AbortError') {
        throw new Error('timeout');
      }
      
      // Rethrow network errors with better detection
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        throw new Error('network');
      }
      
      throw error;
    }
  } catch (error) {
    // Check if retry is appropriate
    if (attempt < MAX_RETRIES && 
        error.message !== 'offline' &&
        error.message !== 'timeout' &&
        error.message !== 'network') {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`Retrying request (attempt ${attempt + 1}) after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendWithRetry(request, apiKey, attempt + 1);
    }
    
    throw error;
  }
}

/**
 * Processes Claude API response
 * @param response - Response from Claude API
 * @returns Parsed Claude response
 */
export async function processResponse(response: Response): Promise<ClaudeResponse> {
  return await response.json() as ClaudeResponse;
}
