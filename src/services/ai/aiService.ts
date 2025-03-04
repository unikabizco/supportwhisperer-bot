/**
 * AI Provider Service
 * Determines which AI provider to use based on user's selection
 * @module services/ai/aiService
 */
import { toast } from "sonner";
import { claudeService } from "../claude";
import { openaiService } from "../openai";
import { browsingService } from "../browsing";
import { amazonService } from "../amazon";
import { ChatMessage } from "../chat";

// Regular expressions to detect browsing requests
const BROWSING_PATTERNS = [
  /(?:search|look up|find|check|browse|get information about|research)\s+(.+?)(?:\son\s+the\s+internet|\sonline|\son\s+the\s+web|\sat\s+amazon|\son\s+amazon)?/i,
  /(?:what\s+is|tell\s+me\s+about|find\s+information\s+on|can\s+you\s+find|\bprice\s+of\b|\bdetails\s+for\b|\bspecs\s+for\b)\s+(.+?)(?:\son\s+the\s+internet|\sonline|\son\s+the\s+web)?/i,
  /(?:compare\s+prices\s+for|how\s+much\s+does\s+it\s+cost|price\s+check)\s+(.+?)(?:\son\s+amazon|\sonline|\son\s+the\s+web)?/i
];

// Regular expressions to detect Amazon-specific queries
const AMAZON_PATTERNS = [
  /(?:amazon\s+price\s+for|price\s+on\s+amazon\s+for|how\s+much\s+is|cost\s+of)\s+(.+)/i,
  /(?:search\s+amazon\s+for|find\s+on\s+amazon|lookup\s+on\s+amazon)\s+(.+)/i,
  /(?:amazon\s+reviews\s+for|ratings\s+on\s+amazon\s+for)\s+(.+)/i
];

/**
 * Determines which AI provider to use and handles fallback logic
 */
