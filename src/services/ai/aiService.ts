
/**
 * AI Provider Service
 * Determines which AI provider to use based on user's selection
 * @module services/ai/aiService
 */
import { toast } from "sonner";
import { claudeService } from "../claude";
import { openaiService } from "../openai";
import { ChatMessage } from "../chat";

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
      // Handle cases based on selected provider
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
  }
};
