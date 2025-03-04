
/**
 * Type definitions for OpenAI API service
 * @module services/openai/types
 */

// Type definitions for OpenAI API
export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  id: string;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Constants for OpenAI API
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1000;
export const CONNECTION_TIMEOUT_MS = 15000; // 15 second timeout
export const DEFAULT_MODEL = "gpt-4o-mini"; // Default OpenAI model
