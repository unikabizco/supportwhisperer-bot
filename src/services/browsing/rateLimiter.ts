
/**
 * Rate limiting service for web browsing requests
 * @module services/browsing/rateLimiter
 */

interface RateLimitTracker {
  domain: string;
  requestTimes: number[]; // Timestamps of requests
  limit: number; // Max requests per minute
}

// In-memory storage for rate limiting
const rateLimits: Record<string, RateLimitTracker> = {};

/**
 * Checks if a request to the domain would exceed rate limits
 * @param domain - The domain to check
 * @param limit - Maximum requests per minute
 * @returns boolean indicating if the request is allowed
 */
export function canMakeRequest(domain: string, limit: number): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000; // 1 minute in milliseconds
  
  // Initialize rate limit tracker if it doesn't exist
  if (!rateLimits[domain]) {
    rateLimits[domain] = {
      domain,
      requestTimes: [],
      limit
    };
  }
  
  const tracker = rateLimits[domain];
  
  // Remove request timestamps older than 1 minute
  tracker.requestTimes = tracker.requestTimes.filter(time => time >= oneMinuteAgo);
  
  // Check if adding a new request would exceed the limit
  if (tracker.requestTimes.length >= tracker.limit) {
    console.log(`Rate limit exceeded for domain: ${domain}`);
    return false;
  }
  
  return true;
}

/**
 * Records a request to the domain
 * @param domain - The domain being requested
 */
export function recordRequest(domain: string): void {
  if (!rateLimits[domain]) {
    return;
  }
  
  rateLimits[domain].requestTimes.push(Date.now());
}

/**
 * Gets current rate limit status for all domains
 */
export function getRateLimitStatus(): Record<string, { current: number; limit: number }> {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  const status: Record<string, { current: number; limit: number }> = {};
  
  Object.keys(rateLimits).forEach(domain => {
    const tracker = rateLimits[domain];
    const currentCount = tracker.requestTimes.filter(time => time >= oneMinuteAgo).length;
    
    status[domain] = {
      current: currentCount,
      limit: tracker.limit
    };
  });
  
  return status;
}
