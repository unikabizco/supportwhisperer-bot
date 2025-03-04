
/**
 * Security module for web browsing service
 * @module services/browsing/browsingSecurity
 */

/**
 * Validates a URL for security concerns
 * @param url - URL to validate
 * @returns Object with validation result and any issues found
 */
export function validateUrl(url: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for valid URL format
  try {
    const urlObj = new URL(url);
    
    // Ensure protocol is http or https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      issues.push(`Invalid protocol: ${urlObj.protocol}`);
    }
    
    // Check for potential XSS in URL parameters
    const hasXssAttempt = urlObj.search.includes('<script') || 
                          urlObj.search.includes('javascript:') ||
                          urlObj.search.includes('onerror=') ||
                          urlObj.search.includes('onclick=');
    
    if (hasXssAttempt) {
      issues.push('Potential XSS detected in URL parameters');
    }
    
    // Check for potentially unsafe URL paths
    const hasUnsafePath = urlObj.pathname.includes('admin') ||
                        urlObj.pathname.includes('login') ||
                        urlObj.pathname.includes('account') ||
                        urlObj.pathname.includes('checkout');
                        
    if (hasUnsafePath) {
      issues.push('URL path contains potentially restricted area');
    }
    
  } catch (error) {
    issues.push('Invalid URL format');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Sanitizes HTML content to remove potentially harmful elements
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeHtmlContent(html: string): string {
  // For a real implementation, use a proper HTML sanitizer library
  // This is a simplified version for demonstration purposes
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove onclick, onerror, and other event handlers
  sanitized = sanitized.replace(/\s(on\w+)="[^"]*"/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  
  // Remove embed tags
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  
  // Remove form tags
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  
  return sanitized;
}

/**
 * Logs a browsing security event
 * @param eventType - Type of security event
 * @param url - URL involved in the event
 * @param details - Additional details about the event
 */
export function logSecurityEvent(eventType: string, url: string, details: string): void {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] ${timestamp} - ${eventType} - ${url} - ${details}`);
  
  // In a production environment, this would log to a secure auditing system
}
