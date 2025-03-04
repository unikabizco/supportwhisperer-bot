/**
 * Chat Context Management Service
 * Handles efficient storage and retrieval of conversation history
 * with optimizations for token usage and context retention
 */
import { ChatMessage, ConversationContext, MAX_CONTEXT_SIZE } from './types';
import { updateContextMetadata } from './metadataExtractor';
import { saveContext, loadContext, clearContext } from './contextStorage';

/**
 * ChatContextManager provides methods to efficiently manage conversation context
 * for Claude AI, optimizing for token usage while preserving critical information
 */
export const chatContextManager = {
  /**
   * Retrieves the current conversation context from localStorage
   */
  getContext(): ConversationContext | null {
    return loadContext();
  },
  
  /**
   * Adds a new message to the conversation context
   */
  addMessage(message: ChatMessage): ConversationContext {
    const context = this.getContext() || {
      messages: [],
      metadata: {
        lastUpdated: Date.now()
      }
    };
    
    // Add timestamp if not provided
    if (!message.timestamp) {
      message.timestamp = Date.now();
    }
    
    // Add the new message
    context.messages.push(message);
    
    // Trim context if it exceeds maximum size
    if (context.messages.length > MAX_CONTEXT_SIZE) {
      // Keep system message if it exists
      const systemMessages = context.messages.filter(msg => msg.role === 'system');
      // Keep most recent user and assistant messages
      const recentMessages = context.messages
        .filter(msg => msg.role !== 'system')
        .slice(-MAX_CONTEXT_SIZE + systemMessages.length);
      
      context.messages = [...systemMessages, ...recentMessages];
    }
    
    // Update metadata
    context.metadata.lastUpdated = Date.now();
    
    // Extract potential product interests, order references, etc.
    updateContextMetadata(context, message);
    
    // Save the updated context
    saveContext(context);
    
    return context;
  },
  
  /**
   * Gets all messages from context formatted for Claude API
   */
  getMessagesForClaudeAPI(): ChatMessage[] {
    const context = this.getContext();
    if (!context) return [];
    
    // Return only the messages array for Claude API
    return context.messages;
  },
  
  /**
   * Gets a summary of the current context metadata for enhancing prompts
   */
  getContextSummary(): string {
    const context = this.getContext();
    if (!context || !context.metadata) return '';
    
    const parts = [];
    
    if (context.metadata.productInterests?.length) {
      parts.push(`Customer has expressed interest in: ${context.metadata.productInterests.join(', ')}.`);
    }
    
    if (context.metadata.orderReferences?.length) {
      parts.push(`Referenced order(s): ${context.metadata.orderReferences.join(', ')}.`);
    }
    
    if (context.metadata.supportTopics?.length) {
      parts.push(`Support topics mentioned: ${context.metadata.supportTopics.join(', ')}.`);
    }
    
    return parts.join(' ');
  },
  
  /**
   * Clears the conversation context
   */
  clearContext(): void {
    clearContext();
  },
  
  /**
   * Gets the number of messages in the current context
   */
  getContextSize(): number {
    const context = this.getContext();
    return context ? context.messages.length : 0;
  }
};
