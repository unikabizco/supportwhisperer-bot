
/**
 * Web browsing service module exports
 * @module services/browsing
 */
export * from './types';
export * from './allowlist';
export * from './cache';
export * from './rateLimiter';
export * from './contentExtractor';
export { browsingService } from './browsingService';

// Add proxy-based browsing approaches in future iterations
