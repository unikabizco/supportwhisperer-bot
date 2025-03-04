
/**
 * OpenAI API service for handling chat interactions
 * @module services/openai/openaiService
 */
import { toast } from "sonner";
import { chatContextManager, ChatMessage } from "../chat";
import { OpenAIRequest, OpenAIMessage, DEFAULT_MODEL } from "./types";
import { getEnhancedSystemPrompt } from "./systemPrompt";
import { sendWithRetry, processResponse } from "./apiClient";
import { handleError } from "./errorHandler";

/**
 * Service to handle OpenAI interactions
 */
export const openaiService = {
  /**
   * Sends a message to OpenAI and returns the response
   * @param newMessage - New message to send to OpenAI
   * @returns Promise with OpenAI's response text
   */
  async sendMessage(newMessage: ChatMessage): Promise<string> {
    // For development, check if API key exists in local storage
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      toast.error("OpenAI API key not found. Please add your API key in settings.");
      return "I'm unable to process your request at the moment. Please check that an OpenAI API key has been configured.";
    }
    
    try {
      // First check internet connectivity
      if (!navigator.onLine) {
        throw new Error('offline');
      }

      // Add the new message to context
      chatContextManager.addMessage(newMessage);
      
      // Get all messages from context and ensure they're properly typed
      const contextMessages = chatContextManager.getMessagesForOpenAIAPI() as OpenAIMessage[];
      
      // Get context summary to enhance system prompt
      const contextSummary = chatContextManager.getContextSummary();
      const enhancedSystemPrompt = getEnhancedSystemPrompt(contextSummary);
      
      // Add system message to the beginning of the messages array
      const messagesWithSystem: OpenAIMessage[] = [
        { role: 'system', content: enhancedSystemPrompt },
        ...contextMessages
      ];
      
      // Build request with context
      const request: OpenAIRequest = {
        model: DEFAULT_MODEL,
        messages: messagesWithSystem,
        max_tokens: 1000,
        temperature: 0.7
      };

      // Send request with retries
      const response = await sendWithRetry(request, apiKey);
      const data = await processResponse(response);
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Invalid response from OpenAI API');
      }
      
      // Add assistant response to context
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: Date.now()
      };
      chatContextManager.addMessage(assistantMessage);
      
      return data.choices[0].message.content;
    } catch (error) {
      return handleError(error);
    }
  }
};
