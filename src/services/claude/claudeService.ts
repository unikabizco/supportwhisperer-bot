
/**
 * Claude AI API service for handling chat interactions
 * @module services/claude/claudeService
 */
import { toast } from "sonner";
import { chatContextManager, ChatMessage } from "../chat";
import { ClaudeRequest, DEFAULT_MODEL } from "./types";
import { getEnhancedSystemPrompt } from "./systemPrompt";
import { sendWithRetry, processResponse } from "./apiClient";
import { handleError } from "./errorHandler";

/**
 * Service to handle Claude AI interactions
 */
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
      // First check internet connectivity
      if (!navigator.onLine) {
        throw new Error('offline');
      }

      // Add the new message to context
      chatContextManager.addMessage(newMessage);
      
      // Get all messages from context
      const contextMessages = chatContextManager.getMessagesForClaudeAPI();
      
      // Get context summary to enhance system prompt
      const contextSummary = chatContextManager.getContextSummary();
      const enhancedSystemPrompt = getEnhancedSystemPrompt(contextSummary);
      
      // Build request with context
      const request: ClaudeRequest = {
        model: DEFAULT_MODEL,
        messages: contextMessages,
        max_tokens: 1000,
        temperature: 0.7,
        system: enhancedSystemPrompt
      };

      // Send request with retries
      const response = await sendWithRetry(request, apiKey);
      const data = await processResponse(response);
      
      // Add assistant response to context
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.content[0].text,
        timestamp: Date.now()
      };
      chatContextManager.addMessage(assistantMessage);
      
      return data.content[0].text;
    } catch (error) {
      return handleError(error);
    }
  }
};
