
/**
 * Chat context management types
 * Defines the structure of chat messages and conversation context
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ConversationContext {
  messages: ChatMessage[];
  metadata: {
    lastUpdated: number;
    productInterests?: string[];
    orderReferences?: string[];
    supportTopics?: string[];
    userPreferences?: {
      language?: string;
      techExpertise?: 'novice' | 'intermediate' | 'expert';
    };
  };
}

// Constants for context management
export const MAX_CONTEXT_SIZE = 20; // Maximum number of messages to keep
export const CONTEXT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const STORAGE_KEY = 'chat_context';
