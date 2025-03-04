
/**
 * Context storage service
 * Handles saving and retrieving conversation context from localStorage
 */
import { ConversationContext, STORAGE_KEY, CONTEXT_EXPIRY } from './types';

/**
 * Saves conversation context to localStorage
 */
export function saveContext(context: ConversationContext): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch (error) {
    console.error('Error saving context to localStorage:', error);
  }
}

/**
 * Retrieves conversation context from localStorage
 */
export function loadContext(): ConversationContext | null {
  const storedContext = localStorage.getItem(STORAGE_KEY);
  if (!storedContext) return null;
  
  try {
    const context = JSON.parse(storedContext) as ConversationContext;
    
    // Check if context has expired
    if (Date.now() - context.metadata.lastUpdated > CONTEXT_EXPIRY) {
      clearContext();
      return null;
    }
    
    return context;
  } catch (error) {
    console.error('Error parsing stored context:', error);
    clearContext();
    return null;
  }
}

/**
 * Clears conversation context from localStorage
 */
export function clearContext(): void {
  localStorage.removeItem(STORAGE_KEY);
}