export const aiService = {
  /**
   * Sends a message to the selected AI provider
   * @param message - The message to send
   * @returns Promise with the AI response
   */
  async sendMessage(message: ChatMessage): Promise<string> {
    const selectedProvider = localStorage.getItem('selected_ai_provider') || 'claude';
    
    // Check for required API keys
    const claudeApiKey = localStorage.getItem('claude_api_key');
    const openaiApiKey = localStorage.getItem('openai_api_key');
    
    try {
      // First, check if the message appears to be a browsing request
      const browsingQuery = this.detectBrowsingRequest(message.content);
      
      if (browsingQuery) {
        console.log('Detected browsing request:', browsingQuery);
        
        // Check if it's specifically an Amazon query
        const isAmazonQuery = this.detectAmazonQuery(message.content);
        
        if (isAmazonQuery) {
          console.log('Processing as Amazon query');
          
          try {
            const amazonInfo = await this.handleAmazonQuery(message.content);
            
            // Now send the enriched info to the AI for a natural language response
            const enhancedMessage: ChatMessage = {
              ...message,
              content: message.content + '\n\n[RETRIEVED DATA]: ' + amazonInfo
            };
            
            // Continue with regular AI processing for the enhanced message
            if (selectedProvider === 'claude') {
              if (!claudeApiKey) throw new Error('missing_api_key_claude');
              return await claudeService.sendMessage(enhancedMessage);
            } else {
              if (!openaiApiKey) throw new Error('missing_api_key_openai');
              return await openaiService.sendMessage(enhancedMessage);
            }
          } catch (browsingError) {
            console.error('Error with Amazon browsing:', browsingError);
            // If Amazon browsing fails, still provide the error info to the AI
            const errorMessage: ChatMessage = {
              ...message,
              content: message.content + '\n\n[RETRIEVED DATA]: ' + 
                      `I tried searching for "${browsingQuery}" on Amazon but encountered an error: ${browsingError.message || 'Unknown error'}`
            };
            
            // Continue with regular AI processing with the error info
            if (selectedProvider === 'claude') {
              if (!claudeApiKey) throw new Error('missing_api_key_claude');
              return await claudeService.sendMessage(errorMessage);
            } else {
              if (!openaiApiKey) throw new Error('missing_api_key_openai');
              return await openaiService.sendMessage(errorMessage);
            }
          }
        }
        
        // Handle general browsing request with better error handling
        try {
          const browsingInfo = await this.handleBrowsingRequest(browsingQuery);
          
          // Now send the enriched info to the AI for a natural language response
          const enhancedMessage: ChatMessage = {
            ...message,
            content: message.content + '\n\n[RETRIEVED DATA]: ' + browsingInfo
          };
          
          // Continue with regular AI processing for the enhanced message
          if (selectedProvider === 'claude') {
            if (!claudeApiKey) throw new Error('missing_api_key_claude');
            return await claudeService.sendMessage(enhancedMessage);
          } else {
            if (!openaiApiKey) throw new Error('missing_api_key_openai');
            return await openaiService.sendMessage(enhancedMessage);
          }
        } catch (browsingError) {
          console.error('Error with general browsing:', browsingError);
          // If browsing fails, still provide the error info to the AI
          const errorMessage: ChatMessage = {
            ...message,
            content: message.content + '\n\n[RETRIEVED DATA]: ' + 
                    `Failed to retrieve information: ${browsingError.message || 'Unknown error'}`
          };
          
          // Continue with regular AI processing with the error info
          if (selectedProvider === 'claude') {
            if (!claudeApiKey) throw new Error('missing_api_key_claude');
            return await claudeService.sendMessage(errorMessage);
          } else {
            if (!openaiApiKey) throw new Error('missing_api_key_openai');
            return await openaiService.sendMessage(errorMessage);
          }
        }
      }
      
      // Handle cases based on selected provider for regular messages
      if (selectedProvider === 'claude') {
        if (!claudeApiKey) {
          throw new Error('missing_api_key_claude');
        }
        return await claudeService.sendMessage(message);
      } 
      else if (selectedProvider === 'openai') {
        if (!openaiApiKey) {
          throw new Error('missing_api_key_openai');
        }
        return await openaiService.sendMessage(message);
      }
      else if (selectedProvider === 'both') {
        // Try Claude first, fallback to OpenAI
        try {
          if (!claudeApiKey) {
            throw new Error('missing_api_key_claude');
          }
          return await claudeService.sendMessage(message);
        } catch (claudeError) {
          console.log('Claude error, falling back to OpenAI:', claudeError);
          
          if (!openaiApiKey) {
            throw new Error('missing_api_key_openai');
          }
          
          toast.info("Falling back to OpenAI as Claude is unavailable");
          return await openaiService.sendMessage(message);
        }
      }
      
      // Default to Claude if something went wrong with the selection
      if (claudeApiKey) {
        return await claudeService.sendMessage(message);
      } else if (openaiApiKey) {
        return await openaiService.sendMessage(message);
      } else {
        throw new Error('no_api_keys');
      }
    } catch (error) {
      console.error('AI provider error:', error);
      
      // Handle specific missing API key errors
      if (error instanceof Error) {
        if (error.message === 'missing_api_key_claude') {
          toast.error("Claude API key not found. Please configure it in settings.");
          return "Please add your Claude API key in the settings to use this service.";
        }
        if (error.message === 'missing_api_key_openai') {
          toast.error("OpenAI API key not found. Please configure it in settings.");
          return "Please add your OpenAI API key in the settings to use this service.";
        }
        if (error.message === 'no_api_keys') {
          toast.error("No API keys configured. Please add at least one API key in settings.");
          return "Please configure at least one AI provider API key in the settings.";
        }
      }
      
      // Return the error message
      return "I'm sorry, there was an error processing your request. Please try again later or check your API configuration.";
    }
  },
  
  /**
   * Detects if a message appears to be a browsing request
   * @param message - User message
   * @returns The browsing query or null
   */
  detectBrowsingRequest(message: string): string | null {
    for (const pattern of BROWSING_PATTERNS) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  },
  
  /**
   * Detects if a message appears to be specifically about Amazon
   * @param message - User message
   * @returns Boolean indicating if it's an Amazon query
   */
  detectAmazonQuery(message: string): boolean {
    // Check for Amazon-specific patterns
    for (const pattern of AMAZON_PATTERNS) {
      if (pattern.test(message)) {
        return true;
      }
    }
    
    // Also check if the message contains Amazon
    return message.toLowerCase().includes('amazon');
  },
  
  /**
   * Handles a browsing request by fetching relevant information
   * @param query - The browsing query
   * @returns Retrieved information formatted as a string
   */
  async handleBrowsingRequest(query: string): Promise<string> {
    try {
      // For a general query, we could use a search engine
      // For this implementation, we'll use a direct URL approach for allowed domains
      
      // Let's try to form an appropriate URL based on the query
      // This is a simplified approach - a production system would use a proper search API
      
      // Check if the query contains a specific domain
      let url = '';
      
      if (query.includes('apple') && query.includes('support')) {
        url = `https://support.apple.com/search?q=${encodeURIComponent(query)}`;
      } else if (query.includes('samsung')) {
        url = `https://www.samsung.com/us/search/searchMain/?searchTerm=${encodeURIComponent(query)}`;
      } else if (query.includes('how to')) {
        url = `https://www.wikihow.com/wikiHowTo?search=${encodeURIComponent(query)}`;
      } else {
        // Fallback to amazon search
        url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
      }
      
      console.log(`Browsing URL: ${url}`);
      
      // Use browsing service to fetch content with improved error handling
      const result = await browsingService.browseUrl({
        url,
        extractionType: 'full',
        cacheTime: 1800 // 30 minutes
      });
      
      if (!result.success) {
        return `Failed to retrieve information: ${result.error}`;
      }
      
      // Format the retrieved content
      let formattedContent = '';
      
      formattedContent += `Source: ${result.url}\n\n`;
      
      if (result.metadata?.title) {
        formattedContent += `Title: ${result.metadata.title}\n\n`;
      }
      
      // Add content summary or extract
      if (result.content) {
        // Limit content to a reasonable size (first 1000 chars)
        const contentPreview = result.content.substring(0, 1000);
        formattedContent += `Content Extract:\n${contentPreview}${result.content.length > 1000 ? '...' : ''}`;
      } else {
        formattedContent += `No content was extracted from this page.`;
      }
      
      // Note if this came from cache
      if (result.source === 'cache') {
        formattedContent += `\n\nNote: This information was retrieved from cache (last updated: ${result.metadata?.lastUpdated || 'unknown'})`;
      }
      
      return formattedContent;
    } catch (error) {
      console.error('Error handling browsing request:', error);
      throw new Error(`Failed to browse for information about "${query}": ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Handles an Amazon-specific query by fetching product information
   * @param message - The user's message
   * @returns Retrieved Amazon product information formatted as a string
   */
  async handleAmazonQuery(message: string): Promise<string> {
    try {
      // Extract the product query from the message
      let productQuery = '';
      
      for (const pattern of AMAZON_PATTERNS) {
        const match = message.match(pattern);
        if (match && match[1]) {
          productQuery = match[1].trim();
          break;
        }
      }
      
      if (!productQuery) {
        // Fallback to general browsing patterns if Amazon-specific patterns don't match
        for (const pattern of BROWSING_PATTERNS) {
          const match = message.match(pattern);
          if (match && match[1]) {
            productQuery = match[1].trim();
            break;
          }
        }
      }
      
      if (!productQuery) {
        return "I couldn't determine what product you're asking about on Amazon.";
      }
      
      console.log(`Searching Amazon for: ${productQuery}`);
      
      // First try using the Amazon service
      try {
        const searchResult = await amazonService.searchProducts({
          keywords: productQuery,
          maxResults: 1
        });
        
        if (searchResult.success && searchResult.products.length > 0) {
          const product = searchResult.products[0];
          
          // Format the product information
          let formattedInfo = '';
          
          formattedInfo += `Amazon Product Information:\n`;
          formattedInfo += `Title: ${product.title}\n`;
          formattedInfo += `Price: ${product.price?.formattedPrice || 'Not available'}\n`;
          
          if (product.rating) {
            formattedInfo += `Rating: ${product.rating.value} out of 5 (${product.rating.count} reviews)\n`;
          }
          
          if (product.features && product.features.length > 0) {
            formattedInfo += `\nKey Features:\n`;
            product.features.forEach(feature => {
              formattedInfo += `- ${feature}\n`;
            });
          }
          
          if (product.description) {
            formattedInfo += `\nDescription: ${product.description}\n`;
          }
          
          formattedInfo += `\nAmazon URL: ${product.url}\n`;
          formattedInfo += `Product ID (ASIN): ${product.asin}\n`;
          formattedInfo += `Information retrieved: ${new Date().toLocaleString()}\n`;
          
          return formattedInfo;
        }
      } catch (amazonApiError) {
        console.error('Amazon API error, falling back to direct browsing:', amazonApiError);
        // Fall through to the browsing approach
      }
      
      // If Amazon API method failed, try direct browsing
      const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(productQuery)}`;
      
      // Use browsing service as fallback
      const browsingResult = await browsingService.browseUrl({
        url: amazonUrl,
        extractionType: 'product',
        cacheTime: 1800 // 30 minutes
      });
      
      if (!browsingResult.success) {
        throw new Error(browsingResult.error || 'Failed to retrieve Amazon product information');
      }
      
      // Format the browsing result
      let formattedInfo = '';
      
      formattedInfo += `Amazon Search Results:\n`;
      formattedInfo += `Search query: "${productQuery}"\n`;
      formattedInfo += `Source: ${browsingResult.url}\n\n`;
      
      if (browsingResult.metadata?.title) {
        formattedInfo += `Page title: ${browsingResult.metadata.title}\n\n`;
      }
      
      if (browsingResult.content) {
        // Limit content to a reasonable size
        const contentPreview = browsingResult.content.substring(0, 1000);
        formattedInfo += `Content extract:\n${contentPreview}${browsingResult.content.length > 1000 ? '...' : ''}`;
      } else {
        formattedInfo += `No product information could be extracted.`;
      }
      
      return formattedInfo;
    } catch (error) {
      console.error('Error handling Amazon query:', error);
      throw new Error(`Failed to get Amazon product information: ${error.message || 'Unknown error'}`);
    }
  }
};
