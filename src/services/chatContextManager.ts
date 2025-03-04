/**
 * Chat Context Management Service
 * Handles efficient storage and retrieval of conversation history
 * with optimizations for token usage and context retention
 */

// Define types for our context management
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

interface ConversationContext {
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

const MAX_CONTEXT_SIZE = 20; // Maximum number of messages to keep
const CONTEXT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const STORAGE_KEY = 'chat_context';

/**
 * ChatContextManager provides methods to efficiently manage conversation context
 * for Claude AI, optimizing for token usage while preserving critical information
 */
export const chatContextManager = {
  /**
   * Retrieves the current conversation context from localStorage
   */
  getContext(): ConversationContext | null {
    const storedContext = localStorage.getItem(STORAGE_KEY);
    if (!storedContext) return null;
    
    try {
      const context = JSON.parse(storedContext) as ConversationContext;
      
      // Check if context has expired
      if (Date.now() - context.metadata.lastUpdated > CONTEXT_EXPIRY) {
        this.clearContext();
        return null;
      }
      
      return context;
    } catch (error) {
      console.error('Error parsing stored context:', error);
      this.clearContext();
      return null;
    }
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
    this.updateContextMetadata(context, message);
    
    // Save the updated context
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    
    return context;
  },
  
  /**
   * Extracts and updates metadata from message content
   */
  updateContextMetadata(context: ConversationContext, message: ChatMessage): void {
    if (message.role !== 'user') return;
    
    const content = message.content.toLowerCase();
    
    // Extract product interests
    const productCategories = [
      'smartphone', 'laptop', 'tablet', 'headphones', 'tv', 'camera', 
      'speaker', 'smartwatch', 'gaming'
    ];
    
    const foundProducts = productCategories.filter(product => 
      content.includes(product)
    );
    
    if (foundProducts.length > 0) {
      context.metadata.productInterests = [
        ...(context.metadata.productInterests || []),
        ...foundProducts
      ].filter((item, index, array) => array.indexOf(item) === index); // Deduplicate
    }
    
    // Extract order references (simple pattern matching for demonstration)
    const orderMatch = content.match(/order\s+(?:number|#)?\s*(\w{2,}-\d{4,}|\d{5,})/i);
    if (orderMatch && orderMatch[1]) {
      context.metadata.orderReferences = [
        ...(context.metadata.orderReferences || []),
        orderMatch[1]
      ].filter((item, index, array) => array.indexOf(item) === index);
    }
    
    // Extract support topics
    const supportTopics = [
      'return', 'refund', 'shipping', 'delivery', 'warranty', 
      'repair', 'troubleshoot', 'setup', 'broken', 'help'
    ];
    
    const foundTopics = supportTopics.filter(topic => 
      content.includes(topic)
    );
    
    if (foundTopics.length > 0) {
      context.metadata.supportTopics = [
        ...(context.metadata.supportTopics || []),
        ...foundTopics
      ].filter((item, index, array) => array.indexOf(item) === index);
    }
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
    localStorage.removeItem(STORAGE_KEY);
  },
  
  /**
   * Gets the number of messages in the current context
   */
  getContextSize(): number {
    const context = this.getContext();
    return context ? context.messages.length : 0;
  }
};
