
/**
 * Type definitions for Claude AI API service
 * @module services/claude/types
 */

// Type definitions for Claude API
export interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  temperature?: number;
  system?: string;
}

export interface ClaudeResponse {
  content: Array<{
    text: string;
    type: string;
  }>;
  id: string;
  model: string;
  role: string;
  type: string;
}

// Constants for Claude API
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1000;
export const CONNECTION_TIMEOUT_MS = 15000; // 15 second timeout
export const DEFAULT_MODEL = "claude-3-sonnet-20240229";
