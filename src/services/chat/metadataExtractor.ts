
/**
 * Metadata extraction service
 * Analyzes chat messages to extract useful metadata
 */
import { ChatMessage, ConversationContext } from './types';

/**
 * Extracts and updates metadata from message content
 */
export function updateContextMetadata(context: ConversationContext, message: ChatMessage): void {
  if (message.role !== 'user') return;
  
  const content = message.content.toLowerCase();
  
  // Extract product interests
  extractProductInterests(context, content);
  
  // Extract order references
  extractOrderReferences(context, content);
  
  // Extract support topics
  extractSupportTopics(context, content);
}

/**
 * Extracts product interests from message content
 */
function extractProductInterests(context: ConversationContext, content: string): void {
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
}

/**
 * Extracts order references from message content
 */
function extractOrderReferences(context: ConversationContext, content: string): void {
  const orderMatch = content.match(/order\s+(?:number|#)?\s*(\w{2,}-\d{4,}|\d{5,})/i);
  if (orderMatch && orderMatch[1]) {
    context.metadata.orderReferences = [
      ...(context.metadata.orderReferences || []),
      orderMatch[1]
    ].filter((item, index, array) => array.indexOf(item) === index);
  }
}

/**
 * Extracts support topics from message content
 */
function extractSupportTopics(context: ConversationContext, content: string): void {
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
}
