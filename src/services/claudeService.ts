
/**
 * Claude AI API service for handling chat interactions
 * @module services/claudeService
 */
import { toast } from "sonner";
import { chatContextManager, ChatMessage } from "./chatContextManager";

// Type definitions for Claude API
interface ClaudeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  temperature?: number;
  system?: string;
}

interface ClaudeResponse {
  content: Array<{
    text: string;
    type: string;
  }>;
  id: string;
  model: string;
  role: string;
  type: string;
}

// Claude system prompt with e-commerce product knowledge
const SYSTEM_PROMPT = `You are a helpful, friendly customer support assistant for an e-commerce platform specializing in consumer electronics.

Your responsibilities include:
- Providing product recommendations based on customer specifications
- Troubleshooting common device setup issues
- Processing order status and return requests
- Answering account-related questions

Keep responses concise, professional yet warm. Ask clarifying questions when needed. 
If a customer seems frustrated or has a complex technical issue, acknowledge it and offer to connect them with a human agent.
Maintain our brand voice: helpful, knowledgeable, and friendly.

You have knowledge about our product catalog, common troubleshooting steps, return policy, and account management.
For questions about specific order details, explain that you'll need order numbers to look up specific information.

Remember to acknowledge information the customer has already provided and don't ask for the same information repeatedly.
Always consider the full conversation context before responding.`;

// Define retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const CONNECTION_TIMEOUT_MS = 15000; // 15 second timeout

// Service to handle Claude AI interactions
export const claudeService = {
  /**
   * Sends a message to Claude AI and returns the response
   * @param newMessage - New message to send to Claude
   * @returns Promise with Claude's response text
   */
  async sendMessage(newMessage: ChatMessage): Promise<string> {
    // For development, check if API key exists in local storage
    const apiKey = localStorage.getItem('claude_api_key');
    
    if (!apiKey) {
      toast.error("Claude API key not found. Please add your API key in settings.");
      return "I'm unable to process your request at the moment. Please check that a Claude API key has been configured.";
    }
    
    try {
      // Add the new message to context
      chatContextManager.addMessage(newMessage);
      
      // Get all messages from context
      const contextMessages = chatContextManager.getMessagesForClaudeAPI();
      
      // Get context summary to enhance system prompt
      const contextSummary = chatContextManager.getContextSummary();
      const enhancedSystemPrompt = contextSummary 
        ? `${SYSTEM_PROMPT}\n\nContext from conversation: ${contextSummary}`
        : SYSTEM_PROMPT;
      
      // Build request with context
      const request: ClaudeRequest = {
        model: "claude-3-sonnet-20240229", // Using Claude 3 Sonnet model
        messages: contextMessages,
        max_tokens: 1000,
        temperature: 0.7,
        system: enhancedSystemPrompt
      };

      // Check internet connection before sending request
      if (!navigator.onLine) {
        throw new Error('offline');
      }

      // Send request with retries
      const response = await this.sendWithRetry(request, apiKey);
      const data = await response.json() as ClaudeResponse;
      
      // Add assistant response to context
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content[0].text,
        timestamp: Date.now()
      };
      chatContextManager.addMessage(assistantMessage);
      
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      
      // Provide more specific error message based on error type
      if (error instanceof Error) {
        if (error.message === 'offline') {
          toast.error("You are currently offline. Please check your internet connection.");
          return "It looks like you're currently offline. Please check your internet connection and try again when you're back online.";
        } else if (error.message === 'timeout') {
          toast.error("Request timed out. The Claude AI service might be experiencing high traffic.");
          return "I'm sorry, but the request timed out. Our AI service might be experiencing high traffic. Please try again in a few moments.";
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          toast.error("Network error when connecting to Claude AI. Please check your internet connection.");
          return "I'm having trouble connecting to my knowledge base due to network issues. Please check your internet connection and try again in a moment. If the problem persists, our servers might be experiencing issues.";
        } else if (error.message.includes('429')) {
          toast.error("Rate limit exceeded. Please try again in a few moments.");
          return "I've reached my rate limit. Please wait a moment before sending another message.";
        } else if (error.message.includes('401')) {
          toast.error("Authentication failed. Please check your API key.");
          return "There seems to be an issue with my authentication. Please check your API key in settings.";
        }
      }
      
      // Generic error message as fallback
      toast.error("Failed to get response from Claude AI");
      return "I'm sorry, I encountered an error processing your request. Please try again later.";
    }
  },
  
  /**
   * Sends a request to Claude API with exponential backoff retry logic
   */
  async sendWithRetry(request: ClaudeRequest, apiKey: string, attempt = 1): Promise<Response> {
    try {
      // Create an AbortController for timeout management
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT_MS);
      
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(request),
          signal: controller.signal
        });
        
        // Clear the timeout since the request completed
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Claude API error:', errorData);
          
          // If we've reached max retries, throw an error
          if (attempt >= MAX_RETRIES) {
            throw new Error(`API error: ${response.status}`);
          }
          
          // For 429 (rate limit) or 5xx errors, retry with exponential backoff
          if (response.status === 429 || response.status >= 500) {
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            console.log(`Retrying request (attempt ${attempt + 1}) after ${delay}ms`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.sendWithRetry(request, apiKey, attempt + 1);
          }
          
          // For other errors, throw immediately
          throw new Error(`API error: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        // Clear the timeout to prevent memory leaks
        clearTimeout(timeoutId);
        
        // Check if the error was caused by the timeout
        if (error.name === 'AbortError') {
          throw new Error('timeout');
        }
        
        throw error;
      }
    } catch (error) {
      if (attempt < MAX_RETRIES && 
          !(error instanceof TypeError) && 
          error.message !== 'timeout' && 
          error.message !== 'offline') {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Retrying request (attempt ${attempt + 1}) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendWithRetry(request, apiKey, attempt + 1);
      }
      
      throw error;
    }
  }
};
